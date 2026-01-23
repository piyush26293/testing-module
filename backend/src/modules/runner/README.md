# Runner Module

## Overview
The Runner module handles test execution using Playwright. It provides browser management, test execution, screenshot capture, video recording, and parallel execution support with Bull/Redis job queuing.

## Features

- **Multi-Browser Support**: Execute tests on Chromium, Firefox, and WebKit
- **Headless/Headed Mode**: Run tests in headless or headed browser mode
- **Screenshot Capture**: Automatically capture screenshots at each test step
- **Video Recording**: Record full video of test execution
- **Parallel Execution**: Queue and execute multiple tests in parallel
- **Job Queue**: Integration with Bull/Redis for reliable job queuing
- **Real-time Status**: Track execution status in real-time
- **Test Reporting**: Generate detailed test reports

## API Endpoints

### Run Test Immediately
```
POST /runner/run
```
Execute a test immediately and wait for results.

**Request Body:**
```json
{
  "testId": "test-123",
  "url": "https://example.com",
  "browser": "chromium",
  "headless": true,
  "screenshots": true,
  "video": false,
  "timeout": 30000
}
```

**Response:**
```json
{
  "success": true,
  "duration": 5230,
  "steps": [
    { "action": "navigate", "value": "https://example.com" },
    { "action": "wait", "value": "networkidle" }
  ],
  "screenshots": ["screenshot-initial-123.png", "screenshot-loaded-456.png"]
}
```

### Queue Test
```
POST /runner/queue
```
Queue a test for asynchronous execution.

**Response:**
```json
{
  "executionId": "exec-1234567890-abc123",
  "status": "queued"
}
```

### Get Execution Status
```
GET /runner/executions/:id
```
Get the status of a specific test execution.

**Response:**
```json
{
  "id": "exec-1234567890-abc123",
  "status": "running",
  "startTime": "2024-01-01T00:00:00.000Z"
}
```

### Get All Executions
```
GET /runner/executions
```
Get all test executions.

### Cancel Execution
```
DELETE /runner/executions/:id
```
Cancel a queued test execution.

## Configuration

Configure Redis for job queuing in your `.env` file:

```env
REDIS_HOST=localhost
REDIS_PORT=6379
```

## Browser Options

### Supported Browsers
- `chromium`: Google Chrome/Chromium (default)
- `firefox`: Mozilla Firefox
- `webkit`: Safari/WebKit

### Execution Options
- `headless`: Run without UI (default: true)
- `screenshots`: Capture screenshots (default: true)
- `video`: Record video (default: false)
- `timeout`: Test timeout in ms (default: 30000)

## Architecture

### BrowserManager
Manages Playwright browser instances and contexts:
- Browser lifecycle management
- Context creation with options
- Resource cleanup

### TestExecutor
Executes tests using Playwright:
- Test step execution
- Screenshot capture
- Error handling
- Result aggregation

### PlaywrightReporter
Generates test reports:
- Step-by-step tracking
- HTML report generation
- Error collection

## Usage Example

```typescript
// Inject the RunnerService
constructor(private runnerService: RunnerService) {}

// Run a test immediately
const result = await this.runnerService.runTest({
  testId: 'test-123',
  url: 'https://example.com',
  browser: 'chromium',
  screenshots: true,
});

// Queue a test
const executionId = await this.runnerService.queueTest({
  testId: 'test-456',
  url: 'https://example.com',
  video: true,
});

// Check execution status
const status = await this.runnerService.getExecutionStatus(executionId);
```

## Parallel Execution

Tests queued with `/runner/queue` are executed in parallel using Bull job queues:

1. Test is added to Redis queue
2. Worker picks up job when available
3. Test executes in isolated browser context
4. Results are stored and retrievable via execution ID

## Screenshot and Video Storage

Screenshots and videos are captured during test execution:

- **Screenshots**: PNG format, captured at key steps
- **Videos**: MP4/WebM format, full test recording
- **Storage**: Files can be uploaded to Storage module

## Best Practices

1. **Resource Cleanup**: Always close browsers and contexts
2. **Timeouts**: Set appropriate timeouts for your tests
3. **Screenshots**: Use sparingly to avoid storage bloat
4. **Parallel Limits**: Configure worker concurrency based on resources
5. **Error Handling**: Always handle test failures gracefully

## Security

- All endpoints require JWT authentication via `JwtAuthGuard`
- Browser contexts are isolated per execution
- Automatic cleanup of resources on errors
