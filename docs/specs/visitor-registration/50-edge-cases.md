# Edge Cases: Visitor Registration

Edge cases define scenarios at the boundaries of normal operation and under stress conditions for the visitor registration system.

---

## EC-VISITOR-001: Name Field Edge Cases

**EC-VISITOR-001-A: Unicode Names**
```
Input: "José María González" (Spanish), "李小明" (Chinese), "Мария Иванова" (Russian)
Expected: Accept all Unicode names
Test: Should handle international character sets
```

**EC-VISITOR-001-B: Maximum Name Length**
```
Input: First name "Wolfgangus" (20 chars), Last name "Schwarzenegger" (14 chars)
Expected: Accept exactly at limit
Test: 50 chars total = OK, 51 chars = ERROR
```

**EC-VISITOR-001-C: Name with Special Characters**
```
Input: "O'Connor-Smith", "Jean-Pierre", "Mary-Jane"
Expected: Accept hyphens and apostrophes
Test: Should allow common name punctuation
```

**EC-VISITOR-001-D: Single Character Names**
```
Input: First name "A", Last name "B"
Expected: Accept minimum 2 characters
Test: 1 char = ERROR, 2 chars = OK
```

**EC-VISITOR-001-E: Names with Numbers**
```
Input: "John Smith Jr 3rd"
Expected: Reject names with numbers
Test: Numbers in names should be invalid
```

---

## EC-VISITOR-002: Phone Number Edge Cases

**EC-VISITOR-002-A: International Formats**
```
Input: "+44 20 7123 4567" (UK), "+91 9876543210" (India), "+81 3-1234-5678" (Japan)
Expected: Accept various international formats
Test: Should normalize to E.164 format
```

**EC-VISITOR-002-B: Extensions and Special Numbers**
```
Input: "+1-555-123-4567 ext 123", "+1-800-SCHOOL-1"
Expected: Handle extensions and vanity numbers
Test: Should validate but preserve formatting
```

**EC-VISITOR-002-C: Shortest Valid Numbers**
```
Input: "+1 234 567 8901" (11 digits US), "+44 20 1234 5678" (13 digits UK)
Expected: Accept minimum valid lengths
Test: Shorter numbers should be rejected
```

**EC-VISITOR-002-D: Emergency Contact Same as Visitor**
```
Input: Visitor phone "+1234567890", Emergency phone "+1234567890"
Expected: Reject duplicate phone numbers
Test: Emergency contact must be different
```

**EC-VISITOR-002-E: Invalid Country Codes**
```
Input: "+999 123 456 7890" (Invalid country)
Expected: Reject invalid country codes
Test: Should validate against known country codes
```

---

## EC-VISITOR-003: Visit Timing Edge Cases

**EC-VISITOR-003-A: Midnight Check-in/Check-out**
```
Scenario: Check-in at 23:59:59, Check-out at 00:00:01 next day
Input: Visit spans midnight
Expected: Should handle date changes correctly
Test: Duration calculation across day boundaries
```

**EC-VISITOR-003-B: DST Transition**
```
Scenario: Check-in before DST change, check-out after
Input: Visit during daylight saving time transition
Expected: Use UTC timestamps internally
Test: Duration unaffected by DST changes
```

**EC-VISITOR-003-C: Leap Year Handling**
```
Scenario: Visit on February 29 during leap year
Input: Check-in on leap day
Expected: Handle date calculations correctly
Test: No issues with leap year dates
```

**EC-VISITOR-003-D: Microsecond Timing**
```
Scenario: Two visitors check in at exact same millisecond
Input: Simultaneous registrations
Expected: Handle concurrent operations
Test: No race conditions in timestamp generation
```

**EC-VISITOR-003-E: Server Clock Drift**
```
Scenario: Server clock 10 minutes fast
Input: Registration during clock drift
Expected: Use NTP-synchronized time
Test: Timestamps remain accurate despite drift
```

---

## EC-VISITOR-004: Badge Generation Edge Cases

**EC-VISITOR-004-A: Badge Number Rollover**
```
Scenario: 9999 visitors in one day
Input: 9999th visitor checks in
Expected: Handle 4-digit limit gracefully
Test: Should either rollover or extend format
```

**EC-VISITOR-004-B: Concurrent Badge Generation**
```
Scenario: 10 guards registering simultaneously at midnight
Input: Multiple registrations at exact same time
Expected: Generate unique badge numbers
Test: No duplicate badges despite concurrency
```

