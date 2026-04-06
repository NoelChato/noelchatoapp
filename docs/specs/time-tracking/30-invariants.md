# Invariants: Time Tracking

## Business Rules & Constraints

### INV-TIME-001: Duration Calculation Accuracy
**Rule:** All visit durations must be calculated accurately and consistently.

**Constraints:**
- Duration = check-out time - check-in time
- Display format: HH:MM (hours:minutes)
- Real-time updates every minute for active visits
- Handle date boundaries (visits spanning midnight)
- No negative durations allowed

**Validation:**
- Server-side calculation using UTC timestamps
- Automatic rounding to nearest minute
- Validation prevents future check-in times
- Audit trail for duration calculations

---

### INV-TIME-002: Long Visit Alert Thresholds
**Rule:** Long visit alerts must trigger at configurable thresholds with appropriate escalation.

**Constraints:**
- Default warning threshold: 4 hours
- Critical threshold: 8 hours (configurable)
- Alerts sent to designated administrators
- Alert status tracking (active, acknowledged, resolved)
- No duplicate alerts for same visit

**Validation:**
- Threshold validation (warning < critical)
- Alert delivery confirmation
- Escalation logic for unacknowledged alerts
- Alert resolution tracking

---

### INV-TIME-003: Real-time Metrics Consistency
**Rule:** Real-time occupancy and duration metrics must be consistent across all interfaces.

**Constraints:**
- All metrics calculated from same data source
- Update latency < 5 seconds from data changes
- Consistent calculation methods across endpoints
- Cache invalidation on data changes

**Validation:**
- Single source of truth for calculations
- Event-driven updates vs polling
- Cache consistency checks
- Performance monitoring for update delays

---

### INV-TIME-004: Historical Data Integrity
**Rule:** Historical analytics data must maintain integrity and be reproducible.

**Constraints:**
- Raw data retention: 7 years minimum
- Aggregated data retention: indefinite
- Data immutability for completed time periods
- Reproducible calculations from raw data

**Validation:**
- Data backup and recovery procedures
- Checksum validation for archived data
- Audit trail for data modifications
- Regular integrity checks

---

### INV-TIME-005: Report Generation Constraints
**Rule:** Report generation must complete within performance limits and maintain data consistency.

**Constraints:**
- Standard reports: < 30 seconds
- Large datasets: < 60 seconds
- Maximum concurrent reports: 10
- Report data frozen at generation time
- Failed reports automatically retried

**Validation:**
- Timeout handling for long-running queries
- Resource limits per report generation
- Data consistency during report creation
- Error handling and retry logic

---

### INV-TIME-006: Data Anonymization Requirements
**Rule:** Personal data must be properly anonymized in reports and analytics.

**Constraints:**
- No PII in aggregated reports
- Individual visitor data anonymized
- Emergency contact information protected
- Photo data excluded from analytics

**Validation:**
- Automatic PII detection and removal
- Anonymization algorithm consistency
- Privacy compliance auditing
- Data classification procedures

---

### INV-TIME-007: Performance Monitoring Thresholds
**Rule:** System performance must be continuously monitored with defined thresholds.

**Constraints:**
- API response time: < 500ms average
- Report generation: < 30 seconds
- Real-time updates: < 5 seconds
- Error rate: < 1%
- System uptime: 99.9%

**Validation:**
- Automated performance monitoring
- Alert thresholds with escalation
- Performance baseline tracking
- Capacity planning based on metrics

---

### INV-TIME-008: Scheduled Report Reliability
**Rule:** Scheduled reports must be delivered reliably and on time.

**Constraints:**
- Delivery within 15 minutes of scheduled time
- Automatic retry for failed deliveries
- Delivery confirmation and tracking
- Archive retention for 7 years

**Validation:**
- Schedule execution monitoring
- Delivery status tracking
- Failure notification system
- Manual execution capability

---

### INV-TIME-009: Audit Trail Completeness
**Rule:** All analytics and reporting activities must be fully auditable.

**Constraints:**
- User identification for all actions
- Timestamp accuracy (server-side)
- Before/after data for modifications
- IP address and user agent logging
- Retention: 7 years minimum

**Validation:**
- Comprehensive logging of all operations
- Tamper-proof audit records
- Regular audit log reviews
- Compliance with regulatory requirements

---

### INV-TIME-010: Capacity and Scalability Limits
**Rule:** System must handle growing data volumes and user loads within defined limits.

**Constraints:**
- Daily visitors: 10,000+ records
- Historical data: 7+ years
- Concurrent users: 50+ report viewers
- Report generation queue: 10 concurrent
- Storage growth: predictable scaling

**Validation:**
- Load testing with realistic data volumes
- Performance monitoring under load
- Scalability planning and implementation
- Resource usage optimization

---

## Data Integrity Constraints

### Database Constraints

#### Check Constraints
```sql
-- Duration validation
ALTER TABLE visits ADD CONSTRAINT chk_duration_positive
CHECK (check_out_time IS NULL OR check_out_time > check_in_time);

-- Date range validation for reports
ALTER TABLE reports ADD CONSTRAINT chk_valid_date_range
CHECK (end_date >= start_date);

-- Threshold validation
ALTER TABLE alert_thresholds ADD CONSTRAINT chk_threshold_order
CHECK (warning_threshold < critical_threshold);
```

