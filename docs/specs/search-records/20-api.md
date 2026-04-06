# API Documentation: Search Records

## Overview

The Search Records API provides comprehensive search and retrieval capabilities for visitor records. All endpoints require authentication and follow RESTful conventions with JSON request/response formats.

## Authentication

All search endpoints require a valid JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

Role-based permissions apply:
- `security_guard`: Basic search access
- `administrator`: Full search access + bulk operations
- `system_admin`: All operations including analytics

## Endpoints

### POST /api/search/visitors

Perform a comprehensive search across visitor records.

**Request Body:**
```json
{
  "query": "John Doe",
  "filters": {
    "dateFrom": "2024-01-01",
    "dateTo": "2024-12-31",
    "purpose": ["meeting", "delivery"],
    "status": "checked_in",
    "host": "john.smith@school.edu"
  },
  "sort": {
    "field": "checkInTime",
    "order": "desc"
  },
  "pagination": {
    "page": 1,
    "limit": 50
  },
  "include": ["photo", "notes", "history"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "id": "visitor_12345",
        "firstName": "John",
        "lastName": "Doe",
        "idNumber": "ID123456",
        "phone": "+1234567890",
        "email": "john.doe@email.com",
        "photo": "https://storage.school.edu/photos/visitor_12345.jpg",
        "checkInTime": "2024-01-15T08:30:00Z",
        "checkOutTime": null,
        "purpose": "Parent meeting",
        "host": {
          "name": "Mrs. Johnson",
          "department": "Elementary",
          "email": "m.johnson@school.edu"
        },
        "notes": "Meeting about student progress",
        "status": "checked_in",
        "duration": null
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 50,
    "totalPages": 1
  },
  "metadata": {
    "searchTime": 150,
    "query": "John Doe",
    "filters": {
      "dateRange": "2024-01-01 to 2024-12-31",
      "purposes": ["meeting", "delivery"]
    }
  }
}
```

**Error Responses:**
- `400 Bad Request`: Invalid search parameters
- `401 Unauthorized`: Missing or invalid authentication
- `403 Forbidden`: Insufficient permissions
- `500 Internal Server Error`: Search service unavailable

### GET /api/search/suggestions

Get search suggestions based on partial input.

**Query Parameters:**
- `q`: Partial search term (required)
- `limit`: Maximum suggestions to return (default: 10, max: 50)

**Example Request:**
```
GET /api/search/suggestions?q=john&limit=5
```

**Response:**
```json
{
  "success": true,
  "data": {
    "suggestions": [
      {
        "text": "John Doe",
        "type": "visitor_name",
        "count": 15
      },
      {
        "text": "John Smith",
        "type": "visitor_name",
        "count": 8
      },
      {
        "text": "john.doe@email.com",
        "type": "email",
        "count": 1
      }
    ]
  }
}
```

### GET /api/search/history

Retrieve user's search history.

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Results per page (default: 20, max: 100)

**Response:**
```json
{
  "success": true,
  "data": {
    "history": [
      {
        "id": "search_67890",
        "query": "John Doe",
        "filters": {
          "dateFrom": "2024-01-01",
          "purpose": ["meeting"]
        },
        "resultCount": 3,
        "timestamp": "2024-01-15T10:30:00Z",
        "executionTime": 120
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 20
  }
}
```

### POST /api/search/saved

Save a search query for future use.

**Request Body:**
```json
{
  "name": "Weekly Parent Meetings",
  "query": "parent meeting",
  "filters": {
    "purpose": ["meeting"],
    "visitorType": "parent",
    "dateFrom": "2024-01-08"
  },
  "description": "Search for all parent-teacher meetings this week"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "saved_search_123",
    "name": "Weekly Parent Meetings",
    "query": "parent meeting",
    "filters": { ... },
    "createdAt": "2024-01-15T11:00:00Z",
    "updatedAt": "2024-01-15T11:00:00Z"
  }
}
```

### GET /api/search/saved

Retrieve saved searches for the current user.

**Response:**
```json
{
  "success": true,
  "data": {
    "searches": [
      {
        "id": "saved_search_123",
        "name": "Weekly Parent Meetings",
        "query": "parent meeting",
        "filters": { ... },
        "description": "Search for all parent-teacher meetings this week",
        "usageCount": 5,
        "lastUsed": "2024-01-15T10:30:00Z",
        "createdAt": "2024-01-10T09:00:00Z"
      }
    ]
  }
}
```

### DELETE /api/search/saved/{id}

Delete a saved search.

**Response:**
```json
{
  "success": true,
  "message": "Saved search deleted successfully"
}
```

### POST /api/search/export

Export search results in various formats.

