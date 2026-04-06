# Architectural Decisions: Time Tracking

This document records key architectural decisions made for the time tracking and analytics system.

---

## Decision Log

### AD-TIME-001: Analytics Database Design

**Context:** Need to store and query large volumes of time-series visitor data efficiently.

**Decision:** Use time-series optimized database with automatic partitioning.

**Rationale:**
- Time-series data has specific access patterns (time-range queries)
- Automatic partitioning improves query performance
- Efficient storage for historical data retention
- Built-in aggregation functions for analytics

**Alternatives Considered:**
- Standard relational database: Slower for time-series queries
- NoSQL document store: Less efficient for range queries
- Data warehouse: Overkill for current scale

**Consequences:**
- ✅ Optimized for time-series queries
- ✅ Automatic data lifecycle management
- ✅ Efficient aggregations
- ⚠️ Learning curve for time-series specific features
- ⚠️ Potential vendor lock-in

---

### AD-TIME-002: Real-time vs Batch Analytics

**Context:** Balance real-time requirements with system performance.

**Decision:** Real-time for critical metrics, batch for complex analytics.

**Rationale:**
- Real-time needed for occupancy monitoring and alerts
- Batch processing acceptable for historical reports
- Reduces system load and improves reliability
- Allows for complex calculations without blocking

**Alternatives Considered:**
- All real-time: High system load, complex implementation
- All batch: Poor user experience for current data
- Hybrid with complex caching: Overly complex

**Consequences:**
- ✅ Good user experience for current data
- ✅ Reliable complex analytics
- ✅ Scalable architecture
- ⚠️ Delay in some analytics updates
- ⚠️ More complex architecture

---

### AD-TIME-003: Alert Management Architecture

**Context:** Need reliable alert generation and management for long visits.

**Decision:** Event-driven alert system with persistent state.

**Rationale:**
- Events ensure no alerts are missed
- Persistent state handles system restarts
- Scalable for high-volume alert generation
- Clear separation of alert generation and management

**Alternatives Considered:**
- Polling-based: Inefficient, potential missed alerts
- In-memory only: Lost on restart
- Database triggers: Tight coupling, harder to maintain

**Consequences:**
- ✅ Reliable alert generation
- ✅ Survives system restarts
- ✅ Scalable and maintainable
- ⚠️ Additional infrastructure complexity
- ⚠️ Eventual consistency considerations

---

### AD-TIME-004: Report Generation Strategy

**Context:** Handle complex report generation without blocking user requests.

**Decision:** Asynchronous report generation with job queuing.

**Rationale:**
- Non-blocking user experience
- Better resource utilization
- Progress tracking capability
- Fault tolerance with retry logic

**Alternatives Considered:**
- Synchronous generation: Poor UX for large reports
- Client-side generation: Security and performance issues
- Pre-computed reports: Storage intensive, less flexible

**Consequences:**
- ✅ Better user experience
- ✅ Resource efficient
- ✅ Fault tolerant
- ⚠️ Additional infrastructure (job queue)
- ⚠️ Complexity in progress tracking

---

### AD-TIME-005: Data Retention and Archiving

**Context:** Balance data retention requirements with storage costs.

**Decision:** Tiered retention: hot (30 days), warm (1 year), cold (7 years).

**Rationale:**
- Frequently accessed data stays fast
- Older data archived to cheaper storage
- Meets regulatory retention requirements
- Cost-effective storage strategy

**Alternatives Considered:**
- All data in fast storage: High cost
- Fixed retention period: Less flexible
- Manual archiving: Operational burden

**Consequences:**
- ✅ Cost-effective storage
- ✅ Performance optimized
- ✅ Regulatory compliant
- ⚠️ Data access complexity
- ⚠️ Migration between tiers

---

### AD-TIME-006: Caching Strategy for Analytics

**Context:** Improve performance for frequently accessed analytics data.

**Decision:** Multi-level caching: in-memory, Redis, database.

**Rationale:**
- Fast access for hot data
- Distributed cache for scalability
- Database as cache of last resort
- Automatic cache invalidation

**Alternatives Considered:**
- No caching: Poor performance
- Database-only caching: Limited scalability
- External cache only: Cold start issues

**Consequences:**
- ✅ Improved performance
- ✅ Scalable architecture
- ✅ Fault tolerant
- ⚠️ Cache consistency challenges
- ⚠️ Additional infrastructure

