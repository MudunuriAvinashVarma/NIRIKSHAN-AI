"""
backend/auth/router.py

POST /api/v1/auth/register | POST /api/v1/auth/login
GET  /api/v1/auth/me       | POST /api/v1/auth/logout

Request flow for login (trace):
  1. verify_origin       : a browser Origin header must be on the allow-list.
  2. Body checks         : missing e-mail/password -> 400.
  3. Throttle            : too many recent failures for (IP, e-mail) -> 429.
  4. Look up user + Argon2 verify (dummy hash if the e-mail is unknown).
  5. Failure -> count it, answer 401 with ONE generic message.
  6. Success -> new random token, store its hash, set HttpOnly cookie.
"""

from __future__ import annotations

import secrets
import sqlite3
import time
from datetime import datetime, timezone
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Request, Response
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from backend.auth import repository, security
from backend.auth.config import AuthSettings, get_auth_settings
from backend.auth.database import connect
from backend.auth.schemas import (
    LoginRequest,
    LoginResponse,
    LogoutResponse,
    MeResponse,
    RegisterRequest,
    RegisterResponse,
    UserOut,
)

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])

INVALID_LOGIN = "Invalid institutional email or password."
NOT_AUTHENTICATED = "Session expired or invalid. Please re-authenticate."


# ----------------------------------------------------------------- dependencies
def get_db(settings: Annotated[AuthSettings, Depends(get_auth_settings)]):
    conn = connect(settings.db_path)
    try:
        yield conn
    finally:
        conn.close()


def verify_origin(request: Request, settings: Annotated[AuthSettings, Depends(get_auth_settings)]) -> None:
    """
    Defence in depth against cross-site request forgery: if the browser says a
    request came from some other website, refuse it. (Non-browser tools send no
    Origin header and are not affected. SameSite=Lax cookies already block most
    cross-site POSTs; this check closes the remaining gaps such as login CSRF.)
    """
    origin = request.headers.get("origin")
    if origin is not None and origin.rstrip("/") not in settings.cors_origins:
        raise HTTPException(status_code=403, detail="Origin not allowed.")


def get_current_user(
    request: Request,
    conn: Annotated[sqlite3.Connection, Depends(get_db)],
    settings: Annotated[AuthSettings, Depends(get_auth_settings)],
) -> sqlite3.Row:
    """Reusable later to protect any other route: user=Depends(get_current_user)."""
    token = request.cookies.get(settings.cookie_name)
    user = repository.get_session_user(conn, security.hash_token(token), int(time.time())) if token else None
    if user is None:
        raise HTTPException(status_code=401, detail=NOT_AUTHENTICATED)
    return user


def _user_out(row: sqlite3.Row) -> UserOut:
    return UserOut(
        id=row["id"],
        email=row["email"],
        full_name=row["full_name"],
        role=row["role"],
        department=row["department"],
    )


def _no_store(response: Response) -> None:
    response.headers["Cache-Control"] = "no-store"  # never cache account data


# --------------------------------------------------------------------- endpoints
@router.post(
    "/register",
    status_code=201,
    response_model=RegisterResponse,
    dependencies=[Depends(verify_origin)],
)
def register(body: RegisterRequest, response: Response, conn: Annotated[sqlite3.Connection, Depends(get_db)]):
    _no_store(response)
    duplicate = HTTPException(status_code=400, detail="An account with this email address already exists.")
    if repository.get_user_by_email(conn, body.email) is not None:
        raise duplicate  # cheap early exit before the expensive hash
    user_id = "usr_" + secrets.token_hex(6)
    try:
        repository.create_user(
            conn,
            user_id=user_id,
            email=body.email,
            full_name=body.full_name,
            password_hash=security.hash_password(body.password.get_secret_value()),
            role="Auditor",  # never taken from the request
            created_at=datetime.now(timezone.utc).isoformat(timespec="seconds"),
        )
    except repository.DuplicateEmailError:
        raise duplicate
    return RegisterResponse(
        message="Account created successfully.",
        user=_user_out(repository.get_user_by_email(conn, body.email)),
    )


