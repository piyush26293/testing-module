# Storage API

The Storage API manages file uploads, downloads, screenshots, videos, and other test artifacts.

## Base URL
```
/api/v1/storage
```

## Authentication
All endpoints require authentication with a valid JWT token.

## Rate Limiting
- Upload operations: 30 requests per 15 minutes
- Download operations: 100 requests per 15 minutes
- Delete operations: 50 requests per 15 minutes

---

## Endpoints

### POST /storage/upload
Upload a file to storage.

#### Headers
```
Authorization: Bearer <access_token>
Content-Type: multipart/form-data
```

#### Request Body (multipart/form-data)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| file | file | Yes | File to upload |
| type | string | No | File type (document, image, video, screenshot, attachment) |
| projectId | string | No | Associated project ID |
| testCaseId | string | No | Associated test case ID |
| executionId | string | No | Associated execution ID |
| description | string | No | File description |
| tags | string | No | Comma-separated tags |

#### Response (201 Created)
```json
{
  "success": true,
  "data": {
    "id": "file_123456789",
    "name": "test-scenario.png",
    "originalName": "test-scenario.png",
    "type": "image",
    "mimeType": "image/png",
    "size": 245678,
    "url": "https://api.example.com/storage/files/file_123456789",
    "downloadUrl": "https://api.example.com/storage/files/file_123456789/download",
    "thumbnailUrl": "https://api.example.com/storage/files/file_123456789/thumbnail",
    "metadata": {
      "width": 1920,
      "height": 1080,
      "format": "png"
    },
    "projectId": "prj_123456789",
    "testCaseId": "tc_123456789",
    "uploadedBy": {
      "id": "usr_123456789",
      "firstName": "John",
      "lastName": "Doe"
    },
    "uploadedAt": "2024-01-23T16:00:00Z"
  }
}
```

#### Error Responses

**400 Bad Request**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_FILE",
    "message": "File type not supported. Allowed types: png, jpg, jpeg, gif, pdf, mp4, webm"
  }
}
```

**413 Payload Too Large**
```json
{
  "success": false,
  "error": {
    "code": "FILE_TOO_LARGE",
    "message": "File size exceeds maximum limit of 50MB"
  }
}
```

**429 Too Many Requests**
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many upload requests. Maximum 30 per 15 minutes.",
    "retryAfter": 300
  }
}
```

#### Code Examples

**cURL**
```bash
curl -X POST https://api.example.com/api/v1/storage/upload \
  -H "Authorization: Bearer <access_token>" \
  -F "file=@/path/to/file.png" \
  -F "type=image" \
  -F "projectId=prj_123456789" \
  -F "testCaseId=tc_123456789"
```

**JavaScript/TypeScript**
```typescript
const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('type', 'image');
formData.append('projectId', 'prj_123456789');
formData.append('testCaseId', 'tc_123456789');

const response = await fetch('https://api.example.com/api/v1/storage/upload', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
  },
  body: formData,
});

const data = await response.json();
```

**Python**
```python
import requests

files = {'file': open('/path/to/file.png', 'rb')}
data = {
    'type': 'image',
    'projectId': 'prj_123456789',
    'testCaseId': 'tc_123456789'
}

response = requests.post(
    'https://api.example.com/api/v1/storage/upload',
    files=files,
    data=data,
    headers={'Authorization': f'Bearer {access_token}'}
)

result = response.json()
```

---

### GET /storage/files/:id
Get file metadata and information.

#### Headers
```
Authorization: Bearer <access_token>
```

