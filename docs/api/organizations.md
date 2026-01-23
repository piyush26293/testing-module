# Organizations API

The Organizations API manages organization entities, which are higher-level groupings that contain multiple projects and users.

## Base URL
```
/api/v1/organizations
```

## Authentication
All endpoints require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <access_token>
```

## Rate Limiting
- Standard rate limit: 100 requests per 15 minutes per user
- Admin operations: 50 requests per 15 minutes

---

## Endpoints

### POST /organizations
Create a new organization.

**Required Role**: Admin

#### Request Body
```json
{
  "name": "Acme Corporation",
  "description": "Software testing organization",
  "website": "https://acme.com",
  "industry": "Technology",
  "size": "51-200",
  "settings": {
    "allowPublicProjects": false,
    "requireMFA": true,
    "maxProjects": 50
  }
}
```

#### Response: 201 Created
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Acme Corporation",
  "description": "Software testing organization",
  "slug": "acme-corporation",
  "website": "https://acme.com",
  "industry": "Technology",
  "size": "51-200",
  "settings": {
    "allowPublicProjects": false,
    "requireMFA": true,
    "maxProjects": 50
  },
  "memberCount": 1,
  "projectCount": 0,
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

#### Error Responses
- **400 Bad Request**: Invalid input data
- **401 Unauthorized**: Invalid or missing token
- **403 Forbidden**: Insufficient permissions
- **409 Conflict**: Organization name already exists

---

### GET /organizations
List all organizations the user has access to.

#### Query Parameters
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 20, max: 100)
- `search` (string, optional): Search by name or description
- `industry` (string, optional): Filter by industry
- `sort` (string, optional): Sort field (name, createdAt, memberCount)
- `order` (string, optional): Sort order (asc, desc)

#### Response: 200 OK
```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Acme Corporation",
      "description": "Software testing organization",
      "slug": "acme-corporation",
      "website": "https://acme.com",
      "industry": "Technology",
      "memberCount": 25,
      "projectCount": 12,
      "role": "admin",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "totalPages": 1
  }
}
```

---

### GET /organizations/:id
Get organization details by ID.

#### Path Parameters
- `id` (string, required): Organization ID

#### Response: 200 OK
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Acme Corporation",
  "description": "Software testing organization",
  "slug": "acme-corporation",
  "website": "https://acme.com",
  "industry": "Technology",
  "size": "51-200",
  "settings": {
    "allowPublicProjects": false,
    "requireMFA": true,
    "maxProjects": 50
  },
  "memberCount": 25,
  "projectCount": 12,
  "members": [
    {
      "id": "user-id-1",
      "email": "admin@acme.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "admin",
      "joinedAt": "2024-01-15T10:30:00Z"
    }
  ],
  "projects": [
    {
      "id": "project-id-1",
      "name": "Web App Testing",
      "testCaseCount": 45,
      "lastExecutionAt": "2024-01-20T15:45:00Z"
    }
  ],
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-20T09:15:00Z"
}
```

#### Error Responses
- **401 Unauthorized**: Invalid or missing token
- **403 Forbidden**: No access to this organization
- **404 Not Found**: Organization not found

---

### PATCH /organizations/:id
Update organization details.

**Required Role**: Admin or Owner

#### Path Parameters
- `id` (string, required): Organization ID

#### Request Body
```json
{
  "name": "Acme Corporation Ltd",
  "description": "Updated description",
  "website": "https://acme-corp.com",
  "settings": {
    "maxProjects": 100
  }
}
```