**EC-VISITOR-004-C: Date Change During Registration**
```
Scenario: Registration starts before midnight, completes after
Input: System date changes during process
Expected: Use consistent date for badge
Test: Badge date matches check-in date
```

**EC-VISITOR-004-D: Badge Printing Failure**
```
Scenario: Printer out of paper during badge print
Input: Print job fails
Expected: Registration still succeeds
Test: Badge data preserved for reprint
```

---

## EC-VISITOR-005: Photo Upload Edge Cases

**EC-VISITOR-005-A: Maximum File Size**
```
Input: 5MB JPEG image
Expected: Accept exactly at limit
Test: 5MB = OK, 5.1MB = ERROR
```

**EC-VISITOR-005-B: Minimum Resolution**
```
Input: 320x240 pixel image
Expected: Reject below minimum resolution
Test: 640x480 minimum required
```

**EC-VISITOR-005-C: Unsupported Formats**
```
Input: BMP, TIFF, GIF files
Expected: Reject non-JPEG/PNG formats
Test: Only allow specified formats
```

**EC-VISITOR-005-D: Corrupted Image Files**
```
Input: Valid extension but corrupted data
Expected: Detect corruption and reject
Test: File validation beyond extension check
```

**EC-VISITOR-005-E: Webcam Access Denied**
```
Scenario: Browser blocks camera access
Input: Photo capture attempted
Expected: Graceful fallback to file upload
Test: Alternative photo input methods
```

---

## EC-VISITOR-006: Pre-registration Edge Cases

**EC-VISITOR-006-A: Bulk Pre-registration**
```
Input: 100 visitors pre-registered at once
Expected: Handle large batches efficiently
Test: No timeout or memory issues
```

**EC-VISITOR-006-B: Pre-registration Expiration**
```
Scenario: Pre-registration expires during visitor arrival
Input: Check-in attempted after expiration
Expected: Allow check-in but require full data
Test: Graceful handling of expired pre-registrations
```

**EC-VISITOR-006-C: Email Delivery Failures**
```
Scenario: SMTP server down during pre-registration
Input: Email notification fails
Expected: Pre-registration still succeeds
Test: Email failure doesn't block registration
```

**EC-VISITOR-006-D: Duplicate Pre-registrations**
```
Input: Same visitor pre-registered twice
Expected: Update existing, don't create duplicate
Test: Handle duplicate pre-registration attempts
```

**EC-VISITOR-006-E: Pre-registration for Past Dates**
```
Input: Expected date in the past
Expected: Reject past dates
Test: Only allow future dates
```

---

## EC-VISITOR-007: Search and Filtering Edge Cases

**EC-VISITOR-007-A: Special Characters in Search**
```
Input: Search for "O'Connor", "José", "Smith-Jones"
Expected: Handle special characters correctly
Test: Unicode and punctuation in search terms
```

**EC-VISITOR-007-B: Very Long Search Terms**
```
Input: 200 character search string
Expected: Handle long search terms
Test: No performance degradation
```

**EC-VISITOR-007-C: Empty Search Results**
```
Input: Search for "xyz123nonexistent"
Expected: Return empty results gracefully
Test: Proper handling of no matches
```

**EC-VISITOR-007-D: Search with SQL Keywords**
```
Input: Search for "SELECT * FROM users"
Expected: Treat as literal search term
Test: No SQL injection in search
```

**EC-VISITOR-007-E: Partial Phone Number Search**
```
Input: Search for "555-123"
Expected: Find matches with partial numbers
Test: Partial matching for phone numbers
```

---

## EC-VISITOR-007-F: Date Range Edge Cases**
```
Input: From "2023-12-31" to "2024-01-01"
Expected: Include visits on both dates
Test: Inclusive date range handling
```

**EC-VISITOR-007-G: Time Zone Search**
```
Scenario: User in different timezone searches
Input: Date range in local timezone
Expected: Convert to UTC for database queries
Test: Time zone handling in search
```

---

## EC-VISITOR-008: Concurrent Access Edge Cases

**EC-VISITOR-008-A: Simultaneous Check-in of Same Visitor**
```
Scenario: Two guards attempt to register same visitor
Input: Duplicate registration attempts
Expected: Only one succeeds, other gets conflict error
Test: Race condition prevention
```

