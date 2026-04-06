# Invariants: Visitor Registration

## Business Rules & Constraints

### INV-VISITOR-001: Single Active Visit Per Visitor
**Rule:** A visitor can only have one active (checked-in) visit at any time.

**Rationale:** Prevents duplicate registrations and ensures accurate occupancy tracking.

**Validation:**
- Check for existing active visits before allowing check-in
- Return conflict error if visitor already checked in
- Allow check-out of existing visit before new check-in

**Exception:** Pre-registered visitors can check-in even with existing records if previous visit was completed.

---

### INV-VISITOR-002: Required Information Collection
**Rule:** All required visitor information must be collected and validated before check-in.

**Required Fields:**
- First name and last name
- Phone number (valid format)
- Visit purpose
- Emergency contact (name, phone, relationship)

**Optional Fields:**
- Middle name, email, person to visit
- Vehicle information, photo, ID details

**Validation Rules:**
- Names: 2-50 characters, letters, spaces, hyphens, apostrophes only
- Phone: E.164 format with country code
- Email: Valid email format if provided
- Visit purpose: Must be from predefined enum

---

### INV-VISITOR-003: Timestamp Accuracy
**Rule:** All timestamps must be accurate and prevent future dating.

**Constraints:**
- Check-in time must be current time (±5 minutes for clock skew)
- Check-out time must be after check-in time
- No future timestamps allowed
- All timestamps stored in UTC

**Validation:**
- Server-side timestamp generation
- Clock synchronization checks
- Audit trail for timestamp modifications

---

### INV-VISITOR-004: Visit Duration Limits
**Rule:** Visits must not exceed reasonable duration limits.

**Limits:**
- Warning: Visits > 4 hours trigger alerts
- Maximum: Visits cannot exceed 12 hours
- School hours: 6:00 AM - 8:00 PM (configurable)

**Enforcement:**
- Automatic alerts for long visits
- Administrative override capability
- Audit logging of extended visits

---

### INV-VISITOR-005: Data Privacy & Retention
**Rule:** Visitor data must comply with privacy regulations and retention policies.

**Privacy Rules:**
- Photos only with explicit consent
- No collection of sensitive personal data
- Data encryption at rest and in transit
- Access controls based on roles

**Retention Policy:**
- Visit records: 7 years (regulatory requirement)
- Photos: 2 years (or until consent withdrawn)
- Audit logs: 7 years
- Automatic data deletion after retention period

---

### INV-VISITOR-006: Pre-registration Validity
**Rule:** Pre-registrations have limited validity periods.

**Constraints:**
- Default expiration: 24 hours from creation
- Maximum validity: 7 days
- Automatic cleanup of expired pre-registrations
- Email notifications sent to pre-registered visitors

**Validation:**
- Expiration timestamp checked before use
- Status updates (pending → expired)
- No check-in allowed on expired pre-registrations

---

### INV-VISITOR-007: Emergency Contact Requirements
**Rule:** Valid emergency contact information must be provided for all visitors.

