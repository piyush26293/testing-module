# Test Suites API

The Test Suites API manages collections of test cases organized for execution.

## Base URL
```
/api/v1/test-suites
```

## Authentication
All endpoints require authentication with a valid JWT token.

## Rate Limiting
- 100 requests per 15 minutes per user
- List operations: 50 requests per 15 minutes

---

## Endpoints

### GET /test-suites
Retrieve a paginated list of test suites.

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
| search | string | No | - | Search by name or description |
| status | string | No | - | Filter by status (active, archived) |
| sortBy | string | No | createdAt | Sort field (createdAt, name, updatedAt) |
| sortOrder | string | No | desc | Sort order (asc, desc) |

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "testSuites": [
      {
        "id": "ts_123456789",
        "projectId": "prj_123456789",
        "name": "Smoke Test Suite",
        "description": "Critical path tests for daily builds",
        "status": "active",
        "testCasesCount": 15,
        "estimatedDuration": 1800,
        "createdBy": {
          "id": "usr_123456789",
          "firstName": "John",
          "lastName": "Doe"
        },
        "createdAt": "2024-01-15T10:30:00Z",
        "updatedAt": "2024-01-23T14:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 24,
      "totalPages": 2
    }
  }
}
```

#### Code Examples

**cURL**
```bash
curl -X GET "https://api.example.com/api/v1/test-suites?projectId=prj_123456789&status=active" \
  -H "Authorization: Bearer <access_token>"
```

**JavaScript/TypeScript**
```typescript
const response = await fetch(
  'https://api.example.com/api/v1/test-suites?projectId=prj_123456789&status=active',
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
    'https://api.example.com/api/v1/test-suites',
    params={
        'projectId': 'prj_123456789',
        'status': 'active'
    },
    headers={'Authorization': f'Bearer {access_token}'}
)

