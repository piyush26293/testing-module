# Test Cases API

The Test Cases API manages individual test cases, test steps, and test case metadata.

## Base URL
```
/api/v1/test-cases
```

## Authentication
All endpoints require authentication with a valid JWT token.

## Rate Limiting
- 100 requests per 15 minutes per user
- List operations: 50 requests per 15 minutes

---

## Endpoints

### GET /test-cases
Retrieve a paginated list of test cases.

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
| search | string | No | - | Search by title or description |
| status | string | No | - | Filter by status (draft, active, deprecated) |
| priority | string | No | - | Filter by priority (low, medium, high, critical) |
| tags | string | No | - | Filter by tags (comma-separated) |
| sortBy | string | No | createdAt | Sort field (createdAt, title, priority, updatedAt) |
| sortOrder | string | No | desc | Sort order (asc, desc) |

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "testCases": [
      {
        "id": "tc_123456789",
        "projectId": "prj_123456789",
        "title": "User login with valid credentials",
        "description": "Verify user can login with valid email and password",
        "status": "active",
        "priority": "high",
        "tags": ["authentication", "login", "smoke"],
        "createdBy": {
          "id": "usr_123456789",
          "firstName": "John",
          "lastName": "Doe"
        },
        "stepsCount": 5,
        "estimatedDuration": 120,
        "createdAt": "2024-01-15T10:30:00Z",
        "updatedAt": "2024-01-23T14:30:00Z"
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

#### Code Examples

**cURL**
```bash
curl -X GET "https://api.example.com/api/v1/test-cases?projectId=prj_123456789&status=active" \
  -H "Authorization: Bearer <access_token>"
```

**JavaScript/TypeScript**
```typescript
const response = await fetch(
  'https://api.example.com/api/v1/test-cases?projectId=prj_123456789&status=active',
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
    'https://api.example.com/api/v1/test-cases',
    params={
        'projectId': 'prj_123456789',
        'status': 'active'
    },
    headers={'Authorization': f'Bearer {access_token}'}
)

data = response.json()
```

---

### POST /test-cases
Create a new test case.

#### Headers
```
Authorization: Bearer <access_token>
```

#### Request Body
```json
{
  "projectId": "prj_123456789",
  "title": "Password reset flow",
  "description": "Verify user can reset password using email link",
  "status": "active",
  "priority": "high",
  "tags": ["authentication", "password", "critical"],
  "preconditions": "User must have a registered account",
  "expectedResult": "User successfully resets password and can login",
  "estimatedDuration": 180,
  "steps": [
    {
      "order": 1,
      "action": "Navigate to login page",
      "expected": "Login page is displayed"
    },
    {
      "order": 2,
      "action": "Click 'Forgot Password' link",
      "expected": "Password reset page is displayed"
    }
  ]
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| projectId | string | Yes | Project ID |
| title | string | Yes | Test case title (5-200 chars) |
| description | string | No | Detailed description |
| status | string | No | Status (draft, active, deprecated) - default: draft |
| priority | string | No | Priority (low, medium, high, critical) - default: medium |
| tags | array | No | Tags for categorization |
| preconditions | string | No | Prerequisites for test |
| expectedResult | string | No | Expected outcome |
| estimatedDuration | integer | No | Estimated duration in seconds |
| steps | array | No | Test steps (can be added later) |

#### Response (201 Created)
```json
{
  "success": true,
  "data": {
    "id": "tc_987654321",
    "projectId": "prj_123456789",
    "title": "Password reset flow",
    "description": "Verify user can reset password using email link",
    "status": "active",
    "priority": "high",
    "tags": ["authentication", "password", "critical"],
    "preconditions": "User must have a registered account",
    "expectedResult": "User successfully resets password and can login",
    "estimatedDuration": 180,
    "createdBy": {
      "id": "usr_123456789",
      "firstName": "John",
      "lastName": "Doe"
    },
    "stepsCount": 2,
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
        "field": "title",
        "message": "Title must be at least 5 characters long"
      }
    ]
  }
}
```

#### Code Examples

**cURL**
```bash
curl -X POST https://api.example.com/api/v1/test-cases \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "prj_123456789",
    "title": "Password reset flow",
    "description": "Verify user can reset password using email link",
    "priority": "high",
    "tags": ["authentication", "password"]
  }'
```

**JavaScript/TypeScript**
```typescript
const response = await fetch('https://api.example.com/api/v1/test-cases', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    projectId: 'prj_123456789',
    title: 'Password reset flow',
    description: 'Verify user can reset password using email link',
    priority: 'high',
    tags: ['authentication', 'password'],
  }),
});

