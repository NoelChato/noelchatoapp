# Architectural Decisions: User Authentication & Authorization

This document records key architectural decisions made for the authentication system.

---

## Decision Log

### AD-AUTH-001: JWT vs Session-Based Authentication

**Context:** Need to choose authentication mechanism for stateless API access.

**Decision:** Use JWT (JSON Web Tokens) with refresh token rotation.

**Rationale:**
- Stateless authentication fits REST API design
- Better scalability than server-side sessions
- Works well with mobile apps and SPAs
- Industry standard for modern web applications

**Alternatives Considered:**
- Session-based: Requires server-side storage, harder to scale
- API Keys: Less secure, harder to revoke
- OAuth2: Overkill for internal system

**Consequences:**
- ✅ Stateless, scalable
- ✅ Mobile-friendly
- ✅ Standard implementation
- ⚠️ Token revocation requires refresh token invalidation
- ⚠️ Need secure token storage on client

---

### AD-AUTH-002: Password Hashing Algorithm

**Context:** Need secure password storage with future-proof algorithm.

**Decision:** Use bcrypt with salt rounds of 12.

**Rationale:**
- Resistant to rainbow table attacks (salting)
- Slow hashing prevents brute force attacks
- Adaptive (can increase rounds as hardware improves)
- Widely supported and battle-tested

**Alternatives Considered:**
- SHA-256: Fast but vulnerable to brute force
- PBKDF2: Good but bcrypt is more secure
- Argon2: Newer but bcrypt is sufficient and more widely supported

**Consequences:**
- ✅ Strong security against attacks
- ✅ Future-proof with adjustable rounds
- ⚠️ Slower than fast hashes (by design)
- ⚠️ Need to handle migration if changing algorithms

---

### AD-AUTH-003: Role-Based Access Control (RBAC)

**Context:** Need to control access based on user roles in school environment.

**Decision:** Implement RBAC with three roles: security_guard, administrator, system_admin.

**Rationale:**
- Clear separation of responsibilities
- Easy to understand and maintain
- Scalable for future role additions
- Matches school organizational structure

**Alternatives Considered:**
- ACL (Access Control Lists): Too granular, complex to manage
- ABAC (Attribute-Based): Overkill for current requirements
- Flat permissions: Doesn't scale with organizational complexity

**Consequences:**
- ✅ Clear role definitions
- ✅ Easy permission management
- ✅ Matches school hierarchy
- ⚠️ Need careful role assignment process

---

### AD-AUTH-004: Session Management Strategy

**Context:** Need to handle multiple concurrent sessions per user.

**Decision:** Allow maximum 3 concurrent sessions per user, invalidate oldest on new login.

**Rationale:**
- Balances security with usability
- Prevents unlimited session accumulation
- Clear user expectation (3 devices)
- Easy to implement and understand

**Alternatives Considered:**
- Single session: Too restrictive for shared devices
- Unlimited sessions: Security risk
- Time-based limits: More complex to manage

**Consequences:**
- ✅ Reasonable device limit
- ✅ Automatic cleanup
- ✅ User-friendly
- ⚠️ May require logout from old devices

---

### AD-AUTH-005: Rate Limiting Implementation

**Context:** Need to prevent brute force attacks and abuse.

**Decision:** Implement sliding window rate limiting (5 attempts per 15 minutes for login).

**Rationale:**
- Prevents brute force attacks effectively
- Allows legitimate retries within reasonable time
- Sliding window is more user-friendly than fixed windows
- Standard practice for authentication endpoints

**Alternatives Considered:**
- Fixed window: Less user-friendly (resets at fixed times)
- Exponential backoff: More complex implementation
- CAPTCHA: Poor UX, not always effective

**Consequences:**
- ✅ Effective against brute force
- ✅ User-friendly retry windows
- ⚠️ Requires Redis/external storage for distributed systems

---

### AD-AUTH-006: Email Verification Strategy

