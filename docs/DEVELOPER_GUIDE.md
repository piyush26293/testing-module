# Developer Guide

This guide provides comprehensive information for developers contributing to or extending the AI-Powered Testing Platform. It covers code structure, development workflow, coding standards, testing guidelines, and best practices.

## Table of Contents

- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Development Environment](#development-environment)
- [Coding Standards](#coding-standards)
- [Development Workflow](#development-workflow)
- [Backend Development](#backend-development)
- [Frontend Development](#frontend-development)
- [Database Management](#database-management)
- [Testing Guidelines](#testing-guidelines)
- [Adding New Features](#adding-new-features)
- [API Development](#api-development)
- [State Management](#state-management)
- [Security Best Practices](#security-best-practices)
- [Performance Optimization](#performance-optimization)
- [Debugging](#debugging)
- [Contributing](#contributing)

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

```bash
# Required
Node.js >= 18.0.0
npm >= 9.0.0
Docker >= 20.10.0
Docker Compose >= 2.0.0
Git >= 2.30.0

# Optional but recommended
PostgreSQL >= 15.0 (for local development without Docker)
Redis >= 7.0 (for local development without Docker)
```

### Initial Setup

1. **Clone the Repository**
   ```bash
   git clone https://github.com/piyush26293/testing-module.git
   cd testing-module
   ```

2. **Install Dependencies**
   ```bash
   # Install root dependencies
   npm install

   # Install backend dependencies
   cd backend
   npm install

   # Install frontend dependencies (when available)
   cd ../frontend
   npm install
   cd ..
   ```

3. **Environment Configuration**
   ```bash
   # Copy example environment files
   cp backend/.env.example backend/.env
   
   # Edit environment variables
   nano backend/.env
   ```

   **Key Environment Variables**:
   ```env
   # Database
   DATABASE_HOST=localhost
   DATABASE_PORT=5432
   DATABASE_USER=postgres
   DATABASE_PASSWORD=postgres
   DATABASE_NAME=ai_testing_platform

   # Redis
   REDIS_HOST=localhost
   REDIS_PORT=6379

   # MinIO/S3
   MINIO_ENDPOINT=localhost
   MINIO_PORT=9000
   MINIO_ACCESS_KEY=minioadmin
   MINIO_SECRET_KEY=minioadmin

   # JWT
   JWT_SECRET=your-secret-key-change-in-production
   JWT_EXPIRATION=7d

   # OpenAI
   OPENAI_API_KEY=your-openai-api-key

   # Application
   PORT=3001
   NODE_ENV=development
   ```

4. **Start Infrastructure**
   ```bash
   # Start PostgreSQL, Redis, MinIO
   docker-compose up postgres redis minio -d
   ```

5. **Run Database Migrations**
   ```bash
   cd backend
   npm run migration:run
   ```

6. **Start Development Servers**
   ```bash
   # Terminal 1: Backend
   cd backend
   npm run start:dev

   # Terminal 2: Frontend (when available)
   cd frontend
   npm run dev
   ```

7. **Verify Setup**
   - Backend: http://localhost:3001/api
   - API Docs: http://localhost:3001/api/docs
   - Frontend: http://localhost:3000

## Project Structure

### Root Directory

```
testing-module/
├── backend/                 # NestJS backend application
├── frontend/                # Next.js frontend application
├── database/                # Database scripts and migrations
├── docs/                    # Documentation
├── .github/                 # GitHub Actions workflows
├── docker-compose.yml       # Docker Compose configuration
├── package.json             # Root package.json (workspaces)
└── README.md               # Project README
```

### Backend Structure

```
backend/
├── src/
│   ├── modules/            # Feature modules
│   │   ├── auth/           # Authentication
│   │   ├── users/          # User management
│   │   ├── organizations/  # Organization management
│   │   ├── projects/       # Project management
│   │   ├── test-cases/     # Test case management
│   │   ├── test-suites/    # Test suite management
│   │   ├── executions/     # Test execution
│   │   ├── reports/        # Reporting
│   │   └── storage/        # File storage
│   ├── common/             # Shared utilities
│   │   ├── decorators/     # Custom decorators
│   │   ├── filters/        # Exception filters
│   │   ├── guards/         # Auth guards
│   │   ├── interceptors/   # Interceptors
│   │   ├── pipes/          # Validation pipes
│   │   └── interfaces/     # Shared interfaces
│   ├── config/             # Configuration
│   │   ├── app.config.ts
│   │   ├── database.config.ts
│   │   └── jwt.config.ts
│   ├── database/           # Database entities
│   │   └── entities/       # TypeORM entities
│   ├── app.module.ts       # Root module
│   └── main.ts             # Application entry point
├── test/                   # E2E tests
├── .env.example            # Example environment file
├── .eslintrc.js            # ESLint configuration
├── .prettierrc             # Prettier configuration
├── nest-cli.json           # NestJS CLI configuration
├── package.json            # Backend dependencies
└── tsconfig.json           # TypeScript configuration
```

### Module Structure

Each feature module follows this structure:

```
module-name/
├── dto/                    # Data Transfer Objects
│   ├── create-*.dto.ts
│   ├── update-*.dto.ts
│   └── query-*.dto.ts
├── entities/               # Database entities (if module-specific)
│   └── *.entity.ts
├── interfaces/             # TypeScript interfaces
│   └── *.interface.ts
├── *.controller.ts         # REST API controller
├── *.service.ts            # Business logic
├── *.module.ts             # Module definition
├── *.controller.spec.ts    # Controller tests
└── *.service.spec.ts       # Service tests
```

## Development Environment

### IDE Setup

#### Visual Studio Code (Recommended)

**Required Extensions**:
```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "firsttris.vscode-jest-runner",
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "prisma.prisma"
  ]
}
```

**Workspace Settings** (`.vscode/settings.json`):
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "jest.autoRun": "off",
  "files.exclude": {
    "**/.git": true,
    "**/node_modules": true,
    "**/dist": true
  }
}
```

### Development Tools

#### Database Management

**pgAdmin** (PostgreSQL):
```bash
# Run pgAdmin in Docker
docker run -p 5050:80 \
  -e PGADMIN_DEFAULT_EMAIL=admin@admin.com \
  -e PGADMIN_DEFAULT_PASSWORD=admin \
  dpage/pgadmin4
```

**RedisInsight** (Redis):
```bash
# Run RedisInsight in Docker
docker run -d -p 8001:8001 \
  redislabs/redisinsight:latest
```

#### API Testing

**Postman Collection**:
- Import from: `docs/postman/testing-platform.json`
- Environment variables included
- All endpoints documented

**Swagger UI**:
- Available at: http://localhost:3001/api/docs
- Interactive API documentation
- Try endpoints directly

## Coding Standards

### TypeScript Guidelines

#### General Rules

```typescript
// ✅ DO: Use interfaces for object shapes
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

// ✅ DO: Use type aliases for unions and complex types
type UserRole = 'admin' | 'user' | 'viewer';
type Nullable<T> = T | null;

// ✅ DO: Use enums for fixed sets of values
enum TestStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  PASSED = 'passed',
  FAILED = 'failed',
}

// ❌ DON'T: Use any type
let data: any; // Bad

// ✅ DO: Use unknown and type guards instead
let data: unknown;
if (typeof data === 'string') {
  // data is string here
}

// ✅ DO: Use async/await instead of promises
async function fetchData(): Promise<Data> {
  const response = await apiCall();
  return response.data;
}

// ❌ DON'T: Use promise chains unnecessarily
function fetchData(): Promise<Data> {
  return apiCall().then(response => response.data);
}
```

#### Naming Conventions

```typescript
// Classes: PascalCase
class UserService {}
class TestCaseController {}

// Interfaces: PascalCase with 'I' prefix (optional)
interface IUserRepository {}
interface User {} // Also acceptable

// Types: PascalCase
type UserId = string;
type UserResponse = {};

// Functions/Methods: camelCase
function getUserById() {}
async function createTestCase() {}

// Variables: camelCase
const userName = 'John';
let testCount = 0;

// Constants: UPPER_SNAKE_CASE
const MAX_RETRIES = 3;
const DEFAULT_TIMEOUT = 30000;

// Private properties: prefix with underscore (optional)
class Service {
  private _cache: Map<string, any>;
  private readonly logger: Logger;
}

// Files: kebab-case
user.service.ts
test-case.controller.ts
create-user.dto.ts
```

### ESLint Configuration

The project uses ESLint for code quality:

```javascript
// .eslintrc.js
module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint/eslint-plugin'],
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  rules: {
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'warn',
    '@typescript-eslint/explicit-module-boundary-types': 'warn',
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'no-console': ['warn', { allow: ['warn', 'error'] }],
  },
};
```

**Run ESLint**:
```bash
# Check for issues
npm run lint

# Auto-fix issues
npm run lint -- --fix
```

### Prettier Configuration

```json
{
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2,
  "semi": true,
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

**Run Prettier**:
```bash
# Format all files
npm run format

# Check formatting
npm run format -- --check
```

### Code Documentation

#### JSDoc Comments

```typescript
/**
 * Creates a new test case in the specified project
 *
 * @param projectId - The ID of the project
 * @param createDto - The test case data
 * @returns The created test case
 * @throws {NotFoundException} If project is not found
 * @throws {BadRequestException} If validation fails
 *
 * @example
 * ```typescript
 * const testCase = await service.createTestCase(
 *   'project-id',
 *   { name: 'Login Test', steps: [...] }
 * );
 * ```
 */
async createTestCase(
  projectId: string,
  createDto: CreateTestCaseDto,
): Promise<TestCase> {
  // Implementation
}
```

#### Inline Comments

```typescript
// ✅ DO: Explain WHY, not WHAT
// Use exponential backoff to avoid overwhelming the API during retries
const delay = Math.pow(2, attempt) * 1000;

// ❌ DON'T: State the obvious
// Increment counter by 1
counter++;

// ✅ DO: Document complex business logic
// Calculate tax based on shipping address state.
// Note: Some states have special tax rules for digital goods.
const tax = calculateTax(amount, shippingState, isDigital);

// ✅ DO: Add TODO comments with context
// TODO(john): Refactor to use new caching service once it's available
// See: https://github.com/org/repo/issues/123
```

## Development Workflow

### Git Workflow

#### Branch Naming

```bash
# Feature branches
feature/user-authentication
feature/ai-test-generation

# Bug fixes
fix/login-timeout-issue
fix/report-export-error

# Hotfixes
hotfix/critical-security-patch

# Refactoring
refactor/test-execution-service

# Documentation
docs/api-documentation
docs/developer-guide
```

#### Commit Messages

Follow Conventional Commits:

```bash
# Format
<type>(<scope>): <subject>

<body>

<footer>

# Types
feat: New feature
fix: Bug fix
docs: Documentation changes
style: Code style changes (formatting)
refactor: Code refactoring
test: Adding or updating tests
chore: Maintenance tasks

# Examples
feat(auth): add JWT refresh token support

Implements automatic token refresh using refresh tokens stored in Redis.
- Add RefreshToken entity
- Create refresh endpoint
- Add token rotation logic

Closes #123

fix(executions): resolve race condition in parallel test execution

The parallel executor was creating too many database connections,
causing some tests to fail intermittently.

- Add connection pooling
- Limit concurrent executions
- Add retry logic

Fixes #456

docs(api): update API reference for test execution endpoints

- Add missing request/response examples
- Document error codes
- Update rate limiting information
```

#### Pull Request Process

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/my-feature
   ```

2. **Make Changes**
   - Write code
   - Add tests
   - Update documentation

3. **Commit Changes**
   ```bash
   git add .
   git commit -m "feat(module): add new feature"
   ```

4. **Push to Remote**
   ```bash
   git push origin feature/my-feature
   ```

5. **Create Pull Request**
   - Fill in PR template
   - Link related issues
   - Add reviewers
   - Wait for CI checks

6. **Address Review Comments**
   ```bash
   git add .
   git commit -m "fix: address review comments"
   git push
   ```

7. **Merge**
   - Squash and merge (preferred)
   - Rebase and merge (for clean history)
   - Merge commit (for feature branches)

### Code Review Guidelines

#### As a Reviewer

**Check for**:
- ✅ Code follows style guidelines
- ✅ Tests are included and passing
- ✅ Documentation is updated
- ✅ No security vulnerabilities
- ✅ Performance considerations
- ✅ Error handling is proper
- ✅ Edge cases are covered

**Provide**:
- Constructive feedback
- Specific suggestions
- Code examples when possible
- Praise for good work

**Example Comments**:
```
✅ Good: "Consider using Promise.all() here to parallelize these
independent operations, which would improve performance."

✅ Good: "Great implementation! One suggestion: we should add a 
timeout to this API call to prevent hanging."

❌ Bad: "This is wrong."

❌ Bad: "Why did you do it this way?"
```

#### As a Pull Request Author

**Before Requesting Review**:
- ✅ Run all tests locally
- ✅ Run linter and formatter
- ✅ Update documentation
- ✅ Self-review your code
- ✅ Test manually

**When Receiving Feedback**:
- Be open to suggestions
- Ask questions if unclear
- Make requested changes
- Thank reviewers

## Backend Development

### NestJS Fundamentals

#### Creating a Module

```typescript
// user.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { User } from './entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService], // Export for use in other modules
})
export class UserModule {}
```

#### Creating a Controller

```typescript
// user.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { PaginationDto } from '../common/dto/pagination.dto';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @Roles('admin')
  @ApiOperation({ summary: 'Create a new user' })
  async create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  async findAll(@Query() paginationDto: PaginationDto) {
    return this.userService.findAll(paginationDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  async findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user' })
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Delete user' })
  async remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}
```

#### Creating a Service

```typescript
// user.service.ts
import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(createUserDto.password, 12);

    // Create user
    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    return this.userRepository.save(user);
  }

  async findAll(paginationDto: PaginationDto): Promise<{
    data: User[];
    meta: any;
  }> {
    const { page = 1, limit = 20 } = paginationDto;

    const [data, total] = await this.userRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    Object.assign(user, updateUserDto);

    return this.userRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    await this.userRepository.remove(user);
  }
}
```

#### Creating DTOs

```typescript
// create-user.dto.ts
import { IsEmail, IsString, MinLength, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  VIEWER = 'viewer',
}

export class CreateUserDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'SecurePass123!' })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ example: 'John' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  lastName: string;

  @ApiProperty({ enum: UserRole, default: UserRole.USER })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole = UserRole.USER;
}

// update-user.dto.ts
import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(
  OmitType(CreateUserDto, ['email', 'password'] as const),
) {}
```

#### Creating Entities

```typescript
// user.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { TestCase } from '../test-cases/entities/test-case.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  @Exclude() // Exclude from JSON responses
  password: string;

  @Column({ name: 'first_name' })
  firstName: string;

  @Column({ name: 'last_name' })
  lastName: string;

  @Column({
    type: 'enum',
    enum: ['admin', 'user', 'viewer'],
    default: 'user',
  })
  role: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'is_email_verified', default: false })
  isEmailVerified: boolean;

  @Column({ name: 'last_login_at', nullable: true })
  lastLoginAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => TestCase, (testCase) => testCase.createdBy)
  testCases: TestCase[];
}
```

### Custom Decorators

```typescript
// roles.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);

// current-user.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);

// Usage in controller
@Get('me')
async getCurrentUser(@CurrentUser() user: User) {
  return user;
}
```

### Guards

```typescript
// jwt-auth.guard.ts
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}

// roles.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some((role) => user.role === role);
  }
}
```

### Interceptors

```typescript
// transform.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  data: T;
  meta?: any;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    return next.handle().pipe(
      map((data) => ({
        data: data?.data || data,
        meta: data?.meta || {
          timestamp: new Date().toISOString(),
        },
      })),
    );
  }
}
```

### Exception Filters

```typescript
// http-exception.filter.ts
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    const error =
      typeof exceptionResponse === 'string'
        ? { message: exceptionResponse }
        : (exceptionResponse as object);

    response.status(status).json({
      ...error,
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
```

## Frontend Development

### Next.js Structure (When Frontend is Available)

```
frontend/
├── src/
│   ├── app/                # App router (Next.js 13+)
│   │   ├── (auth)/        # Auth layout group
│   │   ├── (dashboard)/   # Dashboard layout group
│   │   ├── layout.tsx     # Root layout
│   │   └── page.tsx       # Home page
│   ├── components/        # React components
│   │   ├── ui/           # UI components
│   │   ├── forms/        # Form components
│   │   └── layout/       # Layout components
│   ├── lib/              # Utilities
│   │   ├── api.ts        # API client
│   │   ├── auth.ts       # Auth utilities
│   │   └── utils.ts      # Helper functions
│   ├── hooks/            # Custom React hooks
│   ├── stores/           # State management (Zustand)
│   ├── types/            # TypeScript types
│   └── styles/           # Global styles
├── public/               # Static files
└── package.json
```

### Component Guidelines

```typescript
// Example: Button component
import { FC, ButtonHTMLAttributes } from 'react';
import clsx from 'clsx';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export const Button: FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  className,
  disabled,
  ...props
}) => {
  return (
    <button
      className={clsx(
        'rounded font-medium transition-colors',
        {
          'bg-blue-600 text-white hover:bg-blue-700': variant === 'primary',
          'bg-gray-200 text-gray-800 hover:bg-gray-300': variant === 'secondary',
          'bg-red-600 text-white hover:bg-red-700': variant === 'danger',
          'px-3 py-1.5 text-sm': size === 'sm',
          'px-4 py-2 text-base': size === 'md',
          'px-6 py-3 text-lg': size === 'lg',
          'opacity-50 cursor-not-allowed': disabled || loading,
        },
        className,
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? 'Loading...' : children}
    </button>
  );
};
```

## Database Management

### Creating Migrations

```bash
# Generate migration based on entity changes
npm run typeorm migration:generate -- -n MigrationName

# Create empty migration
npm run typeorm migration:create -- -n MigrationName

# Run migrations
npm run migration:run

# Revert last migration
npm run migration:revert
```

### Migration Example

```typescript
// migrations/1705123456789-AddUserPreferences.ts
import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class AddUserPreferences1705123456789 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'user_preferences',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'user_id',
            type: 'uuid',
          },
          {
            name: 'theme',
            type: 'varchar',
            default: "'light'",
          },
          {
            name: 'notifications',
            type: 'jsonb',
            default: "'{}'",
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
        foreignKeys: [
          {
            columnNames: ['user_id'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('user_preferences');
  }
}
```

## Testing Guidelines

### Unit Tests

```typescript
// user.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { NotFoundException } from '@nestjs/common';

describe('UserService', () => {
  let service: UserService;
  let repository: Repository<User>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    findAndCount: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findOne', () => {
    it('should return a user when found', async () => {
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
      };

      mockRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findOne('123');

      expect(result).toEqual(mockUser);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: '123' } });
    });

    it('should throw NotFoundException when user not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create and return a user', async () => {
      const createDto = {
        email: 'new@example.com',
        password: 'password123',
        firstName: 'Jane',
        lastName: 'Doe',
      };

      const mockUser = { id: '456', ...createDto };

      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(mockUser);
      mockRepository.save.mockResolvedValue(mockUser);

      const result = await service.create(createDto);

      expect(result).toEqual(mockUser);
      expect(repository.create).toHaveBeenCalled();
      expect(repository.save).toHaveBeenCalled();
    });
  });
});
```

### E2E Tests

```typescript
// test/user.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('UserController (e2e)', () => {
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Login and get token
    const loginResponse = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: 'admin@example.com',
        password: 'admin123',
      });

    authToken = loginResponse.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/api/users (GET)', () => {
    it('should return list of users', () => {
      return request(app.getHttpServer())
        .get('/api/users')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toBeInstanceOf(Array);
          expect(res.body.meta).toHaveProperty('total');
        });
    });

    it('should return 401 without auth token', () => {
      return request(app.getHttpServer())
        .get('/api/users')
        .expect(401);
    });
  });

  describe('/api/users (POST)', () => {
    it('should create a new user', () => {
      return request(app.getHttpServer())
        .post('/api/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          email: 'newuser@example.com',
          password: 'password123',
          firstName: 'New',
          lastName: 'User',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.data).toHaveProperty('id');
          expect(res.body.data.email).toBe('newuser@example.com');
        });
    });

    it('should return 400 for invalid data', () => {
      return request(app.getHttpServer())
        .post('/api/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          email: 'invalid-email',
          password: '123', // Too short
        })
        .expect(400);
    });
  });
});
```

### Running Tests

```bash
# Run all unit tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:cov

