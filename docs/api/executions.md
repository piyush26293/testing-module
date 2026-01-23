# Executions API

The Executions API manages test execution runs, real-time status, results, and logs.

## Base URL
```
/api/v1/executions
```

## Authentication
All endpoints require authentication with a valid JWT token.

## Rate Limiting
- 100 requests per 15 minutes per user
- Execution creation: 20 requests per 15 minutes

---

## Endpoints

### POST /executions
Create and start a new test execution.

#### Headers
```
Authorization: Bearer <access_token>
```

#### Request Body
```json
{
  "testSuiteId": "ts_123456789",
  "environment": "staging",
  "browser": "chromium",
  "config": {
    "headless": true,
    "parallel": true,
    "maxParallel": 5,
    "retryFailedTests": true,
    "retryAttempts": 2,
    "continueOnFailure": false,
    "viewport": {
      "width": 1920,
      "height": 1080
    },
    "timeout": 30000,
    "screenshots": "on-failure",
    "video": true
  },
  "variables": {
    "BASE_URL": "https://staging.example.com",
    "API_KEY": "staging_api_key_123"
  },
  "tags": ["staging", "smoke", "daily-build"],
  "scheduledBy": "manual"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| testSuiteId | string | Yes | Test suite ID to execute |
| environment | string | No | Environment name (dev, staging, production) |
| browser | string | No | Browser (chromium, firefox, webkit) |
| config | object | No | Execution configuration |
| variables | object | No | Environment variables |
| tags | array | No | Execution tags |
| scheduledBy | string | No | Trigger type (manual, scheduled, api, webhook) |

#### Response (201 Created)
```json
{
  "success": true,
  "data": {
    "id": "exec_123456789",
    "testSuiteId": "ts_123456789",
    "testSuiteName": "Smoke Test Suite",
    "projectId": "prj_123456789",
    "status": "running",
    "environment": "staging",
    "browser": "chromium",
    "startedAt": "2024-01-23T16:00:00Z",
    "startedBy": {
      "id": "usr_123456789",
      "firstName": "John",
      "lastName": "Doe"
    },
    "progress": {
      "total": 15,
      "completed": 0,
      "passed": 0,
      "failed": 0,
      "skipped": 0,
      "percentage": 0
    },
    "config": {
      "headless": true,
      "parallel": true,
      "maxParallel": 5,
      "retryFailedTests": true,
      "retryAttempts": 2
    },
    "tags": ["staging", "smoke", "daily-build"],
    "scheduledBy": "manual"
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
        "field": "testSuiteId",
        "message": "Test suite not found"
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
    "message": "Too many execution requests. Maximum 20 per 15 minutes.",
    "retryAfter": 300
  }
}
```

#### Code Examples

**cURL**
```bash
curl -X POST https://api.example.com/api/v1/executions \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "testSuiteId": "ts_123456789",
    "environment": "staging",
    "browser": "chromium",
    "config": {
      "headless": true,
      "parallel": true
    }
  }'
```

**JavaScript/TypeScript**
```typescript
const response = await fetch('https://api.example.com/api/v1/executions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    testSuiteId: 'ts_123456789',
    environment: 'staging',
    browser: 'chromium',
    config: {
      headless: true,
      parallel: true,
    },
  }),
});

const data = await response.json();
```

**Python**
```python
import requests

response = requests.post(
    'https://api.example.com/api/v1/executions',
    json={
        'testSuiteId': 'ts_123456789',
        'environment': 'staging',
        'browser': 'chromium',
        'config': {
            'headless': True,
            'parallel': True
        }
    },
    headers={'Authorization': f'Bearer {access_token}'}
)

data = response.json()
```

---

### GET /executions
Retrieve a paginated list of executions.

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
| testSuiteId | string | No | - | Filter by test suite ID |
| status | string | No | - | Filter by status (queued, running, completed, failed, stopped) |
| environment | string | No | - | Filter by environment |
| startDate | string | No | - | Filter by start date (ISO 8601) |
| endDate | string | No | - | Filter by end date (ISO 8601) |
| sortBy | string | No | startedAt | Sort field (startedAt, duration, status) |
| sortOrder | string | No | desc | Sort order (asc, desc) |

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "executions": [
      {
        "id": "exec_123456789",
        "testSuiteId": "ts_123456789",
        "testSuiteName": "Smoke Test Suite",
        "projectId": "prj_123456789",
        "projectName": "E-commerce Testing",
        "status": "completed",
        "environment": "staging",
        "browser": "chromium",
        "startedAt": "2024-01-23T16:00:00Z",
        "completedAt": "2024-01-23T16:28:30Z",
        "duration": 1710,
        "startedBy": {
          "id": "usr_123456789",
          "firstName": "John",
          "lastName": "Doe"
        },
        "results": {
          "total": 15,
          "passed": 14,
          "failed": 1,
          "skipped": 0,
          "passRate": 93.3
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 234,
      "totalPages": 12
    }
  }
}
```