**Context:** Need to verify user email addresses for account security.

**Decision:** Require email verification for new registrations, optional for existing users.

**Rationale:**
- Prevents fake accounts and typos
- Improves account security
- Standard practice for user registration
- Balances security with usability for existing users

**Alternatives Considered:**
- No verification: Security risk
- Mandatory for all: Disrupts existing workflows
- Phone verification: Requires additional infrastructure

**Consequences:**
- ✅ Improved account security
- ✅ Prevents email typos
- ⚠️ Additional user friction during registration
- ⚠️ Need email service reliability

---

### AD-AUTH-007: Password Reset Flow

**Context:** Need secure password reset mechanism.

**Decision:** Time-limited reset tokens (1 hour) sent via email.

**Rationale:**
- Secure (tokens expire quickly)
- Standard user experience
- Prevents token reuse attacks
- Easy to implement

**Alternatives Considered:**
- Security questions: Less secure, poor UX
- SMS reset: Requires phone numbers
- Admin-only reset: Not user-friendly

**Consequences:**
- ✅ Secure and standard
- ✅ Good user experience
- ⚠️ Depends on email delivery
- ⚠️ Tokens can be intercepted if email compromised

---

### AD-AUTH-008: Audit Logging Strategy

**Context:** Need comprehensive audit trail for security and compliance.

**Decision:** Log all authentication events with structured JSON format.

**Rationale:**
- Essential for security investigations
- Helps with compliance requirements
- Enables monitoring and alerting
- Structured format enables analysis

**Alternatives Considered:**
- Minimal logging: Insufficient for security
- Database-only: Harder to analyze
- External SIEM: Overkill for current scale

**Consequences:**
- ✅ Comprehensive security trail
- ✅ Compliance support
- ⚠️ Storage and performance considerations
- ⚠️ Need log rotation and retention policies

---

### AD-AUTH-009: Multi-Tenant Architecture

**Context:** System may serve multiple schools/organizations.

**Decision:** Database-level tenant isolation with tenant_id in all tables.

**Rationale:**
- Complete data isolation between tenants
- Easy to implement with ORM
- Supports future scaling needs
- Clear separation of concerns

**Alternatives Considered:**
- Schema-per-tenant: More complex, harder to maintain
- Shared schema with views: Less secure isolation
- Separate databases: Operational complexity

**Consequences:**
- ✅ Strong isolation
- ✅ Scalable architecture
- ⚠️ Query complexity increases
- ⚠️ Migration challenges for multi-tenant

---

### AD-AUTH-010: Token Refresh Strategy

**Context:** Need to handle token expiration without constant re-login.

**Decision:** Use refresh tokens with rotation (new refresh token on each use).

**Rationale:**
- Prevents refresh token reuse attacks
- Balances security with usability
- Standard OAuth2 pattern
- Automatic token refresh possible

**Alternatives Considered:**
- Long-lived access tokens: Less secure
- No refresh tokens: Poor UX
- Refresh without rotation: Vulnerable to replay attacks

**Consequences:**
- ✅ Strong security
- ✅ Good user experience
- ⚠️ More complex implementation
- ⚠️ Need secure refresh token storage

---

### AD-AUTH-011: Account Lockout Policy

**Context:** Need to handle suspicious login attempts.

**Decision:** Lock account after 5 failed attempts for 30 minutes.

**Rationale:**
- Prevents brute force attacks
- Reasonable lockout duration
- Allows legitimate users to retry
- Standard security practice

**Alternatives Considered:**
- Permanent lockout: Poor UX
- No lockout: Security risk
- Progressive delays: More complex

**Consequences:**
- ✅ Effective against attacks
- ✅ Reasonable user experience
- ⚠️ Can be used for DoS attacks
- ⚠️ Need unlock mechanism

---

### AD-AUTH-012: Password History Policy

**Context:** Need to prevent password reuse.

**Decision:** Prevent reuse of last 5 passwords.