# Run E2E tests
npm run test:e2e

# Run specific test file
npm test -- user.service.spec.ts

# Run tests matching pattern
npm test -- --testNamePattern="UserService"
```

## Adding New Features

### Step-by-Step Process

1. **Plan the Feature**
   - Define requirements
   - Design database schema
   - Plan API endpoints
   - Consider security implications

2. **Create Database Migration**
   ```bash
   npm run typeorm migration:create -- -n AddFeatureXyz
   ```

3. **Create Entity**
   ```typescript
   // src/database/entities/feature-xyz.entity.ts
   ```

4. **Create Module**
   ```bash
   nest g module modules/feature-xyz
   nest g controller modules/feature-xyz
   nest g service modules/feature-xyz
   ```

5. **Create DTOs**
   ```typescript
   // dto/create-feature-xyz.dto.ts
   // dto/update-feature-xyz.dto.ts
   // dto/query-feature-xyz.dto.ts
   ```

6. **Implement Service Logic**
   ```typescript
   // feature-xyz.service.ts
   ```

7. **Implement Controller**
   ```typescript
   // feature-xyz.controller.ts
   ```

8. **Write Tests**
   ```typescript
   // feature-xyz.service.spec.ts
   // feature-xyz.controller.spec.ts
   ```

9. **Add API Documentation**
   - Swagger decorators
   - JSDoc comments

10. **Update Documentation**
    - API reference
    - User guide
    - Architecture docs

## API Development

### REST API Best Practices

```typescript
// ✅ DO: Use proper HTTP methods
GET /api/users              // List users
GET /api/users/:id          // Get specific user
POST /api/users             // Create user
PATCH /api/users/:id        // Update user (partial)
PUT /api/users/:id          // Replace user (full)
DELETE /api/users/:id       // Delete user

