"""
backend/auth/repository.py

All SQL lives here. Every query uses %s placeholders (parameters), never string
formatting, so user input cannot change the SQL (no SQL injection).

The DbConnection wrapper in database.py transparently rewrites %s to ? for
SQLite, so the same SQL works against both backends.
"""

from __future__ import annotations

from backend.auth.database import DbConnection


class DuplicateEmailError(Exception):
    """An account with this e-mail address already exists."""


def _is_integrity_error(exc: Exception) -> bool:
    """Check for unique-constraint violations across both backends."""
    import sqlite3
    if isinstance(exc, sqlite3.IntegrityError):
        return True
    try:
        import psycopg
        if isinstance(exc, (psycopg.errors.UniqueViolation, psycopg.IntegrityError)):
            return True
    except ImportError:
        pass
    return False


def create_user(conn: DbConnection, *, user_id, email, full_name, password_hash, role, created_at) -> None:
    try:
        with conn:  # commits on success, rolls back on error
            conn.execute(
                "INSERT INTO users (id, email, full_name, password_hash, role, created_at) "
                "VALUES (%s, %s, %s, %s, %s, %s)",
                (user_id, email, full_name, password_hash, role, created_at),
            )
    except Exception as error:
        if _is_integrity_error(error):
            raise DuplicateEmailError from error
        raise


def get_user_by_email(conn: DbConnection, email: str):
    return conn.execute("SELECT * FROM users WHERE email = %s", (email,)).fetchone()


def update_password_hash(conn: DbConnection, user_id: str, password_hash: str) -> None:
    with conn:
        conn.execute("UPDATE users SET password_hash = %s WHERE id = %s", (password_hash, user_id))


def touch_last_login(conn: DbConnection, user_id: str, timestamp: str) -> None:
    with conn:
        conn.execute("UPDATE users SET last_login_at = %s WHERE id = %s", (timestamp, user_id))


def create_session(conn: DbConnection, *, token_hash: str, user_id: str, created_at: int, expires_at: int) -> None:
    with conn:
        conn.execute(
            "INSERT INTO sessions (token_hash, user_id, created_at, expires_at) VALUES (%s, %s, %s, %s)",
            (token_hash, user_id, created_at, expires_at),
        )


def get_session_user(conn: DbConnection, token_hash: str, now: int):
    """The active user owning an unexpired session, or None."""
    # is_active is INTEGER(1/0) in SQLite, BOOLEAN in PostgreSQL.
    # Python True adapts correctly for both: SQLite treats True as 1,
    # psycopg sends True as PostgreSQL boolean.
    return conn.execute(
        "SELECT u.* FROM sessions s JOIN users u ON u.id = s.user_id "
        "WHERE s.token_hash = %s AND s.expires_at > %s AND u.is_active = %s",
        (token_hash, now, True),
    ).fetchone()


def delete_session(conn: DbConnection, token_hash: str) -> None:
    with conn:
        conn.execute("DELETE FROM sessions WHERE token_hash = %s", (token_hash,))


def delete_expired_sessions(conn: DbConnection, now: int) -> None:
    with conn:
        conn.execute("DELETE FROM sessions WHERE expires_at <= %s", (now,))