#### Code Examples

**cURL**
```bash
curl -X GET "https://api.example.com/api/v1/executions?projectId=prj_123456789&status=completed" \
  -H "Authorization: Bearer <access_token>"
```

**JavaScript/TypeScript**
```typescript
const response = await fetch(
  'https://api.example.com/api/v1/executions?projectId=prj_123456789&status=completed',
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
    'https://api.example.com/api/v1/executions',
    params={
        'projectId': 'prj_123456789',
        'status': 'completed'
    },
    headers={'Authorization': f'Bearer {access_token}'}
)

data = response.json()
```

---

### GET /executions/:id
Retrieve a specific execution by ID with detailed results.

#### Headers
```
Authorization: Bearer <access_token>
```

#### URL Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Execution ID |

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "id": "exec_123456789",
    "testSuiteId": "ts_123456789",
    "testSuiteName": "Smoke Test Suite",
    "projectId": "prj_123456789",
    "projectName": "E-commerce Testing",
    "status": "completed",
    "environment": "staging",
    "browser": "chromium",
    "config": {
      "headless": true,
      "parallel": true,
      "maxParallel": 5,
      "retryFailedTests": true,
      "retryAttempts": 2,
      "continueOnFailure": false,
      "screenshots": "on-failure",
      "video": true
    },
    "variables": {
      "BASE_URL": "https://staging.example.com"
    },
    "startedAt": "2024-01-23T16:00:00Z",
    "completedAt": "2024-01-23T16:28:30Z",
    "duration": 1710,
    "startedBy": {
      "id": "usr_123456789",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com"
    },
    "results": {
      "total": 15,
      "passed": 14,
      "failed": 1,
      "skipped": 0,
      "passRate": 93.3
    },
    "testResults": [
      {
        "testCaseId": "tc_123456789",
        "testCaseTitle": "User login with valid credentials",
        "status": "passed",
        "duration": 115,
        "startedAt": "2024-01-23T16:00:00Z",
        "completedAt": "2024-01-23T16:01:55Z",
        "retries": 0,
        "screenshots": [],
        "video": null
      },
      {
        "testCaseId": "tc_987654321",
        "testCaseTitle": "Password reset flow",
        "status": "failed",
        "duration": 180,
        "startedAt": "2024-01-23T16:02:00Z",
        "completedAt": "2024-01-23T16:05:00Z",
        "retries": 2,
        "error": {
          "message": "Element not found: #reset-button",
          "stack": "Error: Element not found...",
          "step": 3
        },
        "screenshots": [
          "https://api.example.com/storage/screenshots/exec_123456789/tc_987654321_1.png"
        ],
        "video": "https://api.example.com/storage/videos/exec_123456789/tc_987654321.webm"
      }
    ],
    "tags": ["staging", "smoke", "daily-build"],
    "scheduledBy": "manual"
  }
}
```

#### Error Responses

**404 Not Found**
```json
{
  "success": false,
  "error": {
    "code": "EXECUTION_NOT_FOUND",
    "message": "Execution not found"
  }
}
```

---

### DELETE /executions/:id
Delete an execution record.

#### Headers
```
Authorization: Bearer <access_token>
```

#### URL Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Execution ID |

#### Response (200 OK)
```json
{
  "success": true,
  "message": "Execution successfully deleted"
}
```

#### Error Responses

**409 Conflict**
```json
{
  "success": false,
  "error": {
    "code": "CANNOT_DELETE_EXECUTION",
    "message": "Cannot delete a running execution"
  }
}
```

#### Code Examples

**cURL**
```bash
curl -X DELETE https://api.example.com/api/v1/executions/exec_123456789 \
  -H "Authorization: Bearer <access_token>"
```

---

### POST /executions/:id/stop
Stop a running execution.

#### Headers
```
Authorization: Bearer <access_token>
```

#### URL Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Execution ID |

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "id": "exec_123456789",
    "status": "stopped",
    "stoppedAt": "2024-01-23T16:15:00Z",
    "stoppedBy": {
      "id": "usr_123456789",
      "firstName": "John",
      "lastName": "Doe"
    },
    "results": {
      "total": 15,
      "completed": 7,
      "passed": 6,
      "failed": 1,
      "skipped": 8
    }
  }
}
```

#### Error Responses

**400 Bad Request**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_STATUS",
    "message": "Execution is not running and cannot be stopped"
  }
}
```

#### Code Examples

**cURL**
```bash
curl -X POST https://api.example.com/api/v1/executions/exec_123456789/stop \
  -H "Authorization: Bearer <access_token>"