**EC-VISITOR-008-B: Check-out During Check-in**
```
Scenario: Visitor being checked out while checking in another
Input: Concurrent operations on same visitor
Expected: Proper transaction isolation
Test: Database consistency maintained
```

**EC-VISITOR-008-C: Session Expiration During Operation**
```
Scenario: JWT expires during multi-step registration
Input: Token expires mid-process
Expected: Handle gracefully with clear error
Test: Session management during operations
```

**EC-VISITOR-008-D: Database Connection Loss**
```
Scenario: DB connection lost during registration
Input: Connection failure mid-transaction
Expected: Rollback and retry capability
Test: Transaction safety and recovery
```

---

## EC-VISITOR-009: Data Validation Edge Cases

**EC-VISITOR-009-A: HTML in Text Fields**
```
Input: Name "<script>alert('xss')</script>"
Expected: Sanitize HTML input
Test: XSS prevention in all text fields
```

**EC-VISITOR-009-B: Extremely Long Input**
```
Input: 10,000 character notes field
Expected: Truncate or reject overly long input
Test: Field length limits enforced
```

**EC-VISITOR-009-C: Control Characters**
```
Input: Name with \n \r \t characters
Expected: Strip or reject control characters
Test: Clean input data
```

**EC-VISITOR-009-D: Empty String vs Null**
```
Input: Empty string "" vs null values
Expected: Handle consistently
Test: Null vs empty string validation
```

**EC-VISITOR-009-E: Boolean Field Edge Cases**
```
Input: Consent flags with various truthy/falsy values
Expected: Strict boolean validation
Test: Boolean field handling
```

---

## EC-VISITOR-010: Emergency Scenarios

**EC-VISITOR-010-A: Power Failure During Check-in**
```
Scenario: System loses power during registration
Input: Incomplete registration at power loss
Expected: No partial records created
Test: Transaction atomicity
```

**EC-VISITOR-010-B: Network Partition**
```
Scenario: Network split between app and database
Input: Registration during partition
Expected: Fail gracefully or queue for later
Test: Resilience to network issues
```

**EC-VISITOR-010-C: High Load Emergency List**
```
Scenario: 500+ visitors during emergency
Input: Emergency list generation under load
Expected: Generate within 30 seconds
Test: Performance under emergency conditions
```

**EC-VISITOR-010-D: Corrupted Emergency Contact Data**
```
Scenario: Invalid emergency contact in database
Input: Emergency list with bad data
Expected: Skip invalid records, log errors
Test: Robust error handling in critical operations
```

---

## EC-VISITOR-011: Integration Edge Cases

**EC-VISITOR-011-A: Email Service Down**
```
Scenario: SMTP service unavailable
Input: Pre-registration with email notification
Expected: Registration succeeds, email queued
Test: Graceful degradation of email service
```

**EC-VISITOR-011-B: Photo Storage Full**
```
Scenario: Cloud storage quota exceeded
Input: Photo upload attempted
Expected: Registration succeeds without photo
Test: Non-blocking photo upload failures
```

**EC-VISITOR-011-C: Time Service Inaccessible**
```
Scenario: NTP server unreachable
Input: Timestamp generation
Expected: Use local clock with drift detection
Test: Timestamp accuracy without NTP
```

**EC-VISITOR-011-D: External API Rate Limits**
```
Scenario: Third-party service rate limited
Input: Integration calls during high load
Expected: Implement backoff and retry
Test: Resilience to external API limits
```

---

## EC-VISITOR-012: Performance Edge Cases

**EC-VISITOR-012-A: Large Result Sets**
```
Scenario: Search returns 10,000+ results
Input: Broad search criteria
Expected: Efficient pagination and sorting
Test: Performance with large datasets
```

**EC-VISITOR-012-B: Index Fragmentation**
```
Scenario: Database indexes heavily fragmented
Input: Search operations
Expected: Maintain acceptable performance
Test: Index maintenance and query optimization
```

**EC-VISITOR-012-C: Memory Pressure**
```
Scenario: Server under memory pressure
Input: Multiple concurrent registrations
Expected: Handle memory constraints gracefully
Test: Memory usage optimization
```

**EC-VISITOR-012-D: Disk I/O Contention**
```
Scenario: High disk I/O during peak hours
Input: Photo uploads and logging
Expected: Asynchronous processing where possible
Test: I/O optimization strategies
```

