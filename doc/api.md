# API Documentation

This document describes the REST API endpoints for the Project Profile application.

## Base URL

All API endpoints are relative to the application base URL:
- Development: `http://localhost:3000`
- Production: Your deployed URL

## Response Format

All responses are JSON formatted. Successful responses return the requested data directly. Error responses follow this format:

```json
{
  "error": "Error message description"
}
```

## HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 404 | Not Found |
| 500 | Internal Server Error |

---

## Projects

### List All Projects

```http
GET /api/projects
```

**Response:** Array of projects with assignments

```json
[
  {
    "id": "uuid",
    "name": "Project Name",
    "description": "Project description",
    "status": "ACTIVE",
    "dealSize": "50000",
    "blendedRate": "100",
    "totalHours": "500",
    "startDate": "2024-01-01T00:00:00.000Z",
    "endDate": "2024-06-30T00:00:00.000Z",
    "periodMonths": 6,
    "techStack": "[\"React\",\"Node.js\"]",
    "enduserName": "Customer Corp",
    "partnerName": "Partner LLC",
    "googleDriveUrl": "https://drive.google.com/...",
    "documents": "[{\"name\":\"doc.pdf\",\"url\":\"...\"}]",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-15T00:00:00.000Z",
    "assignments": [
      {
        "id": "uuid",
        "staff": { "name": "John Doe" },
        "role": { "roleName": "Project Manager" }
      }
    ]
  }
]
```

---

### Create Project

```http
POST /api/projects
Content-Type: application/json
```

**Request Body:**

```json
{
  "name": "New Project",
  "description": "Project description",
  "status": "ACTIVE",
  "dealSize": "50000",
  "blendedRate": "100",
  "startDate": "2024-01-01",
  "endDate": "2024-06-30",
  "periodMonths": 6,
  "enduserName": "Customer Corp",
  "partnerName": "Partner LLC",
  "techStack": "[\"React\",\"Node.js\"]",
  "googleDriveUrl": "https://drive.google.com/...",
  "documents": "[{\"name\":\"doc.pdf\",\"url\":\"/uploads/doc.pdf\",\"uploadedAt\":\"2024-01-01\"}]"
}
```

**Required Fields:** `name`, `dealSize`, `blendedRate`

**Response:** Created project object

---

### Get Project Details

```http
GET /api/projects/[id]
```

**Response:** Project with role and full assignments

```json
{
  "id": "uuid",
  "name": "Project Name",
  "status": "ACTIVE",
  "dealSize": "50000",
  "blendedRate": "100",
  "totalHours": "500",
  "assignments": [
    {
      "id": "uuid",
      "allocatedHours": "100",
      "loggedHours": "45",
      "staff": {
        "id": "uuid",
        "name": "John Doe",
        "hourlyCost": "75"
      },
      "role": {
        "id": "uuid",
        "roleName": "Project Manager"
      }
    }
  ]
}
```

---

### Update Project

```http
PUT /api/projects/[id]
Content-Type: application/json
```

**Request Body:** (all fields optional)

```json
{
  "name": "Updated Name",
  "description": "Updated description",
  "status": "COMPLETED",
  "dealSize": "60000",
  "blendedRate": "120"
}
```

**Response:** Updated project object

---

### Delete Project

```http
DELETE /api/projects/[id]
```

**Response:**

```json
{
  "success": true
}
```

**Note:** Deleting a project cascades to delete all associated assignments.

---

## Staff

### List All Staff

```http
GET /api/staff
```

**Response:** Array of staff with aggregated hours

```json
[
  {
    "id": "uuid",
    "name": "John Doe",
    "title": "Senior Developer",
    "hourlyCost": "75",
    "hoursQuota": "40",
    "email": "john@example.com",
    "phone": "+1234567890",
    "skills": "[\"TypeScript\",\"React\"]",
    "bio": "Experienced developer...",
    "executiveSummary": "John is a senior...",
    "role": {
      "id": "uuid",
      "roleName": "Software Developer"
    },
    "assignments": [
      {
        "id": "uuid",
        "allocatedHours": "80",
        "loggedHours": "40",
        "project": {
          "id": "uuid",
          "name": "Project A",
          "status": "ACTIVE"
        },
        "role": {
          "id": "uuid",
          "roleName": "Tech Lead"
        }
      }
    ],
    "totalAllocatedHours": 80,
    "totalLoggedHours": 40
  }
]
```

**Note:** `totalAllocatedHours` and `totalLoggedHours` are computed fields summing all assignment hours.

---

### Create Staff Member

```http
POST /api/staff
Content-Type: application/json
```

**Request Body:**

```json
{
  "name": "Jane Smith",
  "title": "Project Manager",
  "roleId": "uuid",
  "hourlyCost": "100",
  "hoursQuota": "40"
}
```

**Required Fields:** `name`, `roleId`, `hourlyCost`

**Response:** Created staff object with role

---

### Get Staff Details

```http
GET /api/staff/[id]
```

**Response:** Staff with role and assignments

