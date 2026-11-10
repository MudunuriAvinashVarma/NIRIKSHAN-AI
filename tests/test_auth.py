
import sqlite3

import pandas as pd
import pytest
from fastapi.testclient import TestClient

from backend import main as api_module
from backend.auth import security
from backend.auth.config import AuthSettings, get_auth_settings

PASSWORD = "CorrectHorse9Battery"
ALLOWED_ORIGIN = "http://localhost:3000"


def new_user(**overrides):
    body = {"full_name": "Test Auditor", "email": "auditor@example.org", "password": PASSWORD}
    body.update(overrides)
    return body


@pytest.fixture
def auth_settings(tmp_path):
    return AuthSettings(environment="test", db_path=tmp_path / "auth_test.sqlite3")


@pytest.fixture
def client(auth_settings):
    # Point the auth code at a throw-away database and start each test with a
    # clean login throttle.
    api_module.app.dependency_overrides[get_auth_settings] = lambda: auth_settings
    security.login_throttle.clear()
    yield TestClient(api_module.app)
    api_module.app.dependency_overrides.clear()


@pytest.fixture
def registered(client):
    assert client.post("/api/v1/auth/register", json=new_user()).status_code == 201
    return client


@pytest.fixture
def logged_in(registered):
    response = registered.post("/api/v1/auth/login", json={"email": "auditor@example.org", "password": PASSWORD})
    assert response.status_code == 200
    return registered


def db_rows(auth_settings, sql, params=()):
    """Direct SQLite query for test assertions (tests always use SQLite)."""
    conn = sqlite3.connect(auth_settings.db_path)
    conn.row_factory = sqlite3.Row
    try:
        return conn.execute(sql, params).fetchall()
    finally:
        conn.close()


def set_cookie_header(response):
    return response.headers.get("set-cookie", "")


# ------------------------------------------------------------- registration
def test_register_success(client):
    response = client.post("/api/v1/auth/register", json=new_user())
    assert response.status_code == 201
    body = response.json()
    assert body["status"] == "success"
    assert body["message"] == "Account created successfully."
    user = body["user"]
    assert user["email"] == "auditor@example.org"
    assert user["full_name"] == "Test Auditor"
    assert user["role"] == "Auditor"
    assert user["id"].startswith("usr_")
    assert "set-cookie" not in response.headers  # contract: register does not log in


def test_register_never_exposes_password_or_hash(client):
    response = client.post("/api/v1/auth/register", json=new_user())
    assert PASSWORD not in response.text
    assert "hash" not in response.text.lower() and "argon2" not in response.text.lower()


def test_password_is_stored_as_argon2_hash_not_plain_text(client, auth_settings):
    client.post("/api/v1/auth/register", json=new_user())
    row = db_rows(auth_settings, "SELECT password_hash FROM users")[0]
    assert row["password_hash"].startswith("$argon2id$")
    assert PASSWORD not in row["password_hash"]


def test_users_persist_in_sqlite_across_app_restarts(client, auth_settings):
    client.post("/api/v1/auth/register", json=new_user())
    fresh_client = TestClient(api_module.app)  # a new client = new cookie jar, same database file
    response = fresh_client.post("/api/v1/auth/login", json={"email": "auditor@example.org", "password": PASSWORD})
    assert response.status_code == 200


def test_email_is_normalised_to_lowercase(client):
    response = client.post("/api/v1/auth/register", json=new_user(email="  Auditor@Example.ORG "))
    assert response.json()["user"]["email"] == "auditor@example.org"


def test_duplicate_registration_is_rejected(registered):
    response = registered.post("/api/v1/auth/register", json=new_user())
    assert response.status_code == 400
    assert response.json() == {"detail": "An account with this email address already exists."}


def test_duplicate_registration_ignores_email_case(registered):
    response = registered.post("/api/v1/auth/register", json=new_user(email="AUDITOR@example.org"))
    assert response.status_code == 400


def test_password_confirmation_mismatch_is_rejected(client):
    response = client.post("/api/v1/auth/register", json=new_user(confirm_password="Different999"))
    assert response.status_code == 422
    assert response.json()["detail"] == "Passwords do not match."
    assert PASSWORD not in response.text and "Different999" not in response.text  # no echo


def test_password_confirmation_match_and_camel_case_aliases_work(client):
    response = client.post(
        "/api/v1/auth/register",
        json={"fullName": "Camel Case", "email": "camel@example.org", "password": PASSWORD, "confirmPassword": PASSWORD},
    )
    assert response.status_code == 201


