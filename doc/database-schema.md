# Database Schema

This document describes the database schema for the Project Profile application. The schema is managed using Prisma ORM with PostgreSQL.

## Overview

The database consists of four main models:
- **Project** - Project information and metadata
- **Staff** - Staff members with detailed profiles
- **Role** - Role definitions for staff assignments
- **Assignment** - Links staff to projects with specific roles

## Entity Relationship Diagram

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│   Project   │       │ Assignment  │       │    Staff    │
├─────────────┤       ├─────────────┤       ├─────────────┤
│ id (PK)     │◄──────┤ projectId   │       │ id (PK)     │
│ name        │       │ staffId     │──────►│ name        │
│ description │       │ roleId      │       │ title       │
│ status      │       │ allocated   │       │ roleId ─────┼──┐
│ dealSize    │       │ Hours       │       │ hourlyCost  │  │
│ blendedRate │       │ loggedHours │       │ hoursQuota  │  │
│ totalHours  │       └─────────────┘       │ email       │  │
│ startDate   │              │              │ phone       │  │
│ endDate     │              │              │ skills      │  │
│ periodMonths│              │              │ education   │  │
│ techStack   │              │              │ experience  │  │
│ enduser*    │              │              │ certs       │  │
│ partner*    │              │              │ bio         │  │
│ googleDrive │              │              │ execSummary │  │
│ documents   │              │              └─────────────┘  │
└─────────────┘              │                               │
                             │                               │
                             ▼                               ▼
                      ┌─────────────┐                 ┌─────────────┐
                      │    Role     │◄────────────────┤    Role     │
                      ├─────────────┤                 └─────────────┘
                      │ id (PK)     │
                      │ roleName    │
                      │ defaultAlloc│
                      └─────────────┘
