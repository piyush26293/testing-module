# API Reference

This document provides a comprehensive overview of the AI-Powered Testing Platform API, including authentication, request/response formats, error handling, and links to detailed endpoint documentation.

## Table of Contents

- [Overview](#overview)
- [Authentication](#authentication)
- [Base URL](#base-url)
- [Request & Response Format](#request--response-format)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)
- [Pagination](#pagination)
- [Filtering & Sorting](#filtering--sorting)
- [API Modules](#api-modules)
- [Code Examples](#code-examples)
- [Interactive API Documentation](#interactive-api-documentation)

## Overview

The AI-Powered Testing Platform provides a RESTful API built with NestJS and follows OpenAPI 3.0 specifications. The API supports JSON request/response formats and uses JWT for authentication.

### API Version

- **Current Version**: v1
- **Base Path**: `/api`
- **Documentation**: `/api/docs` (Swagger UI)

### Key Features

- **RESTful Design**: Standard HTTP methods (GET, POST, PATCH, DELETE)
- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access**: Organization and project-level permissions
- **Comprehensive Validation**: Input validation with detailed error messages
- **Rate Limiting**: Protection against abuse
- **Pagination**: Efficient handling of large datasets
- **Real-time Updates**: WebSocket support for live updates
- **File Uploads**: Support for screenshots and artifacts

## Authentication

### Authentication Flow

The API uses JWT (JSON Web Token) for authentication. Here's the typical flow:

```
1. Register/Login → Receive access token & refresh token
2. Include access token in Authorization header
3. When access token expires, use refresh token to get new access token
4. On logout, invalidate refresh token
```

### Token Types

#### Access Token
- **Lifetime**: 15 minutes
- **Storage**: Memory (not localStorage)
- **Usage**: API requests
- **Format**: JWT with user claims

```json
{
  "sub": "user-uuid",
  "email": "user@example.com",
  "role": "admin",
  "organizationId": "org-uuid",
  "iat": 1705123456,
  "exp": 1705124356
}
```

#### Refresh Token
- **Lifetime**: 7 days
- **Storage**: HttpOnly cookie or secure storage
- **Usage**: Obtaining new access token
- **Format**: Opaque token (stored in Redis)

### Authentication Endpoints

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response** (201 Created):
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "user"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "refresh-token-string"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response** (200 OK):
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "admin"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "refresh-token-string"
}
```

#### Refresh Token
```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "refresh-token-string"
}
```

**Response** (200 OK):
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "new-refresh-token-string"
}
```

#### Logout
```http
POST /api/auth/logout
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "refreshToken": "refresh-token-string"
}
```

**Response** (200 OK):
```json
{
  "message": "Logged out successfully"
}
```

### Using Authentication

All authenticated requests must include the JWT access token in the Authorization header:

```http
GET /api/projects
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Password Requirements

- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

## Base URL

### Environments

#### Development
```
API: http://localhost:3001/api
Swagger: http://localhost:3001/api/docs
```

#### Staging
```
API: https://staging-api.example.com/api
Swagger: https://staging-api.example.com/api/docs
```

#### Production
```
API: https://api.example.com/api
Swagger: https://api.example.com/api/docs
```

## Request & Response Format

### Content Type

All requests and responses use JSON format:

```http
Content-Type: application/json
Accept: application/json
```

### Standard Response Structure

#### Success Response
```json
{
  "data": {
    // Response data
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z",
    "version": "1.0.0"
  }
}
```

#### List Response (with pagination)
```json
{
  "data": [
    // Array of items
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5,
    "hasNext": true,
    "hasPrevious": false
  }
}
```

### Request Headers

#### Required Headers
```http
Content-Type: application/json
Authorization: Bearer {token}  // For authenticated requests
```

#### Optional Headers
```http
X-Request-ID: unique-request-id  // For request tracing
Accept-Language: en-US           // For localization
```

### HTTP Methods

| Method | Usage | Idempotent |
|--------|-------|------------|
| GET | Retrieve resources | Yes |
| POST | Create resources | No |
| PATCH | Partial update | No |
| PUT | Full update (rarely used) | Yes |
| DELETE | Remove resources | Yes |

## Error Handling

### Error Response Format

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "errors": [
    {
      "field": "email",
      "message": "Email must be a valid email address"
    },
    {
      "field": "password",
      "message": "Password must be at least 8 characters long"
    }
  ],
  "timestamp": "2024-01-15T10:30:00Z",
  "path": "/api/auth/register"
}
```

### HTTP Status Codes

#### Success Codes
| Code | Status | Description |
|------|--------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created |
| 204 | No Content | Successful deletion |

#### Client Error Codes
| Code | Status | Description |
|------|--------|-------------|
| 400 | Bad Request | Invalid request data |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource already exists |
| 422 | Unprocessable Entity | Validation error |
| 429 | Too Many Requests | Rate limit exceeded |

#### Server Error Codes
| Code | Status | Description |
|------|--------|-------------|
| 500 | Internal Server Error | Server error |
| 502 | Bad Gateway | Upstream service error |
| 503 | Service Unavailable | Service temporarily unavailable |
| 504 | Gateway Timeout | Request timeout |

### Common Error Scenarios

#### Authentication Errors

**Invalid Credentials** (401):
```json
{
  "statusCode": 401,
  "message": "Invalid email or password",
  "error": "Unauthorized"
}
```

**Expired Token** (401):
```json
{
  "statusCode": 401,
  "message": "Token has expired",
  "error": "Unauthorized"
}
```

**Insufficient Permissions** (403):
```json
{
  "statusCode": 403,
  "message": "You don't have permission to access this resource",
  "error": "Forbidden"
}
```

#### Validation Errors

**Missing Required Fields** (400):
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "errors": [
    {
      "field": "name",
      "message": "name should not be empty"
    }
  ]
}
```

#### Resource Errors

**Not Found** (404):
```json
{
  "statusCode": 404,
  "message": "Project with ID 'abc-123' not found",
  "error": "Not Found"
}
```

**Conflict** (409):
```json
{
  "statusCode": 409,
  "message": "Project with this name already exists",
  "error": "Conflict"
}
```

#### Rate Limiting

**Too Many Requests** (429):
```json
{
  "statusCode": 429,
  "message": "Too many requests from this IP, please try again later",
  "error": "Too Many Requests",
  "retryAfter": 60
}
```

## Rate Limiting

The API implements rate limiting to prevent abuse and ensure fair usage.

### Rate Limit Rules

| Endpoint Category | Limit | Window |
|-------------------|-------|--------|
| Authentication | 5 requests | 1 minute |
| General API | 100 requests | 1 minute |
| AI Generation | 10 requests | 1 hour |
| File Upload | 20 requests | 1 hour |
| Report Generation | 30 requests | 1 hour |

### Rate Limit Headers

Every API response includes rate limit information:

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1705123456
```

### Rate Limit Exceeded

When rate limit is exceeded:

```http
HTTP/1.1 429 Too Many Requests
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1705123456
Retry-After: 60

{
  "statusCode": 429,
  "message": "Rate limit exceeded. Please try again in 60 seconds",
  "error": "Too Many Requests"
}
```

## Pagination

List endpoints support pagination to handle large datasets efficiently.

### Pagination Parameters

```http
GET /api/projects?page=1&limit=20
```

**Parameters**:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 100)

### Pagination Response

```json
{
  "data": [
    // Array of items
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 156,
    "totalPages": 8,
    "hasNext": true,
    "hasPrevious": false
  }
}
```

### Cursor-Based Pagination

For real-time data (e.g., execution logs):

```http
GET /api/executions/logs?cursor=abc123&limit=50
```

**Response**:
```json
{
  "data": [
    // Array of logs
  ],
  "meta": {
    "nextCursor": "def456",
    "hasMore": true
  }
}
```

## Filtering & Sorting

### Filtering

Filter results using query parameters:

```http
GET /api/test-cases?status=active&priority=high&tags=smoke,regression
```

**Common Filter Parameters**:
- `status`: Filter by status
- `search`: Full-text search
- `createdBy`: Filter by creator
- `createdAfter`: Filter by creation date
- `tags`: Filter by tags (comma-separated)

### Sorting

Sort results using `sortBy` and `order`:

```http
GET /api/projects?sortBy=createdAt&order=DESC
```

**Parameters**:
- `sortBy`: Field to sort by (e.g., `name`, `createdAt`)
- `order`: Sort direction (`ASC` or `DESC`)

### Combined Example

```http
GET /api/test-cases?status=active&priority=high&sortBy=createdAt&order=DESC&page=1&limit=20
```

## API Modules

### Authentication API
Endpoints for user authentication and authorization.

**Base Path**: `/api/auth`

**Endpoints**:
- `POST /register` - User registration
- `POST /login` - User login
- `POST /logout` - User logout
- `POST /refresh` - Refresh access token
- `POST /forgot-password` - Request password reset
- `POST /reset-password` - Reset password
- `POST /verify-email` - Verify email address

**Documentation**: [Authentication API](api/auth.md)

### Users API
Endpoints for user management and profile.

**Base Path**: `/api/users`

**Endpoints**:
- `GET /users` - List users
- `GET /users/:id` - Get user by ID
- `GET /users/me` - Get current user
- `PATCH /users/:id` - Update user
- `DELETE /users/:id` - Delete user
- `PATCH /users/me/password` - Change password
- `POST /users/:id/avatar` - Upload avatar

**Documentation**: [Users API](api/users.md)

### Organizations API
Endpoints for organization/tenant management.

**Base Path**: `/api/organizations`

**Endpoints**:
- `POST /organizations` - Create organization
- `GET /organizations` - List organizations
- `GET /organizations/:id` - Get organization
- `PATCH /organizations/:id` - Update organization
- `DELETE /organizations/:id` - Delete organization
- `POST /organizations/:id/members` - Add member
- `DELETE /organizations/:id/members/:userId` - Remove member

**Documentation**: [Organizations API](api/organizations.md)

### Projects API
Endpoints for project management.

**Base Path**: `/api/projects`

**Endpoints**:
- `POST /projects` - Create project
- `GET /projects` - List projects
- `GET /projects/:id` - Get project
- `PATCH /projects/:id` - Update project
- `DELETE /projects/:id` - Delete project
- `POST /projects/:id/members` - Add team member
- `PATCH /projects/:id/members/:userId` - Update member role
- `DELETE /projects/:id/members/:userId` - Remove member

**Documentation**: [Projects API](api/projects.md)

### Test Cases API
Endpoints for test case management.

**Base Path**: `/api/test-cases`

**Endpoints**:
- `POST /test-cases` - Create test case
- `GET /test-cases` - List test cases
- `GET /test-cases/:id` - Get test case
- `PATCH /test-cases/:id` - Update test case
- `DELETE /test-cases/:id` - Delete test case
- `POST /test-cases/:id/clone` - Clone test case
- `POST /test-cases/bulk-import` - Bulk import
- `GET /test-cases/export` - Export test cases

**Documentation**: [Test Cases API](api/test-cases.md)

### Test Suites API
Endpoints for test suite management.

**Base Path**: `/api/test-suites`

**Endpoints**:
- `POST /test-suites` - Create test suite
- `GET /test-suites` - List test suites
- `GET /test-suites/:id` - Get test suite
- `PATCH /test-suites/:id` - Update test suite
- `DELETE /test-suites/:id` - Delete test suite
- `POST /test-suites/:id/tests` - Add tests to suite
- `DELETE /test-suites/:id/tests/:testId` - Remove test
- `POST /test-suites/:id/execute` - Execute suite
- `POST /test-suites/:id/schedule` - Schedule execution

**Documentation**: [Test Suites API](api/test-suites.md)

### Executions API
Endpoints for test execution and monitoring.

**Base Path**: `/api/executions`

**Endpoints**:
- `POST /executions` - Start execution
- `GET /executions` - List executions
- `GET /executions/:id` - Get execution details
- `POST /executions/:id/stop` - Stop execution
- `POST /executions/:id/retry` - Retry failed tests
- `GET /executions/:id/logs` - Get execution logs
- `GET /executions/:id/screenshots` - Get screenshots
- `GET /executions/:id/video` - Get video recording
- `GET /executions/:id/artifacts` - Get artifacts

**Documentation**: [Executions API](api/executions.md)

### Reports API
Endpoints for report generation and analytics.

**Base Path**: `/api/reports`

**Endpoints**:
- `POST /reports/generate` - Generate report
- `GET /reports` - List reports
- `GET /reports/:id` - Get report
- `DELETE /reports/:id` - Delete report
- `GET /reports/:id/export` - Export report
- `GET /reports/dashboard` - Get dashboard data
- `GET /reports/trends` - Get trend analysis
- `GET /reports/metrics` - Get execution metrics

**Documentation**: [Reports API](api/reports.md)

### Storage API
Endpoints for file storage and management.

**Base Path**: `/api/storage`

**Endpoints**:
- `POST /storage/upload` - Upload file
- `GET /storage/:id` - Get file
- `DELETE /storage/:id` - Delete file
- `GET /storage/:id/url` - Get pre-signed URL
- `POST /storage/bulk-upload` - Bulk upload
- `GET /storage/files` - List files

**Documentation**: [Storage API](api/storage.md)

### AI Engine API
Endpoints for AI-powered features.

**Base Path**: `/api/ai`

**Endpoints**:
- `POST /ai/generate-test` - Generate test from description
- `POST /ai/improve-test` - Suggest test improvements
- `POST /ai/fix-locator` - Suggest locator fixes
- `POST /ai/analyze-failure` - Analyze test failure
- `POST /ai/optimize-suite` - Optimize test suite
- `GET /ai/suggestions` - Get AI suggestions

**Documentation**: [AI Engine API](api/ai-engine.md)

## Code Examples

### JavaScript/TypeScript (Axios)

```typescript
import axios from 'axios';

// Create API client
const api = axios.create({
  baseURL: 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for authentication
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const { data } = await axios.post(
            'http://localhost:3001/api/auth/refresh',
            { refreshToken }
          );
          localStorage.setItem('accessToken', data.accessToken);
          localStorage.setItem('refreshToken', data.refreshToken);
          
          // Retry original request
          error.config.headers.Authorization = `Bearer ${data.accessToken}`;
          return api(error.config);
        } catch (refreshError) {
          // Redirect to login
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

// Usage examples
async function examples() {
  // Login
  const { data: authData } = await api.post('/auth/login', {
    email: 'user@example.com',
    password: 'SecurePass123!',
  });
  localStorage.setItem('accessToken', authData.accessToken);
  localStorage.setItem('refreshToken', authData.refreshToken);

  // Create project
  const { data: project } = await api.post('/projects', {
    name: 'My Project',
    description: 'Project description',
  });

  // List test cases
  const { data: testCases } = await api.get('/test-cases', {
    params: {
      projectId: project.data.id,
      status: 'active',
      page: 1,
      limit: 20,
    },
  });

  // Create test case
  const { data: testCase } = await api.post('/test-cases', {
    projectId: project.data.id,
    name: 'Login Test',
    description: 'Test user login functionality',
    steps: [
      {
        action: 'navigate',
        target: 'https://example.com/login',
      },
      {
        action: 'fill',
        target: '#email',
        value: 'test@example.com',
      },
      {
        action: 'fill',
        target: '#password',
        value: 'password123',
      },
      {
        action: 'click',
        target: '#login-button',
      },
    ],
    priority: 'high',
    tags: ['smoke', 'authentication'],
  });

  // Execute test
  const { data: execution } = await api.post('/executions', {
    testCaseId: testCase.data.id,
    environment: 'staging',
    browser: 'chromium',
  });

  // Check execution status
  const { data: executionStatus } = await api.get(
    `/executions/${execution.data.id}`
  );

  // Generate AI test
  const { data: aiTest } = await api.post('/ai/generate-test', {
    description: 'Test the checkout process with valid credit card',
    projectId: project.data.id,
  });
}
```

### Python (Requests)

```python
import requests
from typing import Dict, Optional

class TestingPlatformAPI:
    def __init__(self, base_url: str = "http://localhost:3001/api"):
        self.base_url = base_url
        self.access_token: Optional[str] = None
        self.refresh_token: Optional[str] = None
        self.session = requests.Session()
    
    def login(self, email: str, password: str) -> Dict:
        """Login and store tokens"""
        response = self.session.post(
            f"{self.base_url}/auth/login",
            json={"email": email, "password": password}
        )
        response.raise_for_status()
        data = response.json()
        
        self.access_token = data["accessToken"]
        self.refresh_token = data["refreshToken"]
        self.session.headers.update({
            "Authorization": f"Bearer {self.access_token}"
        })
        return data
    
    def refresh_access_token(self) -> Dict:
        """Refresh the access token"""
        response = self.session.post(
            f"{self.base_url}/auth/refresh",
            json={"refreshToken": self.refresh_token}
        )
        response.raise_for_status()
        data = response.json()
        
        self.access_token = data["accessToken"]
        self.refresh_token = data["refreshToken"]
        self.session.headers.update({
            "Authorization": f"Bearer {self.access_token}"
        })
        return data
    
    def create_project(self, name: str, description: str = "") -> Dict:
        """Create a new project"""
        response = self.session.post(
            f"{self.base_url}/projects",
            json={"name": name, "description": description}
        )
        response.raise_for_status()
        return response.json()
    
    def create_test_case(self, project_id: str, name: str, steps: list) -> Dict:
        """Create a new test case"""
        response = self.session.post(
            f"{self.base_url}/test-cases",
            json={
                "projectId": project_id,
                "name": name,
                "steps": steps,
                "priority": "high"
            }
        )
        response.raise_for_status()
        return response.json()
    
    def execute_test(self, test_case_id: str, environment: str = "staging") -> Dict:
        """Execute a test case"""
        response = self.session.post(
            f"{self.base_url}/executions",
            json={
                "testCaseId": test_case_id,
                "environment": environment,
                "browser": "chromium"
            }
        )
        response.raise_for_status()
        return response.json()
    
    def get_execution_status(self, execution_id: str) -> Dict:
        """Get execution status"""
        response = self.session.get(
            f"{self.base_url}/executions/{execution_id}"
        )
        response.raise_for_status()
        return response.json()

# Usage
api = TestingPlatformAPI()
api.login("user@example.com", "SecurePass123!")

project = api.create_project("My Python Project", "Automated tests")
project_id = project["data"]["id"]

test_case = api.create_test_case(
    project_id,
    "Login Test",
    [
        {"action": "navigate", "target": "https://example.com/login"},
        {"action": "fill", "target": "#email", "value": "test@example.com"},
        {"action": "fill", "target": "#password", "value": "password123"},
        {"action": "click", "target": "#login-button"}
    ]
)

execution = api.execute_test(test_case["data"]["id"])
status = api.get_execution_status(execution["data"]["id"])
print(f"Execution status: {status['data']['status']}")
```

### cURL

```bash
# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"SecurePass123!"}' \
  | jq '.'

# Store token (in bash)
TOKEN=$(curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"SecurePass123!"}' \
  | jq -r '.accessToken')

# Create project
curl -X POST http://localhost:3001/api/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"My Project","description":"Test project"}' \
  | jq '.'

# List test cases
curl -X GET "http://localhost:3001/api/test-cases?page=1&limit=20" \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.'

# Create test case
curl -X POST http://localhost:3001/api/test-cases \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "projectId": "project-uuid",
    "name": "Login Test",
    "steps": [
      {"action": "navigate", "target": "https://example.com/login"},
      {"action": "fill", "target": "#email", "value": "test@example.com"}
    ],
    "priority": "high"
  }' \
  | jq '.'

# Execute test
curl -X POST http://localhost:3001/api/executions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "testCaseId": "test-case-uuid",
    "environment": "staging",
    "browser": "chromium"
  }' \
  | jq '.'
```

## Interactive API Documentation

The platform provides interactive API documentation using Swagger UI.

### Accessing Swagger UI

**Development**:
```
http://localhost:3001/api/docs
```

**Production**:
```
https://api.example.com/api/docs
```

### Features

- **Interactive Testing**: Try out API endpoints directly from the browser
- **Authentication**: Configure JWT token for authenticated requests
- **Schema Exploration**: View request/response schemas
- **Example Values**: See example requests and responses
- **Response Codes**: View all possible response codes
- **Download**: Export OpenAPI specification

### Using Swagger UI

1. Open Swagger UI in your browser
2. Click "Authorize" button (top right)
3. Enter your JWT token: `Bearer {your-token}`
4. Click "Authorize" to save
5. Try any endpoint by clicking "Try it out"
6. Fill in parameters and click "Execute"
7. View the response below

## Webhooks

The platform supports webhooks for real-time notifications.

### Configuring Webhooks

```http
POST /api/webhooks
Authorization: Bearer {token}
Content-Type: application/json

{
  "url": "https://your-server.com/webhook",
  "events": ["execution.completed", "execution.failed"],
  "secret": "your-webhook-secret"
}
```

### Webhook Events

- `execution.started` - Test execution started
- `execution.completed` - Test execution completed
- `execution.failed` - Test execution failed
- `report.generated` - Report generated
- `test.created` - Test case created
- `test.updated` - Test case updated

### Webhook Payload

```json
{
  "event": "execution.completed",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "executionId": "uuid",
    "status": "passed",
    "duration": 45000,
    "testCase": {
      "id": "uuid",
      "name": "Login Test"
    }
  },
  "signature": "sha256=..."
}
```

## WebSocket API

Real-time updates for test executions and system events.

### Connection

```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:3001', {
  auth: {
    token: accessToken,
  },
});

// Listen to execution updates
socket.on('execution:update', (data) => {
  console.log('Execution update:', data);
});

// Listen to log updates
socket.on('execution:log', (data) => {
  console.log('New log:', data);
});

// Join execution room
socket.emit('execution:join', { executionId: 'uuid' });
```

### Events

- `execution:update` - Execution status update
- `execution:log` - New log entry
- `execution:screenshot` - Screenshot captured
- `execution:completed` - Execution completed
- `execution:failed` - Execution failed

## Additional Resources

### Related Documentation
- [Architecture Overview](ARCHITECTURE.md) - System architecture
- [Developer Guide](DEVELOPER_GUIDE.md) - Development guidelines
- [User Guide](USER_GUIDE.md) - End-user documentation

### External Resources
- [OpenAPI Specification](https://swagger.io/specification/)
- [JWT.io](https://jwt.io/) - JWT debugger
- [HTTP Status Codes](https://httpstatuses.com/)

### Support
- **GitHub Issues**: Report bugs and request features
- **API Status**: Check service status
- **Rate Limit**: Monitor your usage

---

For detailed information about specific API modules, refer to the individual documentation files in the `api/` directory.