@pytest.mark.parametrize(
    "overrides, message",
    [
        ({"password": "short"}, "Password must be between 8 and 128 characters."),
        ({"password": "x" * 129}, "Password must be between 8 and 128 characters."),
        ({"email": "not-an-email"}, "Enter a valid email address."),
        ({"full_name": "   "}, "Full name must be between 1 and 100 characters."),
    ],
)
def test_register_validation_errors_return_422_with_readable_detail(client, overrides, message):
    response = client.post("/api/v1/auth/register", json=new_user(**overrides))
    assert response.status_code == 422
    assert response.json()["detail"] == message
    assert isinstance(response.json()["errors"], list)


def test_register_missing_field_returns_422(client):
    body = new_user()
    del body["email"]
    response = client.post("/api/v1/auth/register", json=body)
    assert response.status_code == 422
    assert response.json()["detail"] == "Email is required."


def test_role_cannot_be_chosen_by_the_user(client):
    response = client.post("/api/v1/auth/register", json=new_user(role="Senior Auditor"))
    assert response.json()["user"]["role"] == "Auditor"


# -------------------------------------------------------------------- login
def test_login_success_sets_secure_session_cookie(registered):
    response = registered.post("/api/v1/auth/login", json={"email": "auditor@example.org", "password": PASSWORD})
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "success"
    assert body["message"] == "Authentication successful."
    assert body["user"]["email"] == "auditor@example.org"

    cookie = set_cookie_header(response)
    assert cookie.startswith("access_token=")
    assert "HttpOnly" in cookie
    assert "Path=/" in cookie
    assert "SameSite=lax" in cookie
    assert "Max-Age=86400" in cookie
    assert "Secure" not in cookie  # development default (plain http://localhost)
    # The session token must never be in the response body (contract rule 1).
    token = registered.cookies.get("access_token")
    assert token and token not in response.text
    assert "hash" not in response.text.lower()


def test_login_is_case_insensitive_for_email(registered):
    response = registered.post("/api/v1/auth/login", json={"email": "AUDITOR@EXAMPLE.ORG", "password": PASSWORD})
    assert response.status_code == 200


def test_remember_me_extends_cookie_lifetime(registered):
    response = registered.post(
        "/api/v1/auth/login",
        json={"email": "auditor@example.org", "password": PASSWORD, "remember_me": True},
    )
    assert "Max-Age=2592000" in set_cookie_header(response)  # 30 days


def test_remember_me_camel_case_alias_is_accepted(registered):
    response = registered.post(
        "/api/v1/auth/login",
        json={"email": "auditor@example.org", "password": PASSWORD, "rememberMe": True},
    )
    assert "Max-Age=2592000" in set_cookie_header(response)


def test_login_with_wrong_password_returns_401_and_no_cookie(registered):
    response = registered.post("/api/v1/auth/login", json={"email": "auditor@example.org", "password": "WrongPassword1"})
    assert response.status_code == 401
    assert response.json() == {"detail": "Invalid institutional email or password."}
    assert "set-cookie" not in response.headers


def test_unknown_email_gives_the_same_error_as_wrong_password(client):
    response = client.post("/api/v1/auth/login", json={"email": "nobody@example.org", "password": PASSWORD})
    assert response.status_code == 401
    assert response.json() == {"detail": "Invalid institutional email or password."}


@pytest.mark.parametrize("body", [{}, {"email": "a@example.org"}, {"password": PASSWORD}, {"email": "", "password": ""}])
def test_login_missing_fields_returns_400(client, body):
    response = client.post("/api/v1/auth/login", json=body)
    assert response.status_code == 400
    assert response.json() == {"detail": "Missing required fields."}


def test_deactivated_account_cannot_log_in(registered, auth_settings):
    conn = sqlite3.connect(auth_settings.db_path)
    conn.execute("UPDATE users SET is_active = 0")
    conn.commit()
    conn.close()
    response = registered.post("/api/v1/auth/login", json={"email": "auditor@example.org", "password": PASSWORD})
    assert response.status_code == 401


def test_repeated_failures_trigger_429_even_for_the_right_password(registered):
    wrong = {"email": "auditor@example.org", "password": "WrongPassword1"}
    for _ in range(5):  # default limit: 5 failures
        assert registered.post("/api/v1/auth/login", json=wrong).status_code == 401
    blocked = registered.post("/api/v1/auth/login", json={"email": "auditor@example.org", "password": PASSWORD})
    assert blocked.status_code == 429
    assert "Retry-After" in blocked.headers


