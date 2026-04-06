# Requirements: User Authentication & Authorization

## Functional Requirements

| ID | Requirement | Description | Priority |
|---|---|---|---|
| REQ-AUTH-001 | User Login | System shall authenticate users via email/password | High |
| REQ-AUTH-002 | JWT Token Generation | System shall generate JWT tokens upon successful login | High |
| REQ-AUTH-003 | Session Management | System shall manage user sessions with 8-hour timeout | High |
| REQ-AUTH-004 | Role-Based Access | System shall enforce different permissions for Security Guard vs Administrator | High |
| REQ-AUTH-005 | Password Validation | System shall validate password strength requirements | High |
| REQ-AUTH-006 | Logout Functionality | System shall securely terminate user sessions | Medium |
| REQ-AUTH-007 | Password Reset | System shall allow users to reset forgotten passwords | Medium |
| REQ-AUTH-008 | Login Attempt Logging | System shall log all login attempts for security audit | Medium |
| REQ-AUTH-009 | Account Lockout | System shall lock accounts after 5 failed login attempts | Medium |
| REQ-AUTH-010 | Session Invalidation | System shall invalidate all sessions when password is changed | Low |

## Non-Functional Requirements

| ID | Requirement | Target | Priority |
|---|---|---|---|
| NFR-AUTH-001 | Login Response Time | < 2 seconds | High |
| NFR-AUTH-002 | Password Hashing | bcrypt with salt rounds >= 12 | High |
| NFR-AUTH-003 | JWT Security | HS256 algorithm with strong secret | High |
| NFR-AUTH-004 | Session Security | Tokens not stored in localStorage | High |
| NFR-AUTH-005 | Password Requirements | Min 8 chars, uppercase, lowercase, number, special char | High |
| NFR-AUTH-006 | Concurrent Sessions | Maximum 3 active sessions per user | Medium |
| NFR-AUTH-007 | Token Expiration | 8 hours for access tokens | Medium |
| NFR-AUTH-008 | Audit Trail | All auth events logged with timestamps | Medium |
| NFR-AUTH-009 | Error Messages | Generic messages to prevent user enumeration | Medium |
| NFR-AUTH-010 | HTTPS Required | All auth endpoints must use HTTPS | High |

## Field Specifications

### User Entity Fields
| Field | Type | Required | Validation |
|---|---|---|---|
| id | UUID/Auto-increment | Auto | Primary key |
| email | String(255) | Yes | Valid email format, unique |
| password | String(255) | Yes | Hashed, meets requirements |
| name | String(255) | Yes | Min 2 chars, max 255 chars |
| role | Enum | Yes | 'security_guard' or 'administrator' |
| is_active | Boolean | Yes | Default true |
| last_login | Timestamp | No | Updated on login |
| created_at | Timestamp | Auto | Creation timestamp |
| updated_at | Timestamp | Auto | Update timestamp |

### Password Requirements
- Minimum 8 characters
- At least 1 uppercase letter (A-Z)
- At least 1 lowercase letter (a-z)
- At least 1 number (0-9)
- At least 1 special character (!@#$%^&*)
- Cannot contain user's email or name
- Cannot reuse last 5 passwords

### JWT Token Payload
```json
{
  "sub": "user-uuid",
  "email": "user@school.edu",
  "name": "John Guard",
  "role": "security_guard",
  "iat": 1640995200,
  "exp": 1641024000
}
```

## Security Requirements

### Authentication Security
- Passwords must be hashed using bcrypt
- JWT tokens must use strong secrets
- Failed login attempts must be rate limited
- Sessions must expire after inactivity
- Tokens must be invalidated on logout

### Authorization Security
- Role-based access control (RBAC)
- Security Guards cannot access admin functions
- Administrators cannot modify system settings
- All actions must be logged for audit

### Data Protection
- User passwords never stored in plain text
- JWT secrets stored securely (environment variables)
- Login attempts logged for security monitoring
- Account lockout after repeated failures

## User Stories

### Security Guard Authentication
**As a** Security Guard  
**I want to** log in securely to the system  
**So that** I can register visitors and access my assigned functions

**Acceptance Criteria:**
- I can enter my email and password
- System validates my credentials
- I receive a valid session token
- I can access visitor registration features
- I cannot access administrator functions

### Administrator Authentication
**As an** Administrator  
**I want to** log in with elevated privileges  
**So that** I can manage the system and generate reports

**Acceptance Criteria:**
- I can enter my email and password
- System validates my credentials
- I receive a valid session token
- I can access all system functions
- My actions are logged for audit

### Session Management
**As a** logged-in user  
**I want to** my session to be managed securely  
**So that** my account remains secure

**Acceptance Criteria:**
- My session expires after 8 hours
- I am automatically logged out on inactivity
- My token becomes invalid after logout
- I cannot use expired tokens
- Concurrent sessions are limited
