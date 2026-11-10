"""
backend/auth/database.py

Dual-backend database layer: SQLite (default, local) or PostgreSQL (production).

Which backend is active?
-------------------------
* When an ``AuthSettings`` object is passed to ``ensure_db()`` or ``connect()``,
  its own ``database_url`` and ``db_path`` properties control the backend
  (PostgreSQL when ``database_url`` is non-empty, otherwise SQLite at ``db_path``).
* When a legacy ``Path`` (or path string) is passed, the ``NIRIKSHAN_DATABASE_URL``
  environment variable selects PostgreSQL if set and non-empty, falling back
  to SQLite at that ``Path``.

Abstraction
-----------
Both backends expose the same three public helpers:

* ``ensure_db(path_or_settings)``  – create tables on first call (idempotent).
* ``connect(path_or_settings)``    – return a connection/cursor-like object.
* ``is_postgres(path_or_settings=None)`` – True when PostgreSQL is selected.

The ``DbConnection`` wrapper unifies the interface so that ``repository.py``
does not need to know which backend it is talking to.  Parameter placeholders
are always written as ``%s`` in SQL strings; for SQLite, ``DbConnection``
transparently rewrites them to ``?``.
"""

from __future__ import annotations

import os
import sqlite3
import threading
from pathlib import Path
from typing import Any, Sequence

from backend.auth.config import AuthSettings

# ---------------------------------------------------------------------------
# SQL schemas – one per backend (syntax differs).
# ---------------------------------------------------------------------------
_SQLITE_SCHEMA = """\
CREATE TABLE IF NOT EXISTS users (
    id            TEXT PRIMARY KEY,
    email         TEXT NOT NULL UNIQUE,
    full_name     TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    role          TEXT NOT NULL DEFAULT 'Auditor',
    department    TEXT,
    is_active     INTEGER NOT NULL DEFAULT 1,
    created_at    TEXT NOT NULL,
    last_login_at TEXT
);

CREATE TABLE IF NOT EXISTS sessions (
    token_hash TEXT PRIMARY KEY,
    user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at INTEGER NOT NULL,
    expires_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sessions_user   ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expiry ON sessions(expires_at);
"""

_POSTGRES_SCHEMA = """\
CREATE TABLE IF NOT EXISTS users (
    id            TEXT PRIMARY KEY,
    email         TEXT NOT NULL UNIQUE,
    full_name     TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    role          TEXT NOT NULL DEFAULT 'Auditor',
    department    TEXT,
    is_active     BOOLEAN NOT NULL DEFAULT TRUE,
    created_at    TEXT NOT NULL,
    last_login_at TEXT
);

CREATE TABLE IF NOT EXISTS sessions (
    token_hash TEXT PRIMARY KEY,
    user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at BIGINT NOT NULL,
    expires_at BIGINT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sessions_user   ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expiry ON sessions(expires_at);
"""

# ---------------------------------------------------------------------------
# Thin wrapper that unifies sqlite3.Connection and psycopg.Connection.
# ---------------------------------------------------------------------------

class DbConnection:
    """
    Minimal DB-API wrapper.

    * ``execute(sql, params)`` – runs one statement, returns rows as dicts.
    * ``commit()`` / ``rollback()`` / ``close()`` – delegate to the real connection.
    * Context-manager usage (``with conn:``) auto-commits on success, rolls back
      on exception — matching the sqlite3 behaviour the codebase already relies on.
    * For SQLite: ``%s`` placeholders are rewritten to ``?``.
    """

    __slots__ = ("_conn", "_backend")

    def __init__(self, conn: Any, backend: str) -> None:
        self._conn = conn
        self._backend = backend  # "sqlite" or "postgres"

    # -- context manager (with conn:) ----------------------------------------
    def __enter__(self) -> "DbConnection":
        if self._backend == "sqlite":
            self._conn.__enter__()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb) -> None:
        if self._backend == "sqlite":
            self._conn.__exit__(exc_type, exc_val, exc_tb)
        else:
            if exc_type is None:
                self._conn.commit()
            else:
                self._conn.rollback()

    # -- query / execute -----------------------------------------------------
    def execute(self, sql: str, params: Sequence = ()) -> _ResultProxy:
        if self._backend == "sqlite":
            sql = sql.replace("%s", "?")
            cursor = self._conn.execute(sql, params)
        else:
            cursor = self._conn.cursor()
            cursor.execute(sql, params)
        return _ResultProxy(cursor, self._backend)

    # -- transaction helpers -------------------------------------------------
    def commit(self) -> None:
        self._conn.commit()

    def rollback(self) -> None:
        self._conn.rollback()

    def close(self) -> None:
        self._conn.close()

    @property
    def backend(self) -> str:
        return self._backend