**Rationale:**
- Prevents password cycling attacks
- Reasonable history depth
- Balances security with usability
- Easy to implement

**Alternatives Considered:**
- No history: Security risk
- Unlimited history: Storage concerns
- Time-based: More complex logic

**Consequences:**
- ✅ Prevents common attacks
- ✅ Reasonable constraints
- ⚠️ Storage of password hashes
- ⚠️ Migration for existing users

---

## Technology Choices

### Core Dependencies
```json
{
  "@nestjs/jwt": "^10.1.0",
  "@nestjs/passport": "^10.0.0",
  "bcrypt": "^5.1.0",
  "passport-jwt": "^4.0.1",
  "passport-local": "^1.0.0",
  "class-validator": "^0.14.0",
  "class-transformer": "^0.5.1"
}
```

### Database Schema
```sql
-- Users table with authentication fields
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('security_guard', 'administrator', 'system_admin') NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  email_verified BOOLEAN DEFAULT FALSE,
  last_login_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Refresh tokens for session management
CREATE TABLE refresh_tokens (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  token_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Audit log for security events
CREATE TABLE auth_audit_log (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NULL,
  event_type VARCHAR(50) NOT NULL,
  event_data JSON NOT NULL,
  ip_address VARCHAR(45) NULL,
  user_agent TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Security Headers
```typescript
// Security middleware configuration
export const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Content-Security-Policy': "default-src 'self'",
  'Referrer-Policy': 'strict-origin-when-cross-origin'
};
```

---

## Migration Strategy

### Existing System Migration
1. **Phase 1:** Deploy authentication service alongside existing system
2. **Phase 2:** Migrate users with password hashing
3. **Phase 3:** Enable new authentication for new users
4. **Phase 4:** Gradually migrate existing sessions
5. **Phase 5:** Decommission old authentication

### Data Migration Script
```typescript
// Migrate existing users to new authentication system
async function migrateUsers() {
  const users = await legacyUserService.findAll();
  
  for (const user of users) {
    const hashedPassword = await bcrypt.hash(user.password, 12);
    await newUserService.create({
      ...user,
      passwordHash: hashedPassword,
      emailVerified: true // Assume existing users are verified
    });
  }
}
```

---

## Monitoring and Alerting

### Key Metrics to Monitor
- Failed login attempts per minute
- Account lockouts
- Password reset requests
- Token refresh failures
- Authentication latency
- Active sessions per user

### Alert Conditions
- > 10 failed logins per user per hour
- > 100 failed logins system-wide per minute
- > 50 password resets per hour
- Authentication service down
- High latency (> 2 seconds)

---

## Future Considerations

### Scalability
- Consider Redis for session storage at scale
- Implement token blacklisting for immediate revocation
- Add multi-region support for global deployments

### Enhanced Security
- Implement device fingerprinting
- Add biometric authentication support
- Consider hardware security keys (FIDO2/WebAuthn)

### Compliance
- GDPR compliance for EU users
- FERPA compliance for educational data
- Regular security audits and penetration testing

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Password breach | Medium | High | Strong hashing, rate limiting, monitoring |
| Token theft | Medium | High | Short token expiry, refresh rotation, secure storage |
| DoS attacks | Low | Medium | Rate limiting, monitoring, CDN protection |
| Session hijacking | Low | High | Secure headers, HTTPS only, session monitoring |
| Insider threats | Low | High | Audit logging, least privilege, monitoring |

---

## Success Metrics

### Security Metrics
- Zero successful brute force attacks
- < 0.1% of accounts compromised
- < 5 minute mean time to detect security incidents
- 100% audit log coverage for auth events

### Performance Metrics
- < 500ms average authentication latency
- 99.9% authentication service uptime
- < 1 second password reset email delivery
- Support for 10,000+ concurrent users

### User Experience Metrics
- < 2% account lockout rate (legitimate users)
- > 95% successful login rate
- < 30 seconds average password reset completion
- > 99% email delivery success rate
