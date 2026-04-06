# Acceptance Criteria: User Authentication & Authorization

Acceptance criteria define the "Done" condition for each authentication requirement using BDD (Behavior-Driven Development) format.

---

## AC-AUTH-001: User Login (REQ-AUTH-001)
**Feature:** User Authentication  
**Story:** As a security guard, I want to log in securely so I can access the system.

```gherkin
Scenario: Successful login with valid credentials
  Given the login page is displayed
  When I enter email "guard@school.edu"
  And I enter password "SecurePass123!"
  And I click the "Login" button
  Then I should be redirected to the dashboard
  And a JWT token should be generated
  And the token should be stored securely
  And I should see my name "John Guard" in the navigation
  And my last_login timestamp should be updated

Scenario: Login with invalid email format
  Given the login page is displayed
  When I enter invalid email "notanemail"
  And I enter password "SecurePass123!"
  And I click the "Login" button
  Then I should see error message "Invalid email format"
  And I should remain on login page
  And no login attempt should be logged

Scenario: Login with incorrect password
  Given the login page is displayed
  When I enter email "guard@school.edu"
  And I enter incorrect password "WrongPassword123!"
  And I click the "Login" button
  Then I should see error message "Invalid email or password"
  And I should remain on login page
  And a failed login attempt should be logged

Scenario: Login with non-existent email
  Given the login page is displayed
  When I enter email "nonexistent@school.edu"
  And I enter password "SecurePass123!"
  And I click the "Login" button
  Then I should see error message "Invalid email or password"
  And I should remain on login page
  And a failed login attempt should be logged

Scenario: Account lockout after failed attempts
  Given I have failed login 5 times in 15 minutes
  When I attempt to login again
  Then I should see error message "Account temporarily locked"
  And I should remain on login page
  And an account lockout event should be logged
```

---

## AC-AUTH-002: JWT Token Generation (REQ-AUTH-002)
**Feature:** Token Management  
**Story:** As a logged-in user, I want secure token management.

```gherkin
Scenario: JWT token contains correct payload
  Given I successfully login
  When the JWT token is generated
  Then the token should contain:
    | Field | Value |
    | sub | user-uuid |
    | email | guard@school.edu |
    | name | John Guard |
    | role | security_guard |
    | exp | current_time + 8_hours |
  And the token should be signed with HS256

Scenario: Token expiration after 8 hours
  Given I logged in 8 hours ago
  When I make an API request
  Then I should receive 401 Unauthorized
  And the error should indicate token expired
  And I should be redirected to login

Scenario: Invalid token signature
  Given I have a JWT token
  When I modify the token signature
  And I make an API request
  Then I should receive 401 Unauthorized
  And the error should indicate invalid token
```

---

## AC-AUTH-003: Session Management (REQ-AUTH-003)
**Feature:** Session Security  
**Story:** As a system, I want to manage user sessions securely.

```gherkin
Scenario: Session timeout after inactivity
  Given I am logged in
  When 8 hours pass without any API calls
  And I make a new API request
  Then I should receive 401 Unauthorized
  And my session should be terminated

Scenario: Logout terminates session
  Given I am logged in
  When I click the "Logout" button
  Then my JWT token should be invalidated
  And I should be redirected to login page
  And I should see "Logged out successfully" message

Scenario: Concurrent session limit
  Given I have 3 active sessions
  When I attempt to login from a 4th device
  Then the login should succeed
  And my oldest session should be terminated
  And I should receive a new JWT token
```

---

## AC-AUTH-004: Role-Based Access Control (REQ-AUTH-004)
**Feature:** Authorization  
**Story:** As an administrator, I want different permission levels.

```gherkin
Scenario: Security guard permissions
  Given I am logged in as "security_guard"
  When I attempt to access user management
  Then I should receive 403 Forbidden
  And I should see "Insufficient permissions" message

Scenario: Administrator permissions
  Given I am logged in as "administrator"
  When I access user management
  Then I should see the user list
  And I should be able to create new users
  And I should be able to modify user roles

Scenario: API endpoint protection
  Given I am logged in as "security_guard"
  When I call POST /auth/register
  Then I should receive 403 Forbidden
  And the response should indicate "Admin only endpoint"
```

---

## AC-AUTH-005: Password Validation (REQ-AUTH-005)
**Feature:** Password Security  
**Story:** As a user, I want strong password requirements.

```gherkin
Scenario: Password meets all requirements
  Given I am registering a new account
  When I enter password "SecurePass123!"
  Then the password should be accepted
  And it should be hashed with bcrypt
  And stored securely in the database

Scenario: Password too short
  Given I am registering a new account
  When I enter password "Short1!"
  Then I should see error "Password must be at least 8 characters"
  And registration should fail

Scenario: Password missing uppercase
  Given I am registering a new account
  When I enter password "securepass123!"
  Then I should see error "Password must contain uppercase letter"
  And registration should fail

Scenario: Password missing special character
  Given I am registering a new account
  When I enter password "SecurePass123"
  Then I should see error "Password must contain special character"
  And registration should fail

Scenario: Password contains user email
  Given I am registering with email "john@school.edu"
  When I enter password "john@school.edu123!"
  Then I should see error "Password cannot contain email"
  And registration should fail
```

---

## AC-AUTH-006: Logout Functionality (REQ-AUTH-006)
**Feature:** Session Termination  
**Story:** As a user, I want to securely log out.

