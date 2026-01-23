# Authentication Module

Complete authentication module for the Testing Platform Backend using JWT tokens, refresh tokens, and bcrypt password hashing.

## Features

- ✅ User registration with validation
- ✅ Login with email/password
- ✅ JWT access tokens
- ✅ Refresh token rotation
- ✅ Token revocation on logout
- ✅ Password hashing with bcrypt
- ✅ Passport JWT strategy
- ✅ Protected routes with JWT guard
- ✅ OpenAPI/Swagger documentation

## Module Structure

```
src/modules/auth/
├── auth.module.ts           # Module configuration
├── auth.controller.ts       # REST API endpoints
├── auth.service.ts          # Business logic
├── jwt.strategy.ts          # Passport JWT strategy
├── dto/
│   ├── register.dto.ts      # Registration validation
│   ├── login.dto.ts         # Login validation
│   ├── refresh-token.dto.ts # Refresh token validation
│   └── index.ts
└── index.ts
```

## API Endpoints

### POST /auth/register
Register a new user account.

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "Password123!",
  "firstName": "John",
  "lastName": "Doe",
  "organizationId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Response:**
```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "john.doe@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "viewer",
    "isActive": true,
    "createdAt": "2024-01-23T10:00:00Z"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": "1d"
}
```

### POST /auth/login
Login with email and password.

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "Password123!"
}
```

**Response:**
```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "john.doe@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "viewer"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": "1d"
}
```

### POST /auth/refresh
Refresh the access token using a refresh token.

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "john.doe@example.com",
    "firstName": "John",
    "lastName": "Doe"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": "1d"
}
```

### POST /auth/logout
Logout and revoke the refresh token. Requires authentication.

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "message": "Successfully logged out"
}
```

### GET /auth/me
Get current authenticated user information. Requires authentication.

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "john.doe@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "role": "viewer",
  "organizationId": "550e8400-e29b-41d4-a716-446655440000",
  "isActive": true,
  "emailVerified": false,
  "lastLoginAt": "2024-01-23T10:00:00Z",
  "createdAt": "2024-01-23T09:00:00Z",
  "updatedAt": "2024-01-23T10:00:00Z"
}
```

## Usage in App Module

Import the `AuthModule` in your `app.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    AuthModule,
    // ... other modules
  ],
})
export class AppModule {}
```

## Protecting Routes

### Using JWT Guard

Protect routes by applying the `JwtAuthGuard`:

```typescript
import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('protected')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ProtectedController {
  @Get()
  getProtectedData() {
    return { message: 'This is protected data' };
  }
}
```

### Public Routes

Mark routes as public using the `@Public()` decorator:

```typescript
import { Controller, Get } from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';

@Controller('public')
export class PublicController {
  @Public()
  @Get()
  getPublicData() {
    return { message: 'This is public data' };
  }
}
```

### Getting Current User

Use the `@CurrentUser()` decorator to access the authenticated user:

```typescript
import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('profile')
@UseGuards(JwtAuthGuard)
export class ProfileController {
  @Get()
  getProfile(@CurrentUser() user: any) {
    return { userId: user.id, email: user.email };
  }

  @Get('name')
  getName(@CurrentUser('firstName') firstName: string) {
    return { firstName };
  }
}
```

## Environment Variables

Configure the following environment variables in your `.env` file:

```bash
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRATION=1d
JWT_REFRESH_SECRET=your-super-secret-refresh-key
JWT_REFRESH_EXPIRATION=7d
```

## Password Requirements

Passwords must meet the following criteria:
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character (@$!%*?&)

## Security Features

- **Password Hashing**: Uses bcrypt with 10 salt rounds
- **Token Expiration**: Access tokens expire after 1 day (configurable)
- **Refresh Token Rotation**: New refresh tokens are issued on each refresh
- **Token Revocation**: Refresh tokens are revoked on logout
- **Inactive User Check**: Prevents login for inactive accounts

## Database Entities

The module uses the following entities:

### User Entity
- Located at: `src/database/entities/user.entity.ts`
- Fields: id, email, passwordHash, firstName, lastName, role, organizationId, isActive, etc.

### RefreshToken Entity
- Located at: `src/database/entities/refresh-token.entity.ts`
- Fields: id, userId, token, expiresAt, revokedAt, createdAt

## Dependencies

The module requires the following packages (already in package.json):
- `@nestjs/jwt` - JWT token generation and verification
- `@nestjs/passport` - Passport integration
- `passport-jwt` - JWT passport strategy
- `bcrypt` - Password hashing
- `class-validator` - DTO validation
- `class-transformer` - DTO transformation
- `@nestjs/swagger` - API documentation

## Testing

Example test for login endpoint:

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            login: jest.fn(),
            register: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
```

## Troubleshooting

### Invalid Token Error
- Ensure the JWT_SECRET environment variable matches across services
- Check token expiration time
- Verify the Authorization header format: `Bearer <token>`

### Password Validation Failed
- Ensure password meets all requirements
- Check for leading/trailing spaces

### User Not Found
- Verify the user exists in the database
- Check if the user account is active
- Ensure email is correctly formatted

## Future Enhancements

Potential improvements:
- Email verification
- Password reset functionality
- Two-factor authentication (2FA)
- Social login (OAuth)
- Rate limiting for login attempts
- Session management
- Remember me functionality
