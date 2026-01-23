# Executions Module

## Overview
The Executions module manages test execution lifecycle, including creating, tracking, and managing test runs. It integrates with Bull queue for asynchronous test execution processing.

## Features
- Create and queue test executions
- Track execution status and progress
- View execution history with filtering
- Stop running executions
- View detailed execution logs
- Project-level access control

## Architecture

### Components
- **ExecutionsController**: REST API endpoints for execution management
- **ExecutionsService**: Business logic for execution operations
- **ExecutionsProcessor**: Bull queue processor for async test execution
- **DTOs**: Data transfer objects for request validation

### Queue Processing
Test executions are processed asynchronously using Bull queue:
1. Execution is created with PENDING status
2. Job is added to 'executions' queue
3. Processor picks up job and executes test
4. Status is updated throughout execution lifecycle

## API Endpoints

### POST /executions
Start a new test execution
- **Body**: `CreateExecutionDto`
- **Auth**: Required
- **Access**: Project member

### GET /executions
List executions with filters
- **Query**: `ExecutionFiltersDto` (projectId, status, trigger, browser, dates, pagination)
- **Auth**: Required
- **Access**: Project member

### GET /executions/:id
Get single execution with logs
- **Auth**: Required
- **Access**: Project member

### PATCH /executions/:id/status
Update execution status (internal use)
- **Body**: `UpdateExecutionStatusDto`
- **Auth**: Required

### DELETE /executions/:id
Delete execution
- **Auth**: Required
- **Access**: Project member
- **Note**: Cannot delete running executions

### POST /executions/:id/stop
Stop running execution
- **Auth**: Required
- **Access**: Project member

### GET /executions/:id/logs
Get execution logs ordered by step
- **Auth**: Required
- **Access**: Project member

## DTOs

### CreateExecutionDto
```typescript
{
  projectId: string;        // Required
  testCaseId?: string;      // Optional
  suiteId?: string;         // Optional
  executionName?: string;   // Optional
  browser: BrowserType;     // Required
  environment?: string;     // Optional
  trigger: ExecutionTrigger; // Required
}
```

### ExecutionFiltersDto
```typescript
{
  projectId?: string;
  testCaseId?: string;
  suiteId?: string;
  status?: ExecutionStatus;
  trigger?: ExecutionTrigger;
  browser?: BrowserType;
  startDate?: string;       // ISO 8601
  endDate?: string;         // ISO 8601
  page?: number;            // Default: 1
  limit?: number;           // Default: 10
}
```

### UpdateExecutionStatusDto
```typescript
{
  status: ExecutionStatus;  // Required
  errorMessage?: string;    // Optional
  stackTrace?: string;      // Optional
  durationMs?: number;      // Optional
}
```

### ExecutionLogDto
```typescript
{
  stepId?: string;          // Optional
  orderIndex: number;       // Required
  status: ExecutionStatus;  // Required
  message?: string;         // Optional
  errorMessage?: string;    // Optional
  screenshotUrl?: string;   // Optional
  durationMs?: number;      // Optional
}
```

## Enums

### ExecutionStatus
- `PENDING`: Execution queued, not started
- `RUNNING`: Currently executing
- `PASSED`: Execution completed successfully
- `FAILED`: Execution failed with assertion errors
- `SKIPPED`: Execution was skipped
- `ERROR`: Execution encountered error

### ExecutionTrigger
- `MANUAL`: Started manually by user
- `SCHEDULED`: Started by scheduler
- `CI_CD`: Started by CI/CD pipeline
- `API`: Started via API call

### BrowserType
- `CHROMIUM`
- `FIREFOX`
- `WEBKIT`
- `CHROME`
- `EDGE`

## Security
- All endpoints require JWT authentication
- Project access is verified for all operations
- Users can only access executions for projects they are members of

## Dependencies
- `@nestjs/bull`: Queue management
- `@nestjs/typeorm`: Database ORM
- `ProjectsModule`: Project access validation

## Future Enhancements
- Implement actual test execution logic in processor
- Add real-time execution progress via WebSocket
- Support parallel test execution
- Add execution screenshots management
- Implement execution reports generation
