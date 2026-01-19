# User Guide

## Overview

The Project Profile Management System helps you manage projects, staff, and resource allocation. This guide covers all the features available in the application.

## Navigation

The application has three main sections accessible from the sidebar:

- **Dashboard** - Overview and quick stats
- **Projects** - Manage projects and assignments
- **Staff** - Manage team members

---

## Projects

### Viewing Projects

The Projects page displays all projects as cards showing:
- Project name and status
- Company and partner names
- Deal size and total hours
- Technology stack tags

### Creating a New Project

1. Click the **"New Project"** button
2. Fill in the required fields:
   - **Project Name** (required)
   - **Deal Size** - Total project value in dollars (required)
   - **Blended Rate** - Hourly rate (required, default: $100/hr)
3. Fill in optional fields:
   - **Description** - Up to 150 words
   - **Status** - Active or Completed
   - **Start Date** and **End Date** - Duration calculates automatically
   - **Company Name** - The customer/end-user
   - **Partner Name** - Partner organization
   - **Technology Stack** - Type and press Enter to add tags
4. Click **"Create Project"**

### Project Detail View

Click **"View"** on any project card to see:

#### Project Info Section
- Description, company, partner
- Project period (dates and duration)
- Technology stack tags

#### Summary Cards
- Status badge
- Deal size
- Blended rate
- Total hours

#### Hour Allocation by Role
Shows how project hours are distributed across roles:
- Each role card displays:
  - Role name and percentage
  - Total hours for the role
  - Assigned vs remaining hours
  - Progress bar
  - Staff assigned with their hours

Click **"Edit Percentages"** to adjust role allocations.

#### Staff Assignments Table
Lists all staff assigned to the project with:
- Staff name
- Role
- Allocated hours
- Logged hours
- Progress percentage
- Actions (Log Hours, Remove)

### Editing a Project

1. Open the project detail page
2. Click **"Edit Project"** button
3. Modify any fields
4. Click **"Save Changes"**

### Assigning Staff

1. Open the project detail page
2. Click **"Assign Staff"** button
3. Select a **Staff Member**
4. Select a **Role** - Shows available hours for each role
5. Enter **Hours to Allocate** - Cannot exceed available hours
6. Click **"Assign"**

### Logging Hours

1. In the Staff Assignments table, click **"Log Hours"**
2. Enter the number of hours
3. Progress updates automatically

### Removing an Assignment

Click **"Remove"** next to any assignment in the table.

---

## Staff

### Viewing Staff

The Staff page displays team members as cards showing:
- Name and title
- Hourly cost
- Total allocated hours across all projects
- Total logged hours
- Assignment count

### Adding a Staff Member

1. Click **"Add Staff"** button
2. Fill in:
   - **Name** (required)
   - **Title** - Display title (e.g., "Senior Developer")
   - **Hourly Cost** (required)
3. Click **"Add Staff"**

### Editing a Staff Member

1. Click **"Edit"** on the staff card
2. Update fields
3. Click **"Save Changes"**

### Deleting a Staff Member

1. Click **"Delete"** on the staff card
2. Confirm the deletion

**Note:** Deleting a staff member removes all their project assignments.

---

## Role Allocation System

### How It Works

1. Each project has a total number of hours calculated from:
   ```
   Total Hours = Deal Size / Blended Rate
   ```

2. Hours are distributed across roles by percentage:
   - Developer: 40% (default)
   - BA: 30% (default)
   - Architect: 20% (default)
   - PM: 10% (default)

3. Example for a $276,000 project at $100/hr:
   - Total Hours: 2,760 hrs
   - Developer: 1,104 hrs (40%)
   - BA: 828 hrs (30%)
   - Architect: 552 hrs (20%)
   - PM: 276 hrs (10%)

### Adjusting Percentages

1. Open any project detail page
2. Click **"Edit Percentages"**
3. Adjust the values
4. The total must equal exactly 100%
5. Click **"Save Allocations"**

**Note:** Changes apply to all projects globally.

### Assignment Validation

When assigning staff:
- You can only allocate up to the remaining hours for that role
- The system shows available hours in the dropdown and input field
- Attempting to exceed available hours shows an error

---

## Tips and Best Practices

### Project Planning

1. Set up the project with accurate deal size and blended rate
2. Add all relevant information (dates, description, tech stack)
3. Review role percentages before making assignments

### Staff Management

1. Keep titles descriptive but concise
2. Update hourly costs when rates change
3. Review staff workload regularly (check for over-allocation)

### Hour Tracking

1. Log hours regularly for accurate progress tracking
2. Review allocation vs logged hours to identify issues
3. Adjust allocations if project scope changes

### Resource Allocation

1. Check available hours before assigning
2. Distribute work evenly among team members
3. Monitor the Hour Allocation section for remaining capacity

---

## Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Add tech stack tag | Enter or Comma |
| Remove tech stack tag | Click × button |
| Close modal | Click outside or Cancel |

---

## Troubleshooting

### "Cannot exceed available hours" error
The hours you're trying to allocate exceed the remaining capacity for that role. Check the available hours shown in the dropdown.

### Percentages won't save
Ensure all role percentages sum to exactly 100%.

### Page not loading
Try refreshing the browser. If the issue persists, the server may need to be restarted.
