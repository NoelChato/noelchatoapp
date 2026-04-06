# API Documentation: Visitor Registration

## Overview

The Visitor Registration API provides endpoints for managing visitor check-in/check-out processes, pre-registration, and visitor tracking. All endpoints require authentication with appropriate role permissions.

**Base URL:** `/api/v1/visitors`  
**Authentication:** JWT Bearer token required  
**Content-Type:** `application/json`

---

## Endpoints

### POST /api/v1/visitors/register

Register a new visitor and perform check-in.

**Authorization:** `security_guard`, `administrator`  
**Rate Limit:** 60 requests per minute

#### Request Body
```json
{
  "firstName": "John",
  "middleName": "Michael",
  "lastName": "Smith",
  "phoneNumber": "+1234567890",
  "email": "john.smith@email.com",
  "visitPurpose": "parent_pickup",
  "personToVisit": "Mrs. Johnson - Room 204",
  "vehicleInfo": {
    "licensePlate": "ABC-123",
    "make": "Toyota",
    "model": "Camry",
    "color": "Blue"
  },
  "emergencyContact": {
    "name": "Jane Smith",
    "phoneNumber": "+1234567891",
    "relationship": "Wife"
  },
  "idType": "drivers_license",
  "idNumber": "D123456789",
  "photoData": "base64-encoded-image-data",
  "notes": "Picking up children after school"
}
```

#### Response (201 Created)
```json
{
  "success": true,
  "data": {
    "visitId": "vis_1234567890abcdef",
    "visitorId": "vst_0987654321fedcba",
    "badgeNumber": "V20231201001",
    "checkInTime": "2023-12-01T14:30:00Z",
    "status": "checked_in",
    "badge": {
      "qrCode": "https://api.school.edu/badges/vis_1234567890abcdef.png",
      "printUrl": "https://api.school.edu/badges/vis_1234567890abcdef/print"
    }
  },
  "message": "Visitor checked in successfully"
}
```

#### Error Responses

**400 Bad Request - Validation Error**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid visitor data",
    "details": {
      "phoneNumber": "Invalid phone number format",
      "email": "Invalid email address"
    }
  }
}
```

**409 Conflict - Duplicate Registration**
```json
{
  "success": false,
  "error": {
    "code": "DUPLICATE_VISITOR",
    "message": "Visitor already checked in today",
    "details": {
      "existingVisitId": "vis_1234567890abcdef",
      "checkInTime": "2023-12-01T08:15:00Z"
    }
  }
}
```

---

### POST /api/v1/visitors/check-out

Check out a visitor from the premises.

**Authorization:** `security_guard`, `administrator`  
**Rate Limit:** 120 requests per minute

#### Request Body
```json
{
  "visitId": "vis_1234567890abcdef",
  "notes": "Left at 3:45 PM"
}
```

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "visitId": "vis_1234567890abcdef",
    "checkOutTime": "2023-12-01T15:45:00Z",
    "duration": "01:15:00",
    "status": "checked_out"
  },
  "message": "Visitor checked out successfully"
}
```

#### Error Responses

**404 Not Found**
```json
{
  "success": false,
  "error": {
    "code": "VISIT_NOT_FOUND",
    "message": "Visit record not found"
  }
}
```

**400 Bad Request - Already Checked Out**
```json
{
  "success": false,
  "error": {
    "code": "ALREADY_CHECKED_OUT",
    "message": "Visitor already checked out",
    "details": {
      "checkOutTime": "2023-12-01T15:30:00Z"
    }
  }
}
```

---

### GET /api/v1/visitors/current

Get list of currently checked-in visitors.

**Authorization:** `security_guard`, `administrator`  
**Rate Limit:** 30 requests per minute