const data = await response.json();
```

**Python**
```python
import requests

response = requests.post(
    'https://api.example.com/api/v1/test-cases',
    json={
        'projectId': 'prj_123456789',
        'title': 'Password reset flow',
        'description': 'Verify user can reset password using email link',
        'priority': 'high',
        'tags': ['authentication', 'password']
    },
    headers={'Authorization': f'Bearer {access_token}'}
)

data = response.json()
```

---

### GET /test-cases/:id
Retrieve a specific test case by ID.

#### Headers
```
Authorization: Bearer <access_token>
```

#### URL Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Test case ID |

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "id": "tc_123456789",
    "projectId": "prj_123456789",
    "title": "User login with valid credentials",
    "description": "Verify user can login with valid email and password",
    "status": "active",
    "priority": "high",
    "tags": ["authentication", "login", "smoke"],
    "preconditions": "User account exists and is active",
    "expectedResult": "User is logged in and redirected to dashboard",
    "estimatedDuration": 120,
    "createdBy": {
      "id": "usr_123456789",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com"
    },
    "steps": [
      {
        "id": "step_111",
        "order": 1,
        "action": "Navigate to login page",
        "expected": "Login page is displayed",
        "data": {
          "url": "https://example.com/login"
        }
      },
      {
        "id": "step_222",
        "order": 2,
        "action": "Enter valid email address",
        "expected": "Email field accepts input",
        "data": {
          "email": "test@example.com"
        }
      }
    ],
    "attachments": [
      {
        "id": "att_123",
        "name": "login-flow.png",
        "type": "image/png",
        "url": "https://api.example.com/storage/files/att_123"
      }
    ],
    "stats": {
      "totalExecutions": 45,
      "passedExecutions": 42,
      "failedExecutions": 3,
      "passRate": 93.3
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
    "code": "TEST_CASE_NOT_FOUND",
    "message": "Test case not found"
  }
}
```

---

### PUT /test-cases/:id
Update a test case.

#### Headers
```
Authorization: Bearer <access_token>
```

#### URL Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Test case ID |

#### Request Body
```json
{
  "title": "User login with valid credentials - Updated",
  "description": "Comprehensive test for user authentication",
  "status": "active",
  "priority": "critical",
  "tags": ["authentication", "login", "smoke", "regression"],
  "preconditions": "User account exists, is active, and email is verified",
  "expectedResult": "User successfully logs in and is redirected to dashboard",
  "estimatedDuration": 150
}
```

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "id": "tc_123456789",
    "projectId": "prj_123456789",
    "title": "User login with valid credentials - Updated",
    "description": "Comprehensive test for user authentication",
    "status": "active",
    "priority": "critical",
    "tags": ["authentication", "login", "smoke", "regression"],
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
    "message": "You don't have permission to update this test case"
  }
}
```

#### Code Examples

**cURL**
```bash
curl -X PUT https://api.example.com/api/v1/test-cases/tc_123456789 \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "User login with valid credentials - Updated",
    "priority": "critical"
  }'
```

**JavaScript/TypeScript**
```typescript
const response = await fetch(
  `https://api.example.com/api/v1/test-cases/${testCaseId}`,
  {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: 'User login with valid credentials - Updated',
      priority: 'critical',
    }),
  }
);

const data = await response.json();
```

**Python**
```python
import requests

response = requests.put(
    f'https://api.example.com/api/v1/test-cases/{test_case_id}',
    json={
        'title': 'User login with valid credentials - Updated',
        'priority': 'critical'
    },
    headers={'Authorization': f'Bearer {access_token}'}
)

data = response.json()
```

---

### DELETE /test-cases/:id
Delete a test case.

#### Headers
```
Authorization: Bearer <access_token>
```

#### URL Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Test case ID |

#### Response (200 OK)
```json
{
  "success": true,
  "message": "Test case successfully deleted"
}
```

#### Error Responses

**409 Conflict**
```json
{
  "success": false,
  "error": {
    "code": "CANNOT_DELETE_TEST_CASE",
    "message": "Cannot delete test case that is part of active test suites"
  }
}
```

#### Code Examples

**cURL**
```bash
curl -X DELETE https://api.example.com/api/v1/test-cases/tc_123456789 \
  -H "Authorization: Bearer <access_token>"
