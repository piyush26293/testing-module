# Reports API

The Reports API generates, manages, and exports test execution reports and analytics.

## Base URL
```
/api/v1/reports
```

## Authentication
All endpoints require authentication with a valid JWT token.

## Rate Limiting
- 100 requests per 15 minutes per user
- Report generation: 10 requests per 15 minutes
- Export operations: 20 requests per 15 minutes

---

## Endpoints

### GET /reports
Retrieve a paginated list of reports.

#### Headers
```
Authorization: Bearer <access_token>
```

#### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| page | integer | No | 1 | Page number |
| limit | integer | No | 20 | Items per page (max: 100) |
| projectId | string | No | - | Filter by project ID |
| type | string | No | - | Filter by type (execution, suite, project, custom) |
| startDate | string | No | - | Filter by start date (ISO 8601) |
| endDate | string | No | - | Filter by end date (ISO 8601) |
| sortBy | string | No | createdAt | Sort field (createdAt, name) |
| sortOrder | string | No | desc | Sort order (asc, desc) |

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "reports": [
      {
        "id": "rpt_123456789",
        "name": "Weekly Smoke Test Report",
        "type": "suite",
        "projectId": "prj_123456789",
        "projectName": "E-commerce Testing",
        "dateRange": {
          "start": "2024-01-15T00:00:00Z",
          "end": "2024-01-22T23:59:59Z"
        },
        "summary": {
          "totalExecutions": 42,
          "totalTests": 630,
          "passed": 598,
          "failed": 28,
          "skipped": 4,
          "passRate": 95.5
        },
        "createdBy": {
          "id": "usr_123456789",
          "firstName": "John",
          "lastName": "Doe"
        },
        "createdAt": "2024-01-23T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 58,
      "totalPages": 3
    }
  }
}
```

#### Code Examples

**cURL**
```bash
curl -X GET "https://api.example.com/api/v1/reports?projectId=prj_123456789&type=suite" \
  -H "Authorization: Bearer <access_token>"
```

**JavaScript/TypeScript**
```typescript
const response = await fetch(
  'https://api.example.com/api/v1/reports?projectId=prj_123456789&type=suite',
  {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  }
);

const data = await response.json();
```

**Python**
```python
import requests

response = requests.get(
    'https://api.example.com/api/v1/reports',
    params={
        'projectId': 'prj_123456789',
        'type': 'suite'
    },
    headers={'Authorization': f'Bearer {access_token}'}
)

data = response.json()
```

---

### GET /reports/:id
Retrieve a specific report by ID with detailed data.

#### Headers
```
Authorization: Bearer <access_token>
```

#### URL Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Report ID |

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "id": "rpt_123456789",
    "name": "Weekly Smoke Test Report",
    "description": "Comprehensive smoke test results for the week",
    "type": "suite",
    "projectId": "prj_123456789",
    "projectName": "E-commerce Testing",
    "dateRange": {
      "start": "2024-01-15T00:00:00Z",
      "end": "2024-01-22T23:59:59Z"
    },
    "filters": {
      "testSuiteIds": ["ts_123456789"],
      "environment": "staging",
      "tags": ["smoke", "critical"]
    },
    "summary": {
      "totalExecutions": 42,
      "totalTests": 630,
      "passed": 598,
      "failed": 28,
      "skipped": 4,
      "passRate": 95.5,
      "avgDuration": 1650,
      "totalDuration": 69300
    },
    "executionDetails": [
      {
        "executionId": "exec_123456789",
        "testSuiteName": "Smoke Test Suite",
        "startedAt": "2024-01-15T02:00:00Z",
        "duration": 1710,
        "status": "completed",
        "results": {
          "total": 15,
          "passed": 14,
          "failed": 1,
          "skipped": 0,
          "passRate": 93.3
        }
      }
    ],
    "failureAnalysis": {
      "topFailedTests": [
        {
          "testCaseId": "tc_987654321",
          "testCaseTitle": "Password reset flow",
          "failureCount": 5,
          "failureRate": 11.9,
          "lastFailure": "2024-01-22T16:05:00Z"
        }
      ],
      "errorCategories": {
        "elementNotFound": 15,
        "timeout": 8,
        "assertionFailed": 3,
        "networkError": 2
      }
    },
    "trends": {
      "passRateHistory": [
        {"date": "2024-01-15", "passRate": 93.3},
        {"date": "2024-01-16", "passRate": 95.2},
        {"date": "2024-01-17", "passRate": 96.7}
      ],
      "durationHistory": [
        {"date": "2024-01-15", "avgDuration": 1710},
        {"date": "2024-01-16", "avgDuration": 1650},
        {"date": "2024-01-17", "avgDuration": 1620}
      ]
    },
    "createdBy": {
      "id": "usr_123456789",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com"
    },
    "createdAt": "2024-01-23T10:00:00Z",
    "updatedAt": "2024-01-23T10:00:00Z"
  }
}
```