#### URL Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | File ID |

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "id": "file_123456789",
    "name": "test-scenario.png",
    "originalName": "test-scenario.png",
    "type": "image",
    "mimeType": "image/png",
    "size": 245678,
    "url": "https://api.example.com/storage/files/file_123456789",
    "downloadUrl": "https://api.example.com/storage/files/file_123456789/download",
    "thumbnailUrl": "https://api.example.com/storage/files/file_123456789/thumbnail",
    "metadata": {
      "width": 1920,
      "height": 1080,
      "format": "png",
      "exif": {}
    },
    "projectId": "prj_123456789",
    "testCaseId": "tc_123456789",
    "executionId": null,
    "description": "Test scenario screenshot",
    "tags": ["screenshot", "test-case"],
    "uploadedBy": {
      "id": "usr_123456789",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com"
    },
    "uploadedAt": "2024-01-23T16:00:00Z",
    "accessCount": 15,
    "lastAccessedAt": "2024-01-23T18:30:00Z"
  }
}
```

#### Error Responses

**404 Not Found**
```json
{
  "success": false,
  "error": {
    "code": "FILE_NOT_FOUND",
    "message": "File not found"
  }
}
```

#### Code Examples

**cURL**
```bash
curl -X GET https://api.example.com/api/v1/storage/files/file_123456789 \
  -H "Authorization: Bearer <access_token>"
```

**JavaScript/TypeScript**
```typescript
const response = await fetch(
  `https://api.example.com/api/v1/storage/files/${fileId}`,
  {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  }
);

const data = await response.json();
```

**Python**
```python
import requests

response = requests.get(
    f'https://api.example.com/api/v1/storage/files/{file_id}',
    headers={'Authorization': f'Bearer {access_token}'}
)

data = response.json()
```

---

### DELETE /storage/files/:id
Delete a file from storage.

#### Headers
```
Authorization: Bearer <access_token>
```

#### URL Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | File ID |

#### Response (200 OK)
```json
{
  "success": true,
  "message": "File successfully deleted"
}
```

#### Error Responses

**403 Forbidden**
```json
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_PERMISSIONS",
    "message": "You don't have permission to delete this file"
  }
}
```

**404 Not Found**
```json
{
  "success": false,
  "error": {
    "code": "FILE_NOT_FOUND",
    "message": "File not found"
  }
}
```

#### Code Examples

**cURL**
```bash
curl -X DELETE https://api.example.com/api/v1/storage/files/file_123456789 \
  -H "Authorization: Bearer <access_token>"
```

**JavaScript/TypeScript**
```typescript
const response = await fetch(
  `https://api.example.com/api/v1/storage/files/${fileId}`,
  {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  }
);

const data = await response.json();
```

**Python**
```python
import requests

response = requests.delete(
    f'https://api.example.com/api/v1/storage/files/{file_id}',
    headers={'Authorization': f'Bearer {access_token}'}
)

data = response.json()
```

---

### GET /storage/files/:id/download
Download a file.

#### Headers
```
Authorization: Bearer <access_token>
```

#### URL Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | File ID |

#### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| inline | boolean | No | false | Display inline instead of download |
| thumbnail | boolean | No | false | Download thumbnail (images only) |

#### Response (200 OK)
Returns the file as binary data with appropriate Content-Type and Content-Disposition headers.

#### Response Headers
```
Content-Type: image/png
Content-Disposition: attachment; filename="test-scenario.png"
Content-Length: 245678
```

#### Code Examples

**cURL**
```bash
curl -X GET https://api.example.com/api/v1/storage/files/file_123456789/download \
  -H "Authorization: Bearer <access_token>" \
  -o downloaded-file.png
```

**JavaScript/TypeScript**
```typescript
const response = await fetch(
  `https://api.example.com/api/v1/storage/files/${fileId}/download`,
  {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  }
);

const blob = await response.blob();
const url = window.URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'file.png';
a.click();
```

**Python**
```python
import requests

response = requests.get(
    f'https://api.example.com/api/v1/storage/files/{file_id}/download',
    headers={'Authorization': f'Bearer {access_token}'}
)

with open('downloaded-file.png', 'wb') as f:
    f.write(response.content)