// ✅ DO: Use nested resources
GET /api/projects/:id/test-cases
POST /api/projects/:id/test-cases
GET /api/projects/:id/test-cases/:testId

// ✅ DO: Use query parameters for filtering
GET /api/users?role=admin&status=active&page=1&limit=20

// ✅ DO: Return proper status codes
200 OK                      // Successful GET, PATCH, PUT
201 Created                 // Successful POST
204 No Content              // Successful DELETE
400 Bad Request             // Validation error
401 Unauthorized            // Not authenticated
403 Forbidden               // Not authorized
404 Not Found               // Resource not found
409 Conflict                // Resource already exists
422 Unprocessable Entity    // Validation error
500 Internal Server Error   // Server error

// ✅ DO: Version your API (if needed)
/api/v1/users
/api/v2/users

// ❌ DON'T: Use verbs in URLs
/api/createUser            // Bad
/api/users                 // Good (POST method)

/api/getUserById/123       // Bad
/api/users/123             // Good (GET method)
```

### API Documentation with Swagger

```typescript
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

@ApiTags('test-cases')
@Controller('test-cases')
export class TestCaseController {
  @Post()
  @ApiOperation({
    summary: 'Create a new test case',
    description: 'Creates a new test case in the specified project',
  })
  @ApiResponse({
    status: 201,
    description: 'Test case successfully created',
    type: TestCase,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: 404,
    description: 'Project not found',
  })
  async create(@Body() createDto: CreateTestCaseDto) {
    return this.service.create(createDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get test case by ID' })
  @ApiParam({
    name: 'id',
    description: 'Test case UUID',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Test case found',
    type: TestCase,
  })
  @ApiResponse({
    status: 404,
    description: 'Test case not found',
  })
  async findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }
}
```

## State Management

### Backend State (Redis Cache)

```typescript
// cache.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';

@Injectable()
export class CacheService {
  constructor(@InjectRedis() private readonly redis: Redis) {}