#### Error Responses

**404 Not Found**
```json
{
  "success": false,
  "error": {
    "code": "REPORT_NOT_FOUND",
    "message": "Report not found"
  }
}
```

---

### POST /reports/generate
Generate a new report.

#### Headers
```
Authorization: Bearer <access_token>
```

#### Request Body
```json
{
  "name": "Monthly Regression Report",
  "description": "Comprehensive regression test results for January",
  "type": "custom",
  "projectId": "prj_123456789",
  "dateRange": {
    "start": "2024-01-01T00:00:00Z",
    "end": "2024-01-31T23:59:59Z"
  },
  "filters": {
    "testSuiteIds": ["ts_123456789", "ts_987654321"],
    "executionIds": [],
    "environments": ["staging", "production"],
    "tags": ["regression"],
    "status": ["completed"]
  },
  "includeCharts": true,
  "includeFailureAnalysis": true,
  "includeTrends": true,
  "includeScreenshots": false
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | Yes | Report name |
| description | string | No | Report description |
| type | string | Yes | Report type (execution, suite, project, custom) |
| projectId | string | Yes | Project ID |
| dateRange | object | Yes | Date range for report data |
| filters | object | No | Filters for report data |
| includeCharts | boolean | No | Include visual charts (default: true) |
| includeFailureAnalysis | boolean | No | Include failure analysis (default: true) |
| includeTrends | boolean | No | Include trend analysis (default: true) |
| includeScreenshots | boolean | No | Include test screenshots (default: false) |

#### Response (201 Created)
```json
{
  "success": true,
  "data": {
    "id": "rpt_987654321",
    "name": "Monthly Regression Report",
    "description": "Comprehensive regression test results for January",
    "type": "custom",
    "projectId": "prj_123456789",
    "status": "generating",
    "progress": 0,
    "createdBy": {
      "id": "usr_123456789",
      "firstName": "John",
      "lastName": "Doe"
    },
    "createdAt": "2024-01-23T16:00:00Z"
  }
}
```

#### Error Responses

**400 Bad Request**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "dateRange.end",
        "message": "End date must be after start date"
      }
    ]
  }
}
```

**429 Too Many Requests**
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many report generation requests. Maximum 10 per 15 minutes.",
    "retryAfter": 300
  }
}
```

#### Code Examples

**cURL**
```bash
curl -X POST https://api.example.com/api/v1/reports/generate \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Monthly Regression Report",
    "type": "custom",
    "projectId": "prj_123456789",
    "dateRange": {
      "start": "2024-01-01T00:00:00Z",
      "end": "2024-01-31T23:59:59Z"
    }
  }'
```

**JavaScript/TypeScript**
```typescript
const response = await fetch('https://api.example.com/api/v1/reports/generate', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: 'Monthly Regression Report',
    type: 'custom',
    projectId: 'prj_123456789',
    dateRange: {
      start: '2024-01-01T00:00:00Z',
      end: '2024-01-31T23:59:59Z',
    },
  }),
});

const data = await response.json();
```

**Python**
```python
import requests

response = requests.post(
    'https://api.example.com/api/v1/reports/generate',
    json={
        'name': 'Monthly Regression Report',
        'type': 'custom',
        'projectId': 'prj_123456789',
        'dateRange': {
            'start': '2024-01-01T00:00:00Z',
            'end': '2024-01-31T23:59:59Z'
        }
    },
    headers={'Authorization': f'Bearer {access_token}'}
)