---

## EC-VISITOR-013: Security Edge Cases

**EC-VISITOR-013-A: Large Payload Attacks**
```
Input: 100MB malicious payload
Expected: Reject oversized requests
Test: Request size limits enforced
```

**EC-VISITOR-013-B: Path Traversal in File Upload**
```
Input: "../../../etc/passwd" as filename
Expected: Sanitize file paths
Test: Path traversal prevention
```

**EC-VISITOR-013-C: Malformed JSON**
```
Input: Invalid JSON with nested objects
Expected: Proper JSON parsing error handling
Test: Robust JSON validation
```

**EC-VISITOR-013-D: Unicode Normalization Attacks**
```
Input: Homoglyph attacks (similar-looking characters)
Expected: Normalize Unicode input
Test: Unicode security handling
```

---

## EC-VISITOR-014: Mobile and Browser Edge Cases

**EC-VISITOR-014-A: Mobile Browser Photo Capture**
```
Scenario: iOS Safari camera access
Input: Photo capture on mobile device
Expected: Handle mobile camera APIs
Test: Cross-platform photo capture
```

**EC-VISITOR-014-B: Slow Network Upload**
```
Scenario: Photo upload over 3G connection
Input: Large photo upload
Expected: Progress indication and timeout handling
Test: Network resilience
```

**EC-VISITOR-014-C: Browser Tab Switching**
```
Scenario: User switches tabs during registration
Input: Form data preservation
Expected: Maintain form state
Test: Browser session handling
```

**EC-VISITOR-014-D: Browser Zoom Levels**
```
Scenario: Browser zoomed to 200%
Input: Form layout and usability
Expected: Responsive design works
Test: UI adaptability
```

---

## Summary: Critical Edge Cases to Test

| Priority | Edge Case | Impact | Test Focus |
|----------|-----------|--------|------------|
| **CRITICAL** | EC-VISITOR-008-A (Concurrent check-in) | Data corruption | Transaction isolation |
| **CRITICAL** | EC-VISITOR-003-A (Midnight timing) | Incorrect duration | Time handling |
| **HIGH** | EC-VISITOR-001-A (Unicode names) | Registration failure | Character encoding |
| **HIGH** | EC-VISITOR-002-A (International phones) | Contact failure | Phone validation |
| **HIGH** | EC-VISITOR-004-B (Concurrent badges) | Duplicate badges | ID generation |
| **MEDIUM** | EC-VISITOR-005-A (File size limits) | Upload failures | File validation |
| **MEDIUM** | EC-VISITOR-007-A (Special char search) | Search failures | Text processing |
| **LOW** | EC-VISITOR-014-A (Mobile photo) | UX issues | Cross-platform |

---

## Testing Strategy for Edge Cases

### Automated Testing
```typescript
describe('Visitor Registration Edge Cases', () => {
  it('should handle Unicode names correctly', () => {
    // Test international character handling
  });

  it('should prevent concurrent duplicate registrations', () => {
    // Test race condition prevention
  });

  it('should handle midnight date transitions', () => {
    // Test date boundary handling
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
- [ ] Test with different timezone settings
- [ ] Test with browser zoom levels
- [ ] Test with ad blockers enabled

### Load Testing Scenarios
- [ ] 100 concurrent registrations
- [ ] 1000 search requests per minute
- [ ] Database with 100,000+ visitor records
- [ ] Photo upload during peak traffic
- [ ] Emergency list generation with 1000 visitors
- [ ] Pre-registration of 500 visitors at once

### Security Testing Scenarios
- [ ] SQL injection attempts in all input fields
- [ ] XSS attempts in text inputs
- [ ] Large file upload attacks
- [ ] Path traversal in file uploads
- [ ] Malformed JSON payloads
- [ ] Unicode normalization attacks
- [ ] Session fixation attempts
- [ ] CSRF attack simulations

### Browser Compatibility Testing
- [ ] Chrome 90+
- [ ] Firefox 88+
- [ ] Safari 14+
- [ ] Edge 90+
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)
- [ ] Different screen resolutions
- [ ] Touch vs mouse input

### Performance Benchmarking
- [ ] Registration completion time under normal load
- [ ] Search response time with 100k records
- [ ] Photo upload time over different network speeds
- [ ] Emergency list generation time
- [ ] Memory usage during peak load
- [ ] Database query performance with indexes