```

---

### POST /test-cases/:id/steps
Add a step to a test case.

#### Headers
```
Authorization: Bearer <access_token>
```

#### URL Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Test case ID |

#### Request Body
```json
{
  "order": 3,
  "action": "Click login button",
  "expected": "User is authenticated and redirected to dashboard",
  "data": {
    "selector": "#login-button",
    "timeout": 5000
  }
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| order | integer | Yes | Step order/sequence number |
| action | string | Yes | Action to perform |
| expected | string | Yes | Expected result |
| data | object | No | Additional step data (selectors, inputs, etc.) |

#### Response (201 Created)
```json
{
  "success": true,
  "data": {
    "id": "step_333",
    "testCaseId": "tc_123456789",
    "order": 3,
    "action": "Click login button",
    "expected": "User is authenticated and redirected to dashboard",
    "data": {
      "selector": "#login-button",
      "timeout": 5000
    },
    "createdAt": "2024-01-23T17:00:00Z"
  }
}
```

#### Code Examples

**cURL**
```bash
curl -X POST https://api.example.com/api/v1/test-cases/tc_123456789/steps \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "order": 3,
    "action": "Click login button",
    "expected": "User is authenticated and redirected to dashboard"
  }'
```

**JavaScript/TypeScript**
```typescript
const response = await fetch(
  `https://api.example.com/api/v1/test-cases/${testCaseId}/steps`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      order: 3,
      action: 'Click login button',
      expected: 'User is authenticated and redirected to dashboard',
    }),
  }
);

const data = await response.json();
```

**Python**
```python
import requests

response = requests.post(
    f'https://api.example.com/api/v1/test-cases/{test_case_id}/steps',
    json={
        'order': 3,
        'action': 'Click login button',
        'expected': 'User is authenticated and redirected to dashboard'
    },
    headers={'Authorization': f'Bearer {access_token}'}
)

data = response.json()
```

---

### PUT /test-cases/:id/steps/:stepId
Update a test step.

#### Headers
```
Authorization: Bearer <access_token>
```

#### URL Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Test case ID |
| stepId | string | Step ID |

#### Request Body
```json
{
  "order": 3,
  "action": "Click login button and wait for redirect",
  "expected": "User is authenticated and redirected to dashboard within 3 seconds",
  "data": {
    "selector": "#login-button",
    "timeout": 3000,
    "waitForNavigation": true
  }
}
```

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "id": "step_333",
    "testCaseId": "tc_123456789",
    "order": 3,
    "action": "Click login button and wait for redirect",
    "expected": "User is authenticated and redirected to dashboard within 3 seconds",
    "data": {
      "selector": "#login-button",
      "timeout": 3000,
      "waitForNavigation": true
    },
    "updatedAt": "2024-01-23T17:30:00Z"
  }
}
```

#### Code Examples

**cURL**
```bash
curl -X PUT https://api.example.com/api/v1/test-cases/tc_123456789/steps/step_333 \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "Click login button and wait for redirect",
    "expected": "User is authenticated and redirected to dashboard within 3 seconds"
  }'
```

---

### DELETE /test-cases/:id/steps/:stepId
Delete a test step.

#### Headers
```
Authorization: Bearer <access_token>
```

#### URL Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Test case ID |
| stepId | string | Step ID |

#### Response (200 OK)
```json
{
  "success": true,
  "message": "Test step successfully deleted"
}
```

#### Code Examples

**cURL**
```bash
curl -X DELETE https://api.example.com/api/v1/test-cases/tc_123456789/steps/step_333 \
  -H "Authorization: Bearer <access_token>"
```

**JavaScript/TypeScript**
```typescript
const response = await fetch(
  `https://api.example.com/api/v1/test-cases/${testCaseId}/steps/${stepId}`,
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
    f'https://api.example.com/api/v1/test-cases/{test_case_id}/steps/{step_id}',
    headers={'Authorization': f'Bearer {access_token}'}
)

data = response.json()
```

---

## Test Case Status

| Status | Description |
|--------|-------------|
| draft | Test case is being created/edited |
| active | Test case is ready for execution |
| deprecated | Test case is no longer in use |

## Priority Levels

| Priority | Description |
|----------|-------------|
| low | Non-critical functionality |
| medium | Standard functionality |
| high | Important functionality |
| critical | Critical business functionality |

## Common Error Codes

| Code | Description |
|------|-------------|
| TEST_CASE_NOT_FOUND | Test case does not exist |
| INSUFFICIENT_PERMISSIONS | User lacks required permissions |
| CANNOT_DELETE_TEST_CASE | Test case has dependencies |
| VALIDATION_ERROR | Request validation failed |
| DUPLICATE_STEP_ORDER | Step order already exists |