---

### AD-TIME-007: Scheduled Report Delivery

**Context:** Automate report generation and delivery.

**Decision:** Cron-based scheduling with email delivery and archiving.

**Rationale:**
- Reliable scheduling with cron
- Email delivery for accessibility
- Automatic archiving for compliance
- Configurable recipients and formats

**Alternatives Considered:**
- Application-level scheduling: Less reliable
- Manual delivery: Operational burden
- Real-time notifications only: Less comprehensive

**Consequences:**
- ✅ Reliable automation
- ✅ Accessible delivery
- ✅ Compliance support
- ⚠️ Email delivery dependencies
- ⚠️ Time zone handling complexity

---

### AD-TIME-008: Performance Metrics Collection

**Context:** Monitor system performance and user experience metrics.

**Decision:** Application-level metrics collection with external monitoring.

**Rationale:**
- Detailed application-specific metrics
- Integration with monitoring tools
- Real-time alerting capabilities
- Performance trend analysis

**Alternatives Considered:**
- External monitoring only: Less detailed
- No metrics: Poor observability
- Custom monitoring stack: Maintenance burden

**Consequences:**
- ✅ Comprehensive monitoring
- ✅ Performance optimization
- ✅ Proactive issue detection
- ⚠️ Additional development overhead
- ⚠️ Storage and processing of metrics

---

### AD-TIME-009: Data Export Architecture

**Context:** Support multiple export formats for different use cases.

**Decision:** Template-based export with streaming for large datasets.

**Rationale:**
- Flexible format support
- Memory-efficient for large exports
- Consistent formatting
- Extensible for new formats

**Alternatives Considered:**
- Format-specific code: Maintenance burden
- Client-side export: Security issues
- Pre-generated exports: Storage intensive

**Consequences:**
- ✅ Flexible and maintainable
- ✅ Memory efficient
- ✅ Consistent output
- ⚠️ Template complexity
- ⚠️ Format compatibility issues

---

### AD-TIME-010: Historical Data Analysis

**Context:** Support long-term trend analysis and comparisons.

**Decision:** Pre-aggregated historical data with raw data access.

**Rationale:**
- Fast queries for common analytics
- Raw data available for custom analysis
- Balances performance and flexibility
- Supports complex trend analysis

**Alternatives Considered:**
- Raw data only: Poor performance
- Pre-computed only: Less flexible
- External analytics: Integration complexity

**Consequences:**
- ✅ Good performance and flexibility
- ✅ Supports various analysis types
- ✅ Scalable for large datasets
- ⚠️ Data consistency between aggregates and raw
- ⚠️ Storage overhead for aggregates

---

## Technology Choices

### Core Dependencies
```json
{
  "@nestjs/schedule": "^4.0.0",
  "@nestjs/bull": "^10.0.0",
  "bull": "^4.10.0",
  "redis": "^4.6.0",
  "timescaledb": "^2.10.0",
  "chart.js": "^4.3.0",
  "pdfkit": "^0.13.0",
  "xlsx": "^0.18.5"
}
```

### Database Schema
```sql
-- Analytics events table (time-series)
CREATE TABLE analytics_events (
  time TIMESTAMPTZ NOT NULL,
  visitor_id VARCHAR(36),
  event_type VARCHAR(50) NOT NULL,
  event_data JSONB,
  duration_minutes INTEGER,
  metadata JSONB
);

-- Create hypertable for time-series optimization
SELECT create_hypertable('analytics_events', 'time', chunk_time_interval => INTERVAL '1 day');

-- Daily aggregations table
CREATE TABLE daily_aggregations (
  date DATE PRIMARY KEY,
  total_visitors INTEGER NOT NULL DEFAULT 0,
  total_duration_minutes INTEGER NOT NULL DEFAULT 0,
  avg_duration_minutes DECIMAL(6,2),
  peak_hour INTEGER,
  peak_hour_visitors INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Alert configurations
CREATE TABLE alert_configs (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  condition_type VARCHAR(50) NOT NULL,
  threshold_value INTEGER NOT NULL,
  severity VARCHAR(20) NOT NULL,
  enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Active alerts
CREATE TABLE active_alerts (
  id VARCHAR(36) PRIMARY KEY,
  alert_config_id VARCHAR(36) NOT NULL,
  visitor_id VARCHAR(36),
  visit_id VARCHAR(36),
  threshold_value INTEGER NOT NULL,
  current_value INTEGER NOT NULL,
  severity VARCHAR(20) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  acknowledged_by VARCHAR(36),
  acknowledged_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  FOREIGN KEY (alert_config_id) REFERENCES alert_configs(id)
);
```