#### Query Parameters
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 50, max: 100)
- `sortBy` (optional): Sort field (default: checkInTime)
- `sortOrder` (optional): Sort order (asc/desc, default: desc)

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "visitors": [
      {
        "visitId": "vis_1234567890abcdef",
        "visitor": {
          "firstName": "John",
          "lastName": "Smith",
          "phoneNumber": "+1234567890",
          "visitPurpose": "parent_pickup",
          "photoUrl": "https://api.school.edu/photos/vst_0987654321fedcba.jpg"
        },
        "checkInTime": "2023-12-01T14:30:00Z",
        "badgeNumber": "V20231201001",
        "checkedInBy": "guard_jane_doe"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 23,
      "totalPages": 1
    },
    "summary": {
      "totalCheckedIn": 23,
      "longVisits": 2
    }
  }
}
```

---

### GET /api/v1/visitors/search

Search and filter visitor records.

**Authorization:** `security_guard`, `administrator`  
**Rate Limit:** 60 requests per minute

#### Query Parameters
- `query` (optional): Search term (name, phone, email)
- `status` (optional): Visit status (checked_in, checked_out, expected)
- `purpose` (optional): Visit purpose
- `dateFrom` (optional): Start date (ISO 8601)
- `dateTo` (optional): End date (ISO 8601)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 100)

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
          "lastName": "Smith",
          "phoneNumber": "+1234567890",
          "email": "john.smith@email.com"
        },
        "checkInTime": "2023-12-01T14:30:00Z",
        "checkOutTime": "2023-12-01T15:45:00Z",
        "status": "checked_out",
        "duration": "01:15:00",
        "visitPurpose": "parent_pickup"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 156,
      "totalPages": 8
    }
  }
}
```

---

### GET /api/v1/visitors/{visitId}

Get detailed information about a specific visit.

**Authorization:** `security_guard`, `administrator`  
**Rate Limit:** 120 requests per minute

#### Path Parameters
- `visitId`: Visit ID (e.g., vis_1234567890abcdef)

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "visitId": "vis_1234567890abcdef",
    "visitor": {
      "visitorId": "vst_0987654321fedcba",
      "firstName": "John",
      "middleName": "Michael",
      "lastName": "Smith",
      "phoneNumber": "+1234567890",
      "email": "john.smith@email.com",
      "visitPurpose": "parent_pickup",
      "personToVisit": "Mrs. Johnson - Room 204",
      "vehicleInfo": {
        "licensePlate": "ABC-123",
        "make": "Toyota",
        "model": "Camry",
        "color": "Blue"
      },
      "emergencyContact": {
        "name": "Jane Smith",
        "phoneNumber": "+1234567891",
        "relationship": "Wife"
      },
      "photoUrl": "https://api.school.edu/photos/vst_0987654321fedcba.jpg"
    },
    "checkInTime": "2023-12-01T14:30:00Z",
    "checkOutTime": "2023-12-01T15:45:00Z",
    "checkedInBy": "guard_jane_doe",
    "checkedOutBy": "guard_john_smith",
    "badgeNumber": "V20231201001",
    "status": "checked_out",
    "duration": "01:15:00",
    "notes": "Picked up children after school",
    "createdAt": "2023-12-01T14:30:00Z",
    "updatedAt": "2023-12-01T15:45:00Z"
  }
}
```

---

### POST /api/v1/visitors/pre-register

Pre-register expected visitors.

**Authorization:** `administrator`  
**Rate Limit:** 30 requests per minute

#### Request Body
```json
{
  "visitors": [
    {
      "firstName": "Sarah",
      "lastName": "Johnson",
      "phoneNumber": "+1234567892",
      "email": "sarah.johnson@email.com",
      "visitPurpose": "meeting",
      "personToVisit": "Principal Williams",
      "expectedDate": "2023-12-05",
      "expectedTime": "10:00",
      "notes": "Parent-teacher conference"
    }
  ],
  "sendNotifications": true,
  "expiresInHours": 24
}
```

#### Response (201 Created)
```json
{
  "success": true,
  "data": {
    "preRegistrations": [
      {
        "id": "pre_1234567890abcdef",
        "visitorId": "vst_0987654321fedcba",
        "expectedDate": "2023-12-05T10:00:00Z",
        "expiresAt": "2023-12-06T10:00:00Z",
        "status": "pending"
      }
    ],
    "notificationsSent": 1
  },
  "message": "Visitors pre-registered successfully"
}
```

---

### GET /api/v1/visitors/pre-registered

Get list of pre-registered visitors.

**Authorization:** `security_guard`, `administrator`  
**Rate Limit:** 30 requests per minute

#### Query Parameters
- `date` (optional): Date to check (default: today)
- `status` (optional): Status filter (pending, arrived, expired)

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "preRegistrations": [
      {
        "id": "pre_1234567890abcdef",
        "visitor": {
          "firstName": "Sarah",
          "lastName": "Johnson",
          "phoneNumber": "+1234567892",
          "visitPurpose": "meeting"
        },
        "expectedDate": "2023-12-05T10:00:00Z",
        "expiresAt": "2023-12-06T10:00:00Z",
        "status": "pending",
        "createdBy": "admin_mary_jones"
      }
    ]
  }
}
```

