# Project Profile

A comprehensive **Project Management & Resource Allocation System** built with Next.js 14, Prisma, and PostgreSQL. This application helps organizations manage projects, track staff contributions, and maintain detailed professional profiles.

## Features

### Dashboard
- Overview of active and potential projects
- Total deal value and billable hours tracking
- Staff workload visualization with progress indicators
- Over-allocation warnings for staff exceeding their hours quota

### Project Management
- Create and manage projects with comprehensive details
- Track deal size, blended rates, and calculated hours
- Assign technology stack tags
- Document management with file uploads and Google Drive integration
- Project period tracking with auto-calculated duration
- Company and partner information

### Staff Contribution Dashboard
- View all staff members with their allocation status
- Configurable hours quota per staff member (default: 40 hours)
- Over-allocation detection and visual warnings
- Track allocated vs logged hours with progress bars
- View project assignments with role information
- Add, edit, and delete staff members

### Staff Profiles
- Detailed professional profiles for each staff member
- Contact information (email, phone)
- Bio summary (~100 words) with auto-generation feature
- Executive summary (~200 words) for detailed professional overview
- Skills management with tags
- Education history (degree, institution, year)
- Work experience (company, role, duration, description)
- Professional certifications
- Project experience pulled from assignments

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: PostgreSQL with Prisma ORM
- **Styling**: Tailwind CSS
- **Language**: TypeScript
- **Runtime**: Node.js

## Prerequisites

- Node.js 18+
- PostgreSQL database
- npm or yarn

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd project-profile
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**

   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/project_profile"
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma client
   npm run db:generate

   # Push schema to database
   npm run db:push

   # (Optional) Seed with sample data
   npm run db:seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push schema changes to database |
| `npm run db:seed` | Seed database with sample data |

## Project Structure

```
project-profile/
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts            # Database seeding script
├── src/
│   ├── app/
│   │   ├── api/           # API routes
│   │   │   ├── projects/  # Project CRUD operations
│   │   │   ├── staff/     # Staff CRUD operations
│   │   │   ├── roles/     # Role management
│   │   │   └── upload/    # File upload handling
│   │   ├── projects/      # Project pages
│   │   ├── staff/         # Staff Contribution Dashboard
│   │   ├── staff-profiles/# Staff Profiles pages
│   │   ├── layout.tsx     # Root layout with navigation
│   │   ├── page.tsx       # Dashboard page
│   │   └── globals.css    # Global styles
│   ├── components/
│   │   └── Navigation.tsx # Main navigation component
│   └── lib/
│       └── prisma.ts      # Prisma client instance
├── public/
│   └── uploads/           # Uploaded files storage
└── docs/
    ├── database-schema.md # Database documentation
    └── api.md             # API documentation
```

## Database Models

### Project
- Project details (name, description, status)
- Financial information (deal size, blended rate, total hours)
- Timeline (start date, end date, period months)
- Technology stack (JSON array)
- Customer/partner information
- Document storage

### Staff
- Basic info (name, title, hourly cost, hours quota)
- Contact details (email, phone)
- Profile content (bio, executive summary)
- Skills, education, experience, certifications (JSON)
- Role assignment

### Role
- Role name (e.g., "Project Manager", "Business Analyst")
- Default allocation percentage

### Assignment
- Links staff to projects with specific roles
- Tracks allocated and logged hours

## Key Features Explained

### Hours Quota & Over-Allocation
Each staff member has a configurable hours quota (default: 40 hours). When their total allocated hours across all projects exceeds this quota, they are flagged as "over-allocated" with visual warnings throughout the application.

### Auto-Generate Bio
The staff profile page includes an "Auto-generate from profile" feature that creates a professional bio (~100 words) based on:
- Staff title and name
- Work experience (calculates total years)
- Top skills
- Current project assignments and roles
- Certifications

### Project Role Display
When viewing staff assignments, each project displays the specific role the staff member holds on that project, not just their default role. This provides accurate visibility into contribution types.

## API Endpoints

### Projects
- `GET /api/projects` - List all projects
- `POST /api/projects` - Create a project
- `GET /api/projects/[id]` - Get project details
- `PUT /api/projects/[id]` - Update project
- `DELETE /api/projects/[id]` - Delete project

### Staff
- `GET /api/staff` - List all staff with aggregated hours
- `POST /api/staff` - Create staff member
- `GET /api/staff/[id]` - Get staff details with assignments
- `PUT /api/staff/[id]` - Update staff (including profile fields)
- `DELETE /api/staff/[id]` - Delete staff member

### Roles
- `GET /api/roles` - List all roles
- `POST /api/roles` - Create a role

### Assignments
- `POST /api/assignments` - Create assignment
- `PUT /api/assignments/[id]` - Update assignment
- `DELETE /api/assignments/[id]` - Delete assignment

## License

Private - All rights reserved

## Contributing

This is a private project. Contact the project maintainers for contribution guidelines.
# ProjectProfile
