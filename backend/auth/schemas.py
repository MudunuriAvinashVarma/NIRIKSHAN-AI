"""
backend/auth/schemas.py

Request and response models for the auth endpoints (see AUTH_CONTRACT.md).

Design decisions
----------------
* Passwords are SecretStr: printing or logging a model shows '**********'
  instead of the password.
* The response model UserOut lists the ONLY fields that may leave the server.
  password_hash is not in it, so it cannot leak even by accident.
* camelCase aliases (fullName, confirmPassword, rememberMe) are accepted in
  addition to snake_case, because the frontend contract does not say which
  style the form sends.
* Role is never read from a request: self-registered accounts are always
  "Auditor". Higher roles must be granted by an administrator in the database.
"""

from __future__ import annotations

import unicodedata
from typing import Literal

from pydantic import (
    AliasChoices,
    BaseModel,
    ConfigDict,
    EmailStr,
    Field,
    SecretStr,
    field_validator,
    model_validator,
)

PASSWORD_MIN = 8
PASSWORD_MAX = 128


class UserOut(BaseModel):
    id: str
    email: str
    full_name: str
    role: str
    department: str | None = None


class RegisterRequest(BaseModel):
    model_config = ConfigDict(extra="ignore", populate_by_name=True)

    full_name: str = Field(validation_alias=AliasChoices("full_name", "fullName"))
    email: EmailStr = Field(max_length=254)
    password: SecretStr
    confirm_password: SecretStr | None = Field(
        default=None, validation_alias=AliasChoices("confirm_password", "confirmPassword")
    )

    @field_validator("full_name")
    @classmethod
    def clean_name(cls, value: str) -> str:
        value = " ".join(value.split())  # trim and collapse whitespace
        if not 1 <= len(value) <= 100:
            raise ValueError("Full name must be between 1 and 100 characters.")
        if any(unicodedata.category(ch).startswith("C") for ch in value):
            raise ValueError("Full name contains invalid characters.")
        return value

    @field_validator("email")
    @classmethod
    def lower_email(cls, value: str) -> str:
        return value.strip().lower()

    @field_validator("password")
    @classmethod
    def check_password(cls, value: SecretStr) -> SecretStr:
        if not PASSWORD_MIN <= len(value.get_secret_value()) <= PASSWORD_MAX:
            raise ValueError(f"Password must be between {PASSWORD_MIN} and {PASSWORD_MAX} characters.")
        return value

    @model_validator(mode="after")
    def passwords_match(self) -> "RegisterRequest":
        # confirm_password is optional because AUTH_CONTRACT.md does not list it;
        # when the frontend sends it, it must match.
        if self.confirm_password is not None and (
            self.confirm_password.get_secret_value() != self.password.get_secret_value()
        ):
            raise ValueError("Passwords do not match.")
        return self


class LoginRequest(BaseModel):
    """Fields are optional here so that a missing field gives the contract's
    400 'Missing required fields.' instead of FastAPI's default 422."""

    model_config = ConfigDict(extra="ignore", populate_by_name=True)

    email: str | None = None
    password: SecretStr | None = None
    remember_me: bool = Field(default=False, validation_alias=AliasChoices("remember_me", "rememberMe"))


class RegisterResponse(BaseModel):
    status: Literal["success"] = "success"
    message: str
    user: UserOut


class LoginResponse(RegisterResponse):
    pass


class MeResponse(BaseModel):
    status: Literal["success"] = "success"
    user: UserOut


class LogoutResponse(BaseModel):
    status: Literal["success"] = "success"
    message: str
