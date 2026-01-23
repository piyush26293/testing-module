# Projects API

The Projects API manages test projects, team members, and project settings.

## Base URL
```
/api/v1/projects
```

## Authentication
All endpoints require authentication with a valid JWT token.

## Rate Limiting
- 100 requests per 15 minutes per user
- List operations: 50 requests per 15 minutes

---

## Endpoints

### GET /projects
Retrieve a paginated list of projects.

#### Headers
```
Authorization: Bearer <access_token>
```

#### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| page | integer | No | 1 | Page number |
| limit | integer | No | 20 | Items per page (max: 100) |
| search | string | No | - | Search by name or description |
| status | string | No | - | Filter by status (active, archived) |
| sortBy | string | No | createdAt | Sort field (createdAt, name, updatedAt) |
| sortOrder | string | No | desc | Sort order (asc, desc) |

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "projects": [
      {
        "id": "prj_123456789",
        "name": "E-commerce Testing",
        "description": "Test automation for online store",
        "status": "active",
        "owner": {
          "id": "usr_123456789",
          "firstName": "John",
          "lastName": "Doe",
          "email": "john@example.com"
        },
        "membersCount": 5,
        "testCasesCount": 42,
        "testSuitesCount": 8,
        "createdAt": "2024-01-15T10:30:00Z",
        "updatedAt": "2024-01-23T14:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 12,
      "totalPages": 1
    }
  }
}
```

#### Code Examples

**cURL**
```bash
curl -X GET "https://api.example.com/api/v1/projects?page=1&limit=20" \
  -H "Authorization: Bearer <access_token>"
```

**JavaScript/TypeScript**
```typescript
const response = await fetch(
  'https://api.example.com/api/v1/projects?page=1&limit=20',
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
    'https://api.example.com/api/v1/projects',
    params={'page': 1, 'limit': 20},
    headers={'Authorization': f'Bearer {access_token}'}
)

data = response.json()
```

---

### POST /projects
Create a new project.

#### Headers
```
Authorization: Bearer <access_token>
```

#### Request Body
```json
{
  "name": "Mobile App Testing",
  "description": "Automated testing for iOS and Android apps",
  "settings": {
    "framework": "playwright",
    "browser": "chromium",
    "defaultTimeout": 30000,
    "retryAttempts": 2,
    "parallel": true,
    "maxParallel": 5
  },
  "tags": ["mobile", "automation", "ios", "android"]
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | Yes | Project name (3-100 chars) |
| description | string | No | Project description |
| settings | object | No | Project configuration |
| tags | array | No | Project tags |

#### Response (201 Created)
```json
{
  "success": true,
  "data": {
    "id": "prj_987654321",
    "name": "Mobile App Testing",
    "description": "Automated testing for iOS and Android apps",
    "status": "active",
    "owner": {
      "id": "usr_123456789",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com"
    },
    "settings": {
      "framework": "playwright",
      "browser": "chromium",
      "defaultTimeout": 30000,
      "retryAttempts": 2,
      "parallel": true,
      "maxParallel": 5
    },
    "tags": ["mobile", "automation", "ios", "android"],
    "createdAt": "2024-01-23T15:00:00Z"
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
        "message": "Project name must be at least 3 characters long"
      }
    ]
  }
}
```

#### Code Examples

**cURL**
```bash
curl -X POST https://api.example.com/api/v1/projects \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Mobile App Testing",
    "description": "Automated testing for iOS and Android apps",
    "tags": ["mobile", "automation"]
  }'
```

**JavaScript/TypeScript**
```typescript
const response = await fetch('https://api.example.com/api/v1/projects', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: 'Mobile App Testing',
    description: 'Automated testing for iOS and Android apps',
    tags: ['mobile', 'automation'],
  }),
});

const data = await response.json();
```

**Python**
```python
import requests

response = requests.post(
    'https://api.example.com/api/v1/projects',
    json={
        'name': 'Mobile App Testing',
        'description': 'Automated testing for iOS and Android apps',
        'tags': ['mobile', 'automation']
    },
    headers={'Authorization': f'Bearer {access_token}'}
)

data = response.json()
```

---

### GET /projects/:id
Retrieve a specific project by ID.

#### Headers
```
Authorization: Bearer <access_token>
```

#### URL Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Project ID |

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "id": "prj_123456789",
    "name": "E-commerce Testing",
    "description": "Test automation for online store",
    "status": "active",
    "owner": {
      "id": "usr_123456789",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com"
    },
    "settings": {
      "framework": "playwright",
      "browser": "chromium",
      "defaultTimeout": 30000,
      "retryAttempts": 2,
      "parallel": true,
      "maxParallel": 5
    },
    "tags": ["e-commerce", "web", "automation"],
    "stats": {
      "membersCount": 5,
      "testCasesCount": 42,
      "testSuitesCount": 8,
      "totalExecutions": 156,
      "passRate": 94.2
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
    "code": "PROJECT_NOT_FOUND",
    "message": "Project not found"
  }
}
```

---

### PUT /projects/:id
Update a project.

#### Headers
```
Authorization: Bearer <access_token>
```

#### URL Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Project ID |

#### Request Body
```json
{
  "name": "E-commerce Testing Suite",
  "description": "Comprehensive test automation for online store",
  "status": "active",
  "settings": {
    "defaultTimeout": 45000,
    "maxParallel": 10
  },
  "tags": ["e-commerce", "web", "automation", "regression"]
}
```

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "id": "prj_123456789",
    "name": "E-commerce Testing Suite",
    "description": "Comprehensive test automation for online store",
    "status": "active",
    "settings": {
      "framework": "playwright",
      "browser": "chromium",
      "defaultTimeout": 45000,
      "retryAttempts": 2,
      "parallel": true,
      "maxParallel": 10
    },
    "tags": ["e-commerce", "web", "automation", "regression"],
    "updatedAt": "2024-01-23T16:00:00Z"
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
    "message": "You don't have permission to update this project"
  }
}
```

