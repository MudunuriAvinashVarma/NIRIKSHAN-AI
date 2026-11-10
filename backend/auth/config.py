"""
backend/auth/config.py

Authentication settings, read from environment variables (and an optional
.env file in the project root, which is NEVER committed to git).

Design decisions
----------------
* Sessions use random opaque tokens stored (hashed) in SQLite, so there is NO
  signing secret to manage and nothing secret to hard-code.
* Production is stricter than development: the cookie must be Secure.
  Invalid combinations stop the app at start-up instead of silently running
  insecurely.
"""

from __future__ import annotations

import os
from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path

try:  # python-dotenv is already in requirements.txt; stay safe if it is missing
    from dotenv import load_dotenv
except ImportError:  # pragma: no cover
    load_dotenv = None

# backend/auth/config.py -> parents[0]=auth, [1]=backend, [2]=project root
PROJECT_ROOT = Path(__file__).resolve().parents[2]
DEFAULT_DB_PATH = PROJECT_ROOT / "instance" / "nirikshan.sqlite3"
DEFAULT_ORIGINS = ("http://localhost:3000", "http://127.0.0.1:3000")


@dataclass(frozen=True)
class AuthSettings:
    environment: str = "development"          # development | test | production
    db_path: Path = DEFAULT_DB_PATH
    database_url: str = ""                    # PostgreSQL DSN; empty = use SQLite
    cors_origins: tuple[str, ...] = DEFAULT_ORIGINS
    cookie_name: str = "access_token"          # name required by AUTH_CONTRACT.md
    cookie_secure: bool = False
    cookie_samesite: str = "lax"               # lax | strict | none
    session_seconds: int = 86_400              # 24 h (contract: Max-Age=86400)
    remember_me_seconds: int = 30 * 86_400     # 30 days when "Remember me" is ticked
    login_max_attempts: int = 5                # failures allowed per window...
    login_window_seconds: int = 900            # ...of 15 minutes

    def __post_init__(self) -> None:
        if self.environment not in {"development", "test", "production"}:
            raise RuntimeError(f"NIRIKSHAN_ENV must be development, test or production, got {self.environment!r}")
        if self.cookie_samesite not in {"lax", "strict", "none"}:
            raise RuntimeError("NIRIKSHAN_COOKIE_SAMESITE must be lax, strict or none")
        if self.cookie_samesite == "none" and not self.cookie_secure:
            raise RuntimeError("SameSite=None cookies must also be Secure")
        if self.environment == "production" and not self.cookie_secure:
            raise RuntimeError("In production the session cookie must be Secure (NIRIKSHAN_COOKIE_SECURE=true)")
        if "*" in self.cors_origins:
            raise RuntimeError("CORS origins cannot be '*' when credentials (cookies) are allowed")
        if min(self.session_seconds, self.remember_me_seconds, self.login_max_attempts, self.login_window_seconds) < 1:
            raise RuntimeError("Session and throttle settings must be positive")

    @classmethod
    def from_env(cls) -> "AuthSettings":
        environment = os.getenv("NIRIKSHAN_ENV", "development").strip().lower()
        origins_raw = os.getenv("NIRIKSHAN_CORS_ORIGINS")
        origins = (
            tuple(o.strip().rstrip("/") for o in origins_raw.split(",") if o.strip())
            if origins_raw
            else DEFAULT_ORIGINS
        )
        return cls(
            environment=environment,
            db_path=Path(os.getenv("NIRIKSHAN_DB_PATH", str(DEFAULT_DB_PATH))),
            database_url=os.getenv("NIRIKSHAN_DATABASE_URL", "").strip(),
            cors_origins=origins,
            cookie_secure=_env_bool("NIRIKSHAN_COOKIE_SECURE", default=(environment == "production")),
            cookie_samesite=os.getenv("NIRIKSHAN_COOKIE_SAMESITE", "lax").strip().lower(),
            session_seconds=_env_int("NIRIKSHAN_SESSION_HOURS", 24) * 3600,
            remember_me_seconds=_env_int("NIRIKSHAN_REMEMBER_ME_DAYS", 30) * 86_400,
            login_max_attempts=_env_int("NIRIKSHAN_LOGIN_MAX_ATTEMPTS", 5),
            login_window_seconds=_env_int("NIRIKSHAN_LOGIN_WINDOW_MINUTES", 15) * 60,
        )


def _env_bool(name: str, default: bool) -> bool:
    raw = os.getenv(name)
    return default if raw is None else raw.strip().lower() in {"1", "true", "yes", "on"}


def _env_int(name: str, default: int) -> int:
    raw = os.getenv(name)
    return default if raw is None or not raw.strip() else int(raw)


@lru_cache
def get_auth_settings() -> AuthSettings:
    """Cached; also a FastAPI dependency so tests can override it."""
    if load_dotenv is not None:
        load_dotenv(PROJECT_ROOT / ".env", override=False)  # real env vars win over .env
    return AuthSettings.from_env()