```

---

### GET /storage/screenshots/:executionId
Get all screenshots for a specific execution.

#### Headers
```
Authorization: Bearer <access_token>
```

#### URL Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| executionId | string | Execution ID |

#### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| testCaseId | string | No | - | Filter by test case ID |
| status | string | No | - | Filter by test status (passed, failed) |
| page | integer | No | 1 | Page number |
| limit | integer | No | 50 | Items per page |

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "executionId": "exec_123456789",
    "screenshots": [
      {
        "id": "file_111",
        "name": "tc_123456789_step_1.png",
        "testCaseId": "tc_123456789",
        "testCaseTitle": "User login with valid credentials",
        "step": 1,
        "stepDescription": "Navigate to login page",
        "status": "passed",
        "url": "https://api.example.com/storage/files/file_111",
        "downloadUrl": "https://api.example.com/storage/files/file_111/download",
        "thumbnailUrl": "https://api.example.com/storage/files/file_111/thumbnail",
        "size": 234567,
        "timestamp": "2024-01-23T16:00:05Z"
      },
      {
        "id": "file_222",
        "name": "tc_987654321_failure.png",
        "testCaseId": "tc_987654321",
        "testCaseTitle": "Password reset flow",
        "step": 3,
        "stepDescription": "Click reset button",
        "status": "failed",
        "url": "https://api.example.com/storage/files/file_222",
        "downloadUrl": "https://api.example.com/storage/files/file_222/download",
        "thumbnailUrl": "https://api.example.com/storage/files/file_222/thumbnail",
        "size": 256789,
        "timestamp": "2024-01-23T16:05:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 23,
      "totalPages": 1
    }
  }
}
```

#### Code Examples

**cURL**
```bash
curl -X GET "https://api.example.com/api/v1/storage/screenshots/exec_123456789?status=failed" \
  -H "Authorization: Bearer <access_token>"
```

**JavaScript/TypeScript**
```typescript
const response = await fetch(
  `https://api.example.com/api/v1/storage/screenshots/${executionId}?status=failed`,
  {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  }
);

const data = await response.json();
```

**Python**
```python
import requests

response = requests.get(
    f'https://api.example.com/api/v1/storage/screenshots/{execution_id}',
    params={'status': 'failed'},
    headers={'Authorization': f'Bearer {access_token}'}
)

data = response.json()
```

---

### GET /storage/videos/:executionId
Get all videos for a specific execution.

#### Headers
```
Authorization: Bearer <access_token>
```

#### URL Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| executionId | string | Execution ID |

#### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| testCaseId | string | No | - | Filter by test case ID |
| status | string | No | - | Filter by test status (passed, failed) |
| page | integer | No | 1 | Page number |
| limit | integer | No | 50 | Items per page |

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "executionId": "exec_123456789",
    "videos": [
      {
        "id": "file_333",
        "name": "tc_123456789_recording.webm",
        "testCaseId": "tc_123456789",
        "testCaseTitle": "User login with valid credentials",
        "status": "passed",
        "url": "https://api.example.com/storage/files/file_333",
        "downloadUrl": "https://api.example.com/storage/files/file_333/download",
        "thumbnailUrl": "https://api.example.com/storage/files/file_333/thumbnail",
        "size": 5234567,
        "duration": 115,
        "format": "webm",
        "resolution": "1920x1080",
        "timestamp": "2024-01-23T16:00:00Z"
      },
      {
        "id": "file_444",
        "name": "tc_987654321_recording.webm",
        "testCaseId": "tc_987654321",
        "testCaseTitle": "Password reset flow",
        "status": "failed",
        "url": "https://api.example.com/storage/files/file_444",
        "downloadUrl": "https://api.example.com/storage/files/file_444/download",
        "thumbnailUrl": "https://api.example.com/storage/files/file_444/thumbnail",
        "size": 8456789,
        "duration": 180,
        "format": "webm",
        "resolution": "1920x1080",
        "timestamp": "2024-01-23T16:02:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 15,
      "totalPages": 1
    }
  }
}
```

#### Code Examples

