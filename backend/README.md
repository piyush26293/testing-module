# AI-Powered Testing Platform - Backend

A comprehensive, production-ready backend for an AI-powered end-to-end web application testing platform built with NestJS.

## Features

- 🔐 **Authentication & Authorization**: JWT-based authentication with role-based access control
- 📊 **Reports Management**: Test execution report generation and management
- 💾 **Storage Service**: MinIO/S3 integration for storing screenshots, videos, and reports
- 🤖 **AI Engine**: OpenAI-powered test generation, page analysis, and self-healing locators
- 🎭 **Test Runner**: Playwright-based test execution with multi-browser support
- 📝 **Audit Logging**: Comprehensive audit trail for all user actions
- 📚 **API Documentation**: Auto-generated Swagger/OpenAPI documentation
- 🔄 **Job Queue**: Bull/Redis for async test execution

## Architecture

```
backend/
├── src/
│   ├── common/               # Shared utilities
│   │   ├── guards/          # Authentication guards
│   │   ├── decorators/      # Custom decorators
│   │   └── filters/         # Exception filters
│   ├── config/              # Configuration
│   └── modules/             # Feature modules
│       ├── auth/            # Authentication
│       ├── reports/         # Report management
│       ├── storage/         # File storage (MinIO/S3)
│       ├── ai-engine/       # AI-powered features
│       ├── runner/          # Test execution (Playwright)
│       └── audit/           # Audit logging
├── package.json
├── tsconfig.json
└── nest-cli.json
```

## Modules

### 1. Auth Module
- User authentication with JWT
- Login/logout endpoints
- Password hashing with bcrypt

### 2. Reports Module
- Test report creation and retrieval
- Report filtering and search
- Report generation

### 3. Storage Module
- File upload/download
- MinIO/S3 integration
- Screenshot storage
- Video recording storage
- Presigned URL generation

### 4. AI Engine Module
- Test generation from user flows
- Page DOM/accessibility analysis
- Self-healing locator suggestions
- Edge case detection
- OpenAI GPT-4 integration

### 5. Runner Module
- Multi-browser test execution (Chromium, Firefox, WebKit)
- Headless/headed mode
- Screenshot capture
- Video recording
- Parallel execution with Bull queue
- Real-time execution tracking

### 6. Audit Module
- Action tracking and logging
- Database persistence
- Advanced filtering
- Compliance support

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL 12+
- Redis 6+
- MinIO or S3-compatible storage
- OpenAI API key (for AI features)

## Installation

```bash
# Install dependencies
npm install

# Install Playwright browsers
npx playwright install
```

## Configuration

Create a `.env` file based on `.env.example`:

```env
PORT=3000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=testing_platform

# JWT
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=1d

# MinIO/S3 Storage
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=test-artifacts
MINIO_USE_SSL=false

# OpenAI
OPENAI_API_KEY=your-openai-api-key
OPENAI_MODEL=gpt-4

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
```

## Running the Application

```bash
# Development mode with hot reload
npm run start:dev

# Production mode
npm run build
npm run start:prod

# Debug mode
npm run start:debug
```

The application will be available at:
- API: http://localhost:3000
- Swagger Documentation: http://localhost:3000/api

## API Documentation

Once the application is running, access the interactive Swagger documentation at:

```
http://localhost:3000/api
```

The documentation includes:
- All available endpoints
- Request/response schemas
- Try-it-out functionality
- Authentication examples

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## Development

```bash
# Lint code
npm run lint

# Format code
npm run format
```

## Module Documentation

Each module has its own README with detailed documentation:

- [Storage Module](./src/modules/storage/README.md)
- [AI Engine Module](./src/modules/ai-engine/README.md)
- [Runner Module](./src/modules/runner/README.md)
- [Audit Module](./src/modules/audit/README.md)

## Security

- JWT authentication on all protected endpoints
- Role-based access control (RBAC)
- Input validation with class-validator
- File type and size validation
- SQL injection protection via TypeORM
- XSS protection
- CORS configuration

## Performance

- Bull queue for async job processing
- Database query optimization
- Connection pooling
- Redis caching
- Efficient file streaming

## Deployment

### Docker

```bash
# Build Docker image
docker build -t ai-testing-backend .

# Run container
docker run -p 3000:3000 --env-file .env ai-testing-backend
```

### Environment Variables

Ensure all required environment variables are set in production:
- Use strong JWT secrets
- Configure production database
- Set up proper CORS origins
- Enable SSL for MinIO/S3
- Use production-ready Redis instance

## Tech Stack

- **Framework**: NestJS 10
- **Language**: TypeScript 5
- **Database**: PostgreSQL with TypeORM
- **Cache/Queue**: Redis with Bull
- **Storage**: MinIO/S3 with minio client
- **AI**: OpenAI GPT-4
- **Testing**: Playwright
- **Documentation**: Swagger/OpenAPI
- **Validation**: class-validator

## Best Practices

1. **Code Organization**: Feature-based module structure
2. **Type Safety**: Full TypeScript coverage
3. **Validation**: DTOs with class-validator
4. **Documentation**: Swagger annotations
5. **Error Handling**: Global exception filters
6. **Security**: Guards and authentication
7. **Testing**: Unit and E2E tests
8. **Logging**: Structured logging with audit trail

## Contributing

1. Follow NestJS best practices
2. Add tests for new features
3. Update Swagger documentation
4. Include README updates for new modules
5. Maintain TypeScript strict mode

## License

MIT

## Support

For issues and questions, please open an issue on the repository.
