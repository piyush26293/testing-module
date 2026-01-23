# Users API

The Users API manages user accounts, profiles, and permissions.

## Base URL
```
/api/v1/users
```

## Authentication
All endpoints require authentication with a valid JWT token.

## Rate Limiting
- 100 requests per 15 minutes per user
- List operations: 50 requests per 15 minutes

---

## Endpoints

### GET /users
Retrieve a paginated list of users.

#### Headers
```
Authorization: Bearer <access_token>
```

#### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| page | integer | No | 1 | Page number |
| limit | integer | No | 20 | Items per page (max: 100) |
| search | string | No | - | Search by name or email |
| role | string | No | - | Filter by role (admin, manager, tester, viewer) |
| sortBy | string | No | createdAt | Sort field (createdAt, email, firstName, lastName) |
| sortOrder | string | No | desc | Sort order (asc, desc) |

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "usr_123456789",
        "email": "user@example.com",
        "firstName": "John",
        "lastName": "Doe",
        "role": "tester",
        "avatar": "https://api.example.com/storage/avatars/usr_123456789.jpg",
        "isActive": true,
        "createdAt": "2024-01-15T10:30:00Z",
        "updatedAt": "2024-01-23T14:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "totalPages": 3
    }
  }
}
```

#### Code Examples

**cURL**
```bash
curl -X GET "https://api.example.com/api/v1/users?page=1&limit=20&role=tester" \
  -H "Authorization: Bearer <access_token>"
```

**JavaScript/TypeScript**
```typescript
const response = await fetch(
  'https://api.example.com/api/v1/users?page=1&limit=20&role=tester',
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
    'https://api.example.com/api/v1/users',
    params={'page': 1, 'limit': 20, 'role': 'tester'},
    headers={'Authorization': f'Bearer {access_token}'}
)

data = response.json()
```

---

### GET /users/:id
Retrieve a specific user by ID.

#### Headers
```
Authorization: Bearer <access_token>
```

#### URL Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | User ID |

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "id": "usr_123456789",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "tester",
    "organization": "Acme Inc",
    "avatar": "https://api.example.com/storage/avatars/usr_123456789.jpg",
    "isActive": true,
    "lastLogin": "2024-01-23T09:15:00Z",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-23T14:30:00Z",
    "preferences": {
      "theme": "dark",
      "notifications": true,
      "language": "en"
    },
    "stats": {
      "projectsCount": 5,
      "testCasesCreated": 42,
      "executionsRun": 156
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
    "code": "USER_NOT_FOUND",
    "message": "User not found"
  }
}
```

---

### POST /users
Create a new user (Admin only).

#### Headers
```
Authorization: Bearer <access_token>
```

#### Request Body
```json
{
  "email": "newuser@example.com",
  "password": "SecurePassword123!",
  "firstName": "Jane",
  "lastName": "Smith",
  "role": "tester",
  "organization": "Acme Inc",
  "sendWelcomeEmail": true
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| email | string | Yes | User's email address |
| password | string | Yes | User's password |
| firstName | string | Yes | First name |
| lastName | string | Yes | Last name |
| role | string | Yes | User role (admin, manager, tester, viewer) |
| organization | string | No | Organization name |
| sendWelcomeEmail | boolean | No | Send welcome email (default: true) |

#### Response (201 Created)
```json
{
  "success": true,
  "data": {
    "id": "usr_987654321",
    "email": "newuser@example.com",
    "firstName": "Jane",
    "lastName": "Smith",
    "role": "tester",
    "isActive": true,
    "createdAt": "2024-01-23T15:00:00Z"
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
    "message": "Only administrators can create users"
  }
}
```

**409 Conflict**
```json
{
  "success": false,
  "error": {
    "code": "EMAIL_EXISTS",
    "message": "A user with this email already exists"
  }
}
```

#### Code Examples

**cURL**
```bash
curl -X POST https://api.example.com/api/v1/users \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "SecurePassword123!",
    "firstName": "Jane",
    "lastName": "Smith",
    "role": "tester"
  }'
```

**JavaScript/TypeScript**
```typescript
const response = await fetch('https://api.example.com/api/v1/users', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'newuser@example.com',
    password: 'SecurePassword123!',
    firstName: 'Jane',
    lastName: 'Smith',
    role: 'tester',
  }),
});

const data = await response.json();
```

**Python**
```python
import requests

response = requests.post(
    'https://api.example.com/api/v1/users',
    json={
        'email': 'newuser@example.com',
        'password': 'SecurePassword123!',
        'firstName': 'Jane',
        'lastName': 'Smith',
        'role': 'tester'
    },
    headers={'Authorization': f'Bearer {access_token}'}
)

