# Audit Module

## Overview
The Audit module provides comprehensive audit logging for tracking all user actions in the AI-Powered Testing Platform. It stores audit logs in the database with powerful querying capabilities.

## Features

- **Action Tracking**: Log all user actions with context
- **Database Storage**: Persist audit logs in PostgreSQL
- **Advanced Filtering**: Query logs by user, action, resource, date range
- **Metadata Support**: Store additional context with each log entry
- **IP and User Agent**: Track request source information
- **Pagination**: Efficient retrieval of large audit log datasets
- **Role-Based Access**: Admin-only access to audit logs

## API Endpoints

### Create Audit Log
```
POST /audit
```
Create a new audit log entry (Admin only).

**Request Body:**
```json
{
  "userId": "user-123",
  "action": "CREATE_TEST",
  "resource": "test",
  "metadata": "{\"testId\": \"test-123\", \"name\": \"Login Test\"}",
  "ipAddress": "192.168.1.1",
  "userAgent": "Mozilla/5.0..."
}
```

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "userId": "user-123",
  "action": "CREATE_TEST",
  "resource": "test",
  "metadata": "{\"testId\": \"test-123\"}",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Get All Audit Logs
```
GET /audit?userId=user-123&action=CREATE_TEST&limit=50&offset=0
```
Get audit logs with optional filters (Admin only).

**Query Parameters:**
- `userId`: Filter by user ID
- `action`: Filter by action type
- `resource`: Filter by resource type
- `startDate`: Filter from date (ISO 8601)
- `endDate`: Filter to date (ISO 8601)
- `limit`: Number of results (default: no limit)
- `offset`: Pagination offset (default: 0)

**Response:**
```json
{
  "logs": [
    {
      "id": "...",
      "userId": "user-123",
      "action": "CREATE_TEST",
      "resource": "test",
      "timestamp": "2024-01-01T00:00:00.000Z"
    }
  ],
  "total": 150,
  "limit": 50,
  "offset": 0
}
```

### Get Audit Log by ID
```
GET /audit/:id
```
Get a specific audit log entry by ID (Admin only).

### Get User Audit Logs
```
GET /audit/user/:userId
```
Get all audit logs for a specific user (Admin only).

## Entity Structure

### AuditLog Entity
```typescript
{
  id: string;              // UUID
  userId: string;          // User who performed the action
  action: string;          // Action performed
  resource: string;        // Resource affected
  metadata: string;        // JSON metadata
  ipAddress: string;       // Request IP
  userAgent: string;       // Browser/client info
  timestamp: Date;         // When the action occurred
}
```

## Common Actions

Standard action types to use:

- `CREATE_TEST`: User created a test
- `UPDATE_TEST`: User updated a test
- `DELETE_TEST`: User deleted a test
- `RUN_TEST`: User executed a test
- `VIEW_REPORT`: User viewed a report
- `UPLOAD_FILE`: User uploaded a file
- `LOGIN`: User logged in
- `LOGOUT`: User logged out
- `CHANGE_SETTINGS`: User changed settings

## Usage Example

```typescript
// Inject the AuditService
constructor(private auditService: AuditService) {}

// Log a user action
await this.auditService.logUserAction(
  'user-123',
  'CREATE_TEST',
  'test',
  { testId: 'test-456', name: 'Login Test' }
);

// Query audit logs
const logs = await this.auditService.findAll({
  userId: 'user-123',
  action: 'CREATE_TEST',
  startDate: new Date('2024-01-01'),
  limit: 50,
  offset: 0,
});

// Get log count
const count = await this.auditService.count({
  userId: 'user-123',
  startDate: new Date('2024-01-01'),
});
```

## Automatic Logging

You can create an interceptor to automatically log all actions:

```typescript
@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private auditService: AuditService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    
    return next.handle().pipe(
      tap(() => {
        this.auditService.logUserAction(
          user.id,
          request.method,
          request.path,
          { body: request.body }
        );
      }),
    );
  }
}
```

## Database Configuration

The Audit module requires TypeORM configuration. Ensure your database connection is configured:

```typescript
TypeOrmModule.forRoot({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'postgres',
  database: 'testing_platform',
  entities: [AuditLog],
  synchronize: true, // Don't use in production
})
```

## Best Practices

1. **Sensitive Data**: Never log passwords or sensitive credentials
2. **Metadata**: Use JSON format for structured metadata
3. **Retention**: Implement log retention policies for old data
4. **Performance**: Use indexes on userId, action, timestamp columns
5. **Privacy**: Comply with data retention regulations (GDPR, etc.)
6. **Async Logging**: Consider async logging for high-traffic operations

## Security

- All endpoints require JWT authentication
- Only users with 'admin' role can access audit logs
- Audit logs are immutable (no update/delete operations)
- IP address and User Agent tracking for security forensics

## Monitoring

Use audit logs for:
- Security incident investigation
- Compliance reporting
- User activity tracking
- System usage analytics
- Debugging user-reported issues