#### Response: 200 OK
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Acme Corporation Ltd",
  "description": "Updated description",
  "website": "https://acme-corp.com",
  "slug": "acme-corporation",
  "industry": "Technology",
  "size": "51-200",
  "settings": {
    "allowPublicProjects": false,
    "requireMFA": true,
    "maxProjects": 100
  },
  "updatedAt": "2024-01-20T10:00:00Z"
}
```

#### Error Responses
- **400 Bad Request**: Invalid input data
- **401 Unauthorized**: Invalid or missing token
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Organization not found
- **409 Conflict**: Updated name conflicts with existing organization

---

### DELETE /organizations/:id
Delete an organization.

**Required Role**: Owner

**Note**: This action is irreversible and will delete all associated projects, test cases, and data.

#### Path Parameters
- `id` (string, required): Organization ID

#### Query Parameters
- `confirm` (boolean, required): Must be true to confirm deletion

#### Response: 204 No Content

#### Error Responses
- **400 Bad Request**: Missing confirmation or organization has active projects
- **401 Unauthorized**: Invalid or missing token
- **403 Forbidden**: Insufficient permissions (must be owner)
- **404 Not Found**: Organization not found

---

### POST /organizations/:id/members
Add a member to the organization.

**Required Role**: Admin or Owner

#### Path Parameters
- `id` (string, required): Organization ID

#### Request Body
```json
{
  "userId": "user-id-123",
  "role": "member",
  "permissions": ["read", "write"]
}
```

**Roles**:
- `owner`: Full access, can delete organization
- `admin`: Manage members, projects, and settings
- `member`: Access projects based on permissions

#### Response: 201 Created
```json
{
  "id": "member-id-456",
  "userId": "user-id-123",
  "organizationId": "550e8400-e29b-41d4-a716-446655440000",
  "user": {
    "id": "user-id-123",
    "email": "newuser@acme.com",
    "firstName": "Jane",
    "lastName": "Smith"
  },
  "role": "member",
  "permissions": ["read", "write"],
  "joinedAt": "2024-01-20T11:00:00Z"
}
```

#### Error Responses
- **400 Bad Request**: Invalid role or user already a member
- **401 Unauthorized**: Invalid or missing token
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Organization or user not found

---

### PATCH /organizations/:id/members/:userId
Update member role or permissions.

**Required Role**: Admin or Owner

#### Path Parameters
- `id` (string, required): Organization ID
- `userId` (string, required): User ID

#### Request Body
```json
{
  "role": "admin",
  "permissions": ["read", "write", "delete"]
}
```

#### Response: 200 OK
```json
{
  "id": "member-id-456",
  "userId": "user-id-123",
  "organizationId": "550e8400-e29b-41d4-a716-446655440000",
  "role": "admin",
  "permissions": ["read", "write", "delete"],
  "updatedAt": "2024-01-20T12:00:00Z"
}
```

---

### DELETE /organizations/:id/members/:userId
Remove a member from the organization.

**Required Role**: Admin or Owner

**Note**: Cannot remove the last owner from an organization.

#### Path Parameters
- `id` (string, required): Organization ID
- `userId` (string, required): User ID to remove

#### Response: 204 No Content

#### Error Responses
- **400 Bad Request**: Cannot remove last owner
- **401 Unauthorized**: Invalid or missing token
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Organization or member not found

---

### GET /organizations/:id/projects
Get all projects in an organization.

#### Path Parameters
- `id` (string, required): Organization ID

#### Query Parameters
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 20)
- `status` (string, optional): Filter by status (active, archived)

#### Response: 200 OK
```json
{
  "data": [
    {
      "id": "project-id-1",
      "name": "Web App Testing",
      "key": "WEBAPP",
      "description": "Testing web application",
      "status": "active",
      "testCaseCount": 45,
      "memberCount": 8,
      "lastExecutionAt": "2024-01-20T15:45:00Z",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 12,
    "totalPages": 1
  }
}
```

---

### GET /organizations/:id/statistics
Get organization statistics and metrics.

**Required Role**: Member or higher

#### Path Parameters
- `id` (string, required): Organization ID

#### Query Parameters
- `period` (string, optional): Time period (7d, 30d, 90d, 1y) - default: 30d

#### Response: 200 OK
```json
{
  "organizationId": "550e8400-e29b-41d4-a716-446655440000",
  "period": "30d",
  "metrics": {
    "totalProjects": 12,
    "activeProjects": 10,
    "totalTestCases": 450,
    "totalExecutions": 1250,
    "successRate": 87.5,
    "averageExecutionTime": "2m 35s",
    "totalMembers": 25,
    "activeMembers": 18
  },
  "trends": {
    "executionsPerDay": [
      { "date": "2024-01-14", "count": 45 },
      { "date": "2024-01-15", "count": 52 }
    ],
    "successRateOverTime": [
      { "date": "2024-01-14", "rate": 85.2 },
      { "date": "2024-01-15", "rate": 87.5 }
    ]
  },
  "topProjects": [
    {
      "id": "project-id-1",
      "name": "Web App Testing",
      "executionCount": 340,
      "successRate": 92.1
    }
  ],
  "generatedAt": "2024-01-20T16:00:00Z"
}
```

---

## Code Examples

### cURL

**Create Organization**:
```bash
curl -X POST https://api.testing-platform.com/api/v1/organizations \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Acme Corporation",
    "description": "Software testing organization",
    "website": "https://acme.com",
    "industry": "Technology"
  }'
