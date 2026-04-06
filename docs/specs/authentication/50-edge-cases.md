# Edge Cases: User Authentication & Authorization

Edge cases define scenarios at the boundaries of normal operation and under stress conditions.

---

## EC-AUTH-001: Email Format Edge Cases

**EC-AUTH-001-A: International Email Domains**
```
Input: "user@münchen.de" (Unicode domain)
Expected: Accept as valid email
Test: Should work with international domains
```

**EC-AUTH-001-B: Plus Addressing**
```
Input: "user+tag@school.edu"
Expected: Accept as valid (Gmail-style tagging)
Test: Should differentiate from "user@school.edu"
```

**EC-AUTH-001-C: Subdomain Emails**
```
Input: "admin@mail.school.edu"
Expected: Accept as valid
Test: Should work with subdomains
```

**EC-AUTH-001-D: Very Long Email**
```
Input: "verylongusername@verylongdomainname.edu" (100+ chars)
Expected: Accept if within DB limits
Test: Should handle long but valid emails
```

**EC-AUTH-001-E: Email with Numbers**
```
Input: "user123@school456.edu"
Expected: Accept as valid
Test: Should work normally
```

---

## EC-AUTH-002: Password Edge Cases

**EC-AUTH-002-A: Maximum Length Password**
```
Input: 128 character password
Expected: Accept exactly at limit
Test: 128 chars = OK, 129 chars = ERROR
```

**EC-AUTH-002-B: Password with Unicode Characters**
```
Input: "Pässword123!" (with umlaut)
Expected: Accept Unicode in passwords
Test: Should hash and validate correctly
```

**EC-AUTH-002-C: Password with Only Special Characters**
```
Input: "!@#$%^&*()123" (meets requirements)
Expected: Accept if meets all criteria
Test: Should work if requirements satisfied
```

**EC-AUTH-002-D: Password Reuse Edge Case**
```
Scenario: User changes password 6 times rapidly
Input: Cycle through 6 different passwords
Expected: Should allow first 5, reject 6th (reuse of #1)
Test: History check works across multiple changes
```

**EC-AUTH-002-E: Password Reset Token Edge Case**
```
Scenario: User requests reset multiple times
Input: 3 reset requests in 1 hour
Expected: Rate limit should apply
Test: Should prevent abuse of reset system
```

---

## EC-AUTH-003: Session Management Edge Cases

**EC-AUTH-003-A: Midnight Session Expiry**
```
Scenario: Session expires at 23:59:59
Input: Login at 15:59, session expires at 23:59
Expected: Should expire precisely at expiration time
Test: No early or late expiration
```

**EC-AUTH-003-B: DST Transition**
```
Scenario: Daylight Saving Time change
Input: Session created before DST change
Expected: Expiration should use UTC, not local time
Test: Session doesn't expire early/late during DST
```

**EC-AUTH-003-C: Server Time Drift**
```
Scenario: Server clock 5 minutes fast
Input: Session expires at 16:00 server time
Expected: Should handle time synchronization issues
Test: Graceful handling of time differences
```

**EC-AUTH-003-D: Concurrent Session Cleanup**
```
Scenario: 3 sessions active, login from 4th device
Input: Login while having maximum sessions
Expected: Should invalidate oldest session
Test: Correct session invalidated (not random)
```

**EC-AUTH-003-E: Network Interruption**
```
Scenario: API call interrupted during token refresh
Input: Token expires during request
Expected: Should handle partial failures
Test: No session corruption on network issues
```

---

## EC-AUTH-004: Rate Limiting Edge Cases

**EC-AUTH-004-A: Rate Limit Boundary**
```
Scenario: Exactly 5 login attempts in 15 minutes
Input: 5th attempt at exactly 15:00 mark
Expected: Should allow if exactly at boundary
Test: Precise timing of rate limits
```

**EC-AUTH-004-B: IP Address Changes**
```
Scenario: User behind load balancer
Input: Requests from different IPs in same session
Expected: Should track by user, not IP
Test: Rate limiting works across IP changes
```

**EC-AUTH-004-C: Distributed Rate Limiting**
```
Scenario: Multiple server instances
Input: Requests distributed across servers
Expected: Rate limits should be shared
Test: Consistent limiting across server instances
```

**EC-AUTH-004-D: Lockout Duration Edge**
```
Scenario: Lockout expires at exact time
Input: Lockout ends at 10:00:00
Expected: Should unlock precisely at expiration
Test: No early or late unlocking
```

---

## EC-AUTH-005: Token Security Edge Cases

**EC-AUTH-005-A: Token Tampering**
```
Scenario: JWT payload modified
Input: Change role from "guard" to "admin"
Expected: Signature verification should fail
Test: Tampered tokens rejected
```

**EC-AUTH-005-B: Token Reuse Detection**
```
Scenario: Same token used simultaneously
Input: Same JWT used from 2 devices
Expected: Should detect and invalidate
Test: Prevents token replay attacks
```

**EC-AUTH-005-C: Algorithm Confusion**
```
Scenario: Token with different algorithm
Input: "alg": "RS256" but signed with HS256
Expected: Should reject invalid algorithms
Test: Algorithm confusion attack prevention
```

**EC-AUTH-005-D: Token Expiration Precision**
```
Scenario: Token expires at exact millisecond
Input: exp: 1640995200000 (exact timestamp)
Expected: Should expire precisely at expiration
Test: Millisecond precision in expiration
```

