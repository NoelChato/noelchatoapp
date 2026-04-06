# Architectural Decisions: Visitor Registration

This document records key architectural decisions made for the visitor registration system.

---

## Decision Log

### AD-VISITOR-001: Database Schema Design

**Context:** Need to store visitor information, visit records, and maintain data relationships.

**Decision:** Use separate tables for Visitors and VisitRecords with foreign key relationships.

**Rationale:**
- Normalizes data to avoid duplication
- Allows tracking multiple visits per visitor
- Supports efficient querying and reporting
- Enables soft deletes and audit trails

**Alternatives Considered:**
- Single table: Would duplicate visitor data for each visit
- Document storage: Less relational query capabilities
- NoSQL: Complex relationships harder to maintain

**Consequences:**
- ✅ Efficient storage and querying
- ✅ Historical visit tracking
- ✅ Data integrity through constraints
- ⚠️ More complex queries for reports
- ⚠️ Migration complexity for schema changes

---

### AD-VISITOR-002: Visit Status State Machine

**Context:** Need to track visitor status throughout their visit lifecycle.

**Decision:** Implement status enum: expected → checked_in → checked_out → cancelled.

**Rationale:**
- Clear state transitions prevent invalid operations
- Supports pre-registration workflow
- Easy to understand and maintain
- Enables status-based filtering and reporting

**Alternatives Considered:**
- Boolean flags: Less expressive, harder to extend
- Complex workflow engine: Overkill for simple states
- Status in separate table: Unnecessary complexity

**Consequences:**
- ✅ Clear state management
- ✅ Prevents invalid transitions
- ✅ Easy querying by status
- ⚠️ Status changes require validation logic

---

### AD-VISITOR-003: Photo Storage Strategy

**Context:** Need to store visitor photos securely and efficiently.

**Decision:** Store photos in cloud storage (AWS S3/Google Cloud) with database references.

**Rationale:**
- Scalable storage for growing photo library
- Secure access controls and encryption
- CDN delivery for fast loading
- Backup and disaster recovery included
- Cost-effective for variable storage needs

**Alternatives Considered:**
- Database BLOB storage: Performance issues at scale
- Local file system: Backup and scaling challenges
- Base64 in database: Storage inefficiency

**Consequences:**
- ✅ Scalable and reliable storage
- ✅ Security and compliance features
- ✅ Fast delivery via CDN
- ⚠️ External dependency on cloud provider
- ⚠️ Additional cost for storage/transfer

---

### AD-VISITOR-004: Badge Number Generation

**Context:** Need unique, sequential badge numbers for visitor identification.

**Decision:** Generate badges as V{YYYYMMDD}{0001} with database sequence.

**Rationale:**
- Human-readable format with date context
- Sequential numbering prevents duplicates
- Easy to generate and validate
- Includes date for natural partitioning

**Alternatives Considered:**
- UUID-based: Not human-friendly, harder to track
- Random numbers: Potential collisions
- External ID generation service: Unnecessary complexity

**Consequences:**
- ✅ Human-readable identifiers
- ✅ Sequential and unique
- ✅ Date-based organization
- ⚠️ Limited to 9999 visitors per day
- ⚠️ Requires sequence management

---

### AD-VISITOR-005: Pre-registration Expiration

**Context:** Pre-registered visitors should not remain in system indefinitely.

**Decision:** 24-hour default expiration with configurable limits.

**Rationale:**
- Prevents stale data accumulation
- Reasonable timeframe for event planning
- Configurable for different school needs
- Automatic cleanup reduces maintenance

**Alternatives Considered:**
- No expiration: Data accumulation issues
- Manual cleanup: Operational burden
- Very short expiration (1 hour): Too restrictive

**Consequences:**
- ✅ Prevents data bloat
- ✅ Reasonable validity period
- ✅ Automatic maintenance
- ⚠️ Requires background cleanup jobs

---

### AD-VISITOR-006: Offline Capability Implementation

**Context:** System must work during network outages for critical school operations.

**Decision:** Implement local storage with automatic synchronization.

**Rationale:**
- Ensures system availability during outages
- Critical for emergency situations
- Automatic sync prevents data loss
- Local storage for immediate operations

**Alternatives Considered:**
- No offline capability: Unacceptable for school security
- Manual data entry later: Error-prone and inefficient
- Full offline replica: Complex synchronization

**Consequences:**
- ✅ System availability during outages
- ✅ Automatic data reconciliation
- ✅ Emergency operation capability
- ⚠️ Synchronization conflict resolution needed
- ⚠️ Local storage security considerations

---

### AD-VISITOR-007: Search Implementation Strategy

**Context:** Need fast, flexible search across visitor data.

**Decision:** Use database full-text search with indexes on key fields.

**Rationale:**
- Native database performance
- Supports complex queries and filters
- Automatic indexing for speed
- Handles partial matches and fuzzy search

