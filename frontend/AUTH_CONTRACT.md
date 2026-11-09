# NIRIKSHAN AI — Backend Authentication API Contract for Claude

> **Target Service**: FastAPI Python Backend  
> **Base URL**: `http://127.0.0.1:8000/api/v1`  
> **Frontend Integration**: Next.js 14 (App Router) + TypeScript (`frontend/src/context/AuthContext.tsx`)  
> **Security Standard**: HTTP-Only, Secure, SameSite=Lax Cookie (Zero token exposure in `localStorage`)

---

## 1. Overview & Architectural Principles

1. **Zero Storage of Tokens in `localStorage`**:  
   Authentication tokens (JWT) must **never** be delivered in response bodies for client-side storage. Instead, the backend must set an **`access_token` HTTP-Only cookie**.
2. **Session Persistence**:  
   On page load or refresh, the Next.js frontend calls `GET /api/v1/auth/me` with `credentials: "include"`. If the cookie is valid, the user profile is returned.
3. **CORS & Cookie Requirements in FastAPI**:  
   The FastAPI `CORSMiddleware` must specify:
   ```python
   app.add_middleware(
       CORSMiddleware,
       allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
       allow_credentials=True, # Essential for HTTP-only cookies
       allow_methods=["*"],
       allow_headers=["*"],
   )
   ```

---

## 2. API Endpoints Specification

### 2.1 Sign In (`POST /api/v1/auth/login`)
Authenticates auditor or analyst credentials and issues an HTTP-Only session cookie.

- **Request Headers**: `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "email": "auditor@nirikshan.gov.in",
    "password": "SecurePassword123"
  }
  ```
- **Success Response (200 OK)**:
  - **Set-Cookie Header**: `access_token=<JWT_TOKEN>; HttpOnly; Path=/; SameSite=Lax; Max-Age=86400`
  - **Response Body**:
    ```json
    {
      "status": "success",
      "message": "Authentication successful.",
      "user": {
        "id": "usr_01",
        "email": "auditor@nirikshan.gov.in",
        "full_name": "Dr. Rajesh Varma",
        "role": "Senior Auditor",
        "department": "Public Accounts Committee"
      }
    }
    ```
- **Error Responses**:
  - `401 Unauthorized`: `{ "detail": "Invalid institutional email or password." }`
  - `400 Bad Request`: `{ "detail": "Missing required fields." }`

---

### 2.2 Register Account (`POST /api/v1/auth/register`)
Registers a new institutional investigator account.

- **Request Body**:
  ```json
  {
    "full_name": "Dr. Rajesh Varma",
    "email": "auditor@nirikshan.gov.in",
    "password": "SecurePassword123"
  }
  ```
- **Success Response (201 Created)**:
  ```json
  {
    "status": "success",
    "message": "Account created successfully.",
    "user": {
      "id": "usr_01",
      "email": "auditor@nirikshan.gov.in",
      "full_name": "Dr. Rajesh Varma",
      "role": "Auditor"
    }
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: `{ "detail": "An account with this email address already exists." }`
  - `422 Unprocessable Entity`: Validation failure on password length or email format.

---

### 2.3 Verify Current Session (`GET /api/v1/auth/me`)
Called on frontend application mount to verify active clearance.

- **Request Headers**: Must include browser cookies (`credentials: "include"`).
- **Success Response (200 OK)**:
  ```json
  {
    "status": "success",
    "user": {
      "id": "usr_01",
      "email": "auditor@nirikshan.gov.in",
      "full_name": "Dr. Rajesh Varma",
      "role": "Senior Auditor"
    }
  }
  ```
- **Error Response (401 Unauthorized)**:
  ```json
  {
    "detail": "Session expired or invalid. Please re-authenticate."
  }
  ```

---

### 2.4 Sign Out (`POST /api/v1/auth/logout`)
Terminates the active session and invalidates the session cookie.

- **Success Response (200 OK)**:
  - **Set-Cookie Header**: `access_token=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0`
  - **Response Body**:
    ```json
    {
      "status": "success",
      "message": "Session terminated successfully."
    }
    ```

---

## 3. Fast Reference for Claude

When ready to implement in `backend/main.py` or `backend/auth.py`:
- Use `passlib[bcrypt]` or `bcrypt` for hashing.
- Use `python-jose[cryptography]` for JWT creation and signature verification.
- Set cookie using FastAPI `response.set_cookie(key="access_token", value=token, httponly=True, samesite="lax")`.