```

## Models

### Project

Stores project information including financials, timeline, and associated documents.

| Field | Type | Description |
|-------|------|-------------|
| `id` | String (UUID) | Primary key |
| `name` | String | Project name |
| `description` | String? | Project description (optional) |
| `status` | String | Status: "ACTIVE" or "COMPLETED" |
| `dealSize` | Decimal | Total deal value in dollars |
| `blendedRate` | Decimal | Blended hourly rate in dollars |
| `totalHours` | Decimal | Total hours (dealSize / blendedRate) |
| `startDate` | DateTime? | Project start date |
| `endDate` | DateTime? | Project end date |
| `periodMonths` | Int? | Duration in months |
| `techStack` | String? | JSON array of technologies |
| `enduserId` | String? | External customer ID |
| `enduserName` | String? | Customer/company name |
| `enduserContactPerson` | String? | Customer contact |
| `partnerId` | String? | External partner ID |
| `partnerName` | String? | Partner name |
| `partnerSales` | String? | Partner sales contact |
| `googleDriveUrl` | String? | Link to document folder |
| `documents` | String? | JSON array of uploaded documents |
| `createdAt` | DateTime | Auto-generated creation timestamp |
| `updatedAt` | DateTime | Auto-updated modification timestamp |

**Relations:**
- `assignments`: One-to-many with Assignment

**Database Table:** `projects`

---

### Staff

Stores staff member information including detailed professional profiles.

| Field | Type | Description |
|-------|------|-------------|
| `id` | String (UUID) | Primary key |
| `name` | String | Staff member's full name |
| `title` | String? | Job title (e.g., "Senior Developer") |
| `roleId` | String | Foreign key to Role (default role) |
| `hourlyCost` | Decimal | Hourly cost rate |
| `hoursQuota` | Decimal | Weekly hours quota (default: 40) |
| `email` | String? | Email address |
| `phone` | String? | Phone number |
| `skills` | String? | JSON array of skill strings |
| `education` | String? | JSON array of education objects |
| `experience` | String? | JSON array of experience objects |
| `certifications` | String? | JSON array of certification strings |
| `bio` | String? | Short bio (~100 words) |
| `executiveSummary` | String? | Extended summary (~200 words) |
| `createdAt` | DateTime | Auto-generated creation timestamp |

**Relations:**
- `role`: Many-to-one with Role
- `assignments`: One-to-many with Assignment

**Database Table:** `staff`

#### JSON Field Structures

**Skills:**
```json
["TypeScript", "React", "Node.js", "PostgreSQL"]
```

**Education:**
```json
[
  {
    "degree": "Bachelor of Science in Computer Science",
    "institution": "University of Technology",
    "year": "2018"
  }
]
```

**Experience:**
```json
[
  {
    "company": "Tech Corp",
    "role": "Senior Developer",
    "duration": "2020-2023",
    "description": "Led development team..."
  }
]
```

**Certifications:**
```json
["AWS Solutions Architect", "Scrum Master"]
```

---

### Role

Defines roles that can be assigned to staff and project assignments.

| Field | Type | Description |
|-------|------|-------------|
| `id` | String (UUID) | Primary key |
| `roleName` | String | Unique role name |
| `defaultAllocationPercentage` | Decimal | Default allocation % |
| `createdAt` | DateTime | Auto-generated timestamp |

**Relations:**
- `staff`: One-to-many with Staff
- `assignments`: One-to-many with Assignment

**Database Table:** `roles`

**Example Roles:**
- Project Manager
- Business Analyst
- Software Developer
- Solution Architect
- QA Engineer

---

### Assignment

Links staff members to projects with specific roles and tracks hours.

| Field | Type | Description |
|-------|------|-------------|
| `id` | String (UUID) | Primary key |
| `projectId` | String | Foreign key to Project |
| `staffId` | String | Foreign key to Staff |
| `roleId` | String | Foreign key to Role |
| `allocatedHours` | Decimal | Hours allocated to assignment |
| `loggedHours` | Decimal | Hours actually worked |
| `createdAt` | DateTime | Auto-generated timestamp |
| `updatedAt` | DateTime | Auto-updated timestamp |

**Relations:**
- `project`: Many-to-one with Project (cascade delete)
- `staff`: Many-to-one with Staff (cascade delete)
- `role`: Many-to-one with Role

**Unique Constraint:** `[projectId, staffId, roleId]`

**Database Table:** `assignments`

---

## Indexes and Constraints

### Primary Keys
All models use UUID-based primary keys generated with `@default(uuid())`.

### Unique Constraints
- `Role.roleName` - Each role must have a unique name
- `Assignment(projectId, staffId, roleId)` - Prevents duplicate assignments

### Foreign Key Constraints
- `Assignment.projectId` → `Project.id` (CASCADE DELETE)
- `Assignment.staffId` → `Staff.id` (CASCADE DELETE)
- `Assignment.roleId` → `Role.id` (RESTRICT)
- `Staff.roleId` → `Role.id` (RESTRICT)

---

## Column Mappings

The Prisma schema uses camelCase field names that are mapped to snake_case database columns:

| Prisma Field | Database Column |
|-------------|-----------------|
| `roleId` | `role_id` |
| `hourlyCost` | `hourly_cost` |
| `hoursQuota` | `hours_quota` |
| `dealSize` | `deal_size` |
| `blendedRate` | `blended_rate` |
| `totalHours` | `total_hours` |
| `startDate` | `start_date` |
| `endDate` | `end_date` |
| `periodMonths` | `period_months` |
| `techStack` | `tech_stack` |
| `enduserId` | `enduser_id` |
| `enduserName` | `enduser_name` |
| `enduserContactPerson` | `enduser_contact_person` |
| `partnerId` | `partner_id` |
| `partnerName` | `partner_name` |
| `partnerSales` | `partner_sales` |
| `googleDriveUrl` | `google_drive_url` |
| `executiveSummary` | `executive_summary` |
| `allocatedHours` | `allocated_hours` |
| `loggedHours` | `logged_hours` |
| `projectId` | `project_id` |
| `staffId` | `staff_id` |
| `roleName` | `role_name` |
| `defaultAllocationPercentage` | `default_allocation_percentage` |
| `createdAt` | `created_at` |
| `updatedAt` | `updated_at` |

---

## Migrations

### Initial Setup
```bash
# Generate Prisma client
npm run db:generate

# Push schema to database (development)
npm run db:push

# Create migration (production)
npx prisma migrate dev --name init
```

### Schema Changes
When modifying the schema:

1. Update `prisma/schema.prisma`
2. Run `npm run db:generate` to update the Prisma client
3. Run `npm run db:push` to apply changes (development)
4. Or run `npx prisma migrate dev --name <change-description>` for production

---

## Seeding

The database can be seeded with sample data using:

```bash
npm run db:seed
```

This runs `prisma/seed.ts` which creates:
- Sample roles (Project Manager, Business Analyst, Developer, etc.)
- Sample staff members
- Sample projects with assignments
