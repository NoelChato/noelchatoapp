# API Specification: User Authentication & Authorization

## Base URL
```
https://api.school-visitors.local/v1
```

## Authentication
All endpoints require Bearer token in Authorization header:
```
Authorization: Bearer <jwt_token>
```

---

## POST /auth/login
Authenticate user and return JWT token.

**Request:**
```json
{
  "email": "guard@school.edu",
  "password": "SecurePass123!"
}
```

**Response (200 - OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "Bearer",
  "expires_in": 28800,
  "user": {
    "id": "usr-001",
    "email": "guard@school.edu",
    "name": "John Guard",
    "role": "security_guard"
  }
}
```

**Response (400 - Bad Request):**
```json
{
  "error": "VALIDATION_ERROR",
  "message": "Email and password are required"
}
```

**Response (401 - Unauthorized):**
```json
{
  "error": "INVALID_CREDENTIALS",
  "message": "Email or password incorrect"
}
```

**Response (429 - Too Many Requests):**
```json
{
  "error": "RATE_LIMIT_EXCEEDED",
  "message": "Too many login attempts. Try again in 15 minutes"
}
```

---

## POST /auth/register
Register a new user account (Admin only).

**Request Headers:**
```
Authorization: Bearer <admin_jwt_token>
```

**Request:**
```json
{
  "email": "newguard@school.edu",
  "password": "SecurePass123!",
  "name": "Jane Smith",
  "role": "security_guard"
}
```

**Response (201 - Created):**
```json
{
  "id": "usr-002",
  "email": "newguard@school.edu",
  "name": "Jane Smith",
  "role": "security_guard",
  "created_at": "2024-03-30T10:00:00Z"
}
```

**Response (400 - Bad Request):**
```json
{
  "error": "VALIDATION_ERROR",
  "message": "Password does not meet requirements",
  "details": {
    "password": "Must contain uppercase, lowercase, number, and special character"
  }
}
```

**Response (409 - Conflict):**
```json
{
  "error": "EMAIL_EXISTS",
  "message": "User with this email already exists"
}
```

**Response (403 - Forbidden):**
```json
{
  "error": "FORBIDDEN",
  "message": "Only administrators can create user accounts"
}
```

---

## POST /auth/logout
Terminate user session and invalidate token.

**Request:**
```json
{}
```

**Response (200 - OK):**
```json
{
  "message": "Logged out successfully"
}
```

---

## POST /auth/refresh-token
Refresh expiring JWT token.

**Request:**
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response (200 - OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "expires_in": 28800
}
```

**Response (401 - Unauthorized):**
```json
{
  "error": "INVALID_TOKEN",
  "message": "Refresh token expired or invalid"
}
```

---

## POST /auth/forgot-password
Request password reset email.

**Request:**
```json
{
  "email": "user@school.edu"
}
```

**Response (200 - OK):**
```json
{
  "message": "If the email exists, a password reset link has been sent"
}
```

---

## POST /auth/reset-password
Reset password using reset token.

**Request:**
```json
{
  "token": "reset-token-here",
  "new_password": "NewSecurePass123!"
}
```

**Response (200 - OK):**
```json
{
  "message": "Password reset successfully"
}
```

**Response (400 - Bad Request):**
```json
{
  "error": "INVALID_TOKEN",
  "message": "Reset token is invalid or expired"
}
```

---

## GET /auth/me
Get current user profile information.

**Response (200 - OK):**
```json
{
  "id": "usr-001",
  "email": "guard@school.edu",
  "name": "John Guard",
  "role": "security_guard",
  "last_login": "2024-03-30T09:00:00Z",
  "created_at": "2024-01-15T08:00:00Z"
}
```

---

## PATCH /auth/change-password
Change current user's password.

**Request:**
```json
{
  "current_password": "OldPass123!",
  "new_password": "NewSecurePass456!"
}
```

**Response (200 - OK):**
```json
{
  "message": "Password changed successfully"
}
```

**Response (400 - Bad Request):**
```json
{
  "error": "INVALID_PASSWORD",
  "message": "Current password is incorrect"
}
```

---

## GET /users (Admin Only)
List all users (Administrator only).

**Response (200 - OK):**
```json
{
  "data": [
    {
      "id": "usr-001",
      "email": "guard@school.edu",
      "name": "John Guard",
      "role": "security_guard",
      "is_active": true,
      "last_login": "2024-03-30T09:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 15,
    "total_pages": 1
  }
}
```

---

## PATCH /users/:id (Admin Only)
Update user information (Administrator only).

**Request:**
```json
{
  "name": "Updated Name",
  "role": "administrator",
  "is_active": true
}
```

**Response (200 - OK):**
```json
{
  "id": "usr-001",
  "email": "guard@school.edu",
  "name": "Updated Name",
  "role": "administrator",
  "is_active": true,
  "updated_at": "2024-03-30T10:00:00Z"
}
```

---

## Error Response Format

All errors follow this format:

```json
{
  "error": "ERROR_CODE",
  "message": "Human-readable message",
  "timestamp": "2024-03-30T10:00:00Z",
  "path": "/auth/login",
  "status": 400,
  "details": {
    "field": "error message"
  }
}
```

---

## HTTP Status Codes

| Code | Meaning | Use Case |
|------|---------|----------|
| 200 | OK | Successful login, logout, profile fetch |
| 201 | Created | Successful user registration |
| 400 | Bad Request | Invalid input data |
| 401 | Unauthorized | Invalid credentials, expired token |
| 403 | Forbidden | Insufficient permissions |
| 409 | Conflict | Email already exists |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Server Error | Unexpected error |

---

## Rate Limiting

```
X-RateLimit-Limit: 5
X-RateLimit-Remaining: 4
X-RateLimit-Reset: 1711877400
```

- Login attempts: 5 per 15 minutes per IP
- Password reset: 3 per hour per email
- API calls: 1000 per hour per user

---

## Security Headers

All responses include:
```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000
Content-Security-Policy: default-src 'self'
```

---

## CORS Configuration

```
Access-Control-Allow-Origin: https://school-visitors.local
Access-Control-Allow-Methods: GET, POST, PATCH, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Max-Age: 86400
```
