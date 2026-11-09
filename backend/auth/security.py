"""
backend/auth/security.py

Password hashing, session tokens and the login throttle.

Design decisions
----------------
* Argon2id (argon2-cffi defaults follow RFC 9106): memory-hard, the current
  OWASP-recommended choice. Each hash contains its own random salt.
* Session token = 32 random bytes (256 bits). Only its SHA-256 hash is stored,
  so a leaked database cannot be replayed as live sessions. SHA-256 (no salt,
  no slow hash) is fine here because the input is high-entropy random data,
  unlike a human password.
* Unknown e-mail addresses still trigger one Argon2 verification against a
  dummy hash, so response time does not reveal which e-mails are registered.
"""

from __future__ import annotations

import hashlib
import secrets
import threading
import time

from argon2 import PasswordHasher
from argon2.exceptions import InvalidHashError, VerificationError, VerifyMismatchError

_hasher = PasswordHasher()
_DUMMY_HASH = _hasher.hash("nirikshan-timing-equaliser")

MAX_LOGIN_PASSWORD_LENGTH = 1024  # refuse absurd inputs before spending CPU hashing them


def hash_password(password: str) -> str:
    return _hasher.hash(password)


def verify_password(stored_hash: str | None, password: str) -> tuple[bool, str | None]:
    """
    Returns (is_valid, new_hash_or_None).

    new_hash is set when the stored hash uses outdated Argon2 parameters, so
    the caller can transparently upgrade it after a successful login.
    stored_hash=None (unknown user) verifies against a dummy hash and is False.
    """
    try:
        _hasher.verify(stored_hash or _DUMMY_HASH, password)
    except (VerifyMismatchError, VerificationError, InvalidHashError):
        return False, None
    if stored_hash is None:
        return False, None
    if _hasher.check_needs_rehash(stored_hash):
        return True, _hasher.hash(password)
    return True, None


def new_session_token() -> str:
    return secrets.token_urlsafe(32)


def hash_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


class LoginThrottle:
    """
    Remembers recent FAILED logins per (client IP, e-mail) and blocks further
    attempts once the limit is reached.

    In-memory, per process: it resets when the server restarts and is not
    shared between several workers. That is acceptable for an MVP; use a
    shared store (e.g. Redis) if you deploy several workers.
    """

    _MAX_KEYS = 10_000  # memory guard

    def __init__(self) -> None:
        self._failures: dict[tuple[str, str], list[float]] = {}
        self._lock = threading.Lock()

    def retry_after(self, key, max_attempts: int, window: int, now: float | None = None) -> int:
        """Seconds to wait before the next attempt; 0 means 'allowed'."""
        now = time.time() if now is None else now
        with self._lock:
            recent = [t for t in self._failures.get(key, []) if now - t < window]
            if recent:
                self._failures[key] = recent
            else:
                self._failures.pop(key, None)
            if len(recent) >= max_attempts:
                return int(window - (now - recent[0])) + 1
            return 0

    def record_failure(self, key, now: float | None = None) -> None:
        with self._lock:
            if len(self._failures) > self._MAX_KEYS:
                self._failures.clear()
            self._failures.setdefault(key, []).append(time.time() if now is None else now)

    def reset(self, key) -> None:
        with self._lock:
            self._failures.pop(key, None)

    def clear(self) -> None:
        with self._lock:
            self._failures.clear()


login_throttle = LoginThrottle()