### Caching Configuration
```typescript
// Redis caching configuration
export const redisConfig = {
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT),
  password: process.env.REDIS_PASSWORD,
  keyPrefix: 'analytics:',
  ttl: 300 // 5 minutes default
};

// Cache keys
export const cacheKeys = {
  occupancy: 'occupancy:current',
  dailyStats: (date: string) => `daily:stats:${date}`,
  alerts: 'alerts:active',
  reportStatus: (id: string) => `report:status:${id}`
};
```

### Job Queue Configuration
```typescript
// Bull queue configuration
export const queueConfig = {
  redis: redisConfig,
  defaultJobOptions: {
    removeOnComplete: 50,
    removeOnFail: 100,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000
    }
  }
};
```

---

## Migration Strategy

### Database Migration
1. **Phase 1:** Create time-series tables alongside existing schema
2. **Phase 2:** Migrate existing data to new structure
3. **Phase 3:** Implement aggregation jobs for historical data
4. **Phase 4:** Switch application to use new analytics tables
5. **Phase 5:** Optimize and monitor performance

### Application Migration
- Implement analytics service alongside existing system
- Gradual rollout of new features
- Backward compatibility during transition
- Performance monitoring throughout migration

---

## Monitoring and Alerting

### Key Metrics to Monitor
- Report generation success rate and duration
- Real-time metrics update latency
- Alert generation and acknowledgment rates
- Cache hit rates and performance
- Database query performance
- Job queue processing rates
- API response times and error rates

### Alert Conditions
- Report generation > 60 seconds
- Real-time update latency > 5 seconds
- Alert acknowledgment rate < 80%
- Cache miss rate > 50%
- Database query time > 2 seconds
- Job queue failure rate > 5%
- API error rate > 1%

### Performance Baselines
- Occupancy update: < 2 seconds
- Daily stats calculation: < 30 seconds
- Report generation (1 month): < 45 seconds
- Alert processing: < 1 second
- Cache hit rate: > 85%
- API response time: < 500ms

---

## Future Enhancements

### Phase 2 (3-6 months)
- Machine learning for anomaly detection
- Predictive analytics for visitor forecasting
- Advanced visualization with interactive dashboards
- Integration with external business intelligence tools
- Mobile analytics application

### Phase 3 (6-12 months)
- Real-time streaming analytics
- Advanced pattern recognition
- Automated insights and recommendations
- Integration with IoT sensors
- API marketplace for third-party analytics

### Long-term Vision
- AI-powered security threat prediction
- Integration with national visitor databases
- Advanced capacity planning and optimization
- Real-time emergency response coordination
- Comprehensive school safety intelligence platform

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Data accuracy in analytics | Medium | High | Comprehensive validation, testing |
| Performance degradation at scale | Medium | High | Performance monitoring, optimization |
| Alert system reliability | Low | High | Redundant alert processing, monitoring |
| Historical data migration | Medium | Medium | Phased migration, data validation |
| Cache consistency issues | Low | Medium | Cache invalidation strategies, monitoring |
| Report generation failures | Low | Medium | Retry logic, error handling, monitoring |

---

## Success Metrics

### Functional Metrics
- 100% accuracy in duration calculations
- < 5 second latency for real-time metrics
- < 30 second report generation for standard reports
- 99.9% alert system reliability
- 95% cache hit rate for hot data

### User Experience Metrics
- > 4.5/5 user satisfaction with analytics features
- < 10% report regeneration rate due to errors
- < 5 minutes average time to find needed analytics
- 100% report delivery success rate

### Business Impact Metrics
- 50% reduction in manual reporting time
- 100% compliance with reporting requirements
- Improved decision-making based on analytics
- Enhanced security through data-driven insights

### Technical Metrics
- < 500ms average API response time
- 99.95% system availability for analytics
- < 100ms real-time metrics update latency
- 99% report generation success rate
