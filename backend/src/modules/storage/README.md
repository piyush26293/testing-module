# Storage Module

## Overview
The Storage module handles file uploads, downloads, and management for the AI-Powered Testing Platform. It provides integration with MinIO/S3-compatible storage for storing test artifacts including screenshots, videos, and reports.

## Features

- **File Upload/Download**: Upload and download files with proper validation
- **MinIO/S3 Integration**: Seamless integration with MinIO or S3-compatible storage
- **Multiple File Types**: Support for screenshots, videos, and report files
- **File Validation**: Validates file types and enforces size limits (50MB max)
- **Presigned URLs**: Generate temporary URLs for secure file access
- **File Management**: List and delete files from storage

## API Endpoints

### Upload File
```
POST /storage/upload?folder=screenshots
Content-Type: multipart/form-data
```
Upload a file to the specified folder (screenshots, videos, or reports).

**Query Parameters:**
- `folder`: Destination folder (screenshots | videos | reports)

**Request Body:**
- `file`: File to upload (multipart/form-data)

**Response:**
```json
{
  "fileName": "screenshots/1234567890-screenshot.png",
  "url": "https://presigned-url...",
  "size": 12345,
  "mimetype": "image/png"
}
```

### Download File
```
GET /storage/download/:folder/:filename
```
Download a file from storage.

### Get Presigned URL
```
GET /storage/url/:folder/:filename?expiry=3600
```
Get a presigned URL for accessing a file.

**Query Parameters:**
- `expiry`: URL expiry time in seconds (default: 3600)

### Delete File
```
DELETE /storage/:folder/:filename
```
Delete a file from storage.

### List Files
```
GET /storage/list?folder=screenshots
```
List all files in storage, optionally filtered by folder.

**Query Parameters:**
- `folder`: Optional folder filter

## Configuration

Configure storage settings in your `.env` file:

```env
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=test-artifacts
MINIO_USE_SSL=false
```

## File Validation

### Allowed File Types
- Images: `image/png`, `image/jpeg`, `image/jpg`
- Videos: `video/mp4`, `video/webm`
- Documents: `application/pdf`, `application/json`, `text/html`

### Size Limits
- Maximum file size: 50MB

## Usage Example

```typescript
// Inject the StorageService
constructor(private storageService: StorageService) {}

// Upload a file
const fileName = await this.storageService.uploadFile(file, 'screenshots');

// Get a presigned URL
const url = await this.storageService.getPresignedUrl(fileName);

// Delete a file
await this.storageService.deleteFile(fileName);
```

## Security

- All endpoints require JWT authentication via `JwtAuthGuard`
- File type validation prevents malicious file uploads
- Size limits prevent storage abuse
- Presigned URLs with expiry for secure file access
