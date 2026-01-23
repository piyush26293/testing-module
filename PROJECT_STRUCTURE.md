# Project Structure

```
testing-module/
├── README.md                               # Main project README
├── IMPLEMENTATION_SUMMARY.md               # Detailed implementation summary
│
└── backend/                                # NestJS Backend Application
    ├── package.json                        # Dependencies & scripts
    ├── tsconfig.json                       # TypeScript configuration
    ├── nest-cli.json                       # NestJS CLI configuration
    ├── .eslintrc.js                        # ESLint configuration
    ├── .prettierrc                         # Prettier configuration
    ├── .env.example                        # Environment variables template
    ├── .gitignore                          # Git ignore rules
    ├── Dockerfile                          # Docker build configuration
    ├── docker-compose.yml                  # Multi-container Docker setup
    ├── README.md                           # Backend documentation
    │
    └── src/
        ├── main.ts                         # Application entry point
        ├── app.module.ts                   # Root application module
        │
        ├── config/
        │   └── configuration.ts            # Environment configuration
        │
        ├── common/                         # Shared utilities
        │   ├── guards/
        │   │   ├── jwt-auth.guard.ts       # JWT authentication guard
        │   │   ├── roles.guard.ts          # Role-based access guard
        │   │   └── index.ts
        │   ├── decorators/
        │   │   ├── roles.decorator.ts      # @Roles() decorator
        │   │   ├── current-user.decorator.ts
        │   │   └── index.ts
        │   └── filters/
        │       ├── http-exception.filter.ts
        │       └── index.ts
        │
        └── modules/
            │
            ├── auth/                       # Authentication Module
            │   ├── auth.module.ts
            │   ├── auth.service.ts
            │   ├── auth.controller.ts
            │   └── dto/
            │       └── login.dto.ts
            │
            ├── reports/                    # Reports Module
            │   ├── reports.module.ts
            │   ├── reports.service.ts
            │   └── reports.controller.ts
            │
            ├── storage/                    # Storage Module ⭐
            │   ├── README.md               # Module documentation
            │   ├── storage.module.ts
            │   ├── storage.service.ts      # MinIO/S3 integration
            │   ├── storage.controller.ts   # Upload/download endpoints
            │   └── dto/
            │       └── upload-file.dto.ts
            │
            ├── ai-engine/                  # AI Engine Module ⭐
            │   ├── README.md               # Module documentation
            │   ├── ai-engine.module.ts
            │   ├── ai-engine.service.ts    # OpenAI integration
            │   ├── ai-engine.controller.ts
            │   ├── dto/
            │   │   ├── generate-test.dto.ts
            │   │   ├── analyze-page.dto.ts
            │   │   └── self-heal.dto.ts
            │   └── prompts/
            │       └── test-generation.prompts.ts
            │
            ├── runner/                     # Runner Module ⭐
            │   ├── README.md               # Module documentation
            │   ├── runner.module.ts
            │   ├── runner.service.ts       # Test orchestration
            │   ├── runner.controller.ts
            │   ├── dto/
            │   │   └── run-test.dto.ts
            │   └── playwright/
            │       ├── browser-manager.ts  # Browser lifecycle
            │       ├── test-executor.ts    # Test execution
            │       └── reporter.ts         # Test reporting
            │
            └── audit/                      # Audit Module ⭐
                ├── README.md               # Module documentation
                ├── audit.module.ts
                ├── audit.service.ts        # Audit logging
                ├── audit.controller.ts
                ├── dto/
                │   └── audit-log.dto.ts
                └── entities/
                    └── audit-log.entity.ts # Database entity

⭐ = Priority modules implemented in this PR
```

## Module Dependencies

```
┌─────────────────────────────────────────────────────────────┐
│                        app.module.ts                         │
│                     (Root Application)                       │
└───────┬─────────────────────────────────────────────────────┘
        │
        ├─── ConfigModule (Global)
        ├─── TypeOrmModule (PostgreSQL)
        ├─── BullModule (Redis Queue)
        │
        ├─── AuthModule
        │       └─── JwtModule, PassportModule
        │
        ├─── ReportsModule
        │
        ├─── StorageModule ⭐
        │       └─── Uses: MinIO/S3 Client
        │
        ├─── AiEngineModule ⭐
        │       └─── Uses: OpenAI GPT-4 API
        │
        ├─── RunnerModule ⭐
        │       ├─── Uses: Playwright
        │       ├─── Uses: Bull Queue
        │       └─── Components:
        │               ├─── BrowserManager
        │               ├─── TestExecutor
        │               └─── PlaywrightReporter
        │
        └─── AuditModule ⭐
                └─── Uses: TypeORM (AuditLog entity)
```

## Request Flow