  async get<T>(key: string): Promise<T | null> {
    const value = await this.redis.get(key);
    return value ? JSON.parse(value) : null;
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    const stringValue = JSON.stringify(value);
    if (ttl) {
      await this.redis.setex(key, ttl, stringValue);
    } else {
      await this.redis.set(key, stringValue);
    }
  }

  async del(key: string): Promise<void> {
    await this.redis.del(key);
  }

  async exists(key: string): Promise<boolean> {
    const result = await this.redis.exists(key);
    return result === 1;
  }
}

// Usage in service
@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: Repository<User>,
    private readonly cacheService: CacheService,
  ) {}

  async findOne(id: string): Promise<User> {
    // Try cache first
    const cacheKey = `user:${id}`;
    const cachedUser = await this.cacheService.get<User>(cacheKey);

    if (cachedUser) {
      return cachedUser;
    }

    // Fetch from database
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Cache for 5 minutes
    await this.cacheService.set(cacheKey, user, 300);

    return user;
  }
}
```

## Security Best Practices

### Input Validation

```typescript
// Always validate and sanitize input
import { IsString, IsEmail, MinLength, Matches } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'Password too weak',
  })
  password: string;
}
```

### SQL Injection Prevention

```typescript
// ✅ DO: Use TypeORM query builder or repository methods
const users = await this.userRepository.find({
  where: { email: userInput },
});

