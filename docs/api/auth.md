# Authentication API

The Authentication API handles user authentication, registration, password management, and session management.

## Base URL
```
/api/v1/auth
```

## Authentication
Most endpoints require no authentication except `/auth/me` which requires a valid JWT token.

## Rate Limiting
- Login attempts: 5 requests per 15 minutes per IP
- Registration: 3 requests per hour per IP
- Password reset: 3 requests per hour per email
- Other endpoints: 100 requests per 15 minutes

---

## Endpoints

### POST /auth/login
Authenticate a user and receive access and refresh tokens.

#### Request Body
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "rememberMe": true
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| email | string | Yes | User's email address |
| password | string | Yes | User's password |
| rememberMe | boolean | No | Extends token expiration (default: false) |

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "usr_123456789",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "tester",
      "createdAt": "2024-01-15T10:30:00Z"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expiresIn": 3600
    }
  }
}
```

#### Error Responses

**401 Unauthorized**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Invalid email or password"
  }
}
```

**429 Too Many Requests**
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many login attempts. Please try again later.",
    "retryAfter": 900
  }
}
```

#### Code Examples

**cURL**
```bash
curl -X POST https://api.example.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePassword123!",
    "rememberMe": true
  }'
```

**JavaScript/TypeScript**
```typescript
const response = await fetch('https://api.example.com/api/v1/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'SecurePassword123!',
    rememberMe: true,
  }),
});

const data = await response.json();
```

**Python**
```python
import requests

response = requests.post(
    'https://api.example.com/api/v1/auth/login',
    json={
        'email': 'user@example.com',
        'password': 'SecurePassword123!',
        'rememberMe': True
    }
)

data = response.json()
```

---

### POST /auth/register
Register a new user account.

#### Request Body
```json
{
  "email": "newuser@example.com",
  "password": "SecurePassword123!",
  "firstName": "Jane",
  "lastName": "Smith",
  "organization": "Acme Inc"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| email | string | Yes | User's email address |
| password | string | Yes | Password (min 8 chars, must include uppercase, lowercase, number, special char) |
| firstName | string | Yes | User's first name |
| lastName | string | Yes | User's last name |
| organization | string | No | Organization name |

#### Response (201 Created)
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "usr_987654321",
      "email": "newuser@example.com",
      "firstName": "Jane",
      "lastName": "Smith",
      "role": "tester",
      "createdAt": "2024-01-23T14:30:00Z"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expiresIn": 3600
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
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "password",
        "message": "Password must be at least 8 characters long"
      }
    ]
  }
}
```

**409 Conflict**
```json
{
  "success": false,
  "error": {
    "code": "EMAIL_EXISTS",
    "message": "An account with this email already exists"
  }
}
```

#### Code Examples

**cURL**
```bash
curl -X POST https://api.example.com/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "SecurePassword123!",
    "firstName": "Jane",
    "lastName": "Smith"
  }'
```

**JavaScript/TypeScript**
```typescript
const response = await fetch('https://api.example.com/api/v1/auth/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'newuser@example.com',
    password: 'SecurePassword123!',
    firstName: 'Jane',
    lastName: 'Smith',
  }),
});

const data = await response.json();
```

**Python**
```python
import requests

response = requests.post(
    'https://api.example.com/api/v1/auth/register',
    json={
        'email': 'newuser@example.com',
        'password': 'SecurePassword123!',
        'firstName': 'Jane',
        'lastName': 'Smith'
    }
)

data = response.json()
```

---

### POST /auth/refresh
Refresh an access token using a refresh token.

#### Request Body
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 3600
  }
}
```

#### Error Responses

**401 Unauthorized**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_TOKEN",
    "message": "Invalid or expired refresh token"
  }
}
```

---

### POST /auth/logout
Invalidate the current session and refresh token.

#### Headers
```
Authorization: Bearer <access_token>
```

#### Request Body
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Response (200 OK)
```json
{
  "success": true,
  "message": "Successfully logged out"
}
```

---

### POST /auth/forgot-password
Request a password reset email.

#### Request Body
```json
{
  "email": "user@example.com"
}
```

#### Response (200 OK)
```json
{
  "success": true,
  "message": "If an account exists with this email, a password reset link has been sent"
}
```

#### Code Examples

**cURL**
```bash
curl -X POST https://api.example.com/api/v1/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com"
  }'
```

---

### POST /auth/reset-password
Reset password using a reset token.

#### Request Body
```json
{
  "token": "reset_token_from_email",
  "newPassword": "NewSecurePassword123!"
}
```

#### Response (200 OK)
```json
{
  "success": true,
  "message": "Password has been successfully reset"
}
```

#### Error Responses

**400 Bad Request**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_TOKEN",
    "message": "Invalid or expired reset token"
  }
}
```

---

### GET /auth/me
Get current authenticated user information.

#### Headers
```
Authorization: Bearer <access_token>
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
    "role": "tester",
    "organization": "Acme Inc",
    "avatar": "https://api.example.com/storage/avatars/usr_123456789.jpg",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-23T14:30:00Z",
    "preferences": {
      "theme": "dark",
      "notifications": true,
      "language": "en"
    }
  }
}
```

#### Error Responses

**401 Unauthorized**
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or expired access token"
  }
}
```

#### Code Examples

**cURL**
```bash
curl -X GET https://api.example.com/api/v1/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**JavaScript/TypeScript**
```typescript
const response = await fetch('https://api.example.com/api/v1/auth/me', {
  headers: {
    'Authorization': `Bearer ${accessToken}`,
  },
});

const data = await response.json();
```

**Python**
```python
import requests

response = requests.get(
    'https://api.example.com/api/v1/auth/me',
    headers={'Authorization': f'Bearer {access_token}'}
)

data = response.json()
```

---

## Common Error Codes

| Code | Description |
|------|-------------|
| INVALID_CREDENTIALS | Email or password is incorrect |
| EMAIL_EXISTS | Email already registered |
| VALIDATION_ERROR | Request validation failed |
| INVALID_TOKEN | Token is invalid or expired |
| RATE_LIMIT_EXCEEDED | Too many requests |
| UNAUTHORIZED | Authentication required |

## Token Expiration

- **Access Token**: 1 hour (3600 seconds)
- **Refresh Token**: 30 days (with rememberMe: 90 days)
- **Password Reset Token**: 1 hour