def test_successful_login_resets_the_failure_counter(registered):
    wrong = {"email": "auditor@example.org", "password": "WrongPassword1"}
    right = {"email": "auditor@example.org", "password": PASSWORD}
    for _ in range(4):
        registered.post("/api/v1/auth/login", json=wrong)
    assert registered.post("/api/v1/auth/login", json=right).status_code == 200
    for _ in range(4):  # counter started again from zero
        assert registered.post("/api/v1/auth/login", json=wrong).status_code == 401


# ------------------------------------------------------ session verification
def test_me_returns_the_logged_in_user(logged_in):
    response = logged_in.get("/api/v1/auth/me")
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "success"
    assert body["user"]["email"] == "auditor@example.org"
    assert body["user"]["role"] == "Auditor"
    assert "hash" not in response.text.lower() and PASSWORD not in response.text


def test_me_without_cookie_returns_401(client):
    response = client.get("/api/v1/auth/me")
    assert response.status_code == 401
    assert response.json() == {"detail": "Session expired or invalid. Please re-authenticate."}


def test_me_with_forged_cookie_returns_401(client):
    client.cookies.set("access_token", "this-is-not-a-real-session-token")
    assert client.get("/api/v1/auth/me").status_code == 401


def test_session_token_is_stored_only_as_a_hash(logged_in, auth_settings):
    token = logged_in.cookies.get("access_token")
    stored = db_rows(auth_settings, "SELECT token_hash FROM sessions")[0]["token_hash"]
    assert stored != token and token not in stored
    assert stored == security.hash_token(token)


def test_expired_session_is_rejected(logged_in, auth_settings):
    conn = sqlite3.connect(auth_settings.db_path)
    conn.execute("UPDATE sessions SET expires_at = 1")  # long in the past
    conn.commit()
    conn.close()
    assert logged_in.get("/api/v1/auth/me").status_code == 401


def test_each_login_issues_a_new_token(registered):
    creds = {"email": "auditor@example.org", "password": PASSWORD}
    registered.post("/api/v1/auth/login", json=creds)
    first = registered.cookies.get("access_token")
    registered.post("/api/v1/auth/login", json=creds)
    assert registered.cookies.get("access_token") != first


# ------------------------------------------------------------------- logout
def test_logout_clears_cookie_and_ends_the_session(logged_in):
    response = logged_in.post("/api/v1/auth/logout")
    assert response.status_code == 200
    assert response.json() == {"status": "success", "message": "Session terminated successfully."}
    cookie = set_cookie_header(response)
    assert cookie.startswith("access_token=") and "Max-Age=0" in cookie and "HttpOnly" in cookie


def test_access_after_logout_is_denied(logged_in):
    logged_in.post("/api/v1/auth/logout")
    assert logged_in.get("/api/v1/auth/me").status_code == 401


def test_a_copied_cookie_stops_working_after_logout(logged_in):
    stolen = logged_in.cookies.get("access_token")
    logged_in.post("/api/v1/auth/logout")
    attacker = TestClient(api_module.app)
    attacker.cookies.set("access_token", stolen)
    assert attacker.get("/api/v1/auth/me").status_code == 401  # revoked on the server


def test_logout_without_a_session_still_succeeds(client):
    assert client.post("/api/v1/auth/logout").status_code == 200


# ------------------------------------------------------- cookie / CORS / CSRF
def test_secure_flag_is_set_when_configured(tmp_path):
    secure = AuthSettings(environment="test", db_path=tmp_path / "s.sqlite3", cookie_secure=True)
    api_module.app.dependency_overrides[get_auth_settings] = lambda: secure
    try:
        https_client = TestClient(api_module.app, base_url="https://testserver")
        https_client.post("/api/v1/auth/register", json=new_user())
        response = https_client.post("/api/v1/auth/login", json={"email": "auditor@example.org", "password": PASSWORD})
        assert "Secure" in set_cookie_header(response)
    finally:
        api_module.app.dependency_overrides.clear()


def test_production_requires_secure_cookies():
    with pytest.raises(RuntimeError, match="Secure"):
        AuthSettings(environment="production", cookie_secure=False)


def test_wildcard_cors_origin_is_refused():
    with pytest.raises(RuntimeError, match="CORS"):
        AuthSettings(cors_origins=("*",))