const users = await this.userRepository
  .createQueryBuilder('user')
  .where('user.email = :email', { email: userInput })
  .getMany();

// ❌ DON'T: Use raw queries with user input
const users = await this.userRepository.query(
  `SELECT * FROM users WHERE email = '${userInput}'`, // Vulnerable!
);
```

### XSS Prevention

```typescript
// Sanitize HTML input
import * as sanitizeHtml from 'sanitize-html';

const cleanHtml = sanitizeHtml(userInput, {
  allowedTags: ['b', 'i', 'em', 'strong', 'a'],
  allowedAttributes: {
    'a': ['href'],
  },
});
```

### Authentication & Authorization

```typescript
// Protect sensitive routes
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminController {
  // Only accessible by admins
}

// Protect specific endpoints
@Get('sensitive-data')
@UseGuards(JwtAuthGuard)
async getSensitiveData(@CurrentUser() user: User) {
  // Check ownership
  if (data.userId !== user.id && user.role !== 'admin') {
    throw new ForbiddenException();
  }
  return data;
}
```

## Performance Optimization

### Database Query Optimization

```typescript
// ✅ DO: Use select to load only needed fields
const users = await this.userRepository.find({
  select: ['id', 'email', 'firstName', 'lastName'],
});

// ✅ DO: Use eager loading for related entities
const testCase = await this.testCaseRepository.findOne({
  where: { id },
  relations: ['project', 'createdBy'],
});

