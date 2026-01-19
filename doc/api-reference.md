# API Reference

Base URL: `http://localhost:3000/api`

## Projects

### List All Projects

```http
GET /api/projects
```

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Project Name",
    "description": "Description text",
    "status": "ACTIVE",
    "dealSize": "100000",
    "blendedRate": "100",
    "totalHours": "1000",
    "startDate": "2024-01-01T00:00:00.000Z",
    "endDate": "2024-12-31T00:00:00.000Z",
    "periodMonths": 12,
    "techStack": "[\"React\",\"Node.js\"]",
    "enduserName": "Customer Inc",
    "partnerName": "Partner Corp",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "assignments": []
  }
]
```

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
  "dealSize": 100000,
  "blendedRate": 100,
  "startDate": "2024-01-01",
  "endDate": "2024-12-31",
  "periodMonths": 12,
  "enduserName": "Customer Inc",
  "partnerName": "Partner Corp",
  "techStack": "[\"React\",\"Node.js\"]"
}
```

**Response:** `201 Created` with project object

### Get Project Details

```http
GET /api/projects/{id}
```

**Response:** Project object with assignments included

### Update Project

```http
PUT /api/projects/{id}
Content-Type: application/json
```

**Request Body:** Same as create (all fields optional)

**Response:** Updated project object

### Delete Project

```http
DELETE /api/projects/{id}
```

**Response:** `{ "success": true }`

---

## Staff

### List All Staff

```http
GET /api/staff
```

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "John Doe",
    "title": "Senior Developer",
    "roleId": "role-uuid",
    "hourlyCost": "150",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "role": {
      "id": "role-uuid",
      "roleName": "Developer",
      "defaultAllocationPercentage": "40"
    },
    "assignments": [],
    "totalAllocatedHours": 500,
    "totalLoggedHours": 250
  }
]
```

### Create Staff

```http
POST /api/staff
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "John Doe",
  "title": "Senior Developer",
  "hourlyCost": 150
}
```

Note: `roleId` is auto-assigned to the first available role.

**Response:** `201 Created` with staff object

### Get Staff Member

```http
GET /api/staff/{id}
```

**Response:** Staff object with role and assignments

### Update Staff

```http
PUT /api/staff/{id}
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Jane Doe",
  "title": "Lead Developer",
  "hourlyCost": 175
}
```

**Response:** Updated staff object

### Delete Staff

```http
DELETE /api/staff/{id}
```

**Response:** `{ "success": true }`

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
    "roleName": "Developer",
    "defaultAllocationPercentage": "40",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  {
    "id": "uuid",
    "roleName": "BA",
    "defaultAllocationPercentage": "30",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

### Create Role

```http
POST /api/roles
Content-Type: application/json
```

**Request Body:**
```json
{
  "roleName": "QA",
  "defaultAllocationPercentage": 10
}
```

**Response:** `201 Created` with role object

### Batch Update Role Percentages

```http
PUT /api/roles
Content-Type: application/json
```

**Request Body:**
```json
{
  "roles": [
    { "id": "uuid-1", "defaultAllocationPercentage": 35 },
    { "id": "uuid-2", "defaultAllocationPercentage": 30 },
    { "id": "uuid-3", "defaultAllocationPercentage": 20 },
    { "id": "uuid-4", "defaultAllocationPercentage": 15 }
  ]
}
```

**Validation:** Sum of all percentages must equal 100

**Response:** Array of updated roles

**Error Response:**
```json
{
  "error": "Total allocation must equal 100%"
}
```

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
  "projectId": "project-uuid",
  "staffId": "staff-uuid",
  "roleId": "role-uuid",
  "allocatedHours": 200
}
```

**Validation:** `allocatedHours` cannot exceed role's available hours

**Response:** `201 Created` with assignment object

### Delete Assignment

```http
DELETE /api/assignments/{id}
```

**Response:** `{ "success": true }`

### Log Hours

```http
POST /api/assignments/log-hours
Content-Type: application/json
```

**Request Body:**
```json
{
  "assignmentId": "assignment-uuid",
  "hours": 8
}
```

**Response:** Updated assignment object

---

## Error Responses

All endpoints may return error responses:

```json
{
  "error": "Error message description"
}
```

Common HTTP Status Codes:
- `400` - Bad Request (validation error)
- `404` - Not Found
- `500` - Internal Server Error