**Alternatives Considered:**
- Application-level search: Slower, more complex
- Elasticsearch: Additional infrastructure overhead
- Simple LIKE queries: Poor performance at scale

**Consequences:**
- ✅ Fast and efficient search
- ✅ Complex query support
- ✅ Built-in database features
- ⚠️ Database-specific syntax
- ⚠️ Index maintenance required

---

### AD-VISITOR-008: Emergency Contact Validation

**Context:** Emergency contacts must be reliable for safety procedures.

**Decision:** Require different phone number and validate relationship field.

**Rationale:**
- Ensures contact is reachable if visitor is unavailable
- Validates data quality for emergency situations
- Prevents using same number as visitor
- Required for regulatory compliance

**Alternatives Considered:**
- Optional emergency contact: Reduces safety
- No validation: Poor data quality
- Multiple emergency contacts: Overkill for most cases

**Consequences:**
- ✅ Reliable emergency contacts
- ✅ Data quality assurance
- ✅ Regulatory compliance
- ⚠️ Additional friction in registration
- ⚠️ May require contact verification

---

### AD-VISITOR-009: Audit Trail Granularity

**Context:** Need comprehensive audit trail for security and compliance.

**Decision:** Log all CRUD operations with full before/after data.

**Rationale:**
- Essential for security investigations
- Supports compliance requirements
- Enables debugging and troubleshooting
- Complete historical record

**Alternatives Considered:**
- Minimal logging: Insufficient for security
- Log aggregation service: Additional complexity
- Selective logging: Gaps in audit trail

**Consequences:**
- ✅ Complete audit coverage
- ✅ Security and compliance support
- ✅ Debugging capabilities
- ⚠️ Storage and performance impact
- ⚠️ Log rotation and retention policies needed

---

### AD-VISITOR-010: API Rate Limiting Strategy

**Context:** Prevent abuse and ensure fair resource usage.

**Decision:** Implement sliding window rate limiting per user and endpoint.

**Rationale:**
- Prevents DoS attacks and abuse
- Fair resource allocation
- Sliding window more user-friendly than fixed
- Per-user limits prevent single user impact

**Alternatives Considered:**
- No rate limiting: Vulnerable to abuse
- Global limits only: Unfair to legitimate users
- Fixed window: Less user-friendly

**Consequences:**
- ✅ Abuse prevention
- ✅ Fair resource usage
- ✅ User-friendly limits
- ⚠️ Requires Redis/external storage
- ⚠️ Configuration complexity

---

### AD-VISITOR-011: Data Retention Policy

**Context:** Balance legal requirements with storage efficiency.

**Decision:** Retain visit data for 7 years, photos for 2 years.

**Rationale:**
- Meets regulatory requirements for educational records
- Balances compliance with storage costs
- Allows historical analysis and reporting
- Automatic cleanup reduces storage needs

**Alternatives Considered:**
- Keep forever: Unnecessary storage costs
- Short retention (1 year): Non-compliant
- Manual deletion: Operational burden

**Consequences:**
- ✅ Regulatory compliance
- ✅ Cost-effective storage
- ✅ Historical data availability
- ⚠️ Data loss if retention too short
- ⚠️ Cleanup job complexity

---

### AD-VISITOR-012: Real-time Updates Implementation

**Context:** Guards need live updates of visitor status changes.

**Decision:** Use WebSocket connections with change data capture.

**Rationale:**
- Real-time updates without polling
- Efficient server resource usage
- Automatic reconnection handling
- Scales with concurrent users

**Alternatives Considered:**
- HTTP polling: Inefficient and slow
- Server-sent events: Less interactive
- Push notifications: Not suitable for web app

**Consequences:**
- ✅ Real-time updates
- ✅ Efficient resource usage
- ✅ Automatic handling
- ⚠️ WebSocket infrastructure required
- ⚠️ Browser compatibility considerations

---

## Technology Choices

### Core Dependencies
```json
{
  "@nestjs/websockets": "^10.0.0",
  "@nestjs/platform-socket.io": "^10.0.0",
  "socket.io": "^4.7.0",
  "multer": "^1.4.5-lts.1",
  "sharp": "^0.32.0",
  "aws-sdk": "^2.1400.0",
  "redis": "^4.6.0",
  "rate-limiter-flexible": "^3.0.0"
}
```

