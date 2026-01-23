# API Documentation Index

Complete API reference for the Testing Module platform.

## Available API Modules

### [Authentication API](./auth.md)
User authentication, registration, and session management.

**Key Endpoints:**
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `POST /auth/refresh` - Refresh tokens
- `POST /auth/logout` - User logout
- `POST /auth/forgot-password` - Password reset request
- `POST /auth/reset-password` - Reset password
- `GET /auth/me` - Get current user

---

### [Users API](./users.md)
User account management and permissions.

**Key Endpoints:**
- `GET /users` - List users
- `GET /users/:id` - Get user details
- `POST /users` - Create user
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user
- `PUT /users/:id/password` - Change password
- `GET /users/:id/projects` - Get user projects

---

### [Projects API](./projects.md)
Project management and team collaboration.

**Key Endpoints:**
- `GET /projects` - List projects
- `POST /projects` - Create project
- `GET /projects/:id` - Get project details
- `PUT /projects/:id` - Update project
- `DELETE /projects/:id` - Delete project
- `POST /projects/:id/members` - Add team member
- `DELETE /projects/:id/members/:userId` - Remove member
- `GET /projects/:id/test-cases` - Get project test cases

---

### [Test Cases API](./test-cases.md)
Test case creation and management.

**Key Endpoints:**
- `GET /test-cases` - List test cases
- `POST /test-cases` - Create test case
- `GET /test-cases/:id` - Get test case details
- `PUT /test-cases/:id` - Update test case
- `DELETE /test-cases/:id` - Delete test case
- `POST /test-cases/:id/steps` - Add test step
- `PUT /test-cases/:id/steps/:stepId` - Update step
- `DELETE /test-cases/:id/steps/:stepId` - Delete step

---

### [Test Suites API](./test-suites.md)
Test suite organization and scheduling.

**Key Endpoints:**
- `GET /test-suites` - List test suites
- `POST /test-suites` - Create test suite
- `GET /test-suites/:id` - Get suite details
- `PUT /test-suites/:id` - Update suite
- `DELETE /test-suites/:id` - Delete suite
- `POST /test-suites/:id/test-cases` - Add test case to suite
- `DELETE /test-suites/:id/test-cases/:testCaseId` - Remove test case

---

### [Executions API](./executions.md)
Test execution and real-time monitoring.

**Key Endpoints:**
- `POST /executions` - Start execution
- `GET /executions` - List executions
- `GET /executions/:id` - Get execution details
- `DELETE /executions/:id` - Delete execution
- `POST /executions/:id/stop` - Stop running execution
- `GET /executions/:id/results` - Get test results
- `GET /executions/:id/logs` - Get execution logs

---

### [Reports API](./reports.md)
Report generation and analytics.

**Key Endpoints:**
- `GET /reports` - List reports
- `GET /reports/:id` - Get report details
- `POST /reports/generate` - Generate new report
- `GET /reports/:id/export` - Export report (PDF/HTML/JSON/CSV/XLSX)
- `GET /reports/trends` - Get trend analysis
- `GET /reports/metrics` - Get performance metrics

---

### [AI Engine API](./ai-engine.md)
AI-powered test generation and optimization.

**Key Endpoints:**
- `POST /ai/generate-test` - Generate test from description
- `POST /ai/heal-locator` - Self-healing selector suggestions
- `POST /ai/analyze-failure` - AI failure analysis
- `POST /ai/suggest-improvements` - Get optimization suggestions

---

### [Storage API](./storage.md)
File storage and artifact management.

**Key Endpoints:**
- `POST /storage/upload` - Upload file
- `GET /storage/files/:id` - Get file info
- `DELETE /storage/files/:id` - Delete file
- `GET /storage/files/:id/download` - Download file
- `GET /storage/screenshots/:executionId` - Get execution screenshots
- `GET /storage/videos/:executionId` - Get execution videos

---

## Quick Start

### Base URL
```
https://api.example.com/api/v1
```

### Authentication
All API requests (except auth endpoints) require a valid JWT token in the Authorization header:

```bash
Authorization: Bearer <your_access_token>
```

### Rate Limiting
Default rate limits:
- **Standard operations**: 100 requests per 15 minutes
- **Heavy operations** (executions, AI): 10-20 requests per 15 minutes
- **Uploads**: 30 requests per 15 minutes

Rate limit headers are included in every response:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1706025600
```

### Response Format
All responses follow this structure:

**Success Response:**
```json
{
  "success": true,
  "data": { ... }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": [ ... ]
  }
}
```

### Common HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (authentication required) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not Found |
| 409 | Conflict (duplicate or constraint violation) |
| 413 | Payload Too Large |
| 429 | Too Many Requests (rate limit exceeded) |
| 500 | Internal Server Error |

---

## Pagination

List endpoints support pagination with these query parameters:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | integer | 1 | Page number |
| limit | integer | 20 | Items per page (max: 100) |

**Response format:**
```json
{
  "success": true,
  "data": {
    "items": [ ... ],
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

## Filtering and Sorting

Most list endpoints support filtering and sorting:

**Filtering:**
```
GET /api/v1/test-cases?status=active&priority=high
```

**Sorting:**
```
GET /api/v1/test-cases?sortBy=createdAt&sortOrder=desc
```

**Search:**
```
GET /api/v1/test-cases?search=login
```

---

## Timestamps

All timestamps are in ISO 8601 format with UTC timezone:
```
2024-01-23T16:00:00Z
```

---

## Versioning

The API is versioned using URL path versioning:
```
/api/v1/...
```

Breaking changes will result in a new version (`v2`, `v3`, etc.).

---

## Client Libraries

Official client libraries:
- **JavaScript/TypeScript**: `@testing-module/client`
- **Python**: `testing-module-client`
- **Java**: `com.testingmodule:client`
- **Go**: `github.com/testing-module/go-client`

---

## Support

- **Documentation**: [docs.testing-module.com](https://docs.testing-module.com)
- **API Status**: [status.testing-module.com](https://status.testing-module.com)
- **Support**: support@testing-module.com
- **GitHub**: [github.com/testing-module](https://github.com/testing-module)

---

## Additional Resources

- [Getting Started Guide](../GETTING_STARTED.md)
- [User Guide](../USER_GUIDE.md)
- [Developer Guide](../DEVELOPER_GUIDE.md)
- [Architecture Overview](../ARCHITECTURE.md)
- [Deployment Guide](../DEPLOYMENT_GUIDE.md)
