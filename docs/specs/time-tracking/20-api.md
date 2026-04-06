# API Documentation: Time Tracking

## Overview

The Time Tracking API provides endpoints for real-time occupancy monitoring, historical analytics, automated reporting, and performance metrics. All endpoints require authentication with appropriate role permissions.

**Base URL:** `/api/v1/analytics`  
**Authentication:** JWT Bearer token required  
**Content-Type:** `application/json`

---

## Endpoints

### GET /api/v1/analytics/occupancy

Get current occupancy metrics and real-time visitor statistics.

**Authorization:** `security_guard`, `administrator`  
**Rate Limit:** 60 requests per minute  
**Cache:** 30 seconds

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "currentVisitors": 23,
    "capacityPercentage": 15.3,
    "longVisitsCount": 2,
    "averageDurationMinutes": 45,
    "lastUpdated": "2023-12-01T14:30:00Z",
    "visitorsByPurpose": {
      "parent_pickup": 15,
      "meeting": 5,
      "delivery": 2,
      "maintenance": 1
    },
    "peakToday": {
      "hour": 15,
      "visitorCount": 45
    }
  }
}
```

---

### GET /api/v1/analytics/durations

Get current visit durations for all active visitors.

**Authorization:** `security_guard`, `administrator`  
**Rate Limit:** 30 requests per minute

#### Query Parameters
- `sortBy` (optional): Sort field (duration, checkInTime, name) - default: duration
- `sortOrder` (optional): Sort order (asc/desc) - default: desc
- `limit` (optional): Maximum results - default: 100

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "visits": [
      {
        "visitId": "vis_1234567890abcdef",
        "visitor": {
          "firstName": "John",
          "lastName": "Smith"
        },
        "checkInTime": "2023-12-01T08:30:00Z",
        "currentDuration": "06:15",
        "durationMinutes": 375,
        "isLongVisit": true,
        "visitPurpose": "meeting",
        "badgeNumber": "V20231201001"
      }
    ],
    "summary": {
      "totalActiveVisits": 23,
      "longVisitsCount": 2,
      "averageDuration": "01:45",
      "maxDuration": "08:30"
    }
  }
}
```

---

### GET /api/v1/analytics/alerts

Get active long visit alerts and notifications.

**Authorization:** `administrator`  
**Rate Limit:** 30 requests per minute

#### Query Parameters
- `status` (optional): Alert status (active, acknowledged, resolved) - default: active
- `severity` (optional): Alert severity (warning, critical) - default: all

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "alerts": [
      {
        "id": "alert_1234567890abcdef",
        "visitId": "vis_1234567890abcdef",
        "visitorName": "John Smith",
        "checkInTime": "2023-12-01T08:30:00Z",
        "currentDuration": "06:15",
        "thresholdHours": 4,
        "severity": "warning",
        "status": "active",
        "createdAt": "2023-12-01T12:30:00Z",
        "acknowledgedBy": null
      }
    ],
    "summary": {
      "totalActive": 3,
      "warningCount": 2,
      "criticalCount": 1,
      "acknowledgedToday": 5
    }
  }
}
```

---

### POST /api/v1/analytics/alerts/{alertId}/acknowledge

Acknowledge a long visit alert.

**Authorization:** `administrator`  
**Rate Limit:** 60 requests per minute

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "alertId": "alert_1234567890abcdef",
    "status": "acknowledged",
    "acknowledgedBy": "admin_jane_doe",
    "acknowledgedAt": "2023-12-01T14:35:00Z"
  },
  "message": "Alert acknowledged successfully"
}
```

---

### GET /api/v1/analytics/daily/{date}

Get comprehensive daily statistics for a specific date.

**Authorization:** `security_guard`, `administrator`  
**Rate Limit:** 30 requests per minute

#### Path Parameters
- `date`: Date in YYYY-MM-DD format

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "date": "2023-12-01",
    "totalVisitors": 234,
    "uniqueVisitors": 198,
    "averageDurationMinutes": 42,
    "averageDurationFormatted": "00:42",
    "peakHour": 15,
    "peakHourVisitors": 45,
    "totalVisitTimeMinutes": 9828,
    "visitPurposeBreakdown": {
      "parent_pickup": 145,
      "meeting": 45,
      "delivery": 23,
      "maintenance": 12,
      "interview": 9
    },
    "hourlyBreakdown": [
      0, 0, 0, 0, 0, 0, 5, 12, 28, 35, 42, 38, 45, 52, 48, 45, 38, 25, 18, 12, 8, 5, 2, 0
    ],
    "durationDistribution": {
      "under_30_min": 89,
      "30_60_min": 67,
      "1_2_hours": 45,
      "2_4_hours": 23,
      "over_4_hours": 10
    }
  }
}
```

---

### GET /api/v1/analytics/range

Get analytics for a custom date range.

**Authorization:** `administrator`  
**Rate Limit:** 20 requests per minute

#### Query Parameters
- `startDate`: Start date (YYYY-MM-DD) - required
- `endDate`: End date (YYYY-MM-DD) - required
- `groupBy` (optional): Grouping (day, week, month) - default: day

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "dateRange": {
      "startDate": "2023-12-01",
      "endDate": "2023-12-07"
    },
    "summary": {
      "totalDays": 7,
      "totalVisitors": 1456,
      "averageDailyVisitors": 208,
      "peakDay": "2023-12-05",
      "peakDayVisitors": 267,
      "totalVisitTimeHours": 1456
    },
    "dailyData": [
      {
        "date": "2023-12-01",
        "visitors": 234,
        "averageDuration": "00:42"
      }
    ],
    "trends": {
      "visitorGrowth": 12.5,
      "durationChange": -5.2,
      "peakHourShift": 0
    }
  }
}
```

---

### POST /api/v1/reports/generate

Generate a custom analytics report.

**Authorization:** `administrator`  
**Rate Limit:** 10 requests per minute

#### Request Body
```json
{
  "reportType": "monthly_compliance",
  "dateRange": {
    "startDate": "2023-11-01",
    "endDate": "2023-11-30"
  },
  "filters": {
    "visitPurpose": ["parent_pickup", "meeting"],
    "minDuration": 30
  },
  "format": "pdf",
  "includeCharts": true,
  "recipients": ["admin@school.edu"]
}
```

#### Response (202 Accepted)
```json
{
  "success": true,
  "data": {
    "reportId": "rpt_1234567890abcdef",
    "status": "processing",
    "estimatedCompletion": "2023-12-01T14:35:00Z",
    "downloadUrl": null
  },
  "message": "Report generation started"
}
```

---

### GET /api/v1/reports/{reportId}

Get report generation status and download link.

**Authorization:** `administrator`  
**Rate Limit:** 60 requests per minute

#### Path Parameters
- `reportId`: Report ID from generation request

#### Response (200 OK) - Completed
```json
{
  "success": true,
  "data": {
    "reportId": "rpt_1234567890abcdef",
    "status": "completed",
    "reportType": "monthly_compliance",
    "generatedAt": "2023-12-01T14:32:00Z",
    "fileSize": 2457600,
    "downloadUrl": "https://api.school.edu/reports/rpt_1234567890abcdef.pdf",
    "expiresAt": "2023-12-08T14:32:00Z"
  }
}
```

#### Response (200 OK) - Processing
```json
{
  "success": true,
  "data": {
    "reportId": "rpt_1234567890abcdef",
    "status": "processing",
    "progress": 65,
    "estimatedCompletion": "2023-12-01T14:35:00Z"
  }
}
```

---

### GET /api/v1/reports/scheduled

List scheduled reports and their configurations.

**Authorization:** `administrator`  
**Rate Limit:** 30 requests per minute

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "schedules": [
      {
        "id": "sch_1234567890abcdef",
        "name": "Monthly Compliance Report",
        "reportType": "monthly_compliance",
        "schedule": {
          "frequency": "monthly",
          "dayOfMonth": 1,
          "time": "09:00"
        },
        "recipients": ["compliance@school.edu", "admin@school.edu"],
        "format": "pdf",
        "isActive": true,
        "lastRun": "2023-11-01T09:00:00Z",
        "nextRun": "2023-12-01T09:00:00Z"
      }
    ]
  }
}
```

---

### POST /api/v1/reports/schedules

Create a new scheduled report.

**Authorization:** `administrator`  
**Rate Limit:** 20 requests per minute

#### Request Body
```json
{
  "name": "Weekly Security Summary",
  "reportType": "weekly_analytics",
  "schedule": {
    "frequency": "weekly",
    "dayOfWeek": "monday",
    "time": "08:00"
  },
  "filters": {
    "includeLongVisits": true
  },
  "format": "pdf",
  "recipients": ["security@school.edu"],
  "isActive": true
}
```

#### Response (201 Created)
```json
{
  "success": true,
  "data": {
    "scheduleId": "sch_1234567890abcdef",
    "name": "Weekly Security Summary",
    "nextRun": "2023-12-04T08:00:00Z"
  },
  "message": "Scheduled report created successfully"
}
```

---

### GET /api/v1/analytics/thresholds

Get current alert thresholds and configuration.

**Authorization:** `administrator`  
**Rate Limit:** 30 requests per minute

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "longVisitThresholdHours": 4,
    "criticalVisitThresholdHours": 8,
    "capacityWarningPercentage": 90,
    "capacityCriticalPercentage": 95,
    "alertRecipients": ["admin@school.edu", "security@school.edu"],
    "emailNotifications": true,
    "smsNotifications": false
  }
}
```

---

### PUT /api/v1/analytics/thresholds

Update alert thresholds and notification settings.

**Authorization:** `administrator`  
**Rate Limit:** 10 requests per minute

#### Request Body
```json
{
  "longVisitThresholdHours": 6,
  "criticalVisitThresholdHours": 10,
  "capacityWarningPercentage": 85,
  "alertRecipients": ["admin@school.edu", "security@school.edu", "manager@school.edu"]
}
```

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "longVisitThresholdHours": 6,
    "criticalVisitThresholdHours": 10,
    "capacityWarningPercentage": 85,
    "alertRecipients": ["admin@school.edu", "security@school.edu", "manager@school.edu"],
    "updatedAt": "2023-12-01T14:30:00Z"
  },
  "message": "Alert thresholds updated successfully"
}
```

---

### GET /api/v1/analytics/performance

Get system performance metrics and analytics.

**Authorization:** `administrator`  
**Rate Limit:** 30 requests per minute

#### Query Parameters
- `period` (optional): Time period (hour, day, week) - default: day

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "period": "day",
    "registrationMetrics": {
      "averageTime": 1.8,
      "successRate": 99.7,
      "totalRegistrations": 234
    },
    "apiMetrics": {
      "averageResponseTime": 245,
      "errorRate": 0.3,
      "requestsPerMinute": 45
    },
    "systemHealth": {
      "uptime": 99.9,
      "databaseConnections": 12,
      "memoryUsage": 68.5
    }
  }
}
```

---

## Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `INVALID_DATE_RANGE` | 400 | Start date after end date or invalid format |
| `REPORT_NOT_FOUND` | 404 | Specified report ID does not exist |
| `REPORT_GENERATION_FAILED` | 500 | Report generation encountered an error |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests for report generation |
| `INSUFFICIENT_PERMISSIONS` | 403 | User lacks permission for requested analytics |

---

## Rate Limiting

- **Real-time endpoints:** Sliding window, 60 requests per minute
- **Report generation:** Strict limit, 10 requests per minute per user
- **Analytics queries:** 30 requests per minute
- **Headers included:** `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

---

## Data Formats

### Date Parameters
- **Format:** YYYY-MM-DD (ISO 8601 date only)
- **Validation:** Must be valid calendar dates
- **Range:** Maximum 1 year for custom ranges

### Time Durations
- **Format:** HH:MM or ISO 8601 duration (PT1H30M)
- **Precision:** Minutes for storage, HH:MM for display
- **Calculation:** Includes seconds but displays rounded to minutes

### Report Formats
- **PDF:** High-quality formatted reports with charts
- **CSV:** Raw data export for analysis
- **Excel:** Formatted spreadsheets with calculations
- **JSON:** Structured data for API integration

---

## Webhooks (Future Enhancement)

The system supports webhooks for real-time notifications:
- **Long Visit Alerts:** Notify security systems
- **Capacity Thresholds:** Alert when occupancy limits reached
- **Report Generation:** Notify when scheduled reports complete
- **System Alerts:** Performance and error notifications

---

## SDK Examples

### JavaScript - Real-time Occupancy
```javascript
// Get current occupancy
const getOccupancy = async () => {
  const response = await fetch('/api/v1/analytics/occupancy', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const result = await response.json();
  console.log(`Current visitors: ${result.data.currentVisitors}`);
  return result;
};

// Monitor long visits
const monitorLongVisits = async () => {
  const response = await fetch('/api/v1/analytics/alerts?status=active');
  const result = await response.json();
  
  result.data.alerts.forEach(alert => {
    if (alert.severity === 'critical') {
      // Trigger emergency response
      notifySecurity(alert);
    }
  });
};
```

### cURL Examples
```bash
# Get daily statistics
curl -X GET "https://api.school.edu/api/v1/analytics/daily/2023-12-01" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Generate monthly report
curl -X POST https://api.school.edu/api/v1/reports/generate \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "reportType": "monthly_compliance",
    "dateRange": {
      "startDate": "2023-11-01",
      "endDate": "2023-11-30"
    },
    "format": "pdf"
  }'

# Update alert thresholds
curl -X PUT https://api.school.edu/api/v1/analytics/thresholds \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "longVisitThresholdHours": 6
  }'
```
