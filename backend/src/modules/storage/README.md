# Storage Module

This module provides file storage functionality using MinIO (S3-compatible object storage).

## Features

- File upload with multipart/form-data
- File download with streaming
- File deletion
- Presigned URL generation for temporary access
- File metadata retrieval
- File listing with folder/prefix filtering
- Automatic bucket creation on module initialization
- Support for screenshots, videos, and report files

## API Endpoints

### POST /storage/upload
Upload a file to MinIO storage.

**Request:**
- Content-Type: `multipart/form-data`
- Body:
  - `file`: File (binary)
  - `folder`: Optional folder path (e.g., 'screenshots', 'videos', 'reports')

**Response:**
```json
{
  "url": "http://localhost:9000/testing-platform/screenshots/abc-123.png",
  "fileName": "screenshots/abc-123.png",
  "message": "File uploaded successfully"
}
```

### GET /storage/download/:fileName
Download a file from MinIO storage.

**Parameters:**
- `fileName`: Full file path (e.g., 'screenshots/abc-123.png')

**Response:**
- Binary file stream

### DELETE /storage/:fileName
Delete a file from MinIO storage.

**Parameters:**
- `fileName`: Full file path (e.g., 'screenshots/abc-123.png')

**Response:**
```json
{
  "message": "File deleted successfully"
}
```

### GET /storage/presigned-url/:fileName
Get a presigned URL for temporary file access.

**Parameters:**
- `fileName`: Full file path (e.g., 'screenshots/abc-123.png')
- `expiry`: Optional expiry time in seconds (default: 86400 - 24 hours, max: 604800 - 7 days)

**Response:**
```json
{
  "url": "http://localhost:9000/testing-platform/screenshots/abc-123.png?X-Amz-Algorithm=...",
  "expiresIn": 86400,
  "message": "Presigned URL generated successfully"
}
```

### GET /storage/list
List files in a folder.

**Query Parameters:**
- `folder`: Optional folder path
- `prefix`: Optional prefix to filter files

**Response:**
```json
{
  "files": [
    "screenshots/abc-123.png",
    "screenshots/def-456.jpg"
  ],
  "count": 2
}
```

### GET /storage/metadata/:fileName
Get file metadata.

**Parameters:**
- `fileName`: Full file path (e.g., 'screenshots/abc-123.png')

**Response:**
```json
{
  "size": 1024,
  "etag": "\"abc123def456\"",
  "lastModified": "2024-01-23T12:00:00.000Z",
  "contentType": "image/png",
  "originalName": "screenshot.png"
}
```

## Configuration

Required environment variables:

```env
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET_NAME=testing-platform
MINIO_REGION=us-east-1
```

## Usage

### Import Module

```typescript
import { StorageModule } from './modules/storage';

@Module({
  imports: [StorageModule],
})
export class AppModule {}
```

### Use Service

```typescript
import { StorageService } from './modules/storage';

@Injectable()
export class MyService {
  constructor(private storageService: StorageService) {}

  async uploadScreenshot(file: Express.Multer.File) {
    const url = await this.storageService.uploadFile(file, 'screenshots');
    return url;
  }
}
```

## File Size Limits

- Maximum file size: 100MB
- Supported file types: All (screenshots, videos, documents, etc.)

## Security

- All endpoints are protected with JWT authentication
- Presigned URLs allow temporary access without authentication
- Maximum presigned URL expiry: 7 days

## Error Handling

The module provides detailed error responses:

- `400 Bad Request`: Invalid input, file too large, or missing file
- `401 Unauthorized`: Missing or invalid authentication
- `404 Not Found`: File not found
- `500 Internal Server Error`: Storage operation failed
