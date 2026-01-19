# Development Guide

## Prerequisites

- Node.js 18 or higher
- npm or yarn
- Docker Desktop (optional, for PostgreSQL)
- Git

## Initial Setup

### 1. Clone and Install

```bash
git clone <repository-url>
cd Project_Profile
npm install
```

### 2. Environment Configuration

Create or update `.env` file:

```env
# SQLite (default)
DATABASE_URL="file:./dev.db"

# PostgreSQL (Docker)
# DATABASE_URL="postgresql://postgres:postgres@localhost:5432/project_profile"
```

### 3. Database Setup

```bash
# Push schema to database
npm run db:push

# Generate Prisma client
npm run db:generate

# (Optional) Seed database
npm run db:seed
```

### 4. Start Development Server

```bash
npm run dev
```

## Project Structure

```
Project_Profile/
├── doc/                    # Documentation
├── prisma/
│   ├── schema.prisma       # Database schema
│   ├── dev.db              # SQLite database file
│   └── seed.ts             # Database seed script
├── src/
│   ├── app/
│   │   ├── api/            # API routes
│   │   │   ├── assignments/
│   │   │   ├── projects/
│   │   │   ├── roles/
│   │   │   └── staff/
│   │   ├── projects/       # Project pages
│   │   │   ├── page.tsx    # List view
│   │   │   └── [id]/
│   │   │       └── page.tsx # Detail view
│   │   ├── staff/
│   │   │   └── page.tsx    # Staff management
│   │   ├── layout.tsx      # Root layout
│   │   ├── page.tsx        # Home page
│   │   └── globals.css     # Global styles
│   └── lib/
│       └── prisma.ts       # Prisma client singleton
├── docker-compose.yml      # Docker PostgreSQL config
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

## Development Workflow

### Making Database Changes

1. **Edit Schema**
   ```prisma
   // prisma/schema.prisma
   model Staff {
     id          String       @id @default(uuid())
     name        String
     newField    String?      @map("new_field")  // Add new field
     ...
   }
   ```

2. **Push Changes**
   ```bash
   npm run db:push
   ```

3. **Regenerate Client**
   ```bash
   npm run db:generate
   ```

4. **Update TypeScript Interfaces**
   Update interfaces in relevant page files to match schema.

5. **Update API Routes**
   Modify API handlers to accept/return new fields.

6. **Update UI**
   Add form fields and display elements.

### Adding a New API Endpoint

1. Create route file: `src/app/api/[endpoint]/route.ts`

2. Implement handlers:
   ```typescript
   import { NextRequest, NextResponse } from 'next/server'
   import { prisma } from '@/lib/prisma'

   export async function GET() {
     try {
       const data = await prisma.model.findMany()
       return NextResponse.json(data)
     } catch (error) {
       return NextResponse.json(
         { error: 'Failed to fetch' },
         { status: 500 }
       )
     }
   }

   export async function POST(request: NextRequest) {
     try {
       const body = await request.json()
       // Validate and create
       return NextResponse.json(result, { status: 201 })
     } catch (error) {
       return NextResponse.json(
         { error: 'Failed to create' },
         { status: 500 }
       )
     }
   }
   ```

### Adding a New Page

1. Create page file: `src/app/[page]/page.tsx`

2. Use client components for interactivity:
   ```typescript
   'use client'

   import { useState, useEffect } from 'react'

   export default function NewPage() {
     const [data, setData] = useState([])

     useEffect(() => {
       fetch('/api/endpoint')
         .then(res => res.json())
         .then(setData)
     }, [])

     return (
       <div>
         {/* Page content */}
       </div>
     )
   }
   ```

## Coding Standards

### TypeScript

- Always define interfaces for data structures
- Use strict type checking
- Avoid `any` type

### React

- Use functional components
- Use hooks for state and effects
- Keep components focused and small

### API Routes

- Always handle errors with try/catch
- Return appropriate HTTP status codes
- Validate input data before processing

### Styling

- Use Tailwind CSS utility classes
- Follow mobile-first responsive design
- Use consistent spacing and colors

## Testing

### Manual Testing

1. Start the dev server
2. Test each feature through the UI
3. Check browser console for errors
4. Verify API responses in Network tab

### Database Inspection

```bash
# Open Prisma Studio
npx prisma studio
```

## Common Issues

### Prisma Client Not Updated

If you see "Unknown argument" errors after schema changes:

```bash
# Kill any running node processes
taskkill /F /IM node.exe

# Regenerate client
npx prisma generate

# Restart dev server
npm run dev
```

### Port Already in Use

The server will automatically try the next port (3001, 3002, etc.)

### Docker Database Connection Failed

```bash
# Ensure Docker Desktop is running
# Then start the container
docker-compose up -d

# Check container status
docker ps
```

## Useful Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run start            # Start production server

# Database
npm run db:push          # Push schema changes
npm run db:generate      # Generate Prisma client
npm run db:seed          # Seed database
npx prisma studio        # Open database GUI
npx prisma migrate dev   # Create migration

# Docker
docker-compose up -d     # Start PostgreSQL
docker-compose down      # Stop PostgreSQL
docker-compose logs      # View logs
```