// ✅ DO: Use pagination for large datasets
const [data, total] = await this.repository.findAndCount({
  skip: (page - 1) * limit,
  take: limit,
});

// ✅ DO: Use indexes for frequently queried fields
@Index(['email'])
@Index(['projectId', 'status'])
@Entity('test_cases')
export class TestCase {}

// ✅ DO: Use database query optimization
const results = await this.repository
  .createQueryBuilder('test')
  .leftJoinAndSelect('test.project', 'project')
  .where('test.status = :status', { status: 'active' })
  .andWhere('project.organizationId = :orgId', { orgId })
  .cache(true) // Enable query result caching
  .getMany();
```

### Caching Strategy

```typescript
// Cache frequently accessed data
async getProjectStats(projectId: string) {
  const cacheKey = `project:${projectId}:stats`;
  const cached = await this.cacheService.get(cacheKey);

  if (cached) return cached;

  const stats = await this.calculateStats(projectId);

  // Cache for 5 minutes
  await this.cacheService.set(cacheKey, stats, 300);

  return stats;
}

// Invalidate cache when data changes
async updateProject(id: string, updateDto: UpdateProjectDto) {
  const project = await this.repository.save({ id, ...updateDto });

  // Invalidate related cache
  await this.cacheService.del(`project:${id}:stats`);

  return project;
}
```

## Debugging

### Logging

```typescript
import { Logger } from '@nestjs/common';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  async create(createDto: CreateUserDto) {
    this.logger.log(`Creating user: ${createDto.email}`);

    try {
      const user = await this.userRepository.save(createDto);
      this.logger.log(`User created successfully: ${user.id}`);
      return user;
    } catch (error) {
      this.logger.error(`Failed to create user: ${error.message}`, error.stack);
      throw error;
    }
  }
}
```

### Debug Mode

```bash
# Enable debug logging
DEBUG=* npm run start:dev