data = response.json()
```

---

### PUT /users/:id
Update a user's information.

#### Headers
```
Authorization: Bearer <access_token>
```

#### URL Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | User ID |

#### Request Body
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "role": "manager",
  "organization": "New Org",
  "isActive": true,
  "preferences": {
    "theme": "light",
    "notifications": false,
    "language": "es"
  }
}
```

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "id": "usr_123456789",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "manager",
    "organization": "New Org",
    "isActive": true,
    "updatedAt": "2024-01-23T15:30:00Z"
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
    "message": "You can only update your own profile"
  }
}
```

---

### DELETE /users/:id
Delete a user (Admin only).

#### Headers
```
Authorization: Bearer <access_token>
```

#### URL Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | User ID |

#### Response (200 OK)
```json
{
  "success": true,
  "message": "User successfully deleted"
}
```

#### Error Responses

**403 Forbidden**
```json
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_PERMISSIONS",
    "message": "Only administrators can delete users"
  }
}
```

**409 Conflict**
```json
{
  "success": false,
  "error": {
    "code": "CANNOT_DELETE_USER",
    "message": "Cannot delete user with active projects"
  }
}
```

#### Code Examples

**cURL**
```bash
curl -X DELETE https://api.example.com/api/v1/users/usr_123456789 \
  -H "Authorization: Bearer <access_token>"
```

**JavaScript/TypeScript**
```typescript
const response = await fetch(
  `https://api.example.com/api/v1/users/${userId}`,
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
    f'https://api.example.com/api/v1/users/{user_id}',
    headers={'Authorization': f'Bearer {access_token}'}
)

data = response.json()
```

---

### PUT /users/:id/password
Change a user's password.

#### Headers
```
Authorization: Bearer <access_token>
```

#### URL Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | User ID |

#### Request Body
```json
{
  "currentPassword": "OldPassword123!",
  "newPassword": "NewSecurePassword123!"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| currentPassword | string | Yes | Current password |
| newPassword | string | Yes | New password (min 8 chars) |

#### Response (200 OK)
```json
{
  "success": true,
  "message": "Password successfully changed"
}
```

#### Error Responses

**400 Bad Request**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_PASSWORD",
    "message": "Current password is incorrect"
  }
}
```

#### Code Examples

**cURL**
```bash
curl -X PUT https://api.example.com/api/v1/users/usr_123456789/password \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "OldPassword123!",
    "newPassword": "NewSecurePassword123!"
  }'
```

**JavaScript/TypeScript**
```typescript
const response = await fetch(
  `https://api.example.com/api/v1/users/${userId}/password`,
  {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      currentPassword: 'OldPassword123!',
      newPassword: 'NewSecurePassword123!',
    }),
  }
);

const data = await response.json();
```

**Python**
```python
import requests

response = requests.put(
    f'https://api.example.com/api/v1/users/{user_id}/password',
    json={
        'currentPassword': 'OldPassword123!',
        'newPassword': 'NewSecurePassword123!'
    },
    headers={'Authorization': f'Bearer {access_token}'}
)

data = response.json()
```

---

### GET /users/:id/projects
Get all projects a user is a member of.

#### Headers
```
Authorization: Bearer <access_token>
```

#### URL Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | User ID |

#### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| page | integer | No | 1 | Page number |
| limit | integer | No | 20 | Items per page |
| role | string | No | - | Filter by project role (owner, admin, member, viewer) |

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
        "role": "admin",
        "joinedAt": "2024-01-15T10:30:00Z",
        "testCasesCount": 42,
        "lastActivity": "2024-01-23T14:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 5,
      "totalPages": 1
    }
  }
}
```

#### Code Examples

**cURL**
```bash
curl -X GET "https://api.example.com/api/v1/users/usr_123456789/projects" \
  -H "Authorization: Bearer <access_token>"
```

**JavaScript/TypeScript**
```typescript
const response = await fetch(
  `https://api.example.com/api/v1/users/${userId}/projects`,
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
    f'https://api.example.com/api/v1/users/{user_id}/projects',
    headers={'Authorization': f'Bearer {access_token}'}
)

data = response.json()
```

---

## User Roles

| Role | Description | Permissions |
|------|-------------|-------------|
| admin | System administrator | Full access to all resources |
| manager | Project manager | Create projects, manage users in projects |
| tester | Test engineer | Create and execute tests |
| viewer | Read-only user | View projects and test results |

## Common Error Codes

| Code | Description |
|------|-------------|
| USER_NOT_FOUND | User does not exist |
| EMAIL_EXISTS | Email already in use |
| INSUFFICIENT_PERMISSIONS | User lacks required permissions |
| INVALID_PASSWORD | Password is incorrect |
| CANNOT_DELETE_USER | User cannot be deleted (has dependencies) |
| VALIDATION_ERROR | Request validation failed |
