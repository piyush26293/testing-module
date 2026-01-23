# Projects Module

This module handles project management operations in the testing platform.

## Features

- **CRUD Operations**: Create, read, update, and delete projects
- **Access Control**: Role-based access control with project-level permissions
- **Member Management**: Add, remove, and list project members
- **Automatic Slug Generation**: URL-friendly slugs are automatically generated from project names
- **Soft Deletes**: Projects are soft-deleted to preserve data integrity
- **Organization Scoping**: Projects are scoped to organizations

## Endpoints

### Projects

- `POST /projects` - Create a new project
- `GET /projects` - List all projects user has access to (with pagination)
- `GET /projects/:id` - Get a single project by ID
- `PATCH /projects/:id` - Update a project (admins and project managers only)
- `DELETE /projects/:id` - Soft delete a project (admins and project managers only)

### Project Members

- `POST /projects/:id/members` - Add a member to a project (admins and project managers only)
- `GET /projects/:id/members` - List all members of a project
- `DELETE /projects/:id/members/:userId` - Remove a member from a project (admins and project managers only)

## Authorization

### Project Access Levels

- **Admin**: Full access to all operations (organization-wide)
- **Project Manager**: Can manage projects they're assigned to
- **QA Lead / QA Engineer / Developer / Viewer**: Can view projects they're members of

### Permission Rules

1. **Project Creation**: Any authenticated user can create a project
2. **Project Updates**: Only project admins and project managers can update
3. **Project Deletion**: Only project admins and project managers can delete
4. **Member Management**: Only project admins and project managers can add/remove members
5. **Project Viewing**: Any project member can view the project
6. **Organization Admins**: Have full access to all projects in their organization

## DTOs

### CreateProjectDto

```typescript
{
  name: string;              // Required, max 255 chars
  description?: string;      // Optional
  baseUrl?: string;          // Optional, must be valid URL
  organizationId: string;    // Required, UUID
  settings?: object;         // Optional, JSON object
}
```

### UpdateProjectDto

```typescript
{
  name?: string;             // Optional, max 255 chars
  description?: string;      // Optional
  baseUrl?: string;          // Optional, must be valid URL
  status?: ProjectStatus;    // Optional, enum: 'active', 'archived', 'deleted'
  settings?: object;         // Optional, JSON object
}
```

### AddMemberDto

```typescript
{
  userId: string;            // Required, UUID
  role: UserRole;            // Required, enum: 'admin', 'project_manager', 'qa_lead', 'qa_engineer', 'developer', 'viewer'
}
```

## Business Logic

### Project Creation

1. Validates input data
2. Generates URL-friendly slug from project name
3. Ensures slug uniqueness within the organization
4. Creates project with the provided data
5. Automatically adds creator as an admin member

### Project Access Control

- System admins have access to all projects
- Regular users only have access to projects they're members of
- Project listing is filtered based on user's organization and memberships

### Member Management

- Members must belong to the same organization as the project
- A user cannot remove themselves from a project
- Each project must have at least one admin member
- Duplicate memberships are prevented

## Examples

### Create a Project

```bash
POST /projects
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "E-Commerce Platform",
  "description": "Testing project for our main e-commerce application",
  "baseUrl": "https://shop.example.com",
  "organizationId": "123e4567-e89b-12d3-a456-426614174000",
  "settings": {
    "retryOnFailure": true,
    "maxRetries": 3
  }
}
```

### Add a Member

```bash
POST /projects/abc123/members
Authorization: Bearer <token>
Content-Type: application/json

{
  "userId": "456e7890-e89b-12d3-a456-426614174000",
  "role": "qa_engineer"
}
```

### List Projects

```bash
GET /projects?page=1&limit=10
Authorization: Bearer <token>
```

## Error Handling

The module returns appropriate HTTP status codes:

- `200 OK` - Successful GET, PATCH, DELETE
- `201 Created` - Successful POST
- `400 Bad Request` - Invalid input data
- `401 Unauthorized` - Missing or invalid authentication token
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `409 Conflict` - Duplicate slug or member

## Dependencies

- `@nestjs/common`
- `@nestjs/typeorm`
- `typeorm`
- `class-validator`
- `class-transformer`
- `@nestjs/swagger`

## Related Entities

- `Project` - Main project entity
- `ProjectMember` - Project membership relationship
- `User` - User entity for authentication
- `Organization` - Organization that owns the project