**cURL**
```bash
curl -X GET "https://api.example.com/api/v1/storage/videos/exec_123456789" \
  -H "Authorization: Bearer <access_token>"
```

**JavaScript/TypeScript**
```typescript
const response = await fetch(
  `https://api.example.com/api/v1/storage/videos/${executionId}`,
  {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  }
);

const data = await response.json();
```

**Python**
```python
import requests

response = requests.get(
    f'https://api.example.com/api/v1/storage/videos/{execution_id}',
    headers={'Authorization': f'Bearer {access_token}'}
)

data = response.json()
```

---

## File Types and Limits

### Supported File Types

| Category | Extensions | Max Size |
|----------|-----------|----------|
| Images | png, jpg, jpeg, gif, bmp, webp | 10 MB |
| Videos | mp4, webm, avi, mov | 100 MB |
| Documents | pdf, doc, docx, txt, md | 25 MB |
| Archives | zip, tar, gz | 50 MB |
| Other | json, xml, csv, xlsx | 10 MB |

### Storage Quotas

| Plan | Storage Limit | Retention Period |
|------|--------------|------------------|
| Free | 1 GB | 30 days |
| Professional | 50 GB | 90 days |
| Enterprise | 500 GB | 365 days |
| Custom | Unlimited | Custom |

---

## Image Processing

### Automatic Processing
- **Thumbnails**: Automatically generated for images (200x200px)
- **Optimization**: Images are automatically compressed
- **Format Conversion**: WebP format for better compression
- **Metadata Extraction**: EXIF data extracted and stored

### Available Operations

#### Resize
```
GET /storage/files/:id/download?width=800&height=600
```

#### Crop
```
GET /storage/files/:id/download?crop=true&x=0&y=0&width=400&height=300
```

#### Format Conversion
```
GET /storage/files/:id/download?format=webp
```

---

## Video Processing

### Automatic Processing
- **Thumbnails**: First frame extracted as thumbnail
- **Compression**: Videos automatically compressed
- **Format**: Converted to WebM for browser compatibility

### Video Metadata
- Duration
- Resolution
- Frame rate
- Codec information
- File size

---

## Security Features

### Access Control
- Files are private by default
- Access requires authentication
- Project-based permissions
- Temporary signed URLs available

### Virus Scanning
- All uploads are scanned for malware
- Infected files are automatically rejected
- Scan results stored in metadata

### Encryption
- Files encrypted at rest (AES-256)
- Encrypted in transit (TLS 1.3)
- Secure file URLs with expiration

---

## Retention and Cleanup

### Automatic Cleanup
- Orphaned files (not linked to any resource) are deleted after 30 days
- Old execution artifacts deleted based on plan retention period
- Soft delete with 7-day recovery period

### Manual Cleanup
```bash
# Delete all files for an execution
DELETE /storage/executions/:executionId

# Delete all files for a test case
DELETE /storage/test-cases/:testCaseId

# Delete all files older than a date
DELETE /storage/files?before=2024-01-01T00:00:00Z
```

---

## Common Error Codes

| Code | Description |
|------|-------------|
| FILE_NOT_FOUND | File does not exist |
| FILE_TOO_LARGE | File exceeds size limit |
| INVALID_FILE | File type not supported |
| QUOTA_EXCEEDED | Storage quota exceeded |
| UPLOAD_FAILED | File upload failed |
| VIRUS_DETECTED | File contains malware |
| INSUFFICIENT_PERMISSIONS | User lacks required permissions |
| RATE_LIMIT_EXCEEDED | Too many requests |

---

## Best Practices

### Upload Optimization
- Compress images before upload
- Use appropriate file formats (WebP for images, WebM for videos)
- Remove unnecessary metadata
- Batch upload when possible

### Performance
- Use thumbnails for previews
- Stream large video files
- Cache frequently accessed files
- Use CDN URLs when available

### Organization
- Use descriptive file names
- Add relevant tags
- Link files to appropriate resources
- Clean up unused files regularly