#### Code Examples

**cURL**
```bash
curl -X PUT https://api.example.com/api/v1/projects/prj_123456789 \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "E-commerce Testing Suite",
    "description": "Comprehensive test automation for online store"
  }'
```

**JavaScript/TypeScript**
```typescript
const response = await fetch(
  `https://api.example.com/api/v1/projects/${projectId}`,
  {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: 'E-commerce Testing Suite',
      description: 'Comprehensive test automation for online store',
    }),
  }
);

const data = await response.json();
```

**Python**
```python
import requests

response = requests.put(
    f'https://api.example.com/api/v1/projects/{project_id}',
    json={
        'name': 'E-commerce Testing Suite',
        'description': 'Comprehensive test automation for online store'
    },
    headers={'Authorization': f'Bearer {access_token}'}
)

data = response.json()
```

---

### DELETE /projects/:id
Delete a project.

#### Headers
```
Authorization: Bearer <access_token>
```

#### URL Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Project ID |

#### Response (200 OK)
```json
{
  "success": true,
  "message": "Project successfully deleted"
}
```

#### Error Responses

**403 Forbidden**
```json
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_PERMISSIONS",
    "message": "Only project owners can delete projects"
  }
}
```

#### Code Examples

**cURL**
```bash
curl -X DELETE https://api.example.com/api/v1/projects/prj_123456789 \
  -H "Authorization: Bearer <access_token>"