---

### PUT /api/v1/visitors/{visitId}

Update visitor information (limited fields).

**Authorization:** `administrator`  
**Rate Limit:** 30 requests per minute

#### Path Parameters
- `visitId`: Visit ID

#### Request Body
```json
{
  "notes": "Updated visit notes",
  "personToVisit": "Updated teacher name"
}
```

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "visitId": "vis_1234567890abcdef",
    "updatedFields": ["notes", "personToVisit"],
    "updatedAt": "2023-12-01T16:00:00Z"
  },
  "message": "Visit updated successfully"
}
```

---

### POST /api/v1/visitors/emergency-list

Generate emergency evacuation list.

**Authorization:** `security_guard`, `administrator`  
**Rate Limit:** 10 requests per minute

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "generatedAt": "2023-12-01T15:00:00Z",
    "totalVisitors": 23,
    "visitors": [
      {
        "name": "John Smith",
        "location": "Main Entrance",
        "checkInTime": "2023-12-01T14:30:00Z",
        "emergencyContact": {
          "name": "Jane Smith",
          "phoneNumber": "+1234567891"
        }
      }
    ],
    "exportUrl": "https://api.school.edu/emergency/visits_20231201_150000.pdf"
  }
}
```

---

## Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Request data validation failed |
| `UNAUTHORIZED` | 401 | Authentication required or invalid token |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Resource conflict (duplicate, already checked out) |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |

---

## Rate Limiting

- **Authentication required** for all endpoints
- **Sliding window** rate limiting (1 minute windows)
- **Headers included** in responses:
  - `X-RateLimit-Limit`: Maximum requests per window
  - `X-RateLimit-Remaining`: Remaining requests in current window
  - `X-RateLimit-Reset`: Time when limit resets (Unix timestamp)

---

## Data Formats

### Phone Numbers
- **Format**: E.164 international format
- **Example**: `+1234567890`
- **Validation**: Required country code, valid number format

### Dates and Times
- **Format**: ISO 8601
- **Example**: `2023-12-01T14:30:00Z`
- **Timezone**: UTC for all timestamps

### Photo Upload
- **Format**: Base64 encoded JPEG/PNG
- **Max Size**: 5MB
- **Resolution**: Minimum 640x480, recommended 1024x768
- **Storage**: Secure cloud storage with access controls

---

## Security Headers

All responses include security headers:
```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
Content-Security-Policy: default-src 'self'
```

---

## Webhooks (Future Enhancement)

The system supports webhooks for real-time notifications:
- **Visitor Check-in**: Notify security systems
- **Long Visit Alerts**: Alert administrators
- **Emergency Events**: Trigger emergency protocols

---

## SDK Examples

### JavaScript (Frontend)
```javascript
// Check in a visitor
const checkInVisitor = async (visitorData) => {
  const response = await fetch('/api/v1/visitors/register', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(visitorData)
  });
  
  const result = await response.json();
  return result;
};

// Search visitors
const searchVisitors = async (query) => {
  const response = await fetch(`/api/v1/visitors/search?query=${encodeURIComponent(query)}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const result = await response.json();
  return result;
};
```

### cURL Examples
```bash
# Register visitor
curl -X POST https://api.school.edu/api/v1/visitors/register \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Smith",
    "phoneNumber": "+1234567890",
    "visitPurpose": "parent_pickup"
  }'

# Get current visitors
curl -X GET https://api.school.edu/api/v1/visitors/current \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```