**Request Body:**
```json
{
  "query": "John Doe",
  "filters": {
    "dateFrom": "2024-01-01",
    "dateTo": "2024-12-31"
  },
  "format": "pdf",
  "include": ["photo", "notes", "signature"],
  "email": "admin@school.edu"
}
```

**Supported Formats:**
- `pdf`: PDF report with school branding
- `excel`: Excel spreadsheet (.xlsx)
- `csv`: Comma-separated values
- `json`: JSON data format

**Response:**
```json
{
  "success": true,
  "data": {
    "exportId": "export_45678",
    "status": "processing",
    "format": "pdf",
    "estimatedCompletion": "2024-01-15T11:05:00Z",
    "downloadUrl": null
  }
}
```

### GET /api/search/export/{id}/status

Check export status and get download URL when complete.

**Response (Processing):**
```json
{
  "success": true,
  "data": {
    "exportId": "export_45678",
    "status": "processing",
    "progress": 75,
    "estimatedCompletion": "2024-01-15T11:02:00Z"
  }
}
```

**Response (Complete):**
```json
{
  "success": true,
  "data": {
    "exportId": "export_45678",
    "status": "completed",
    "downloadUrl": "https://storage.school.edu/exports/export_45678.pdf",
    "expiresAt": "2024-01-16T11:00:00Z",
    "fileSize": 2457600
  }
}
```

### POST /api/search/bulk/checkout

Perform bulk check-out operations on search results.

**Request Body:**
```json
{
  "searchCriteria": {
    "query": "meeting",
    "filters": {
      "dateFrom": "2024-01-15",
      "status": "checked_in"
    }
  },
  "reason": "End of school day bulk checkout",
  "notes": "Automated checkout for remaining visitors"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "processed": 12,
    "successful": 12,
    "failed": 0,
    "results": [
      {
        "visitorId": "visitor_12345",
        "status": "success",
        "checkOutTime": "2024-01-15T17:00:00Z"
      }
    ]
  }
}
```

### GET /api/search/analytics

Get search usage analytics (admin only).

**Query Parameters:**
- `period`: Time period (day, week, month, year)
- `startDate`: Start date for custom period
- `endDate`: End date for custom period

**Response:**
```json
{
  "success": true,
  "data": {
    "period": "week",
    "totalSearches": 1250,
    "uniqueUsers": 15,
    "averageResponseTime": 180,
    "popularQueries": [
      {
        "query": "parent meeting",
        "count": 45
      },
      {
        "query": "delivery",
        "count": 32
      }
    ],
    "performance": {
      "fastSearches": 1100,
      "slowSearches": 25,
      "failedSearches": 2
    }
  }
}
```

## Rate Limiting

- Standard users: 100 searches per hour
- Administrators: 500 searches per hour
- System admins: Unlimited

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## Error Handling

All endpoints return standardized error responses:

```json
{
  "success": false,
  "error": {
    "code": "SEARCH_INVALID_QUERY",
    "message": "Search query contains invalid characters",
    "details": {
      "field": "query",
      "value": "john@doe.com"
    }
  }
}
```

## WebSocket Events

Real-time updates for long-running searches:

```javascript
// Connect to WebSocket
const ws = new WebSocket('ws://api.school.edu/search');

// Listen for search progress
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.type === 'search_progress') {
    console.log(`Search ${data.searchId}: ${data.progress}% complete`);
  }
};
```

## Data Formats

### Search Filters

```typescript
interface SearchFilters {
  dateFrom?: string; // ISO date string
  dateTo?: string;   // ISO date string
  timeFrom?: string; // HH:MM format
  timeTo?: string;   // HH:MM format
  purpose?: string[]; // Array of purposes
  visitorType?: string[]; // Array of visitor types
  host?: string; // Host name or email
  status?: 'checked_in' | 'checked_out' | 'overdue';
  department?: string[];
  securityGuard?: string;
}
```

### Sort Options

```typescript
interface SortOptions {
  field: 'checkInTime' | 'checkOutTime' | 'lastName' | 'duration' | 'purpose';
  order: 'asc' | 'desc';
}
```

### Pagination

```typescript
interface PaginationOptions {
  page: number; // 1-based page number
  limit: number; // Results per page (max 100)
}
```

## Best Practices

1. **Use specific filters** to reduce result sets and improve performance
2. **Implement client-side caching** for frequently accessed search results
3. **Use pagination** for large result sets to maintain UI responsiveness
4. **Save commonly used searches** to improve user efficiency
5. **Monitor search analytics** to optimize system performance
6. **Handle rate limits gracefully** with exponential backoff
7. **Validate search input** on the client side before API calls
