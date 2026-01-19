# Claude AI Assistant Instructions

## Project Overview

This is a **Project Profile Management System** built with Next.js 14, Prisma ORM, and SQLite. It helps manage project staffing, hour allocations, and resource tracking.

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: SQLite (development), PostgreSQL (Docker available)
- **ORM**: Prisma

## Key Concepts

### Projects
- Projects have a deal size and blended rate that calculate total hours
- Projects can have descriptions, dates, company/partner info, and tech stack tags
- Status: ACTIVE or COMPLETED

### Roles & Hour Allocation
- Roles (Developer, BA, Architect, PM) have percentage allocations that must total 100%
- Role percentages determine how project hours are distributed
- Example: 2760 total hours with Developer at 40% = 1104 hours for developers

### Staff
- Staff members have a name, title (display only), and hourly cost
- Title is for display purposes and not linked to the role system
- Staff are assigned to projects with specific hour allocations

### Assignments
- Staff are assigned to projects with a specific role and hour allocation
- The allocated hours cannot exceed the role's remaining available hours
- Progress is tracked via logged hours vs allocated hours

## File Structure

```
src/
├── app/
│   ├── api/
│   │   ├── assignments/     # Assignment CRUD
│   │   ├── projects/        # Project CRUD
│   │   ├── roles/           # Role management
│   │   └── staff/           # Staff CRUD
│   ├── projects/
│   │   ├── page.tsx         # Projects list
│   │   └── [id]/page.tsx    # Project detail
│   ├── staff/page.tsx       # Staff management
│   └── layout.tsx           # Root layout
├── lib/
│   └── prisma.ts            # Prisma client
prisma/
├── schema.prisma            # Database schema
└── dev.db                   # SQLite database
```

## Common Tasks

### Adding a New Field to a Model
1. Update `prisma/schema.prisma`
2. Run `npx prisma db push` to sync schema
3. Run `npx prisma generate` to update client
4. Update TypeScript interfaces in relevant page files
5. Update API routes to handle the new field
6. Update UI forms and displays

### Modifying Role Percentages
- Percentages must always total 100%
- Use the "Edit Percentages" button on project detail page
- Changes affect all projects' hour calculations

### Staff Assignment Flow
1. Select staff member
2. Select role for the project
3. Enter hours to allocate (cannot exceed role's available hours)
4. System validates and creates assignment

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/projects | List all projects |
| POST | /api/projects | Create project |
| GET | /api/projects/[id] | Get project details |
| PUT | /api/projects/[id] | Update project |
| DELETE | /api/projects/[id] | Delete project |
| GET | /api/staff | List all staff |
| POST | /api/staff | Create staff (auto-assigns default role) |
| PUT | /api/staff/[id] | Update staff |
| DELETE | /api/staff/[id] | Delete staff |
| GET | /api/roles | List all roles |
| PUT | /api/roles | Batch update role percentages |
| POST | /api/assignments | Create assignment |
| DELETE | /api/assignments/[id] | Remove assignment |

## Development Commands

```bash
# Start development server
npm run dev

# Start Docker PostgreSQL
docker-compose up -d

# Push schema changes
npm run db:push

# Generate Prisma client
npm run db:generate

# Open Prisma Studio
npx prisma studio
```

## Important Notes

1. **Title vs Role**: Staff "title" is display text only. The "role" system (Developer, BA, etc.) is used for hour allocation calculations.

2. **Hour Allocation Validation**: When assigning staff, hours cannot exceed the remaining available hours for that role in the project.

3. **Percentage Validation**: Role percentages must always sum to exactly 100%.

4. **Tech Stack**: Stored as JSON string in SQLite since it doesn't support arrays natively.