#### Index Strategy
```sql
-- Performance indexes for analytics queries
CREATE INDEX idx_visits_check_in_time ON visits (check_in_time);
CREATE INDEX idx_visits_status_check_in ON visits (status, check_in_time);
CREATE INDEX idx_visits_purpose_check_in ON visits (visit_purpose, check_in_time);
CREATE INDEX idx_audit_log_timestamp ON audit_log (created_at);
CREATE INDEX idx_reports_date_range ON reports (start_date, end_date);
```

#### Partitioning Strategy
```sql
-- Partition visits by month for performance
PARTITION BY RANGE (YEAR(check_in_time), MONTH(check_in_time)) (
  PARTITION p202301 VALUES LESS THAN (2023, 2),
  PARTITION p202302 VALUES LESS THAN (2023, 3),
  -- ... additional partitions
);
```

### Business Logic Constraints

#### Duration Calculation
```typescript
// Accurate duration calculation with timezone handling
const calculateDuration = (checkIn: Date, checkOut: Date): Duration => {
  const durationMs = checkOut.getTime() - checkIn.getTime();
  const hours = Math.floor(durationMs / (1000 * 60 * 60));
  const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
  
  return {
    hours,
    minutes,
    formatted: `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`,
    totalMinutes: hours * 60 + minutes
  };
};
```

#### Alert Management
```typescript
// Alert deduplication and escalation
const manageAlerts = async (visitId: string, durationHours: number) => {
  const existingAlert = await alertRepository.findOne({
    where: { visitId, status: 'active' }
  });
  
  if (!existingAlert && durationHours >= threshold) {
    await createAlert(visitId, durationHours);
  } else if (existingAlert && durationHours >= criticalThreshold) {
    await escalateAlert(existingAlert.id);
  }
};
```

---

## Security Constraints

### Data Protection
- **Encryption:** All analytics data encrypted at rest
- **Access Control:** Role-based access to reports and metrics
- **Data Masking:** PII automatically masked in logs
- **Network Security:** TLS 1.3 for all analytics API calls

### Privacy Compliance
- **Anonymization:** Personal data removed from aggregated reports
- **Consent Tracking:** Photo usage consent verified
- **Data Minimization:** Only necessary data collected for analytics
- **Retention Limits:** Automatic deletion of expired personal data

### Audit Security
- **Immutable Logs:** Audit records cannot be modified
- **Access Logging:** All report access logged with user details
- **Secure Storage:** Audit logs encrypted and access-controlled
- **Regular Reviews:** Automated review of suspicious access patterns

---

## Performance Constraints

### Query Optimization
- **Database Indexes:** Composite indexes on frequently queried fields
- **Query Caching:** Redis caching for expensive calculations
- **Result Pagination:** Automatic pagination for large result sets
- **Async Processing:** Background processing for report generation

### Resource Management
- **Memory Limits:** Per-request memory limits to prevent OOM
- **CPU Limits:** Request CPU time limits for fairness
- **Connection Pooling:** Database connection reuse and limits
- **File Handle Limits:** Proper cleanup of temporary files

### Monitoring and Alerting
- **Performance Metrics:** Continuous monitoring of response times
- **Resource Usage:** Memory, CPU, and disk usage tracking
- **Error Tracking:** Automatic error detection and alerting
- **Capacity Planning:** Usage trend analysis for scaling decisions

---

## Integration Constraints

### External System Integration
- **Email Service:** Reliable delivery for report notifications
- **File Storage:** Secure storage for generated reports
- **Cache Service:** Redis for performance optimization
- **Monitoring:** Integration with system monitoring tools

### API Compatibility
- **Versioning:** Semantic versioning for API changes
- **Backward Compatibility:** 12-month support for deprecated endpoints
- **Documentation:** OpenAPI specification maintained
- **Rate Limiting:** Fair usage policies for all consumers

---

## Monitoring & Alerting Constraints

### System Health Monitoring
- **Availability:** 99.9% uptime monitoring
- **Performance:** Response time and throughput tracking
- **Errors:** Error rate monitoring with automatic alerts
- **Resources:** CPU, memory, and disk usage monitoring

### Business Metrics Monitoring
- **Report Generation:** Success rate and timing monitoring
- **User Activity:** Analytics usage patterns tracking
- **Data Quality:** Accuracy of calculations and aggregations
- **Alert Effectiveness:** Alert generation and response tracking

### Security Monitoring
- **Access Patterns:** Unusual access pattern detection
- **Data Access:** Monitoring of sensitive data access
- **Audit Compliance:** Regular audit log analysis
- **Threat Detection:** Automated threat pattern recognition

---

## Disaster Recovery Constraints

### Data Backup
- **Frequency:** Real-time replication for critical data
- **Retention:** 30 days of detailed backups, 1 year of monthly
- **Testing:** Monthly restoration testing
- **Encryption:** All backups encrypted

### Failover Capabilities
- **RTO:** 1 hour recovery time for analytics functions
- **RPO:** 5 minute data loss tolerance
- **Automatic Failover:** Database and service failover
- **Read Replicas:** Read-only analytics during failover

### Business Continuity
- **Degraded Mode:** Basic analytics available during outages
- **Data Synchronization:** Automatic sync after recovery
- **Communication:** Status updates during incidents
- **Testing:** Regular disaster recovery drills