# Debug specific module
DEBUG=app:user* npm run start:dev

# Node.js debugger
node --inspect-brk dist/main.js
```

### VS Code Debug Configuration

```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Backend",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "start:debug"],
      "cwd": "${workspaceFolder}/backend",
      "console": "integratedTerminal",
      "restart": true,
      "protocol": "inspector"
    }
  ]
}
```

## Contributing

### Pull Request Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] E2E tests added/updated
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings
- [ ] Tests pass locally

## Screenshots (if applicable)

## Related Issues
Closes #(issue number)
```

### Code of Conduct

- Be respectful and inclusive
- Welcome newcomers
- Focus on constructive feedback
- Help others learn
- Follow project guidelines

---

## Additional Resources

- [NestJS Documentation](https://docs.nestjs.com/)
- [TypeORM Documentation](https://typeorm.io/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Playwright Documentation](https://playwright.dev/docs/intro)

## Getting Help

- **GitHub Issues**: Bug reports and feature requests
- **Discussions**: Questions and community help
- **Stack Overflow**: Tag with `ai-testing-platform`
- **Email**: dev@example.com

---

**Happy Coding!** 🚀

For more information, see:
- [Architecture](ARCHITECTURE.md)
- [API Reference](API_REFERENCE.md)
- [User Guide](USER_GUIDE.md)