data = response.json()
```

---

### GET /reports/:id/export
Export a report in various formats.

#### Headers
```
Authorization: Bearer <access_token>
```

#### URL Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Report ID |

#### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| format | string | Yes | - | Export format (pdf, html, json, csv, xlsx) |
| includeCharts | boolean | No | true | Include charts (PDF/HTML only) |
| includeScreenshots | boolean | No | false | Include screenshots (PDF/HTML only) |

#### Response (200 OK)

For **json** format:
```json
{
  "success": true,
  "data": {
    "report": {
      "id": "rpt_123456789",
      "name": "Weekly Smoke Test Report",
      "summary": { /* ... */ },
      "executionDetails": [ /* ... */ ]
    }
  }
}
```

For **pdf**, **html**, **csv**, **xlsx** formats:
- Returns file as binary download with appropriate Content-Type header
- Content-Disposition: attachment; filename="report_name.{format}"

#### Error Responses

**404 Not Found**
```json
{
  "success": false,
  "error": {
    "code": "REPORT_NOT_FOUND",
    "message": "Report not found"
  }
}
```

#### Code Examples

**cURL (JSON)**
```bash
curl -X GET "https://api.example.com/api/v1/reports/rpt_123456789/export?format=json" \
  -H "Authorization: Bearer <access_token>"
```

**cURL (PDF Download)**
```bash
curl -X GET "https://api.example.com/api/v1/reports/rpt_123456789/export?format=pdf" \
  -H "Authorization: Bearer <access_token>" \
  -o report.pdf
```

**JavaScript/TypeScript (JSON)**
```typescript
const response = await fetch(
  `https://api.example.com/api/v1/reports/${reportId}/export?format=json`,
  {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  }
);

const data = await response.json();
```

**JavaScript/TypeScript (PDF Download)**
```typescript
const response = await fetch(
  `https://api.example.com/api/v1/reports/${reportId}/export?format=pdf`,
  {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  }
);

const blob = await response.blob();
const url = window.URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'report.pdf';
a.click();
```

**Python (PDF Download)**
```python
import requests

response = requests.get(
    f'https://api.example.com/api/v1/reports/{report_id}/export',
    params={'format': 'pdf'},
    headers={'Authorization': f'Bearer {access_token}'}
)

with open('report.pdf', 'wb') as f:
    f.write(response.content)
```

---

### GET /reports/trends
Get trend analysis across multiple executions.

#### Headers
```
Authorization: Bearer <access_token>
```

#### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| projectId | string | Yes | - | Project ID |
| testSuiteId | string | No | - | Filter by test suite ID |
| startDate | string | Yes | - | Start date (ISO 8601) |
| endDate | string | Yes | - | End date (ISO 8601) |
| granularity | string | No | daily | Time granularity (hourly, daily, weekly, monthly) |
| metrics | string | No | all | Metrics to include (comma-separated: passRate, duration, failures, executions) |

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "projectId": "prj_123456789",
    "dateRange": {
      "start": "2024-01-01T00:00:00Z",
      "end": "2024-01-31T23:59:59Z"
    },
    "granularity": "daily",
    "trends": {
      "passRate": [
        {"date": "2024-01-01", "value": 93.5},
        {"date": "2024-01-02", "value": 95.2},
        {"date": "2024-01-03", "value": 96.8}
      ],
      "avgDuration": [
        {"date": "2024-01-01", "value": 1720},
        {"date": "2024-01-02", "value": 1680},
        {"date": "2024-01-03", "value": 1650}
      ],
      "totalExecutions": [
        {"date": "2024-01-01", "value": 5},
        {"date": "2024-01-02", "value": 6},
        {"date": "2024-01-03", "value": 7}
      ],
      "failureCount": [
        {"date": "2024-01-01", "value": 3},
        {"date": "2024-01-02", "value": 2},
        {"date": "2024-01-03", "value": 1}
      ]
    },
    "summary": {
      "avgPassRate": 95.3,
      "totalExecutions": 156,
      "totalTests": 2340,
      "avgDuration": 1650,
      "trend": "improving"
    }
  }
}
```

#### Code Examples

**cURL**
```bash
curl -X GET "https://api.example.com/api/v1/reports/trends?projectId=prj_123456789&startDate=2024-01-01T00:00:00Z&endDate=2024-01-31T23:59:59Z" \
  -H "Authorization: Bearer <access_token>"
```

