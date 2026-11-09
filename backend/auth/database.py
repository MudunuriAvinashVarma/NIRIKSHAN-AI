"""
backend/auth/database.py

SQLite connection and schema creation for users and sessions.

Design decisions
----------------
* The schema is created with CREATE TABLE IF NOT EXISTS, so starting the
  server on a fresh machine "just works" and restarts never wipe data.
* One short-lived connection per request (SQLite connections are cheap).
  check_same_thread=False is needed because FastAPI may open and close a
  request's connection on different worker threads; each connection is still
  used by only one request at a time.
* The default rollback journal is used (not WAL): WAL creates extra -wal/-shm
  files that cloud-sync folders such as OneDrive can interfere with.
* Foreign keys are switched on per connection (SQLite default is off).
"""

from __future__ import annotations

import sqlite3
import threading
from pathlib import Path

SCHEMA = """
CREATE TABLE IF NOT EXISTS users (
    id            TEXT PRIMARY KEY,
    email         TEXT NOT NULL UNIQUE,          -- stored lower-case
    full_name     TEXT NOT NULL,
    password_hash TEXT NOT NULL,                 -- Argon2id string, never the password
    role          TEXT NOT NULL DEFAULT 'Auditor',
    department    TEXT,
    is_active     INTEGER NOT NULL DEFAULT 1,
    created_at    TEXT NOT NULL,
    last_login_at TEXT
);

CREATE TABLE IF NOT EXISTS sessions (
    token_hash TEXT PRIMARY KEY,                 -- SHA-256 of the cookie value
    user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at INTEGER NOT NULL,                 -- Unix seconds
    expires_at INTEGER NOT NULL                  -- Unix seconds
);

CREATE INDEX IF NOT EXISTS idx_sessions_user   ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expiry ON sessions(expires_at);
"""

_initialised: set[str] = set()
_lock = threading.Lock()


def ensure_db(path: Path) -> None:
    """Create the folder, file and tables once per process (idempotent)."""
    key = str(Path(path).resolve())
    with _lock:
        if key in _initialised:
            return
        Path(path).parent.mkdir(parents=True, exist_ok=True)
        conn = sqlite3.connect(path)
        try:
            conn.executescript(SCHEMA)
            conn.commit()
        finally:
            conn.close()
        _initialised.add(key)


def connect(path: Path) -> sqlite3.Connection:
    ensure_db(path)
    conn = sqlite3.connect(path, timeout=10, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn
