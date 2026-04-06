# API Documentation: Reporting

## Overview

The Reporting API provides comprehensive analytics and report generation capabilities. All endpoints require authentication and follow RESTful conventions with JSON request/response formats.

## Authentication

All reporting endpoints require a valid JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

Role-based permissions apply:
- `administrator`: Full reporting access
- `system_admin`: All operations including system analytics
- `security_guard`: Limited access to operational reports

## Endpoints

### GET /api/reports/templates

Retrieve available report templates.

**Query Parameters:**
- `category`: Filter by category (standard, compliance, operational)
- `page`: Page number (default: 1)
- `limit`: Results per page (default: 20)

**Response:**
```json
{
  "success": true,
  "data": {
    "templates": [
      {
        "id": "daily-summary",
        "name": "Daily Visitor Summary",
        "description": "Summary of daily visitor activity",
        "category": "operational",
        "parameters": {
          "date": "date"
        },
        "outputFormats": ["pdf", "excel", "csv"],
        "estimatedGenerationTime": 30
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 20
  }
}
```

### POST /api/reports/generate

Generate a report using a template or custom configuration.

**Request Body:**
```json
{
  "templateId": "daily-summary",
  "parameters": {
    "date": "2024-01-15",
    "includeCharts": true,
    "format": "pdf"
  },
  "customConfig": {
    "title": "Custom Report",
    "fields": ["visitorName", "checkInTime", "purpose"],
    "filters": {
      "dateRange": {
        "from": "2024-01-01",
        "to": "2024-01-31"
      },
      "purpose": ["meeting", "delivery"]
    },
    "groupBy": ["purpose"],
    "aggregations": {
      "visitorCount": "count",
      "avgDuration": "average"
    }
  },
  "output": {
    "format": "pdf",
    "email": "admin@school.edu",
    "saveToArchive": true
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "reportId": "report_12345",
    "status": "processing",
    "estimatedCompletion": "2024-01-15T10:05:00Z",
    "progress": {
      "stage": "data_aggregation",
      "percentage": 25
    }
  }
}
```

### GET /api/reports/{id}/status

Check the status of a report generation.

**Response (Processing):**
```json
{
  "success": true,
  "data": {
    "reportId": "report_12345",
    "status": "processing",
    "progress": {
      "stage": "chart_generation",
      "percentage": 75
    },
    "estimatedCompletion": "2024-01-15T10:02:00Z"
  }
}
```

**Response (Complete):**
```json
{
  "success": true,
  "data": {
    "reportId": "report_12345",
    "status": "completed",
    "downloadUrl": "https://storage.school.edu/reports/report_12345.pdf",
    "expiresAt": "2024-01-16T10:00:00Z",
    "fileSize": 2457600,
    "generatedAt": "2024-01-15T10:00:00Z",
    "metadata": {
      "recordCount": 150,
      "dateRange": "2024-01-01 to 2024-01-15",
      "generationTime": 45
    }
  }
}
```

### GET /api/reports/archive

Retrieve archived reports.

**Query Parameters:**
- `templateId`: Filter by template
- `dateFrom`: Start date filter
- `dateTo`: End date filter
- `status`: Filter by status (completed, failed)
- `page`: Page number
- `limit`: Results per page

**Response:**
```json
{
  "success": true,
  "data": {
    "reports": [
      {
        "id": "report_12345",
        "templateId": "daily-summary",
        "templateName": "Daily Visitor Summary",
        "parameters": { ... },
        "status": "completed",
        "generatedAt": "2024-01-15T10:00:00Z",
        "fileSize": 2457600,
        "downloadUrl": "https://storage.school.edu/reports/report_12345.pdf",
        "expiresAt": "2024-01-16T10:00:00Z"
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 20
  }
}
```

### POST /api/reports/schedules

Create a report schedule for automated generation.

**Request Body:**
```json
{
  "templateId": "weekly-summary",
  "name": "Weekly Management Report",
  "schedule": {
    "frequency": "weekly",
    "dayOfWeek": "monday",
    "time": "09:00",
    "timezone": "America/New_York"
  },
  "parameters": {
    "includeCharts": true,
    "format": "pdf"
  },
  "distribution": {
    "emails": ["admin@school.edu", "manager@school.edu"],
    "subject": "Weekly Visitor Report",
    "message": "Please find attached the weekly visitor summary report."
  },
  "retention": {
    "days": 90
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "scheduleId": "schedule_67890",
    "name": "Weekly Management Report",
    "nextRun": "2024-01-22T09:00:00Z",
    "status": "active"
  }
}
```

### GET /api/reports/schedules

Retrieve report schedules.

**Response:**
```json
{
  "success": true,
  "data": {
    "schedules": [
      {
        "id": "schedule_67890",
        "name": "Weekly Management Report",
        "templateId": "weekly-summary",
        "schedule": { ... },
        "distribution": { ... },
        "status": "active",
        "lastRun": "2024-01-15T09:00:00Z",
        "nextRun": "2024-01-22T09:00:00Z",
        "successCount": 12,
        "failureCount": 0
      }
    ]
  }
}
```

### DELETE /api/reports/schedules/{id}

Delete a report schedule.

**Response:**
```json
{
  "success": true,
  "message": "Report schedule deleted successfully"
}
```

### GET /api/reports/dashboard

Retrieve dashboard data for real-time metrics.

**Query Parameters:**
- `period`: Time period (hour, day, week, month)
- `metrics`: Comma-separated list of metrics to include

**Response:**
```json
{
  "success": true,
  "data": {
    "timestamp": "2024-01-15T10:30:00Z",
    "metrics": {
      "currentVisitors": 12,
      "todayCheckIns": 45,
      "todayCheckOuts": 38,
      "avgVisitDuration": 45,
      "peakHourOccupancy": 28,
      "weeklyTrend": [
        { "date": "2024-01-09", "visitors": 120 },
        { "date": "2024-01-10", "visitors": 135 },
        { "date": "2024-01-11", "visitors": 98 }
      ]
    },
    "alerts": [
      {
        "type": "high_occupancy",
        "message": "Current occupancy at 85% capacity",
        "severity": "warning"
      }
    ]
  }
}
```

### POST /api/reports/custom

Create a custom report configuration.

**Request Body:**
```json
{
  "name": "Custom Occupancy Analysis",
  "description": "Analysis of visitor occupancy patterns",
  "config": {
    "dataSource": "visitors",
    "fields": [
      {
        "name": "checkInTime",
        "type": "datetime",
        "aggregation": "count"
      },
      {
        "name": "purpose",
        "type": "string",
        "groupBy": true
      }
    ],
    "filters": [
      {
        "field": "checkInTime",
        "operator": "between",
        "value": ["2024-01-01", "2024-01-31"]
      }
    ],
    "sort": [
      {
        "field": "checkInTime",
        "order": "desc"
      }
    ]
  },
  "visualization": {
    "type": "line_chart",
    "xAxis": "checkInTime",
    "yAxis": "count",
    "groupBy": "purpose"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "reportId": "custom_12345",
    "name": "Custom Occupancy Analysis",
    "config": { ... },
    "createdAt": "2024-01-15T10:30:00Z",
    "previewUrl": "/api/reports/custom/12345/preview"
  }
}
```

### GET /api/reports/analytics

Get reporting system analytics (admin only).

**Query Parameters:**
- `period`: Analysis period (day, week, month)
- `metrics`: Specific metrics to include

**Response:**
```json
{
  "success": true,
  "data": {
    "period": "week",
    "metrics": {
      "totalReportsGenerated": 145,
      "averageGenerationTime": 42,
      "mostPopularTemplates": [
        { "templateId": "daily-summary", "count": 35 },
        { "templateId": "weekly-activity", "count": 28 }
      ],
      "failureRate": 0.02,
      "peakUsageHours": [9, 10, 14, 15],
      "storageUsed": 1073741824
    },
    "performance": {
      "p95GenerationTime": 120,
      "errorRate": 0.015,
      "userSatisfaction": 4.6
    }
  }
}
```

## Rate Limiting

- Standard users: 50 report generations per hour
- Administrators: 200 report generations per hour
- System admins: Unlimited

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 50
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1640995200
```

## Error Handling

All endpoints return standardized error responses:

```json
{
  "success": false,
  "error": {
    "code": "REPORT_GENERATION_FAILED",
    "message": "Report generation failed due to data processing error",
    "details": {
      "stage": "data_aggregation",
      "error": "Query timeout exceeded"
    }
  }
}
```

## WebSocket Events

Real-time updates for long-running reports:

```javascript
// Connect to WebSocket
const ws = new WebSocket('ws://api.school.edu/reports');

// Listen for report progress
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.type === 'report_progress') {
    console.log(`Report ${data.reportId}: ${data.progress}% complete`);
  }
};

// Listen for dashboard updates
if (data.type === 'dashboard_update') {
  updateDashboard(data.metrics);
}
```

## Data Formats

### Report Parameters

```typescript
interface ReportParameters {
  date?: string;
  dateFrom?: string;
  dateTo?: string;
  department?: string[];
  purpose?: string[];
  includeCharts?: boolean;
  format?: 'pdf' | 'excel' | 'csv' | 'json';
}
```

### Schedule Configuration

```typescript
interface ScheduleConfig {
  frequency: 'daily' | 'weekly' | 'monthly';
  dayOfWeek?: number; // 0-6, Sunday = 0
  dayOfMonth?: number; // 1-31
  time: string; // HH:MM format
  timezone: string;
}
```

### Custom Report Configuration

```typescript
interface CustomReportConfig {
  name: string;
  dataSource: string;
  fields: ReportField[];
  filters: ReportFilter[];
  groupBy?: string[];
  aggregations?: Record<string, string>;
  sort?: SortConfig[];
}
```

## Best Practices

1. **Use appropriate templates** for common reporting needs to ensure consistency
2. **Schedule reports during off-peak hours** to avoid system load
3. **Test custom reports** with small data sets before full generation
4. **Archive important reports** for long-term retention
5. **Monitor report analytics** to optimize system performance
6. **Use filters effectively** to reduce report generation time
7. **Validate report data** against known benchmarks
8. **Plan report schedules** to avoid conflicts and system overload