data = response.json()
```

---

### POST /test-suites
Create a new test suite.

#### Headers
```
Authorization: Bearer <access_token>
```

#### Request Body
```json
{
  "projectId": "prj_123456789",
  "name": "Regression Test Suite",
  "description": "Full regression tests for release validation",
  "status": "active",
  "tags": ["regression", "release", "full-coverage"],
  "config": {
    "parallel": true,
    "maxParallel": 5,
    "retryFailedTests": true,
    "retryAttempts": 2,
    "continueOnFailure": false,
    "browser": "chromium",
    "headless": true
  },
  "schedule": {
    "enabled": true,
    "cron": "0 2 * * *",
    "timezone": "America/New_York"
  }
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| projectId | string | Yes | Project ID |
| name | string | Yes | Suite name (3-200 chars) |
| description | string | No | Detailed description |
| status | string | No | Status (active, archived) - default: active |
| tags | array | No | Tags for categorization |
| config | object | No | Execution configuration |
| schedule | object | No | Automated scheduling settings |

#### Response (201 Created)
```json
{
  "success": true,
  "data": {
    "id": "ts_987654321",
    "projectId": "prj_123456789",
    "name": "Regression Test Suite",
    "description": "Full regression tests for release validation",
    "status": "active",
    "tags": ["regression", "release", "full-coverage"],
    "config": {
      "parallel": true,
      "maxParallel": 5,
      "retryFailedTests": true,
      "retryAttempts": 2,
      "continueOnFailure": false,
      "browser": "chromium",
      "headless": true
    },
    "schedule": {
      "enabled": true,
      "cron": "0 2 * * *",
      "timezone": "America/New_York",
      "nextRun": "2024-01-24T02:00:00Z"
    },
    "testCasesCount": 0,
    "estimatedDuration": 0,
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
        "field": "name",
        "message": "Suite name must be at least 3 characters long"
      }
    ]
  }
}
```

#### Code Examples

**cURL**
```bash
curl -X POST https://api.example.com/api/v1/test-suites \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "prj_123456789",
    "name": "Regression Test Suite",
    "description": "Full regression tests for release validation",
    "tags": ["regression", "release"]
  }'
```

**JavaScript/TypeScript**
```typescript
const response = await fetch('https://api.example.com/api/v1/test-suites', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    projectId: 'prj_123456789',
    name: 'Regression Test Suite',
    description: 'Full regression tests for release validation',
    tags: ['regression', 'release'],
  }),
});

const data = await response.json();
```

**Python**
```python
import requests

response = requests.post(
    'https://api.example.com/api/v1/test-suites',
    json={
        'projectId': 'prj_123456789',
        'name': 'Regression Test Suite',
        'description': 'Full regression tests for release validation',
        'tags': ['regression', 'release']
    },
    headers={'Authorization': f'Bearer {access_token}'}
)

data = response.json()
```

---

### GET /test-suites/:id
Retrieve a specific test suite by ID.

#### Headers
```
Authorization: Bearer <access_token>
```

#### URL Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Test suite ID |

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "id": "ts_123456789",
    "projectId": "prj_123456789",
    "name": "Smoke Test Suite",
    "description": "Critical path tests for daily builds",
    "status": "active",
    "tags": ["smoke", "critical", "daily"],
    "config": {
      "parallel": true,
      "maxParallel": 5,
      "retryFailedTests": true,
      "retryAttempts": 2,
      "continueOnFailure": false,
      "browser": "chromium",
      "headless": true,
      "viewport": {
        "width": 1920,
        "height": 1080
      }
    },
    "schedule": {
      "enabled": true,
      "cron": "0 2 * * *",
      "timezone": "America/New_York",
      "nextRun": "2024-01-24T02:00:00Z",
      "lastRun": "2024-01-23T02:00:00Z"
    },
    "testCases": [
      {
        "id": "tc_123456789",
        "title": "User login with valid credentials",
        "priority": "high",
        "estimatedDuration": 120
      }
    ],
    "testCasesCount": 15,
    "estimatedDuration": 1800,
    "createdBy": {
      "id": "usr_123456789",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com"
    },
    "stats": {
      "totalExecutions": 89,
      "passedExecutions": 84,
      "failedExecutions": 5,
      "passRate": 94.4,
      "avgDuration": 1650
    },
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-23T14:30:00Z"
  }
}
```

#### Error Responses

**404 Not Found**
```json
{
  "success": false,
  "error": {
    "code": "TEST_SUITE_NOT_FOUND",
    "message": "Test suite not found"
  }
}
```

---

### PUT /test-suites/:id
Update a test suite.

#### Headers
```
Authorization: Bearer <access_token>
```

#### URL Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Test suite ID |

#### Request Body
```json
{
  "name": "Updated Smoke Test Suite",
  "description": "Enhanced critical path tests for daily builds",
  "status": "active",
  "tags": ["smoke", "critical", "daily", "automated"],
  "config": {
    "maxParallel": 10,
    "retryAttempts": 3
  },
  "schedule": {
    "enabled": true,
    "cron": "0 1 * * *"
  }
}
```

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "id": "ts_123456789",
    "projectId": "prj_123456789",
    "name": "Updated Smoke Test Suite",
    "description": "Enhanced critical path tests for daily builds",
    "status": "active",
    "tags": ["smoke", "critical", "daily", "automated"],
    "config": {
      "parallel": true,
      "maxParallel": 10,
      "retryFailedTests": true,
      "retryAttempts": 3,
      "continueOnFailure": false,
      "browser": "chromium",
      "headless": true
    },
    "schedule": {
      "enabled": true,
      "cron": "0 1 * * *",
      "timezone": "America/New_York",
      "nextRun": "2024-01-24T01:00:00Z"
    },
    "updatedAt": "2024-01-23T17:00:00Z"
  }
}
```

#### Error Responses

**403 Forbidden**
```json
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_PERMISSIONS",
    "message": "You don't have permission to update this test suite"
  }
}
```

#### Code Examples

**cURL**
```bash
curl -X PUT https://api.example.com/api/v1/test-suites/ts_123456789 \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Smoke Test Suite",
    "description": "Enhanced critical path tests for daily builds"
  }'
```

**JavaScript/TypeScript**
```typescript
const response = await fetch(
  `https://api.example.com/api/v1/test-suites/${testSuiteId}`,
  {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: 'Updated Smoke Test Suite',
      description: 'Enhanced critical path tests for daily builds',
    }),
  }
);

const data = await response.json();
```

**Python**
```python
import requests

response = requests.put(
    f'https://api.example.com/api/v1/test-suites/{test_suite_id}',
    json={
        'name': 'Updated Smoke Test Suite',
        'description': 'Enhanced critical path tests for daily builds'
    },
    headers={'Authorization': f'Bearer {access_token}'}
)

data = response.json()
```

---

### DELETE /test-suites/:id
Delete a test suite.

#### Headers
```
Authorization: Bearer <access_token>
```

#### URL Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Test suite ID |

#### Response (200 OK)
```json
{
  "success": true,
  "message": "Test suite successfully deleted"
}
```

#### Error Responses

**409 Conflict**
```json
{
  "success": false,
  "error": {
    "code": "CANNOT_DELETE_TEST_SUITE",
    "message": "Cannot delete test suite with active executions"
  }
}
```

#### Code Examples

**cURL**
```bash
curl -X DELETE https://api.example.com/api/v1/test-suites/ts_123456789 \
  -H "Authorization: Bearer <access_token>"