```

**List Organizations**:
```bash
curl -X GET "https://api.testing-platform.com/api/v1/organizations?page=1&limit=20" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### JavaScript/TypeScript

```typescript
import axios from 'axios';

const API_BASE_URL = 'https://api.testing-platform.com/api/v1';
const accessToken = 'YOUR_ACCESS_TOKEN';

// Create organization
async function createOrganization(orgData: any) {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/organizations`,
      orgData,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error creating organization:', error);
    throw error;
  }
}

// Get organization statistics
async function getOrgStatistics(orgId: string, period: string = '30d') {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/organizations/${orgId}/statistics`,
      {
        params: { period },
        headers: { 'Authorization': `Bearer ${accessToken}` }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching statistics:', error);
    throw error;
  }
}

// Add member to organization
async function addMember(orgId: string, userId: string, role: string) {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/organizations/${orgId}/members`,
      { userId, role, permissions: ['read', 'write'] },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error adding member:', error);
    throw error;
  }
}
```

### Python

```python
import requests

API_BASE_URL = 'https://api.testing-platform.com/api/v1'
ACCESS_TOKEN = 'YOUR_ACCESS_TOKEN'

def create_organization(org_data):
    """Create a new organization"""
    headers = {
        'Authorization': f'Bearer {ACCESS_TOKEN}',
        'Content-Type': 'application/json'
    }
    
    response = requests.post(
        f'{API_BASE_URL}/organizations',
        json=org_data,
        headers=headers
    )
    
    if response.status_code == 201:
        return response.json()
    else:
        response.raise_for_status()

def get_organization(org_id):
    """Get organization details"""
    headers = {'Authorization': f'Bearer {ACCESS_TOKEN}'}
    
    response = requests.get(
        f'{API_BASE_URL}/organizations/{org_id}',
        headers=headers
    )
    
    if response.status_code == 200:
        return response.json()
    else:
        response.raise_for_status()

def update_organization(org_id, updates):
    """Update organization"""
    headers = {
        'Authorization': f'Bearer {ACCESS_TOKEN}',
        'Content-Type': 'application/json'
    }
    
    response = requests.patch(
        f'{API_BASE_URL}/organizations/{org_id}',
        json=updates,
        headers=headers
    )
    
    if response.status_code == 200:
        return response.json()
    else:
        response.raise_for_status()

# Example usage
if __name__ == '__main__':
    # Create organization
    new_org = create_organization({
        'name': 'Acme Corporation',
        'description': 'Software testing organization',
        'website': 'https://acme.com',
        'industry': 'Technology'
    })
    print(f"Created organization: {new_org['id']}")
    
    # Get organization details
    org_details = get_organization(new_org['id'])
    print(f"Organization members: {org_details['memberCount']}")
```

---

## Error Codes

| Code | Message | Description |
|------|---------|-------------|
| ORG_001 | Organization not found | The specified organization ID does not exist |
| ORG_002 | Organization name already exists | An organization with this name already exists |
| ORG_003 | Invalid organization data | The request data is invalid or incomplete |
| ORG_004 | Cannot delete organization | Organization has active projects or is not empty |
| ORG_005 | Member already exists | User is already a member of the organization |
| ORG_006 | Member not found | The specified member does not exist in the organization |
| ORG_007 | Cannot remove last owner | Organizations must have at least one owner |
| ORG_008 | Project limit reached | Organization has reached maximum project limit |
| ORG_009 | Insufficient permissions | User does not have required permissions |

---

## Best Practices

1. **Organization Structure**: Use organizations to group related projects and teams
2. **Member Management**: Assign appropriate roles based on responsibilities
3. **Settings**: Configure security settings (MFA, access controls) early
4. **Monitoring**: Regularly review organization statistics and metrics
5. **Cleanup**: Archive or delete unused projects to stay within limits

---

## Related Documentation

- [Projects API](projects.md) - Managing projects within organizations
- [Users API](users.md) - User management and authentication
- [User Guide](../USER_GUIDE.md) - Organization management guide

---

**Last Updated**: January 2024
