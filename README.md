# AI-Powered Testing Platform

A complete, production-ready, AI-powered end-to-end web application testing platform built with modern technologies.

## Overview

This platform combines intelligent test automation with AI-powered features to provide a comprehensive testing solution:

- 🤖 **AI-Powered Test Generation**: Automatically generate tests from natural language descriptions
- 🎭 **Multi-Browser Testing**: Execute tests on Chromium, Firefox, and WebKit via Playwright
- 🔍 **Self-Healing Tests**: AI-powered locator suggestions when tests fail
- 💾 **Artifact Storage**: Store screenshots, videos, and reports with MinIO/S3
- 📊 **Rich Reporting**: Comprehensive test execution reports
- 🔐 **Enterprise Security**: JWT authentication, role-based access control, audit logging
- 📚 **API-First**: Complete REST API with Swagger documentation

## Project Structure

```
testing-module/
├── backend/                 # NestJS backend application
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/       # Authentication module
│   │   │   ├── reports/    # Report management
│   │   │   ├── storage/    # File storage (MinIO/S3)
│   │   │   ├── ai-engine/  # AI-powered features
│   │   │   ├── runner/     # Test execution (Playwright)
│   │   │   └── audit/      # Audit logging
│   │   ├── common/         # Shared utilities
│   │   ├── config/         # Configuration
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── package.json
│   └── README.md
└── README.md
```

## Features

### 1. Storage Module ✅
- File upload/download with MinIO/S3
- Screenshot and video storage
- Presigned URL generation
- File validation and size limits
- [Documentation](./backend/src/modules/storage/README.md)

### 2. AI Engine Module ✅
- OpenAI GPT-4 integration
- Test generation from user flows
- Page DOM/accessibility analysis
- Self-healing locator suggestions
- Edge case detection
- [Documentation](./backend/src/modules/ai-engine/README.md)

### 3. Runner Module ✅
- Playwright test execution
- Multi-browser support (Chromium, Firefox, WebKit)
- Screenshot capture per step
- Video recording
- Parallel execution with Bull/Redis
- [Documentation](./backend/src/modules/runner/README.md)

### 4. Audit Module ✅
- Comprehensive action tracking
- Database persistence
- Advanced filtering and querying
- Compliance support
- [Documentation](./backend/src/modules/audit/README.md)

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 12+
- Redis 6+
- MinIO or S3 (for file storage)
- OpenAI API key (optional, for AI features)

### Installation

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Install Playwright browsers
npx playwright install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Start the application
npm run start:dev
```

The API will be available at:
- **API**: http://localhost:3000
- **Swagger Docs**: http://localhost:3000/api

### Using Docker Compose

```bash
cd backend

# Set your OpenAI API key
export OPENAI_API_KEY=sk-your-key-here

# Start all services
docker-compose up -d
```

This will start:
- Backend API (port 3000)
- PostgreSQL (port 5432)
- Redis (port 6379)
- MinIO (ports 9000, 9001)

## API Documentation

Interactive API documentation is available at `http://localhost:3000/api` when the server is running.

### Key Endpoints

#### Authentication
- `POST /auth/login` - User login

#### Storage
- `POST /storage/upload` - Upload files
- `GET /storage/download/:folder/:filename` - Download files
- `GET /storage/url/:folder/:filename` - Get presigned URL

#### AI Engine
- `POST /ai-engine/generate-test` - Generate test from description
- `POST /ai-engine/analyze-page` - Analyze page structure
- `POST /ai-engine/self-heal` - Get self-healing suggestions

#### Runner
- `POST /runner/run` - Execute test immediately
- `POST /runner/queue` - Queue test for execution
- `GET /runner/executions/:id` - Get execution status

#### Audit
- `GET /audit` - Get audit logs with filters
- `POST /audit` - Create audit log entry

## Configuration

Key environment variables:

```env
# Application
PORT=3000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=testing_platform

# Authentication
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=1d

# Storage (MinIO/S3)
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin

# AI Engine
OPENAI_API_KEY=sk-your-key-here
OPENAI_MODEL=gpt-4

# Queue
REDIS_HOST=localhost
REDIS_PORT=6379
```

## Technology Stack

### Backend
- **Framework**: NestJS 10
- **Language**: TypeScript 5
- **Database**: PostgreSQL + TypeORM
- **Cache/Queue**: Redis + Bull
- **Storage**: MinIO/S3
- **AI**: OpenAI GPT-4
- **Testing**: Playwright
- **Docs**: Swagger/OpenAPI

## Development

```bash
# Run in development mode
npm run start:dev

# Run tests
npm run test

# Lint code
npm run lint

# Format code
npm run format

# Build for production
npm run build
```

## Architecture

The platform follows a modular architecture with clear separation of concerns:

1. **Auth Module**: Handles authentication and authorization
2. **Storage Module**: Manages file storage with MinIO/S3
3. **AI Engine Module**: Provides AI-powered features via OpenAI
4. **Runner Module**: Executes tests using Playwright
5. **Audit Module**: Tracks all user actions for compliance
6. **Reports Module**: Manages test execution reports

## Security

- JWT-based authentication
- Role-based access control (RBAC)
- Input validation with class-validator
- SQL injection protection via TypeORM
- File type and size validation
- Audit logging for compliance

## Contributing

1. Follow NestJS best practices
2. Write tests for new features
3. Update documentation
4. Follow TypeScript strict mode
5. Add Swagger annotations

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.