**Requirements:**
- Contact name (relationship to visitor)
- Phone number (different from visitor's phone)
- Relationship type (spouse, parent, friend, etc.)

**Validation:**
- Phone number format validation
- Different from visitor's primary phone
- Required for emergency evacuation procedures

---

### INV-VISITOR-008: Badge Generation & Uniqueness
**Rule:** Each visit must have a unique badge number.

**Format:** `V{YYYYMMDD}{0001}` (e.g., V20231201001)

**Constraints:**
- Sequential numbering per day
- Reset to 0001 at midnight
- Unique within the day
- Printable QR code for verification

**Validation:**
- Automatic generation on check-in
- Duplicate prevention
- Audit trail of badge assignments

---

### INV-VISITOR-009: Role-Based Access Control
**Rule:** Access to visitor operations is restricted by user roles.

**Permissions:**

| Operation | Security Guard | Administrator |
|-----------|----------------|---------------|
| Register Visitor | ✅ | ✅ |
| Check-out Visitor | ✅ | ✅ |
| View Current Visitors | ✅ | ✅ |
| Search Visitors | ✅ | ✅ |
| Pre-register Visitors | ❌ | ✅ |
| Update Visitor Info | ❌ | ✅ |
| Delete Records | ❌ | ✅ |
| View Reports | ❌ | ✅ |

**Validation:**
- JWT token role verification
- API-level permission checks
- Audit logging of all operations

---

### INV-VISITOR-010: Audit Trail Requirements
**Rule:** All visitor-related operations must be audited.

**Audited Events:**
- Visitor registration/check-in
- Check-out operations
- Pre-registration creation
- Data modifications
- Photo uploads
- Search operations
- Report generation

**Audit Data:**
- User ID performing action
- Timestamp of action
- IP address and user agent
- Before/after values for modifications
- Success/failure status

---

## Data Integrity Constraints

### Database Constraints

#### Unique Constraints
```sql
-- Prevent duplicate active visits
ALTER TABLE visits ADD CONSTRAINT unique_active_visitor
UNIQUE (visitor_id) WHERE status = 'checked_in';

-- Unique badge numbers per day
ALTER TABLE visits ADD CONSTRAINT unique_badge_per_day
UNIQUE (badge_number, DATE(check_in_time));
```

#### Foreign Key Constraints
```sql
-- Visitor references
ALTER TABLE visits ADD CONSTRAINT fk_visit_visitor
FOREIGN KEY (visitor_id) REFERENCES visitors(id) ON DELETE RESTRICT;

-- User references
ALTER TABLE visits ADD CONSTRAINT fk_visit_checked_in_by
FOREIGN KEY (checked_in_by) REFERENCES users(id);

ALTER TABLE visits ADD CONSTRAINT fk_visit_checked_out_by
FOREIGN KEY (checked_out_by) REFERENCES users(id);
```

#### Check Constraints
```sql
-- Visit status validation
ALTER TABLE visits ADD CONSTRAINT chk_visit_status
CHECK (status IN ('expected', 'checked_in', 'checked_out', 'cancelled'));

-- Visit purpose validation
ALTER TABLE visitors ADD CONSTRAINT chk_visit_purpose
CHECK (visit_purpose IN ('parent_pickup', 'meeting', 'delivery', 'maintenance', 'interview', 'other'));

-- Phone number format (basic check)
ALTER TABLE visitors ADD CONSTRAINT chk_phone_format
CHECK (phone_number REGEXP '^\\+[1-9]\\d{1,14}$');

-- Timestamp validation
ALTER TABLE visits ADD CONSTRAINT chk_checkout_after_checkin
CHECK (check_out_time IS NULL OR check_out_time > check_in_time);
```

### Business Logic Constraints

#### Visit Duration Calculation
```typescript
// Automatic duration calculation
const calculateDuration = (checkIn: Date, checkOut: Date): string => {
  const duration = checkOut.getTime() - checkIn.getTime();
  const hours = Math.floor(duration / (1000 * 60 * 60));
  const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;
};
```

#### Duplicate Prevention
```typescript
// Check for existing active visits
const canCheckIn = async (visitorId: string): Promise<boolean> => {
  const activeVisit = await visitRepository.findOne({
    where: {
      visitorId,
      status: VisitStatus.CHECKED_IN
    }
  });
  return !activeVisit;
};
```

---

## Security Constraints

### Data Protection
- **Encryption:** All visitor data encrypted at rest using AES-256
- **Transmission:** TLS 1.3 required for all API communications
- **Access Control:** Row-level security based on school/organization
- **Data Masking:** Sensitive data masked in logs and error messages

### Authentication & Authorization
- **JWT Validation:** All requests must include valid JWT token
- **Role Verification:** Operations checked against user roles
- **Session Management:** Automatic logout after 8 hours of inactivity
- **IP Whitelisting:** Optional IP restrictions for sensitive operations

### Input Validation & Sanitization
- **SQL Injection Prevention:** Parameterized queries only
- **XSS Protection:** Input sanitization for all text fields
- **File Upload Security:** Photo uploads scanned for malware
- **Rate Limiting:** API rate limits to prevent abuse

---

## Performance Constraints

### Response Time Requirements
- **Check-in:** < 2 seconds end-to-end
- **Check-out:** < 1 second
- **Search:** < 500ms for queries
- **Current Visitors:** < 1 second for dashboard

### Scalability Limits
- **Concurrent Users:** Support 50 simultaneous guards
- **Daily Visitors:** Handle 1000+ visitors per day
- **Data Retention:** Efficient querying of 7-year history
- **Photo Storage:** Handle 10GB+ of photo data

### Database Performance
- **Indexing Strategy:** Composite indexes on frequently queried fields
- **Query Optimization:** Avoid N+1 queries, use efficient JOINs
- **Caching:** Redis caching for frequently accessed data
- **Archiving:** Automatic archiving of old records

---

## Integration Constraints

### External System Integration
- **Email Service:** Reliable delivery for pre-registration notifications
- **SMS Service:** Optional emergency contact notifications
- **Photo Storage:** Secure cloud storage with CDN delivery
- **Time Service:** NTP synchronization for accurate timestamps

### API Compatibility
- **Versioning:** API versioning for backward compatibility
- **Deprecation:** 6-month deprecation notice for breaking changes
- **Documentation:** OpenAPI 3.0 specification maintained
- **SDK Support:** Official SDKs for major platforms

---

## Monitoring & Alerting Constraints

### System Health Monitoring
- **Uptime:** 99.9% availability monitoring
- **Performance:** Response time tracking and alerting
- **Error Rates:** Automatic alerting on error rate spikes
- **Storage:** Disk space and database size monitoring

### Business Metrics Monitoring
- **Visitor Volume:** Daily/weekly visitor count tracking
- **Check-in Times:** Average registration time monitoring
- **Long Visits:** Automated alerts for extended visits
- **Data Quality:** Validation error rate monitoring

### Security Monitoring
- **Failed Access:** Authentication failure monitoring
- **Suspicious Activity:** Unusual access pattern detection
- **Data Access:** Audit log monitoring and alerting
- **Compliance:** Regular privacy audit scheduling

---

## Disaster Recovery Constraints

### Data Backup
- **Frequency:** Daily full backups, hourly incremental
- **Retention:** 30 days of daily backups, 1 year of monthly backups
- **Encryption:** All backups encrypted
- **Testing:** Monthly backup restoration testing

### Failover Requirements
- **RTO:** 4 hours recovery time objective
- **RPO:** 1 hour recovery point objective
- **Geographic Redundancy:** Multi-region deployment option
- **Automatic Failover:** Database and application failover

### Business Continuity
- **Offline Mode:** Core functionality during network outages
- **Data Synchronization:** Automatic sync when connectivity restored
- **Communication:** Emergency communication procedures
- **Training:** Regular disaster recovery drills
