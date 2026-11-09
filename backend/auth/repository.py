"""
backend/auth/repository.py

All SQL lives here. Every query uses ? placeholders (parameters), never string
formatting, so user input cannot change the SQL (no SQL injection).
"""

from __future__ import annotations

import sqlite3


class DuplicateEmailError(Exception):
    """An account with this e-mail address already exists."""


def create_user(conn, *, user_id, email, full_name, password_hash, role, created_at) -> None:
    try:
        with conn:  # commits on success, rolls back on error
            conn.execute(
                "INSERT INTO users (id, email, full_name, password_hash, role, created_at) "
                "VALUES (?, ?, ?, ?, ?, ?)",
                (user_id, email, full_name, password_hash, role, created_at),
            )
    except sqlite3.IntegrityError as error:
        # The UNIQUE constraint is the real guard: it is race-safe even if two
        # identical sign-ups arrive at the same moment.
        raise DuplicateEmailError from error


def get_user_by_email(conn, email: str):
    return conn.execute("SELECT * FROM users WHERE email = ?", (email,)).fetchone()


def update_password_hash(conn, user_id: str, password_hash: str) -> None:
    with conn:
        conn.execute("UPDATE users SET password_hash = ? WHERE id = ?", (password_hash, user_id))


def touch_last_login(conn, user_id: str, timestamp: str) -> None:
    with conn:
        conn.execute("UPDATE users SET last_login_at = ? WHERE id = ?", (timestamp, user_id))


def create_session(conn, *, token_hash: str, user_id: str, created_at: int, expires_at: int) -> None:
    with conn:
        conn.execute(
            "INSERT INTO sessions (token_hash, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)",
            (token_hash, user_id, created_at, expires_at),
        )


def get_session_user(conn, token_hash: str, now: int):
    """The active user owning an unexpired session, or None."""
    return conn.execute(
        "SELECT u.* FROM sessions s JOIN users u ON u.id = s.user_id "
        "WHERE s.token_hash = ? AND s.expires_at > ? AND u.is_active = 1",
        (token_hash, now),
    ).fetchone()


def delete_session(conn, token_hash: str) -> None:
    with conn:
        conn.execute("DELETE FROM sessions WHERE token_hash = ?", (token_hash,))


def delete_expired_sessions(conn, now: int) -> None:
    with conn:
        conn.execute("DELETE FROM sessions WHERE expires_at <= ?", (now,))