```

---

### POST /projects/:id/members
Add a member to a project.

#### Headers
```
Authorization: Bearer <access_token>
```

#### URL Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Project ID |

#### Request Body
```json
{
  "userId": "usr_987654321",
  "role": "member"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| userId | string | Yes | User ID to add |
| role | string | Yes | Member role (owner, admin, member, viewer) |

#### Response (201 Created)
```json
{
  "success": true,
  "data": {
    "projectId": "prj_123456789",
    "member": {
      "id": "usr_987654321",
      "firstName": "Jane",
      "lastName": "Smith",
      "email": "jane@example.com",
      "role": "member",
      "joinedAt": "2024-01-23T16:00:00Z"
    }
  }
}
```

#### Error Responses

**409 Conflict**
```json
{
  "success": false,
  "error": {
    "code": "MEMBER_EXISTS",
    "message": "User is already a member of this project"
  }
}
```

#### Code Examples

**cURL**
```bash
curl -X POST https://api.example.com/api/v1/projects/prj_123456789/members \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "usr_987654321",
    "role": "member"
  }'
```

**JavaScript/TypeScript**
```typescript
const response = await fetch(
  `https://api.example.com/api/v1/projects/${projectId}/members`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userId: 'usr_987654321',
      role: 'member',
    }),
  }
);

const data = await response.json();
```

**Python**
```python
import requests

response = requests.post(
    f'https://api.example.com/api/v1/projects/{project_id}/members',
    json={
        'userId': 'usr_987654321',
        'role': 'member'
    },
    headers={'Authorization': f'Bearer {access_token}'}
)

data = response.json()
```

---

### DELETE /projects/:id/members/:userId
Remove a member from a project.

#### Headers
```
Authorization: Bearer <access_token>
```

#### URL Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Project ID |
| userId | string | User ID to remove |

#### Response (200 OK)
```json
{
  "success": true,
  "message": "Member successfully removed from project"
}
```

#### Error Responses

**403 Forbidden**
```json
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_PERMISSIONS",
    "message": "You don't have permission to remove members"
  }
}
```

**409 Conflict**
```json
{
  "success": false,
  "error": {
    "code": "CANNOT_REMOVE_OWNER",
    "message": "Cannot remove project owner"
  }
}
```

#### Code Examples

**cURL**
```bash
curl -X DELETE https://api.example.com/api/v1/projects/prj_123456789/members/usr_987654321 \
  -H "Authorization: Bearer <access_token>"
```

---

### GET /projects/:id/test-cases
Get all test cases in a project.

#### Headers
```
Authorization: Bearer <access_token>
```

#### URL Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Project ID |

#### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| page | integer | No | 1 | Page number |
| limit | integer | No | 20 | Items per page |
| status | string | No | - | Filter by status (draft, active, deprecated) |
| priority | string | No | - | Filter by priority (low, medium, high, critical) |

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "testCases": [
      {
        "id": "tc_123456789",
        "title": "User login with valid credentials",
        "description": "Verify user can login with valid email and password",
        "status": "active",
        "priority": "high",
        "createdBy": {
          "id": "usr_123456789",
          "firstName": "John",
          "lastName": "Doe"
        },
        "stepsCount": 5,
        "createdAt": "2024-01-15T10:30:00Z",
        "updatedAt": "2024-01-23T14:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 42,
      "totalPages": 3
    }
  }
}
```

#### Code Examples

**cURL**
```bash
curl -X GET "https://api.example.com/api/v1/projects/prj_123456789/test-cases?status=active" \
  -H "Authorization: Bearer <access_token>"
```

**JavaScript/TypeScript**
```typescript
const response = await fetch(
  `https://api.example.com/api/v1/projects/${projectId}/test-cases?status=active`,
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
    f'https://api.example.com/api/v1/projects/{project_id}/test-cases',
    params={'status': 'active'},
    headers={'Authorization': f'Bearer {access_token}'}
)

data = response.json()
```

---

## Project Roles

| Role | Description | Permissions |
|------|-------------|-------------|
| owner | Project owner | Full control, can delete project |
| admin | Project administrator | Manage members, settings, all CRUD operations |
| member | Project member | Create and edit test cases, run executions |
| viewer | Read-only member | View projects and test results only |

## Common Error Codes

| Code | Description |
|------|-------------|
| PROJECT_NOT_FOUND | Project does not exist |
| INSUFFICIENT_PERMISSIONS | User lacks required permissions |
| MEMBER_EXISTS | User is already a project member |
| CANNOT_REMOVE_OWNER | Cannot remove project owner |
| VALIDATION_ERROR | Request validation failed |
