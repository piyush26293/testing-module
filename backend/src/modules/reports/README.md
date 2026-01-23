# Reports Module

## Overview
The Reports module provides functionality to generate, manage, and download test execution reports for projects.

## Features
- Generate comprehensive reports from test execution data
- Filter reports by project with pagination support
- Calculate detailed metrics (pass rate, fail rate, avg duration, etc.)
- Generate execution summaries with top failures and performance insights
- Download report files
- Project-level access control

## Structure

### Module Files
- `reports.module.ts` - Module configuration with TypeORM entities and dependencies
- `reports.controller.ts` - REST API endpoints with Swagger documentation
- `reports.service.ts` - Business logic for report generation and management
- `dto/generate-report.dto.ts` - DTO for report generation request

## API Endpoints

### POST /reports
Generate a new report for a project.

**Request Body:**
```json
{
  "projectId": "uuid",
  "reportType": "summary",
  "timePeriodStart": "2024-01-01T00:00:00Z",
  "timePeriodEnd": "2024-01-31T23:59:59Z",
  "name": "Optional report name"
}
```

**Response:** Created report object with metrics and summary

### GET /reports?projectId={uuid}&page={n}&limit={n}
List all reports for a project with pagination.

**Query Parameters:**
- `projectId` (required): UUID of the project
- `page` (optional, default: 1): Page number
- `limit` (optional, default: 10): Items per page

**Response:** Paginated list of reports

### GET /reports/:id
Get a single report by ID.

**Response:** Report object with full details

### DELETE /reports/:id
Delete a report.

**Response:** 204 No Content

### GET /reports/:id/download
Download the report file (if available).

**Response:** PDF file stream

## Service Methods

### generate(generateDto, userId)
Creates a new report by:
1. Validating user access to the project
2. Fetching executions within the specified time period
3. Calculating comprehensive metrics
4. Generating execution summary
5. Saving the report to database

### findAll(projectId, pagination, userId)
Retrieves paginated reports for a project with access control.

### findOne(id, userId)
Fetches a single report with project access validation.

### remove(id, userId)
Deletes a report after verifying access permissions.

### calculateMetrics(executions)
Computes detailed metrics including:
- Total tests, passed, failed, skipped, error counts
- Pass rate and fail rate percentages
- Average and total duration
- Breakdowns by status, trigger type, and browser

### generateSummary(executions)
Creates a summary object containing:
- Unique test cases and suites count
- Top 10 failures with error details
- Fastest and slowest execution information

## Metrics Calculated

The following metrics are automatically calculated from execution data:

- **totalTests**: Total number of test executions
- **passedTests**: Count of passed executions
- **failedTests**: Count of failed executions
- **skippedTests**: Count of skipped executions
- **errorTests**: Count of executions with errors
- **passRate**: Percentage of passed tests
- **failRate**: Percentage of failed tests
- **avgDurationMs**: Average execution duration in milliseconds
- **totalDurationMs**: Total duration of all executions
- **executionsByStatus**: Breakdown by execution status
- **executionsByTrigger**: Breakdown by trigger type (manual, scheduled, CI/CD, API)
- **executionsByBrowser**: Breakdown by browser type

## Summary Information

Reports include a summary with:
- **totalExecutions**: Total count of executions in the period
- **uniqueTestCases**: Number of unique test cases executed
- **uniqueSuites**: Number of unique test suites executed
- **topFailures**: Up to 10 most recent failures with details
- **fastestExecution**: Details of the fastest test execution
- **slowestExecution**: Details of the slowest test execution

## Dependencies

- **TypeORM**: Database operations with Report and TestExecution entities
- **ProjectsModule**: For project access validation
- **ExecutionsModule**: For execution data retrieval

## Authentication & Authorization

All endpoints require:
- JWT authentication via `JwtAuthGuard`
- Role-based access via `RolesGuard`
- Project-level access validation via `ProjectsService.hasAccess()`

## Error Handling

- **400 Bad Request**: Invalid date range or input data
- **401 Unauthorized**: Missing or invalid authentication token
- **403 Forbidden**: User doesn't have access to the project/report
- **404 Not Found**: Report or file not found

## Usage Example

```typescript
// Generate a report
const report = await reportsService.generate({
  projectId: 'project-uuid',
  reportType: 'summary',
  timePeriodStart: '2024-01-01T00:00:00Z',
  timePeriodEnd: '2024-01-31T23:59:59Z',
  name: 'January 2024 Report'
}, 'user-uuid');

// List reports with pagination
const reports = await reportsService.findAll(
  'project-uuid',
  { page: 1, limit: 10 },
  'user-uuid'
);
```

## Future Enhancements

Potential improvements for the module:
- PDF/Excel file generation for reports
- Email delivery of generated reports
- Scheduled report generation
- Custom report templates
- Report comparison features
- AI-generated insights integration