@router.post("/login", response_model=LoginResponse, dependencies=[Depends(verify_origin)])
def login(
    body: LoginRequest,
    request: Request,
    response: Response,
    conn: Annotated[sqlite3.Connection, Depends(get_db)],
    settings: Annotated[AuthSettings, Depends(get_auth_settings)],
):
    _no_store(response)
    email = (body.email or "").strip().lower()
    password = body.password.get_secret_value() if body.password is not None else ""
    if not email or not password:
        raise HTTPException(status_code=400, detail="Missing required fields.")

    client_ip = request.client.host if request.client else "unknown"
    throttle_key = (client_ip, email)
    wait = security.login_throttle.retry_after(
        throttle_key, settings.login_max_attempts, settings.login_window_seconds
    )
    if wait:
        raise HTTPException(
            status_code=429,
            detail="Too many failed sign-in attempts. Please try again later.",
            headers={"Retry-After": str(wait)},
        )

    user = repository.get_user_by_email(conn, email)
    valid, new_hash = (False, None)
    if len(password) <= security.MAX_LOGIN_PASSWORD_LENGTH:
        valid, new_hash = security.verify_password(user["password_hash"] if user else None, password)
    if not (valid and user is not None and user["is_active"]):
        security.login_throttle.record_failure(throttle_key)
        raise HTTPException(status_code=401, detail=INVALID_LOGIN)  # same text for every failure

    security.login_throttle.reset(throttle_key)
    if new_hash:
        repository.update_password_hash(conn, user["id"], new_hash)

    now = int(time.time())
    lifetime = settings.remember_me_seconds if body.remember_me else settings.session_seconds
    token = security.new_session_token()  # fresh token every login (no session fixation)
    repository.delete_expired_sessions(conn, now)
    repository.create_session(
        conn, token_hash=security.hash_token(token), user_id=user["id"], created_at=now, expires_at=now + lifetime
    )
    repository.touch_last_login(conn, user["id"], datetime.now(timezone.utc).isoformat(timespec="seconds"))

    response.set_cookie(
        key=settings.cookie_name,
        value=token,
        max_age=lifetime,
        path="/",
        httponly=True,  # JavaScript can never read the cookie
        secure=settings.cookie_secure,
        samesite=settings.cookie_samesite,
    )
    return LoginResponse(message="Authentication successful.", user=_user_out(user))


@router.get("/me", response_model=MeResponse)
def me(response: Response, user: Annotated[sqlite3.Row, Depends(get_current_user)]):
    _no_store(response)
    return MeResponse(user=_user_out(user))


@router.post("/logout", response_model=LogoutResponse, dependencies=[Depends(verify_origin)])
def logout(
    request: Request,
    response: Response,
    conn: Annotated[sqlite3.Connection, Depends(get_db)],
    settings: Annotated[AuthSettings, Depends(get_auth_settings)],
):
    _no_store(response)
    token = request.cookies.get(settings.cookie_name)
    if token:
        # Real invalidation: the session row is deleted, so a copied cookie
        # stops working too (not just in this browser).
        repository.delete_session(conn, security.hash_token(token))
    response.delete_cookie(
        key=settings.cookie_name,
        path="/",
        httponly=True,
        secure=settings.cookie_secure,
        samesite=settings.cookie_samesite,
    )
    return LogoutResponse(message="Session terminated successfully.")  # idempotent: always 200


# ------------------------------------------------------------ validation errors
def validation_error_response(exc: RequestValidationError) -> JSONResponse:
    """
    422 body for auth routes: {"detail": "<readable sentence>", "errors": [...]}.
    FastAPI's default puts a LIST in "detail" and echoes the submitted input,
    which would send the user's password back. We return messages only.
    """
    errors = []
    for err in exc.errors():
        path = [str(p) for p in err["loc"] if p != "body"]
        field = path[-1] if path and not path[-1].isdigit() else None
        message = str(err["msg"]).removeprefix("Value error, ")
        if err["type"] == "missing":
            message = f"{(field or 'field').replace('_', ' ').capitalize()} is required."
        elif err["type"] == "json_invalid":
            message = "Request body must be valid JSON."
        elif field == "email":
            message = "Enter a valid email address."
        errors.append({"field": field, "message": message})
    return JSONResponse(
        status_code=422,
        content={"detail": errors[0]["message"] if errors else "Invalid request.", "errors": errors},
    )