class _ResultProxy:
    """Wraps a DB-API cursor so rows come back as dicts."""

    __slots__ = ("_cursor", "_backend")

    def __init__(self, cursor: Any, backend: str) -> None:
        self._cursor = cursor
        self._backend = backend

    def fetchone(self) -> dict | None:
        row = self._cursor.fetchone()
        if row is None:
            return None
        if self._backend == "sqlite":
            # sqlite3.Row already supports dict-like access via keys()
            return dict(row)
        # psycopg with RealDictCursor returns a RealDictRow (dict subclass)
        return dict(row)

    def fetchall(self) -> list[dict]:
        rows = self._cursor.fetchall()
        if self._backend == "sqlite":
            return [dict(r) for r in rows]
        return [dict(r) for r in rows]


# ---------------------------------------------------------------------------
# Backend detection
# ---------------------------------------------------------------------------

def _get_database_url() -> str | None:
    """Return the PostgreSQL DSN from the environment, or None for SQLite."""
    url = os.getenv("NIRIKSHAN_DATABASE_URL", "").strip()
    return url or None


def _is_settings(obj: Any) -> bool:
    return isinstance(obj, AuthSettings) or (
        hasattr(obj, "database_url") and hasattr(obj, "db_path")
    )


def _resolve_target(path_or_settings: Any) -> tuple[str | None, Path | None]:
    """
    Resolve either (postgres_dsn, None) or (None, sqlite_path).

    * AuthSettings -> uses ``settings.database_url`` and ``settings.db_path``
      directly without consulting ``os.getenv()``.
    * Path / str   -> checks ``NIRIKSHAN_DATABASE_URL`` env var, falling back
      to SQLite at the supplied path.
    """
    if _is_settings(path_or_settings):
        dsn = (path_or_settings.database_url or "").strip()
        if dsn:
            return dsn, None
        return None, Path(path_or_settings.db_path)

    dsn = _get_database_url()
    if dsn:
        return dsn, None
    return None, Path(path_or_settings)


def is_postgres(path_or_settings: Any = None) -> bool:
    """True when the PostgreSQL backend is active for the given config or env."""
    if path_or_settings is None:
        return _get_database_url() is not None
    dsn, _ = _resolve_target(path_or_settings)
    return dsn is not None


# ---------------------------------------------------------------------------
# SQLite backend
# ---------------------------------------------------------------------------

_sqlite_initialised: set[str] = set()
_sqlite_lock = threading.Lock()


def _ensure_sqlite(path: Path) -> None:
    key = str(Path(path).resolve())
    with _sqlite_lock:
        if key in _sqlite_initialised:
            return
        Path(path).parent.mkdir(parents=True, exist_ok=True)
        conn = sqlite3.connect(path)
        try:
            conn.executescript(_SQLITE_SCHEMA)
            conn.commit()
        finally:
            conn.close()
        _sqlite_initialised.add(key)


def _connect_sqlite(path: Path) -> DbConnection:
    _ensure_sqlite(path)
    conn = sqlite3.connect(path, timeout=10, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return DbConnection(conn, "sqlite")


# ---------------------------------------------------------------------------
# PostgreSQL backend
# ---------------------------------------------------------------------------

_pg_initialised: set[str] = set()
_pg_lock = threading.Lock()


def _ensure_postgres(dsn: str) -> None:
    with _pg_lock:
        if dsn in _pg_initialised:
            return
        import psycopg
        conn = psycopg.connect(dsn, autocommit=True)
        try:
            conn.execute(_POSTGRES_SCHEMA)
        finally:
            conn.close()
        _pg_initialised.add(dsn)


def _connect_postgres(dsn: str) -> DbConnection:
    _ensure_postgres(dsn)
    import psycopg
    from psycopg.rows import dict_row
    conn = psycopg.connect(dsn, row_factory=dict_row, autocommit=False)
    return DbConnection(conn, "postgres")


# ---------------------------------------------------------------------------
# Public API (used by router.py, main.py, tests)
# ---------------------------------------------------------------------------

def ensure_db(path_or_settings: AuthSettings | Path | str) -> None:
    """
    Create tables if they don't exist.

    Accepts either:
    * an ``AuthSettings`` instance (uses ``database_url`` and ``db_path``)
    * a ``Path`` (legacy SQLite call; checks ``NIRIKSHAN_DATABASE_URL`` env var)
    """
    dsn, path = _resolve_target(path_or_settings)
    if dsn:
        _ensure_postgres(dsn)
    else:
        assert path is not None
        _ensure_sqlite(path)


def connect(path_or_settings: AuthSettings | Path | str) -> DbConnection:
    """
    Return a ``DbConnection`` for the active backend.

    Accepts either:
    * an ``AuthSettings`` instance (uses ``database_url`` and ``db_path``)
    * a ``Path`` (legacy SQLite call; checks ``NIRIKSHAN_DATABASE_URL`` env var)
    """
    dsn, path = _resolve_target(path_or_settings)
    if dsn:
        return _connect_postgres(dsn)
    assert path is not None
    return _connect_sqlite(path)