```json
{
  "id": "uuid",
  "name": "John Doe",
  "title": "Senior Developer",
  "hourlyCost": "75",
  "hoursQuota": "40",
  "email": "john@example.com",
  "phone": "+1234567890",
  "skills": "[\"TypeScript\",\"React\"]",
  "education": "[{\"degree\":\"BSc\",\"institution\":\"MIT\",\"year\":\"2015\"}]",
  "experience": "[{\"company\":\"Tech Corp\",\"role\":\"Developer\",\"duration\":\"2015-2020\",\"description\":\"...\"}]",
  "certifications": "[\"AWS Certified\"]",
  "bio": "Experienced developer...",
  "executiveSummary": "John is a senior...",
  "role": {
    "id": "uuid",
    "roleName": "Software Developer"
  },
  "assignments": [
    {
      "id": "uuid",
      "allocatedHours": "80",
      "loggedHours": "40",
      "project": {
        "id": "uuid",
        "name": "Project A",
        "status": "ACTIVE"
      },
      "role": {
        "id": "uuid",
        "roleName": "Tech Lead"
      }
    }
  ]
}
```

---

### Update Staff Member

```http
PUT /api/staff/[id]
Content-Type: application/json
```

**Request Body:** (all fields optional)

```json
{
  "name": "John Doe",
  "title": "Lead Developer",
  "hourlyCost": "85",
  "hoursQuota": "45",
  "email": "john.doe@example.com",
  "phone": "+1234567890",
  "bio": "Updated bio text...",
  "executiveSummary": "Updated executive summary...",
  "skills": "[\"TypeScript\",\"React\",\"Node.js\"]",
  "education": "[{\"degree\":\"MSc\",\"institution\":\"Stanford\",\"year\":\"2017\"}]",
  "experience": "[{\"company\":\"Big Tech\",\"role\":\"Senior Dev\",\"duration\":\"2020-2024\",\"description\":\"Led team...\"}]",
  "certifications": "[\"AWS Solutions Architect\",\"Scrum Master\"]"
}
```

**Response:** Updated staff object with role

---

### Delete Staff Member

```http
DELETE /api/staff/[id]
```

**Response:**

```json
{
  "success": true
}
```

**Note:** Deleting a staff member cascades to delete all associated assignments.

---

## Roles

### List All Roles

```http
GET /api/roles
```

**Response:**

```json
[
  {
    "id": "uuid",
    "roleName": "Project Manager",
    "defaultAllocationPercentage": "100",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  {
    "id": "uuid",
    "roleName": "Business Analyst",
    "defaultAllocationPercentage": "80",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

---

### Create Role

```http
POST /api/roles
Content-Type: application/json
```

**Request Body:**

```json
{
  "roleName": "QA Engineer",
  "defaultAllocationPercentage": "100"
}
```

**Required Fields:** `roleName`, `defaultAllocationPercentage`

**Response:** Created role object

---

## Assignments

### Create Assignment

```http
POST /api/assignments
Content-Type: application/json
```

**Request Body:**

```json
{
  "projectId": "uuid",
  "staffId": "uuid",
  "roleId": "uuid",
  "allocatedHours": "80"
}
```

**Required Fields:** `projectId`, `staffId`, `roleId`

**Response:** Created assignment with project, staff, and role

```json
{
  "id": "uuid",
  "projectId": "uuid",
  "staffId": "uuid",
  "roleId": "uuid",
  "allocatedHours": "80",
  "loggedHours": "0",
  "project": { "id": "uuid", "name": "Project A" },
  "staff": { "id": "uuid", "name": "John Doe" },
  "role": { "id": "uuid", "roleName": "Developer" }
}
```

---

### Update Assignment

```http
PUT /api/assignments/[id]
Content-Type: application/json
```

**Request Body:**

```json
{
  "allocatedHours": "100",
  "loggedHours": "50"
}
```

**Response:** Updated assignment object

---

### Delete Assignment

```http
DELETE /api/assignments/[id]
```

**Response:**

```json
{
  "success": true
}
```

---

## File Upload

### Upload Document

```http
POST /api/upload
Content-Type: multipart/form-data
```

**Form Data:**
- `file`: The file to upload
- `projectId`: Project ID or "new" for new projects

**Response:**

```json
{
  "success": true,
  "file": {
    "name": "document.pdf",
    "url": "/uploads/project-id/1704067200000-document.pdf",
    "uploadedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Supported:** All file types. Files are stored in `public/uploads/[projectId]/`

---

## Error Handling

### Common Errors

**404 Not Found:**
```json
{
  "error": "Staff member not found"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Failed to fetch staff"
}
```

**400 Bad Request:**
```json
{
  "error": "Name and role are required"
}
```

---

## Usage Examples

### Create a Complete Project Flow

1. **Create roles** (if not existing):
```bash
curl -X POST http://localhost:3000/api/roles \
  -H "Content-Type: application/json" \
  -d '{"roleName":"Developer","defaultAllocationPercentage":"100"}'
```

2. **Create staff members:**
```bash
curl -X POST http://localhost:3000/api/staff \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","roleId":"<role-uuid>","hourlyCost":"75"}'
```

3. **Create project:**
```bash
curl -X POST http://localhost:3000/api/projects \
  -H "Content-Type: application/json" \
  -d '{"name":"New Website","dealSize":"25000","blendedRate":"100"}'
```

4. **Assign staff to project:**
```bash
curl -X POST http://localhost:3000/api/assignments \
  -H "Content-Type: application/json" \
  -d '{"projectId":"<project-uuid>","staffId":"<staff-uuid>","roleId":"<role-uuid>","allocatedHours":"80"}'
```

### Update Staff Profile

```bash
curl -X PUT http://localhost:3000/api/staff/<staff-uuid> \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "bio": "Experienced developer with 10+ years...",
    "skills": "[\"React\",\"TypeScript\",\"Node.js\"]",
    "education": "[{\"degree\":\"BSc Computer Science\",\"institution\":\"MIT\",\"year\":\"2014\"}]"
  }'
```