def test_cors_allows_the_frontend_origin_with_credentials(client):
    preflight = client.options(
        "/api/v1/auth/login",
        headers={
            "Origin": ALLOWED_ORIGIN,
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "content-type",
        },
    )
    assert preflight.status_code == 200
    assert preflight.headers["access-control-allow-origin"] == ALLOWED_ORIGIN
    assert preflight.headers["access-control-allow-credentials"] == "true"


def test_cors_rejects_other_origins(client):
    response = client.get("/api/v1/health", headers={"Origin": "http://evil.example"})
    assert "access-control-allow-origin" not in response.headers


def test_post_from_a_foreign_origin_is_blocked(registered):
    creds = {"email": "auditor@example.org", "password": PASSWORD}
    blocked = registered.post("/api/v1/auth/login", json=creds, headers={"Origin": "http://evil.example"})
    assert blocked.status_code == 403
    allowed = registered.post("/api/v1/auth/login", json=creds, headers={"Origin": ALLOWED_ORIGIN})
    assert allowed.status_code == 200


# -------------------------------------------- existing anomaly API still works
@pytest.fixture
def anomaly_csv(tmp_path, monkeypatch):
    path = tmp_path / "anomaly_explanations.csv"
    pd.DataFrame(
        [[1, "Testland A", "Completed", "['Global Isolation Forest']"],
         [2, "Testland B", "In Progress", "['State-Year Delay Comparison']"]],
        columns=["Sr. No.", "State", "Work Status", "Review Signals"],
    ).to_csv(path, index=False)
    monkeypatch.setattr(api_module, "DATA_FILE", path)


def test_anomaly_endpoint_requires_login(client, anomaly_csv):
    response = client.get("/api/v1/anomalies", params={"state": "testland a"})
    assert response.status_code == 401
    assert response.json() == {"detail": "Session expired or invalid. Please re-authenticate."}
    assert "Testland" not in response.text


def test_anomaly_endpoint_unchanged_for_logged_in_users(logged_in, anomaly_csv):
    # Same filter, fields and signal parsing as before protection was added.
    response = logged_in.get("/api/v1/anomalies", params={"state": "testland a"})
    assert response.status_code == 200
    body = response.json()
    assert body["total_records"] == 1 and body["data"][0]["Review Signals"] == ["Global Isolation Forest"]
    assert logged_in.get("/api/v1/anomalies").json()["total_records"] == 2


def test_root_and_health_still_work(client):
    assert client.get("/").json()["version"] == "1.0.0"
    assert client.get("/api/v1/health").json()["status"] == "healthy"


def test_anomaly_validation_errors_keep_fastapi_default_format(logged_in):
    response = logged_in.get("/api/v1/anomalies", params={"limit": 0})
    assert response.status_code == 422
    assert isinstance(response.json()["detail"], list)  # unchanged outside /auth


# --------------------------------------------- dual-backend awareness tests
def test_sqlite_using_path(tmp_path, monkeypatch):
    """Legacy Path argument selects SQLite when NIRIKSHAN_DATABASE_URL is unset."""
    monkeypatch.delenv("NIRIKSHAN_DATABASE_URL", raising=False)
    from backend.auth.database import connect, ensure_db, is_postgres

    db_file = tmp_path / "via_path.sqlite3"
    assert not is_postgres(db_file)
    ensure_db(db_file)
    assert db_file.exists()
    conn = connect(db_file)
    try:
        assert conn.backend == "sqlite"
    finally:
        conn.close()


def test_sqlite_using_auth_settings(tmp_path, monkeypatch):
    """AuthSettings with empty database_url uses SQLite at db_path, ignoring env var."""
    monkeypatch.setenv("NIRIKSHAN_DATABASE_URL", "postgresql://ignored:ignored@localhost/ignored")
    from backend.auth.database import connect, ensure_db, is_postgres

    db_file = tmp_path / "via_settings.sqlite3"
    settings = AuthSettings(environment="test", db_path=db_file, database_url="")
    assert not is_postgres(settings)
    ensure_db(settings)
    assert db_file.exists()
    conn = connect(settings)
    try:
        assert conn.backend == "sqlite"
    finally:
        conn.close()


