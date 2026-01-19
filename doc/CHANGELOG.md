# Changelog

All notable changes to this project are documented in this file.

## [1.0.0] - 2026-01-09

### Added

#### Project Management
- Create, edit, and delete projects
- Project description field (max 150 words)
- Project period with start date, end date, and auto-calculated duration
- Company name and partner name fields
- Technology stack multi-tagging system
- Status options: Active and Completed

#### Staff Management
- Create, edit, and delete staff members
- Staff title field (independent of role system)
- Hourly cost tracking
- Staff workload overview with allocated/logged hours

#### Role-Based Hour Allocation
- Four default roles: Developer (40%), BA (30%), Architect (20%), PM (10%)
- Editable role percentages with 100% validation
- Visual progress bars showing assignment status
- Available hours tracking per role

#### Assignment System
- Assign staff to projects with specific roles
- Configurable hour allocation per assignment
- Validation: cannot exceed role's available hours
- Hour logging for progress tracking
- Remove assignment functionality

#### UI Features
- Responsive card-based layouts
- Modal dialogs for forms
- Real-time validation feedback
- Progress indicators
- Tag input for technology stack

### Technical

- Next.js 14 with App Router
- Prisma ORM with SQLite
- TypeScript throughout
- Tailwind CSS styling
- Docker PostgreSQL support

---

## Version History

| Version | Date | Description |
|---------|------|-------------|
| 1.0.0 | 2026-01-09 | Initial release with full feature set |
