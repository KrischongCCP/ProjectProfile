# Project Profile Management System

A comprehensive project staffing and resource management application built with Next.js.

## Features

- **Project Management**: Create and manage projects with deal size, dates, descriptions, and technology stacks
- **Staff Management**: Manage team members with titles and hourly costs
- **Role-Based Hour Allocation**: Automatically calculate and distribute project hours across roles (Developer, BA, Architect, PM)
- **Assignment Tracking**: Assign staff to projects with specific hour allocations and track progress
- **Real-time Validation**: Ensure hour allocations don't exceed role limits

## Quick Start

### Prerequisites

- Node.js 18+
- Docker (optional, for PostgreSQL)

### Installation

```bash
# Install dependencies
npm install

# Push database schema
npm run db:push

# Generate Prisma client
npm run db:generate

# Start development server
npm run dev
```

The application will be available at `http://localhost:3000`

### Using Docker PostgreSQL (Optional)

```bash
# Start PostgreSQL container
docker-compose up -d

# Update .env to use PostgreSQL connection string
# DATABASE_URL="postgresql://postgres:postgres@localhost:5432/project_profile"
```

## Usage

### Creating a Project

1. Navigate to Projects page
2. Click "New Project"
3. Fill in project details:
   - Name (required)
   - Description (max 150 words)
   - Status (Active/Completed)
   - Deal Size and Blended Rate
   - Start/End dates (duration auto-calculates)
   - Company and Partner names
   - Technology Stack (tags)

### Managing Staff

1. Navigate to Staff page
2. Click "Add Staff"
3. Enter name, title, and hourly cost
4. Staff are automatically assigned a default role for the allocation system

### Assigning Staff to Projects

1. Open a project detail page
2. Click "Assign Staff"
3. Select staff member and role
4. Enter hours to allocate (limited by role's available hours)
5. Click "Assign"

### Adjusting Role Allocations

1. Open a project detail page
2. Click "Edit Percentages" in the Hour Allocation section
3. Adjust percentages (must total 100%)
4. Click "Save Allocations"

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Next.js Frontend                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │  Projects   │  │    Staff    │  │   Roles     │     │
│  │    Page     │  │    Page     │  │  (System)   │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                   Next.js API Routes                     │
│  /api/projects  /api/staff  /api/roles  /api/assignments│
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                      Prisma ORM                          │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│              SQLite / PostgreSQL Database                │
└─────────────────────────────────────────────────────────┘
```

## License

Private - All rights reserved