```gherkin
Scenario: Successful logout
  Given I am logged in
  When I click "Logout" button
  Then my session should be terminated
  And my JWT token should be invalidated
  And I should be redirected to login page
  And I should see confirmation message

Scenario: Logout from all devices
  Given I have multiple active sessions
  When I logout from one device
  Then all my sessions should be terminated
  And I should need to login again on all devices
```

---

## AC-AUTH-007: Password Reset (REQ-AUTH-007)
**Feature:** Password Recovery  
**Story:** As a user, I want to reset my forgotten password.

```gherkin
Scenario: Request password reset
  Given I forgot my password
  When I enter my email "guard@school.edu"
  And click "Reset Password"
  Then I should see message "Reset email sent if account exists"
  And a reset token should be generated
  And an email should be sent with reset link

Scenario: Reset password with valid token
  Given I have a valid reset token
  When I enter new password "NewSecurePass456!"
  And confirm the reset
  Then my password should be updated
  And the reset token should be invalidated
  And I should be able to login with new password

Scenario: Reset token expired
  Given I have an expired reset token
  When I try to reset password
  Then I should see error "Token expired"
  And password should not be changed
```

---

## AC-AUTH-008: Login Attempt Logging (REQ-AUTH-008)
**Feature:** Security Audit  
**Story:** As an administrator, I want to monitor login attempts.

```gherkin
Scenario: Successful login logged
  Given I login successfully
  When the login completes
  Then a login event should be logged with:
    | Field | Value |
    | user_id | usr-001 |
    | email | guard@school.edu |
    | success | true |
    | ip_address | 192.168.1.100 |
    | user_agent | Chrome/91.0 |
    | timestamp | 2024-03-30T09:00:00Z |

Scenario: Failed login logged
  Given I enter wrong password
  When login fails
  Then a login event should be logged with:
    | Field | Value |
    | email | guard@school.edu |
    | success | false |
    | failure_reason | invalid_password |
    | ip_address | 192.168.1.100 |
    | attempt_count | 1 |
```

---

## AC-AUTH-009: Account Lockout (REQ-AUTH-009)
**Feature:** Account Protection  
**Story:** As a system, I want to protect accounts from brute force attacks.

```gherkin
Scenario: Account lockout after 5 failures
  Given I failed login 5 times in 15 minutes
  When I attempt login again
  Then I should see "Account locked for 15 minutes"
  And login should be prevented
  And lockout event should be logged

Scenario: Lockout reset after successful login
  Given my account was locked
  When 15 minutes pass
  And I login successfully
  Then the lockout should be reset
  And failure count should be cleared
```

---

## AC-AUTH-010: Session Invalidation (REQ-AUTH-010)
**Feature:** Security Management  
**Story:** As an administrator, I want to manage user sessions.

```gherkin
Scenario: Password change invalidates sessions
  Given I have multiple active sessions
  When I change my password
  Then all existing sessions should be invalidated
  And I should need to login again on all devices

Scenario: Admin forces logout
  Given a user is logged in
  When administrator deactivates the user account
  Then all user sessions should be terminated
  And user should be unable to make API calls
```

---

## Performance Acceptance Criteria

### AC-AUTH-PERF-001: Login Performance
**Feature:** System Performance  
**Story:** As a user, I want fast authentication.

```gherkin
Scenario: Login response time
  Given the authentication service is running
  When I submit login credentials
  Then response time should be less than 2 seconds
  And JWT token should be returned immediately

Scenario: Concurrent login support
  Given 50 users attempt login simultaneously
  When all requests are processed
  Then all should complete within 5 seconds
  And no authentication failures due to load
```

---

## Security Acceptance Criteria

### AC-AUTH-SEC-001: Password Security
**Feature:** Data Protection  
**Story:** As a system, I want to protect user passwords.

```gherkin
Scenario: Password hashing
  Given a user registers with password "MyPassword123!"
  When the password is stored
  Then it should be hashed with bcrypt (12+ rounds)
  And the hash should be different each time
  And plain text password should never be logged

Scenario: JWT token security
  Given a JWT token is generated
  When I inspect the token
  Then it should not contain sensitive information
  And it should have short expiration (8 hours max)
  And it should be signed with strong secret
```

---

## Summary Table

| AC ID | Feature | Status | Tests |
|-------|---------|--------|-------|
| AC-AUTH-001 | User Login | ✅ Ready | 5 scenarios |
| AC-AUTH-002 | JWT Tokens | ✅ Ready | 3 scenarios |
| AC-AUTH-003 | Sessions | ✅ Ready | 3 scenarios |
| AC-AUTH-004 | RBAC | ✅ Ready | 3 scenarios |
| AC-AUTH-005 | Password Validation | ✅ Ready | 5 scenarios |
| AC-AUTH-006 | Logout | ✅ Ready | 2 scenarios |
| AC-AUTH-007 | Password Reset | ✅ Ready | 3 scenarios |
| AC-AUTH-008 | Audit Logging | ✅ Ready | 2 scenarios |
| AC-AUTH-009 | Account Lockout | ✅ Ready | 2 scenarios |
| AC-AUTH-010 | Session Invalidation | ✅ Ready | 2 scenarios |
| AC-AUTH-PERF-001 | Performance | ✅ Ready | 2 scenarios |
| AC-AUTH-SEC-001 | Security | ✅ Ready | 2 scenarios |

**Total Acceptance Criteria:** 12  
**Total BDD Scenarios:** 34  
**All criteria reference REQ-AUTH-* IDs** ✅