def test_postgres_selection_using_auth_settings_database_url(tmp_path, monkeypatch):
    """AuthSettings.database_url selects PostgreSQL even without NIRIKSHAN_DATABASE_URL."""
    monkeypatch.delenv("NIRIKSHAN_DATABASE_URL", raising=False)
    import psycopg
    from backend.auth import database as db_module

    monkeypatch.setattr(db_module, "_pg_initialised", set())
    calls = []

    class DummyConn:
        def execute(self, sql):
            calls.append(("execute", sql))

        def cursor(self):
            return self

        def commit(self):
            pass

        def rollback(self):
            pass

        def close(self):
            calls.append(("close", None))

    def fake_connect(dsn, **kwargs):
        calls.append(("connect", dsn, kwargs))
        return DummyConn()

    monkeypatch.setattr(psycopg, "connect", fake_connect)

    dsn = "postgresql://settings-user:secret@db.example:5432/nirikshan"
    settings = AuthSettings(environment="test", db_path=tmp_path / "unused.sqlite3", database_url=dsn)
    assert db_module.is_postgres(settings)

    db_module.ensure_db(settings)
    conn = db_module.connect(settings)
    try:
        assert conn.backend == "postgres"
    finally:
        conn.close()

    assert not (tmp_path / "unused.sqlite3").exists()
    connect_calls = [c for c in calls if c[0] == "connect"]
    assert len(connect_calls) == 2  # once in _ensure_postgres, once in _connect_postgres
    assert all(c[1] == dsn for c in connect_calls)


def test_postgres_selection_using_env_var(tmp_path, monkeypatch):
    """NIRIKSHAN_DATABASE_URL selects PostgreSQL for legacy Path calls and AuthSettings.from_env()."""
    dsn = "postgresql://env-user:secret@db.example:6543/postgres"
    monkeypatch.setenv("NIRIKSHAN_DATABASE_URL", dsn)
    import psycopg
    from backend.auth import database as db_module

    monkeypatch.setattr(db_module, "_pg_initialised", set())
    connect_dsns = []

    class DummyConn:
        def execute(self, sql):
            pass

        def close(self):
            pass

    def fake_connect(conn_dsn, **kwargs):
        connect_dsns.append(conn_dsn)
        return DummyConn()

    monkeypatch.setattr(psycopg, "connect", fake_connect)

    legacy_path = tmp_path / "unused_legacy.sqlite3"
    assert db_module.is_postgres()
    assert db_module.is_postgres(legacy_path)

    db_module.ensure_db(legacy_path)
    conn = db_module.connect(legacy_path)
    try:
        assert conn.backend == "postgres"
    finally:
        conn.close()

    assert not legacy_path.exists()
    assert connect_dsns == [dsn, dsn]
    assert AuthSettings.from_env().database_url == dsn


def test_dbconnection_execute_returns_dict_rows(client, auth_settings):
    """DbConnection.execute().fetchone() returns a plain dict."""
    client.post("/api/v1/auth/register", json=new_user())
    from backend.auth.database import connect
    conn = connect(auth_settings)
    try:
        row = conn.execute("SELECT * FROM users WHERE email = %s", ("auditor@example.org",)).fetchone()
        assert isinstance(row, dict)
        assert row["email"] == "auditor@example.org"
        assert row["full_name"] == "Test Auditor"
    finally:
        conn.close()


def test_is_integrity_error_detects_sqlite_and_psycopg3_exceptions():
    """_is_integrity_error handles sqlite3.IntegrityError and psycopg 3 integrity exceptions."""
    import psycopg
    from backend.auth import repository

    assert repository._is_integrity_error(sqlite3.IntegrityError("UNIQUE constraint failed"))
    assert repository._is_integrity_error(psycopg.IntegrityError("integrity error"))
    assert repository._is_integrity_error(psycopg.errors.UniqueViolation("duplicate key value"))
    assert not repository._is_integrity_error(psycopg.OperationalError("connection lost"))
    assert not repository._is_integrity_error(ValueError("unrelated error"))

    class RaisingConn:
        def __init__(self, exc):
            self._exc = exc

        def __enter__(self):
            return self

        def __exit__(self, exc_type, exc_val, exc_tb):
            return False

        def execute(self, sql, params=()):
            raise self._exc

    for exc in (psycopg.errors.UniqueViolation("dup"), psycopg.IntegrityError("dup")):
        with pytest.raises(repository.DuplicateEmailError):
            repository.create_user(
                RaisingConn(exc),
                user_id="usr_1",
                email="a@example.org",
                full_name="A",
                password_hash="h",
                role="Auditor",
                created_at="2026-01-01T00:00:00+00:00",
            )