```

**JavaScript/TypeScript**
```typescript
const response = await fetch(
  `https://api.example.com/api/v1/executions/${executionId}/stop`,
  {
    method: 'POST',
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

response = requests.post(
    f'https://api.example.com/api/v1/executions/{execution_id}/stop',
    headers={'Authorization': f'Bearer {access_token}'}
)

data = response.json()
```

---

### GET /executions/:id/results
Get detailed test results for an execution.

#### Headers
```
Authorization: Bearer <access_token>
```

#### URL Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Execution ID |

#### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| status | string | No | - | Filter by status (passed, failed, skipped) |
| page | integer | No | 1 | Page number |
| limit | integer | No | 20 | Items per page |

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "executionId": "exec_123456789",
    "results": [
      {
        "id": "result_111",
        "testCaseId": "tc_123456789",
        "testCaseTitle": "User login with valid credentials",
        "status": "passed",
        "duration": 115,
        "startedAt": "2024-01-23T16:00:00Z",
        "completedAt": "2024-01-23T16:01:55Z",
        "retries": 0,
        "steps": [
          {
            "order": 1,
            "action": "Navigate to login page",
            "status": "passed",
            "duration": 35
          },
          {
            "order": 2,
            "action": "Enter valid email",
            "status": "passed",
            "duration": 20
          }
        ],
        "screenshots": [],
        "video": null,
        "logs": []
      }
    ],
    "summary": {
      "total": 15,
      "passed": 14,
      "failed": 1,
      "skipped": 0,
      "passRate": 93.3
    },
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 15,
      "totalPages": 1
    }
  }
}
```

#### Code Examples

**cURL**
```bash
curl -X GET "https://api.example.com/api/v1/executions/exec_123456789/results?status=failed" \
  -H "Authorization: Bearer <access_token>"
```

**JavaScript/TypeScript**
```typescript
const response = await fetch(
  `https://api.example.com/api/v1/executions/${executionId}/results?status=failed`,
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
    f'https://api.example.com/api/v1/executions/{execution_id}/results',
    params={'status': 'failed'},
    headers={'Authorization': f'Bearer {access_token}'}
)

data = response.json()
```

---

### GET /executions/:id/logs
Get execution logs.

#### Headers
```
Authorization: Bearer <access_token>
```

#### URL Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Execution ID |

#### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| level | string | No | - | Filter by log level (debug, info, warn, error) |
| testCaseId | string | No | - | Filter by test case ID |
| page | integer | No | 1 | Page number |
| limit | integer | No | 100 | Items per page |

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "executionId": "exec_123456789",
    "logs": [
      {
        "timestamp": "2024-01-23T16:00:00.123Z",
        "level": "info",
        "message": "Starting execution for test suite: Smoke Test Suite",
        "testCaseId": null
      },
      {
        "timestamp": "2024-01-23T16:00:05.456Z",
        "level": "info",
        "message": "Starting test case: User login with valid credentials",
        "testCaseId": "tc_123456789"
      },
      {
        "timestamp": "2024-01-23T16:00:10.789Z",
        "level": "debug",
        "message": "Navigating to https://staging.example.com/login",
        "testCaseId": "tc_123456789"
      },
      {
        "timestamp": "2024-01-23T16:05:00.123Z",
        "level": "error",
        "message": "Element not found: #reset-button",
        "testCaseId": "tc_987654321",
        "stack": "Error: Element not found..."
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 100,
      "total": 342,
      "totalPages": 4
    }
  }
}
```

#### Code Examples

**cURL**
```bash
curl -X GET "https://api.example.com/api/v1/executions/exec_123456789/logs?level=error" \
  -H "Authorization: Bearer <access_token>"
```

**JavaScript/TypeScript**
```typescript
const response = await fetch(
  `https://api.example.com/api/v1/executions/${executionId}/logs?level=error`,
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
    f'https://api.example.com/api/v1/executions/{execution_id}/logs',
    params={'level': 'error'},
    headers={'Authorization': f'Bearer {access_token}'}
)

data = response.json()
```

---

## Execution Status

| Status | Description |
|--------|-------------|
| queued | Execution is queued and waiting to start |
| running | Execution is currently running |
| completed | Execution finished successfully |
| failed | Execution failed due to error |
| stopped | Execution was manually stopped |

## Screenshot Options

| Option | Description |
|--------|-------------|
| always | Take screenshots after every step |
| on-failure | Take screenshots only on failures |
| never | Don't take screenshots |

## Common Error Codes

| Code | Description |
|------|-------------|
| EXECUTION_NOT_FOUND | Execution does not exist |
| INVALID_STATUS | Invalid execution status |
| CANNOT_DELETE_EXECUTION | Cannot delete running execution |
| RATE_LIMIT_EXCEEDED | Too many execution requests |
| VALIDATION_ERROR | Request validation failed |
