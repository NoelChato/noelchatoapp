# Invariants: User Authentication & Authorization

Invariants are rules that must always be true in the authentication system. They are enforced at the database level and application logic level.

---

## User Account Invariants

**INV-AUTH-001: Email Uniqueness**
```
Every user account MUST have a unique email address:
- Case-insensitive comparison (john@school.edu = JOHN@school.edu)
- Email format must be valid (RFC 5322 compliant)
- Cannot be changed after account creation
- Soft-deleted accounts cannot be reused
```

**INV-AUTH-002: Password Requirements**
```
User passwords MUST meet security requirements:
- Minimum 8 characters, maximum 128 characters
- At least 1 uppercase letter (A-Z)
- At least 1 lowercase letter (a-z)
- At least 1 number (0-9)
- At least 1 special character (!@#$%^&*)
- NOT contain the user's email address
- NOT contain the user's name
- NOT be in the list of common passwords
```

**INV-AUTH-003: Role Assignment**
```
User role MUST be one of predefined values:
- 'security_guard' - Basic access for visitor registration
- 'administrator' - Full access including user management
- Role cannot be null or empty
- Role changes must be logged for audit
```

**INV-AUTH-004: Account Status**
```
User account status MUST be properly managed:
- is_active defaults to true for new accounts
- Deactivated accounts cannot login
- Deactivated accounts retain data for audit
- Only administrators can change account status
```

---

## Authentication Invariants

**INV-AUTH-005: JWT Token Validity**
```
JWT tokens MUST be cryptographically valid:
- Signed with HS256 algorithm
- Contains valid payload structure
- Not expired (8-hour maximum lifetime)
- Issued by trusted authority
- Not tampered with (signature verification)
```

**INV-AUTH-006: Session Management**
```
User sessions MUST be properly managed:
- Maximum 3 concurrent sessions per user
- Sessions expire after 8 hours of inactivity
- Logout invalidates all user sessions
- Session tokens are unique per login
- Compromised sessions can be invalidated
```

**INV-AUTH-007: Login Attempt Limits**
```
Failed login attempts MUST be rate limited:
- Maximum 5 attempts per 15-minute window
- Account lockout after limit exceeded
- Lockout duration increases with repeated violations
- Successful login resets attempt counter
- Lockout events are logged for security
```

**INV-AUTH-008: Password History**
```
Password changes MUST maintain history:
- Cannot reuse current password
- Cannot reuse last 5 passwords
- Password history retained for 2 years
- History prevents password cycling attacks
- Admin password resets bypass history check
```

---

## Authorization Invariants

**INV-AUTH-009: Role-Based Access Control**
```
Permissions MUST be strictly enforced by role:
- Security Guard: visitor registration, time tracking, basic search
- Administrator: all guard permissions + reports + user management
- System operations require appropriate role
- Permission violations are logged and blocked
- No privilege escalation allowed
```

**INV-AUTH-010: Resource Ownership**
```
Users MUST only access their own resources:
- Security guards see only visitors they registered
- Administrators see all system data
- Cross-user data access is forbidden
- Data filtering enforced at database level
- Access violations trigger security alerts
```

**INV-AUTH-011: Administrative Actions**
```
Administrator actions MUST be restricted and audited:
- User creation/modification requires admin role
- System configuration changes logged
- Bulk operations have additional verification
- Critical actions require confirmation
- All admin actions timestamped and attributed
```

---

## Security Invariants

**INV-AUTH-012: Password Storage**
```
Passwords MUST be securely stored:
- Hashed using bcrypt with minimum 12 salt rounds
- Never stored in plain text
- Never logged in application logs
- Hash verification uses constant-time comparison
- Password reset tokens expire within 1 hour
```

**INV-AUTH-013: Audit Trail**
```
All authentication events MUST be logged:
- Login attempts (successful and failed)
- Password changes and resets
- Account creation, modification, deactivation
- Role changes and permission grants
- Session creation and termination
- Logs retained for minimum 2 years
```

**INV-AUTH-014: Token Security**
```
JWT tokens MUST follow security best practices:
- Strong secret key (minimum 256 bits)
- Short expiration time (8 hours max)
- No sensitive data in token payload
- Tokens invalidated on logout
- Refresh tokens stored securely
- Token reuse detection and prevention
```

**INV-AUTH-015: Input Validation**
```
All authentication inputs MUST be validated:
- Email format validation (RFC compliant)
- Password strength checking
- SQL injection prevention
- XSS protection on all inputs
- Rate limiting on authentication endpoints
- Input sanitization before processing
```

---

## System Invariants

**INV-AUTH-016: Database Integrity**
```
User data MUST maintain referential integrity:
- Foreign key constraints on all relationships
- Cascade deletes prevented for audit data
- Soft deletes for user accounts
- Data consistency across all tables
- Transaction safety for multi-step operations
```

**INV-AUTH-017: Performance Requirements**
```
Authentication operations MUST meet performance targets:
- Login response time < 2 seconds (95th percentile)
- Token validation < 100ms
- User lookup < 500ms
- Concurrent authentication support for 50+ users
- Database queries optimized with proper indexing
```

**INV-AUTH-018: Error Handling**
```
Authentication errors MUST be handled securely:
- Generic error messages prevent user enumeration
- Sensitive information never exposed in errors
- Failed authentication attempts logged but not exposed
- System errors don't reveal internal structure
- Graceful degradation during service failures
```

---

## Constraint Enforcement

### Database Constraints
```sql
-- Email uniqueness (case-insensitive)
UNIQUE INDEX idx_user_email_unique ON users (LOWER(email));

-- Role enum constraint
CHECK (role IN ('security_guard', 'administrator'));

-- Password hash not null
CHECK (password_hash IS NOT NULL AND LENGTH(password_hash) > 0);

-- Account status default
DEFAULT (is_active = true);
```

### Application Constraints
```typescript
// Password validation
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

// JWT payload validation
interface JWTPayload {
  sub: string;
  email: string;
  role: 'security_guard' | 'administrator';
  iat: number;
  exp: number;
}
```

### API Constraints
```typescript
// Rate limiting
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: 'Too many login attempts, try again later'
});
```

---

## Violation Handling

| Invariant | Violation Type | Action | Severity |
|-----------|----------------|--------|----------|
| INV-AUTH-001 | Duplicate email | Reject registration | High |
| INV-AUTH-002 | Weak password | Reject with requirements | High |
| INV-AUTH-005 | Invalid token | Return 401 Unauthorized | Medium |
| INV-AUTH-007 | Rate limit exceeded | Return 429 Too Many Requests | Medium |
| INV-AUTH-009 | Permission denied | Return 403 Forbidden | High |
| INV-AUTH-012 | Plain text password | Security alert, immediate fix | Critical |
| INV-AUTH-013 | Missing audit log | Log gap alert | Medium |
| INV-AUTH-016 | Data inconsistency | Database integrity check | High |

---

## Testing Invariants

```gherkin
Feature: Authentication Invariants

  Scenario: Email uniqueness enforcement
    Given a user exists with email "john@school.edu"
    When attempting to register "JOHN@school.edu"
    Then system shall reject with "Email already exists"

  Scenario: Password strength requirements
    Given password "weak"
    When validating password strength
    Then system shall reject with specific requirements

  Scenario: Role-based access control
    Given user with role "security_guard"
    When accessing admin endpoint "/users"
    Then system shall return 403 Forbidden

  Scenario: Session limits
    Given user has 3 active sessions
    When attempting 4th login
    Then system shall invalidate oldest session

  Scenario: Audit trail completeness
    Given user login attempt
    When login succeeds or fails
    Then event shall be logged with timestamp and details
```