### Database Schema
```sql
-- Visitors table
CREATE TABLE visitors (
  id VARCHAR(36) PRIMARY KEY,
  first_name VARCHAR(50) NOT NULL,
  middle_name VARCHAR(50),
  last_name VARCHAR(50) NOT NULL,
  phone_number VARCHAR(20) NOT NULL,
  email VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Visit records table
CREATE TABLE visit_records (
  id VARCHAR(36) PRIMARY KEY,
  visitor_id VARCHAR(36) NOT NULL,
  check_in_time TIMESTAMP NOT NULL,
  check_out_time TIMESTAMP NULL,
  checked_in_by VARCHAR(36) NOT NULL,
  checked_out_by VARCHAR(36),
  badge_number VARCHAR(15) UNIQUE,
  status ENUM('expected', 'checked_in', 'checked_out', 'cancelled') NOT NULL,
  visit_purpose VARCHAR(50) NOT NULL,
  person_to_visit TEXT,
  vehicle_info JSON,
  emergency_contact JSON NOT NULL,
  photo_url VARCHAR(500),
  id_type VARCHAR(50),
  id_number VARCHAR(50),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (visitor_id) REFERENCES visitors(id) ON DELETE RESTRICT,
  FOREIGN KEY (checked_in_by) REFERENCES users(id),
  FOREIGN KEY (checked_out_by) REFERENCES users(id)
);

-- Pre-registrations table
CREATE TABLE pre_registrations (
  id VARCHAR(36) PRIMARY KEY,
  visitor_id VARCHAR(36) NOT NULL,
  expected_date DATE NOT NULL,
  expected_time TIME,
  expires_at TIMESTAMP NOT NULL,
  status ENUM('pending', 'arrived', 'expired') DEFAULT 'pending',
  created_by VARCHAR(36) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (visitor_id) REFERENCES visitors(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Audit log table
CREATE TABLE visitor_audit_log (
  id VARCHAR(36) PRIMARY KEY,
  visit_id VARCHAR(36),
  visitor_id VARCHAR(36),
  action VARCHAR(50) NOT NULL,
  old_data JSON,
  new_data JSON,
  user_id VARCHAR(36) NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### File Upload Configuration
```typescript
// Multer configuration for photo uploads
export const multerConfig = {
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, callback) => {
    if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
      return callback(new Error('Only image files are allowed!'), false);
    }
    callback(null, true);
  },
  storage: multer.memoryStorage() // Process before cloud upload
};
```

### WebSocket Configuration
```typescript
// Socket.IO configuration for real-time updates
export const socketConfig = {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['websocket', 'polling']
};
```

---

## Migration Strategy

### Data Migration from Legacy System
1. **Phase 1:** Export existing visitor logs to CSV/JSON
2. **Phase 2:** Transform data to new schema format
3. **Phase 3:** Validate data integrity and completeness
4. **Phase 4:** Import visitors and visit records
5. **Phase 5:** Generate missing audit trail data
6. **Phase 6:** Validate migration and switch to new system

### Schema Evolution
- Use database migration tools (TypeORM migrations)
- Backward compatible changes where possible
- Data transformation scripts for breaking changes
- Rollback plans for failed migrations

---

## Monitoring and Alerting

### Key Metrics to Monitor
- Registration completion rate
- Average check-in/check-out times
- Photo upload success rate
- Search query performance
- WebSocket connection health
- Emergency list generation time
- Pre-registration expiration cleanup

### Alert Conditions
- Registration time > 5 seconds
- Photo upload failure rate > 5%
- Search query time > 2 seconds
- WebSocket connection failures > 10%
- Emergency list generation > 30 seconds
- Pre-registration cleanup failures

### Performance Baselines
- Check-in: < 2 seconds average
- Check-out: < 1 second average
- Search (1000 records): < 500ms
- Photo upload: < 5 seconds
- Emergency list (500 visitors): < 10 seconds

---

## Future Enhancements

### Phase 2 (3-6 months)
- QR code badge scanning for check-out
- Facial recognition integration
- Mobile app for visitor self-check-in
- Advanced reporting and analytics
- Integration with school calendar system

### Phase 3 (6-12 months)
- Automated license plate recognition
- Visitor frequency analysis
- Emergency notification system
- Integration with security camera feeds
- Advanced access control integration

### Long-term Vision
- AI-powered suspicious activity detection
- Integration with national visitor databases
- Real-time emergency coordination
- Comprehensive school security ecosystem

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Data loss during migration | Medium | High | Comprehensive testing, backups |
| Photo storage service outage | Low | Medium | Local fallback, multiple providers |
| High concurrent load | Medium | Medium | Load testing, horizontal scaling |
| WebSocket connection issues | Low | Low | Fallback to polling, reconnection logic |
| Pre-registration spam | Low | Low | Rate limiting, CAPTCHA if needed |
| Emergency contact unreachability | Medium | High | Validation, multiple contact methods |

---

## Success Metrics

### Functional Metrics
- 95%+ registration completion rate
- < 2 second average registration time
- 100% audit trail coverage
- 99.9% system availability

### User Experience Metrics
- > 4.5/5 user satisfaction score
- < 5% error rate in data entry
- < 30 minutes training time
- > 95% photo capture success rate

### Business Impact Metrics
- 60% reduction in registration time vs paper
- 100% emergency contact data accuracy
- < 1 minute emergency list generation
- 0 data loss incidents in production

### Technical Metrics
- < 500ms search response time
- < 5MB average photo storage per visitor
- 99.95% API uptime
- < 100ms WebSocket latency