```

---

### POST /test-suites/:id/test-cases
Add a test case to a test suite.

#### Headers
```
Authorization: Bearer <access_token>
```

#### URL Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Test suite ID |

#### Request Body
```json
{
  "testCaseId": "tc_987654321",
  "order": 1
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| testCaseId | string | Yes | Test case ID to add |
| order | integer | No | Execution order (default: appends to end) |

#### Response (201 Created)
```json
{
  "success": true,
  "data": {
    "testSuiteId": "ts_123456789",
    "testCase": {
      "id": "tc_987654321",
      "title": "Password reset flow",
      "priority": "high",
      "estimatedDuration": 180,
      "order": 1,
      "addedAt": "2024-01-23T17:00:00Z"
    }
  }
}
```

#### Error Responses

**404 Not Found**
```json
{
  "success": false,
  "error": {
    "code": "TEST_CASE_NOT_FOUND",
    "message": "Test case not found"
  }
}
```

**409 Conflict**
```json
{
  "success": false,
  "error": {
    "code": "TEST_CASE_EXISTS",
    "message": "Test case already exists in this suite"
  }
}
```

#### Code Examples

**cURL**
```bash
curl -X POST https://api.example.com/api/v1/test-suites/ts_123456789/test-cases \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "testCaseId": "tc_987654321",
    "order": 1
  }'
```

**JavaScript/TypeScript**
```typescript
const response = await fetch(
  `https://api.example.com/api/v1/test-suites/${testSuiteId}/test-cases`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      testCaseId: 'tc_987654321',
      order: 1,
    }),
  }
);

const data = await response.json();
```

**Python**
```python
import requests

response = requests.post(
    f'https://api.example.com/api/v1/test-suites/{test_suite_id}/test-cases',
    json={
        'testCaseId': 'tc_987654321',
        'order': 1
    },
    headers={'Authorization': f'Bearer {access_token}'}
)

data = response.json()
```

---

### DELETE /test-suites/:id/test-cases/:testCaseId
Remove a test case from a test suite.

#### Headers
```
Authorization: Bearer <access_token>
```

#### URL Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Test suite ID |
| testCaseId | string | Test case ID to remove |

#### Response (200 OK)
```json
{
  "success": true,
  "message": "Test case successfully removed from test suite"
}
```

#### Error Responses

**404 Not Found**
```json
{
  "success": false,
  "error": {
    "code": "TEST_CASE_NOT_IN_SUITE",
    "message": "Test case is not part of this test suite"
  }
}
```

#### Code Examples

**cURL**
```bash
curl -X DELETE https://api.example.com/api/v1/test-suites/ts_123456789/test-cases/tc_987654321 \
  -H "Authorization: Bearer <access_token>"
```

**JavaScript/TypeScript**
```typescript
const response = await fetch(
  `https://api.example.com/api/v1/test-suites/${testSuiteId}/test-cases/${testCaseId}`,
  {
    method: 'DELETE',
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

response = requests.delete(
    f'https://api.example.com/api/v1/test-suites/{test_suite_id}/test-cases/{test_case_id}',
    headers={'Authorization': f'Bearer {access_token}'}
)

data = response.json()
```

---

## Configuration Options

### Execution Config

| Option | Type | Description |
|--------|------|-------------|
| parallel | boolean | Run tests in parallel |
| maxParallel | integer | Maximum parallel threads (1-20) |
| retryFailedTests | boolean | Retry failed tests |
| retryAttempts | integer | Number of retry attempts (1-5) |
| continueOnFailure | boolean | Continue execution on test failure |
| browser | string | Browser (chromium, firefox, webkit) |
| headless | boolean | Run in headless mode |
| viewport | object | Viewport dimensions |

### Schedule Config

| Option | Type | Description |
|--------|------|-------------|
| enabled | boolean | Enable scheduled execution |
| cron | string | Cron expression for schedule |
| timezone | string | Timezone for schedule (IANA format) |

## Common Error Codes

| Code | Description |
|------|-------------|
| TEST_SUITE_NOT_FOUND | Test suite does not exist |
| TEST_CASE_NOT_FOUND | Test case does not exist |
| TEST_CASE_EXISTS | Test case already in suite |
| TEST_CASE_NOT_IN_SUITE | Test case not in suite |
| INSUFFICIENT_PERMISSIONS | User lacks required permissions |
| CANNOT_DELETE_TEST_SUITE | Suite has dependencies |
| VALIDATION_ERROR | Request validation failed |