```
Client Request
      │
      ▼
┌──────────────┐
│  API Gateway │ (NestJS)
│  (main.ts)   │
└──────┬───────┘
       │
       ├─── Global Filters (Exception handling)
       ├─── Global Pipes (Validation)
       └─── Global Guards (Authentication)
       │
       ▼
┌──────────────┐
│  Controllers │ (Routes)
│              │
│  - AuthController       (POST /auth/login)
│  - ReportsController    (GET/POST /reports)
│  - StorageController    (POST /storage/upload) ⭐
│  - AiEngineController   (POST /ai-engine/generate-test) ⭐
│  - RunnerController     (POST /runner/run) ⭐
│  - AuditController      (GET/POST /audit) ⭐
│              │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   Services   │ (Business Logic)
│              │
│  - AuthService
│  - ReportsService
│  - StorageService       (MinIO client) ⭐
│  - AiEngineService      (OpenAI client) ⭐
│  - RunnerService        (Test execution) ⭐
│  - AuditService         (Logging) ⭐
│              │
└──────┬───────┘
       │
       ▼
┌──────────────────────────────┐
│     External Services         │
│                               │
│  - PostgreSQL (Database)      │
│  - Redis (Queue)              │
│  - MinIO/S3 (Storage) ⭐      │
│  - OpenAI API (AI) ⭐         │
│  - Playwright Browsers ⭐     │
│                               │
└───────────────────────────────┘
```

## API Endpoints Summary

| Module     | Method | Endpoint                        | Description                |
|------------|--------|---------------------------------|----------------------------|
| Auth       | POST   | `/auth/login`                  | User login                 |
| Reports    | GET    | `/reports`                     | List reports               |
| Reports    | GET    | `/reports/:id`                 | Get report by ID           |
| Reports    | POST   | `/reports`                     | Create report              |
| **Storage**| POST   | `/storage/upload`              | Upload file ⭐             |
| Storage    | GET    | `/storage/download/:folder/:filename` | Download file ⭐  |
| Storage    | GET    | `/storage/url/:folder/:filename` | Get presigned URL ⭐     |
| Storage    | DELETE | `/storage/:folder/:filename`   | Delete file ⭐             |
| Storage    | GET    | `/storage/list`                | List files ⭐              |
| **AI Engine**| POST | `/ai-engine/generate-test`    | Generate test code ⭐      |
| AI Engine  | POST   | `/ai-engine/analyze-page`      | Analyze page ⭐            |
| AI Engine  | POST   | `/ai-engine/self-heal`         | Self-healing locators ⭐   |
| AI Engine  | GET    | `/ai-engine/edge-cases`        | Suggest edge cases ⭐      |
| **Runner** | POST   | `/runner/run`                  | Execute test ⭐            |
| Runner     | POST   | `/runner/queue`                | Queue test ⭐              |
| Runner     | GET    | `/runner/executions`           | List executions ⭐         |
| Runner     | GET    | `/runner/executions/:id`       | Get execution status ⭐    |
| Runner     | DELETE | `/runner/executions/:id`       | Cancel execution ⭐        |
| **Audit**  | POST   | `/audit`                       | Create audit log ⭐        |
| Audit      | GET    | `/audit`                       | Query audit logs ⭐        |
| Audit      | GET    | `/audit/:id`                   | Get audit log ⭐           |
| Audit      | GET    | `/audit/user/:id`              | User audit logs ⭐         |

⭐ = New endpoints implemented in this PR

## Data Flow Examples

### 1. Test Generation Flow (AI Engine)
```
User → POST /ai-engine/generate-test
       ├─ Body: { userFlow: "Login and check dashboard" }
       │
       ▼
    AiEngineController
       │
       ▼
    AiEngineService
       ├─ Format prompt with template
       ├─ Call OpenAI GPT-4 API
       └─ Parse response
       │
       ▼
    Return: { testCode: "import { test } from...", framework: "playwright" }
```

### 2. Test Execution Flow (Runner)
```
User → POST /runner/run
       ├─ Body: { testId, url, browser: "chromium", screenshots: true }
       │
       ▼
    RunnerController
       │
       ▼
    RunnerService
       │
       ▼
    TestExecutor
       ├─ BrowserManager.createContext()
       ├─ Launch browser
       ├─ Navigate to URL
       ├─ Capture screenshots
       ├─ Execute test steps
       └─ Generate report
       │
       ▼
    Return: { success: true, duration: 5230, steps: [...], screenshots: [...] }
```

### 3. File Upload Flow (Storage)
```
User → POST /storage/upload?folder=screenshots
       ├─ File: screenshot.png (multipart/form-data)
       │
       ▼
    StorageController
       ├─ Validate file type
       ├─ Check file size (< 50MB)
       │
       ▼
    StorageService
       ├─ Connect to MinIO
       ├─ Upload to bucket
       ├─ Generate presigned URL
       │
       ▼
    Return: { fileName: "screenshots/123-screenshot.png", url: "https://..." }
```

### 4. Audit Logging Flow
```
User Action → Any Controller Method
              │
              ▼
           AuditService.logUserAction()
              ├─ userId, action, resource, metadata
              │
              ▼
           TypeORM Repository
              │
              ▼
           PostgreSQL Database
              └─ INSERT INTO audit_logs (...)
```