**JavaScript/TypeScript**
```typescript
const response = await fetch(
  'https://api.example.com/api/v1/reports/trends?' + new URLSearchParams({
    projectId: 'prj_123456789',
    startDate: '2024-01-01T00:00:00Z',
    endDate: '2024-01-31T23:59:59Z',
    granularity: 'daily',
  }),
  {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  }
);

const data = await response.json();
```

**Python**
```python
import requests

response = requests.get(
    'https://api.example.com/api/v1/reports/trends',
    params={
        'projectId': 'prj_123456789',
        'startDate': '2024-01-01T00:00:00Z',
        'endDate': '2024-01-31T23:59:59Z',
        'granularity': 'daily'
    },
    headers={'Authorization': f'Bearer {access_token}'}
)

data = response.json()
```

---

### GET /reports/metrics
Get key performance metrics for a project.

#### Headers
```
Authorization: Bearer <access_token>
```

#### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| projectId | string | Yes | - | Project ID |
| startDate | string | No | - | Start date (ISO 8601) |
| endDate | string | No | - | End date (ISO 8601) |

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "projectId": "prj_123456789",
    "dateRange": {
      "start": "2024-01-01T00:00:00Z",
      "end": "2024-01-31T23:59:59Z"
    },
    "metrics": {
      "testCoverage": {
        "total": 156,
        "active": 142,
        "deprecated": 14,
        "coveragePercentage": 91.0
      },
      "executionMetrics": {
        "totalExecutions": 234,
        "avgExecutionsPerDay": 7.5,
        "totalTests": 3510,
        "avgTestsPerExecution": 15
      },
      "qualityMetrics": {
        "overallPassRate": 95.3,
        "avgPassRate": 94.8,
        "bestPassRate": 100.0,
        "worstPassRate": 86.7,
        "stability": "high"
      },
      "performanceMetrics": {
        "avgExecutionDuration": 1650,
        "minExecutionDuration": 1200,
        "maxExecutionDuration": 2400,
        "totalExecutionTime": 386100
      },
      "failureMetrics": {
        "totalFailures": 165,
        "uniqueFailedTests": 28,
        "mostFailedTest": {
          "id": "tc_987654321",
          "title": "Password reset flow",
          "failureCount": 15
        },
        "topErrorTypes": {
          "elementNotFound": 42,
          "timeout": 35,
          "assertionFailed": 20
        }
      },
      "efficiency": {
        "automationRate": 92.3,
        "testsPerTester": 35.2,
        "avgTimeToFix": 3.5
      }
    }
  }
}
```

#### Code Examples

**cURL**
```bash
curl -X GET "https://api.example.com/api/v1/reports/metrics?projectId=prj_123456789" \
  -H "Authorization: Bearer <access_token>"
```

**JavaScript/TypeScript**
```typescript
const response = await fetch(
  `https://api.example.com/api/v1/reports/metrics?projectId=prj_123456789`,
  {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  }
);

const data = await response.json();
```

**Python**
```python
import requests

response = requests.get(
    'https://api.example.com/api/v1/reports/metrics',
    params={'projectId': 'prj_123456789'},
    headers={'Authorization': f'Bearer {access_token}'}
)

data = response.json()
```

---

## Report Types

| Type | Description |
|------|-------------|
| execution | Report for a single execution |
| suite | Report for all executions of a test suite |
| project | Report for all tests in a project |
| custom | Custom report with specific filters |

## Export Formats

| Format | Description | Use Case |
|--------|-------------|----------|
| pdf | PDF document | Sharing and archiving |
| html | HTML web page | Web viewing and embedding |
| json | JSON data | API integration and processing |
| csv | CSV spreadsheet | Data analysis in Excel |
| xlsx | Excel workbook | Advanced data analysis |

## Granularity Options

| Option | Description |
|--------|-------------|
| hourly | Data grouped by hour |
| daily | Data grouped by day |
| weekly | Data grouped by week |
| monthly | Data grouped by month |

## Common Error Codes

| Code | Description |
|------|-------------|
| REPORT_NOT_FOUND | Report does not exist |
| INVALID_FORMAT | Unsupported export format |
| RATE_LIMIT_EXCEEDED | Too many requests |
| VALIDATION_ERROR | Request validation failed |
| GENERATION_FAILED | Report generation failed |