---

## EC-AUTH-006: Database Constraint Edge Cases

**EC-AUTH-006-A: Unique Email Case Sensitivity**
```
Scenario: Emails with different cases
Input 1: "John@School.EDU"
Input 2: "john@school.edu"
Expected: Should treat as identical (case-insensitive)
Test: Second registration should fail
```

**EC-AUTH-006-B: Soft Delete Email Reuse**
```
Scenario: Deleted user email reuse
Input: Delete user, then register same email
Expected: Should allow (soft delete)
Test: Email uniqueness respects soft deletes
```

**EC-AUTH-006-C: Foreign Key Cascade**
```
Scenario: User with visitor records deleted
Input: Delete user who registered visitors
Expected: Should prevent delete or cascade properly
Test: Referential integrity maintained
```

**EC-AUTH-006-D: Index Performance**
```
Scenario: 10,000+ users in system
Input: Login with email lookup
Expected: Should remain fast (< 500ms)
Test: Database indexing works at scale
```

---

## EC-AUTH-007: Input Validation Edge Cases

**EC-AUTH-007-A: SQL Injection Attempts**
```
Input: "admin' OR '1'='1' --"
Expected: Should treat as literal string
Test: No SQL injection possible
```

**EC-AUTH-007-B: XSS in User Data**
```
Input: "<script>alert('xss')</script>"
Expected: Should sanitize input
Test: No XSS execution in responses
```

**EC-AUTH-007-C: Unicode Normalization**
```
Input: "café" vs "cafe\u0301" (different Unicode)
Expected: Should normalize consistently
Test: Unicode handling consistent
```

**EC-AUTH-007-D: Control Characters**
```
Input: Password with \n \r \t characters
Expected: Should handle or reject
Test: Control characters in input
```

---

## EC-AUTH-008: Audit Logging Edge Cases

**EC-AUTH-008-A: Log File Rotation**
```
Scenario: Log file reaches size limit
Input: Continuous login attempts
Expected: Should rotate logs without losing data
Test: No log data loss during rotation
```

**EC-AUTH-008-B: High Volume Logging**
```
Scenario: 1000 login attempts per minute
Input: DDoS-like login attempts
Expected: Should handle logging load
Test: Logging doesn't impact performance
```

**EC-AUTH-008-C: Log Corruption**
```
Scenario: Power failure during logging
Input: System crash mid-log write
Expected: Should recover gracefully
Test: Log integrity after crashes
```

---

## EC-AUTH-009: Multi-Tenant Edge Cases

**EC-AUTH-009-A: School Separation**
```
Scenario: Multiple schools on same system
Input: Users from different schools
Expected: Should isolate by school/organization
Test: Cross-school data isolation
```

**EC-AUTH-009-B: Role Hierarchy**
```
Scenario: District admin vs School admin
Input: Different admin levels
Expected: Should handle role hierarchies
Test: Permission inheritance works
```

---

## EC-AUTH-010: Integration Edge Cases

**EC-AUTH-010-A: External Service Failure**
```
Scenario: Email service down during password reset
Input: SMTP server unreachable
Expected: Should handle gracefully
Test: No system crash on external failures
```

**EC-AUTH-010-B: Database Connection Loss**
```
Scenario: DB connection lost during login
Input: Network interruption
Expected: Should retry or fail gracefully
Test: Transaction safety during failures
```

**EC-AUTH-010-C: Cache Invalidation**
```
Scenario: User data cached incorrectly
Input: User role changed while cached
Expected: Should invalidate cache
Test: Cache consistency maintained
```

---

## Summary: Critical Edge Cases to Test

| Priority | Edge Case | Impact | Test Focus |
|----------|-----------|--------|------------|
| **CRITICAL** | EC-AUTH-005-A (Token tampering) | Security breach | Signature validation |
| **CRITICAL** | EC-AUTH-001-A (Unicode emails) | Registration failure | Email validation |
| **HIGH** | EC-AUTH-003-A (Midnight expiry) | Session issues | Time handling |
| **HIGH** | EC-AUTH-004-A (Rate limit boundary) | DoS vulnerability | Precise limiting |
| **MEDIUM** | EC-AUTH-006-A (Case sensitivity) | Duplicate accounts | Email uniqueness |
| **MEDIUM** | EC-AUTH-007-A (SQL injection) | Data breach | Input sanitization |
| **LOW** | EC-AUTH-002-B (Unicode passwords) | Minor issues | Character handling |

---

## Testing Strategy for Edge Cases

### Automated Testing
```typescript
describe('Authentication Edge Cases', () => {
  it('should handle Unicode emails', () => {
    // Test international domain handling
  });

  it('should prevent token tampering', () => {
    // Test JWT signature validation
  });

  it('should handle DST transitions', () => {
    // Test time zone edge cases
  });
});
```

### Manual Testing Checklist
- [ ] Test with various international keyboards
- [ ] Test during DST transitions
- [ ] Test with slow network connections
- [ ] Test with browser incognito mode
- [ ] Test with VPN/proxy connections
- [ ] Test with mobile browsers
- [ ] Test with screen readers (accessibility)

### Load Testing Scenarios
- [ ] 100 concurrent login attempts
- [ ] 1000 password reset requests per hour
- [ ] Database with 100,000+ users
- [ ] Session cleanup with 10,000 active sessions
- [ ] Audit logging with high volume events
