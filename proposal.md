# AI-Powered Intern Progress Management System

## Project Proposal

**Prepared for:** NETSOL Technologies  
**Date:** August 2026  
**Version:** 1.0

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Problem Statement](#2-problem-statement)
3. [Proposed Solution](#3-proposed-solution)
4. [Objectives](#4-objectives)
5. [Scope & Boundaries](#5-scope--boundaries)
6. [Technology Stack](#6-technology-stack)
7. [User Roles & Permissions](#7-user-roles--permissions)
8. [System Architecture](#8-system-architecture)
9. [Feature Breakdown](#9-feature-breakdown)
   - 9.1 [Authentication & Onboarding Flow](#91-authentication--onboarding-flow)
   - 9.2 [Admin Panel](#92-admin-panel)
   - 9.3 [Intern Dashboard](#93-intern-dashboard)
   - 9.4 [Mentor Dashboard](#94-mentor-dashboard)
   - 9.5 [AI-Powered Insights Engine](#95-ai-powered-insights-engine)
10. [Interface Descriptions](#10-interface-descriptions)
11. [Data Models](#11-data-models)
12. [API Design Overview](#12-api-design-overview)
13. [AI Integration Details](#13-ai-integration-details)
14. [Security Considerations](#14-security-considerations)
15. [Deployment Strategy](#15-deployment-strategy)
16. [Future Extensibility](#16-future-extensibility)
17. [Timeline & Milestones](#17-timeline--milestones)
18. [Conclusion](#18-conclusion)

---

## 1. Executive Summary

This document presents the proposal for an **AI-Powered Intern Progress Management System** — a purpose-built platform designed to streamline how NETSOL manages, monitors, and evaluates intern performance across their internship lifecycle.

The system introduces three distinct user roles — **Admin**, **Mentor**, and **Intern** — each with a tailored dashboard and feature set. An integrated AI layer analyzes weekly reports, identifies at-risk interns, and generates end-of-internship performance summaries, drastically reducing the manual overhead involved in intern management.

The platform is designed to complement NETSOL's existing portal (which handles attendance and other HR functions) without duplicating any of its capabilities. Instead, it focuses exclusively on **work tracking, progress monitoring, learning documentation, blocker resolution, and mentor feedback**.

---

## 2. Problem Statement

Managing interns at scale presents several recurring challenges:

- **Lack of Centralized Tracking:** Intern tasks, progress, and feedback are often scattered across spreadsheets, emails, and verbal updates, making it difficult to get a unified view.
- **Inconsistent Reporting:** Without a structured reporting mechanism, weekly progress updates vary in quality, format, and completeness.
- **Delayed Identification of Issues:** Mentors may not notice an intern struggling until weeks into the program, by which time recovery is difficult.
- **Manual Evaluation Burden:** At the end of an internship, mentors must manually compile feedback and assessments, which is time-consuming and prone to gaps.
- **No Data-Driven Insights:** There is no mechanism to automatically surface trends, patterns, or anomalies in intern performance data.
- **Onboarding Friction:** Setting up intern accounts and assigning them to mentors involves manual coordination with no standardized workflow.

---

## 3. Proposed Solution

The proposed system addresses every challenge listed above through a structured, role-based web application with AI capabilities:

| Challenge | Solution |
|---|---|
| Scattered tracking | Centralized dashboard per intern with projects, tasks, and weekly reports |
| Inconsistent reporting | Structured weekly report forms with guided fields (tasks, learnings, blockers) |
| Delayed issue detection | AI-powered alerts and risk indicators visible on the mentor dashboard |
| Manual evaluation | Auto-generated end-of-internship performance summaries |
| No insights | AI analysis engine that processes weekly data and surfaces actionable insights |
| Onboarding friction | Admin panel with signup approval workflow and bulk import capability |

---

## 4. Objectives

The primary objectives of the system are to:

1. **Centralize intern progress data** — Provide a single source of truth for all internship-related work, eliminating scattered records.
2. **Standardize weekly reporting** — Give interns a structured, guided format for submitting weekly updates covering tasks, learnings, and blockers.
3. **Empower mentors with visibility** — Deliver a comprehensive, at-a-glance view of each intern's six-week journey, including tasks, reports, and feedback history.
4. **Automate performance analysis** — Leverage AI to generate insights from weekly reports, identify struggling interns early, and produce end-of-internship summaries.
5. **Streamline administration** — Provide admins with tools for account management, signup approvals, bulk imports, and system-wide performance oversight.
6. **Reduce manual overhead** — Minimize the time mentors and administrators spend on repetitive monitoring and evaluation tasks.
7. **Enable future integration** — Architect the system so it can be extended and integrated into NETSOL's existing infrastructure when needed.

---

## 5. Scope & Boundaries

### In Scope

- User authentication and role-based access control (Admin, Mentor, Intern)
- Admin panel for account management, approvals, and system oversight
- Intern profile management and internship/project information
- Task creation, assignment, and status tracking
- Structured weekly report submission (tasks completed, learnings, blockers)
- Mentor feedback per week
- AI-generated progress insights and performance summaries
- Internship timeline and week-by-week progress visualization
- End-of-internship report generation
- Bulk intern import functionality for admins

### Out of Scope

- **Attendance tracking** — Already handled by NETSOL's existing portal
- **Leave management** — Part of existing HR systems
- **Payroll or stipend management** — Outside the scope of this system
- **Communication/chat features** — Can be added in future phases
- **Video conferencing integration** — Not included in v1.0
- **Mobile application** — Web-responsive design will serve mobile users; a dedicated app can be considered for future phases

---

## 6. Technology Stack

| Layer | Technology | Rationale |
|---|---|---|
| **Frontend** | React / Next.js | Server-side rendering, file-based routing, excellent developer experience, and SEO support |
| **Styling** | Tailwind CSS | Utility-first CSS framework enabling rapid, consistent, and responsive UI development |
| **Backend** | FastAPI (Python) | High-performance async framework ideal for REST APIs with built-in OpenAPI documentation |
| **Database** | PostgreSQL | Robust, open-source relational database with excellent support for complex queries and JSON data |
| **ORM** | SQLAlchemy + Alembic | Industry-standard Python ORM with migration support for PostgreSQL |
| **Authentication** | JWT (JSON Web Tokens) | Stateless authentication suitable for API-first architecture |
| **AI Layer** | OpenAI API / LLM Integration | For analyzing weekly reports, generating insights, and producing performance summaries |
| **Deployment** | Docker + Docker Compose | Containerized deployment for consistency across environments |
| **Version Control** | Git (GitHub/GitLab) | Standard version control with branching and PR workflows |

---

## 7. User Roles & Permissions

The system defines three distinct roles, each with progressively broader access:

### 7.1 Intern

The intern role is the primary data contributor. Interns interact with the system to document their work, report progress, and track their own growth.

**Permissions:**
- Create and update their own profile
- Add internship and project details
- Create, update, and manage their own tasks
- Submit weekly reports (tasks, learnings, blockers)
- View mentor feedback on their reports
- View their own progress timeline and performance data
- Cannot view other interns' data
- Cannot access admin or mentor features

### 7.2 Mentor

The mentor role is the primary evaluator and supervisor. Mentors use the system to monitor their assigned interns, provide feedback, and identify issues early.

**Permissions:**
- View their dedicated mentor dashboard
- Add/assign interns using official email addresses
- View all interns assigned to them
- Access individual intern profiles, projects, and tasks
- View submitted weekly reports for each intern
- Provide written feedback for each week
- View AI-generated insights and risk indicators
- View complete internship history for any assigned intern
- Cannot modify intern-submitted data
- Cannot access admin features or other mentors' interns

### 7.3 Admin

The admin role has system-wide authority. Admins manage the platform's operational aspects — from user account lifecycle to performance oversight.

**Permissions:**
- Approve or reject signup/registration requests
- Create individual user accounts (intern or mentor)
- Perform bulk imports of intern accounts via CSV/Excel
- Assign or reassign interns to mentors
- View all users, all interns, and all mentors across the system
- Access system-wide performance analytics and dashboards
- View aggregated AI insights across all interns
- Manage system settings and configurations
- Deactivate or archive user accounts
- Export reports and data

---

## 8. System Architecture

The system follows a **three-tier architecture** with a clear separation between the frontend, backend API, and database layers:

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                             │
│                                                                 │
│   ┌─────────────┐   ┌─────────────┐   ┌──────────────────┐     │
│   │   Intern     │   │   Mentor    │   │   Admin          │     │
│   │   Dashboard  │   │   Dashboard │   │   Panel          │     │
│   └──────┬──────┘   └──────┬──────┘   └────────┬─────────┘     │
│          │                 │                    │               │
│          └─────────────────┼────────────────────┘               │
│                            │                                    │
│                   Next.js Frontend                              │
│                   (Tailwind CSS)                                │
└────────────────────────────┼────────────────────────────────────┘
                             │ HTTPS / REST API
┌────────────────────────────┼────────────────────────────────────┐
│                      API LAYER                                  │
│                            │                                    │
│              ┌─────────────▼──────────────┐                     │
│              │      FastAPI Backend        │                     │
│              │                            │                     │
│              │  ┌──────────────────────┐  │                     │
│              │  │  Auth Middleware     │  │                     │
│              │  │  (JWT Validation)    │  │                     │
│              │  └──────────────────────┘  │                     │
│              │                            │                     │
│              │  ┌──────────────────────┐  │                     │
│              │  │  Role-Based Access   │  │                     │
│              │  │  Control (RBAC)      │  │                     │
│              │  └──────────────────────┘  │                     │
│              │                            │                     │
│              │  ┌──────────────────────┐  │                     │
│              │  │  API Route Handlers  │  │                     │
│              │  │  (Routers/Endpoints) │  │                     │
│              │  └──────────────────────┘  │                     │
│              │                            │                     │
│              │  ┌──────────────────────┐  │                     │
│              │  │  AI Service Layer    │  │                     │
│              │  │  (LLM Integration)   │  │                     │
│              │  └──────────────────────┘  │                     │
│              └────────────┬───────────────┘                     │
└───────────────────────────┼─────────────────────────────────────┘
                            │ SQLAlchemy ORM
┌───────────────────────────┼─────────────────────────────────────┐
│                     DATA LAYER                                  │
│              ┌────────────▼───────────────┐                     │
│              │       PostgreSQL           │                     │
│              │                            │                     │
│              │  Users, Profiles, Projects │                     │
│              │  Tasks, Weekly Reports,    │                     │
│              │  Feedback, AI Insights     │                     │
│              └────────────────────────────┘                     │
└─────────────────────────────────────────────────────────────────┘
```

### Key Architectural Principles

- **API-First Design:** The backend exposes a well-documented REST API (auto-generated OpenAPI docs via FastAPI). The frontend consumes this API exclusively.
- **Stateless Authentication:** JWT-based auth ensures the backend remains stateless and horizontally scalable.
- **Role-Based Access Control:** Every API endpoint enforces role checks, ensuring users can only access data appropriate to their role.
- **AI as a Service Layer:** The AI engine is encapsulated as an internal service, making it easy to swap LLM providers or upgrade models without affecting the rest of the system.
- **Database Migrations:** Alembic manages schema evolution, ensuring safe, versioned database changes.

---

## 9. Feature Breakdown

This section details every feature of the system, organized by the flow a user would experience — starting from authentication and onboarding, then branching into role-specific dashboards.

---

### 9.1 Authentication & Onboarding Flow

The authentication system is the entry point for all users. It handles registration, approval, login, and initial profile setup.

#### 9.1.1 Signup / Registration

**Flow:**
1. A new user (intern or mentor) navigates to the signup page.
2. They fill out a registration form with the following fields:
   - Full Name
   - Official NETSOL Email Address
   - Password (with confirmation)
   - Role Selection (Intern / Mentor)
   - Department (dropdown)
3. Upon submission, the registration request is saved with a **"Pending Approval"** status.
4. The user sees a confirmation screen: *"Your registration request has been submitted. You will receive an email once an admin approves your account."*
5. The admin receives a notification (visible on their dashboard) about the pending request.

**Validations:**
- Email must be a valid NETSOL domain email
- Password must meet minimum complexity requirements (8+ characters, uppercase, lowercase, number, special character)
- Duplicate email addresses are rejected

#### 9.1.2 Admin Approval Workflow

**Flow:**
1. Admin logs into the admin panel.
2. Navigates to **Pending Approvals** section.
3. Sees a list of pending signup requests with details (name, email, role, department, submission date).
4. For each request, admin can:
   - **Approve** — Account is activated, credentials are sent via email, and the user can log in.
   - **Reject** — Request is rejected with an optional reason. The user is notified via email.
5. Admin can also create accounts directly (bypassing the signup flow) or bulk import accounts.

#### 9.1.3 Login

**Flow:**
1. User navigates to the login page.
2. Enters email and password.
3. System validates credentials and checks account status (must be "Approved" / "Active").
4. On successful authentication:
   - A JWT access token and refresh token are issued.
   - The user is redirected to their role-specific dashboard:
     - **Intern** → Intern Dashboard
     - **Mentor** → Mentor Dashboard
     - **Admin** → Admin Panel
5. On failure, an appropriate error message is shown (invalid credentials, account pending, account rejected, account deactivated).

#### 9.1.4 Password Management

- **Forgot Password:** Users can request a password reset link sent to their registered email.
- **Reset Password:** Users follow the emailed link to set a new password.
- **Change Password:** Logged-in users can change their password from their profile settings.

#### 9.1.5 First-Time Profile Setup (Interns)

After an intern logs in for the first time, they are guided through a profile completion wizard:

**Step 1 — Personal Information:**
- Profile photo upload
- Phone number
- University / Institution name
- Degree program
- Current semester/year
- LinkedIn profile URL (optional)
- GitHub profile URL (optional)

**Step 2 — Internship Details:**
- Internship start date
- Internship end date (auto-calculated as 6 weeks from start, or manually overridden)
- Department assigned
- Mentor assigned (auto-populated if admin pre-assigned, otherwise selected from a dropdown)

**Step 3 — Project Information:**
- Project title
- Project description
- Technologies / tools to be used
- Project goals (what the intern aims to achieve)

Once complete, the intern lands on their full dashboard.

---

### 9.2 Admin Panel

The Admin Panel is the control center for system-wide management. It is accessible only to users with the **Admin** role.

#### 9.2.1 Admin Dashboard (Home)

The admin dashboard provides a high-level overview of the entire system:

**Key Metrics (Cards/Widgets):**
- Total registered interns (active / completed / archived)
- Total registered mentors
- Pending signup approvals count
- Interns currently in progress (by week: Week 1, Week 2, ... Week 6)
- Average performance score across all interns
- Number of interns flagged as "needs attention" by AI

**Visual Elements:**
- Bar chart: Intern distribution by department
- Line chart: Signup trends over time
- Pie chart: Intern status distribution (Active, Completed, Archived)
- Recent activity feed (latest signups, approvals, report submissions)

#### 9.2.2 User Management

This section allows the admin to manage all user accounts in the system.

**Intern Management:**
- Searchable, filterable, and sortable table of all interns
- Columns: Name, Email, Department, Mentor, Internship Status (Active/Completed/Archived), Week, Joined Date
- Actions per intern:
  - View full profile
  - Reassign to a different mentor
  - Deactivate account
  - Archive account (post-internship)
  - Reset password

**Mentor Management:**
- Table of all mentors
- Columns: Name, Email, Department, Number of Assigned Interns, Joined Date
- Actions per mentor:
  - View profile
  - View assigned interns
  - Deactivate account
  - Reset password

**Admin Management:**
- List of admin accounts
- Ability to add new admins (restricted to existing admins only)

#### 9.2.3 Signup Approval Queue

A dedicated page for managing pending registrations:

- List view with: Name, Email, Requested Role, Department, Date Submitted
- Quick filters: All Pending, Interns Only, Mentors Only
- Bulk actions: Approve Selected, Reject Selected
- Individual actions: Approve (with optional welcome message), Reject (with required reason)
- History tab: Previously approved and rejected requests with timestamps and admin who actioned

#### 9.2.4 Bulk Import

Admins can create multiple intern accounts at once:

**Process:**
1. Download a CSV/Excel template with required columns (Name, Email, Department, Mentor Email, Internship Start Date).
2. Fill in the template with intern data.
3. Upload the completed file.
4. System validates the data:
   - Checks for duplicate emails
   - Validates mentor emails exist in the system
   - Validates date formats
   - Reports any errors row-by-row
5. On successful validation, accounts are created in bulk.
6. Each intern receives an email with their temporary credentials and a link to complete their profile.

#### 9.2.5 Performance Overview

A system-wide analytics view:

- **Department-wise Performance:** Average scores, task completion rates, and blocker frequency per department.
- **Mentor-wise Performance:** How interns under each mentor are performing on average.
- **Cohort Analysis:** Compare performance across different internship cohorts (batches).
- **Export:** Download performance data as CSV or PDF reports.

#### 9.2.6 System Settings

- Manage department list (add/edit/remove departments)
- Configure internship duration defaults (default: 6 weeks)
- Manage email notification templates
- Configure AI settings (enable/disable AI insights, select AI model)
- View system audit logs (who did what and when)

---

### 9.3 Intern Dashboard

The Intern Dashboard is the intern's workspace — where they manage their profile, track tasks, submit weekly reports, and view their progress. Everything is designed around the **six-week internship lifecycle**.

#### 9.3.1 Dashboard Home

The intern's landing page after login, providing an at-a-glance summary:

**Top Section — Progress Overview:**
- **Internship Timeline Bar:** A visual horizontal progress bar showing all 6 weeks, with the current week highlighted. Completed weeks are marked with a green check, the current week pulses, and future weeks are grayed out.
- **Current Week Indicator:** Large, prominent display: *"You are in Week 3 of 6"*
- **Days Remaining:** Countdown to internship end date.

**Middle Section — Quick Stats:**
- Tasks assigned this week vs. tasks completed
- Weekly report status: Submitted ✓ / Pending ⏳
- Unresolved blockers count
- Skills learned this week

**Bottom Section — Recent Activity:**
- Latest mentor feedback (if any)
- Recently updated tasks
- Upcoming deadlines

#### 9.3.2 Profile Management

The intern can view and edit their profile at any time:

**Viewable/Editable Fields:**
- Profile photo
- Full name
- Email (read-only, set during registration)
- Phone number
- University / Institution
- Degree program and semester
- LinkedIn and GitHub URLs
- Bio / About Me

**Internship Information (read-only after initial setup, editable by admin/mentor):**
- Internship start and end dates
- Department
- Assigned mentor (name, email, profile link)

#### 9.3.3 Project Management

Interns can manage one or more projects they are working on during their internship:

**Project Details:**
- Project title
- Project description (rich text)
- Technologies and tools used (tag-based input)
- Project status: Not Started / In Progress / Completed
- Project start and end dates
- Repository link (GitHub/GitLab URL)
- Project goals and deliverables

**Actions:**
- Add a new project
- Edit an existing project
- Mark a project as complete
- Delete a project (with confirmation)

#### 9.3.4 Task Management

Tasks are the atomic units of work within a project. The task management interface allows interns to organize, track, and update their daily/weekly work.

**Task Board View (Kanban):**
- **To Do** — Tasks planned but not started
- **In Progress** — Tasks currently being worked on
- **In Review** — Tasks completed and awaiting mentor review
- **Done** — Tasks fully completed and reviewed

**Task List View (Alternative):**
- Sortable table with columns: Task Title, Project, Priority, Status, Due Date, Week
- Filters: By project, by status, by priority, by week

**Task Fields:**
- Task title
- Description (detailed explanation of the task)
- Associated project (dropdown)
- Priority: Low / Medium / High / Critical
- Status: To Do / In Progress / In Review / Done
- Assigned week (Week 1 through Week 6)
- Due date
- Estimated hours
- Actual hours spent
- Notes / comments

**Actions:**
- Create a new task
- Edit task details
- Update task status (drag-and-drop on Kanban or dropdown on list view)
- Delete a task (with confirmation)
- Filter and search tasks

#### 9.3.5 Weekly Report Submission

Weekly reports are the core data artifact of the system. Each week, the intern submits a structured report that captures their progress, learnings, and challenges.

**Report Structure:**

Each weekly report contains the following sections:

**Section 1 — Tasks Completed:**
- Auto-populated list of tasks marked as "Done" during this week
- Intern can add additional context or notes to each task
- Intern can manually add tasks not tracked in the task manager

**Section 2 — Tasks In Progress:**
- Auto-populated list of tasks currently in "In Progress" or "In Review" status
- Expected completion timeline

**Section 3 — Learnings & Skills Gained:**
- Free-text area for the intern to describe what they learned this week
- Tag-based skill input (e.g., "Python", "REST APIs", "Git", "Docker")
- The system maintains a cumulative skill tracker across all weeks

**Section 4 — Blockers & Challenges:**
- Structured blocker entries:
  - Blocker description
  - Severity: Minor / Moderate / Critical
  - Status: Unresolved / Resolved
  - Help needed (what the intern needs to unblock themselves)
- Blockers persist across weeks until marked as resolved

**Section 5 — Goals for Next Week:**
- Free-text area where the intern outlines what they plan to accomplish next week

**Section 6 — Self-Assessment:**
- Rating (1–5 scale): How productive was this week?
- Rating (1–5 scale): How confident do you feel about your progress?
- Optional: Additional comments

**Submission Rules:**
- One report per week
- Reports can be saved as drafts before final submission
- Once submitted, reports cannot be edited (to preserve integrity)
- Late submissions are flagged in the system
- If a report is not submitted by the deadline (e.g., Friday 6 PM), the mentor and admin are notified

#### 9.3.6 Internship Timeline View

A visual, week-by-week timeline that shows the intern's entire internship journey:

- **Week Cards (1–6):** Each week is represented as a card or expandable section containing:
  - Report submission status (Submitted / Pending / Late / Missed)
  - Number of tasks completed that week
  - Key learnings (tags)
  - Blockers (if any, with severity)
  - Mentor feedback summary (if provided)
  - Self-assessment scores
- **Color Coding:** Green (good progress), Yellow (average), Red (needs attention), Gray (future/no data)
- **Current Week Highlight:** The current week is visually distinct and expanded by default

#### 9.3.7 Mentor Feedback View

Interns can view feedback their mentor has provided:

- Organized by week
- Each feedback entry shows:
  - Week number
  - Feedback text (from mentor)
  - Rating/score (if mentor provided one)
  - Date feedback was given
- Read-only — interns cannot edit or respond to feedback (to keep the system simple in v1.0)

#### 9.3.8 Progress & Analytics

A personal analytics page for the intern to visualize their own performance:

- **Task Completion Trend:** Line chart showing tasks completed per week
- **Skill Growth:** Visualization of skills accumulated over the internship (tag cloud or bar chart)
- **Self-Assessment Trend:** Line chart of weekly self-assessment scores
- **Blocker History:** Timeline showing when blockers were raised and resolved
- **Overall Progress Score:** A computed score based on task completion, report timeliness, mentor feedback, and self-assessment

---

### 9.4 Mentor Dashboard

The Mentor Dashboard is designed for oversight and evaluation. Mentors use it to monitor their assigned interns, review weekly reports, provide feedback, and leverage AI insights.

#### 9.4.1 Dashboard Home

The mentor's landing page provides a consolidated view of all assigned interns:

**Top Section — Summary Cards:**
- Total interns assigned
- Interns currently active (in-progress internships)
- Interns who have completed their internship
- Pending weekly reports (not yet reviewed by mentor)
- Interns flagged as "needs attention" (by AI or by blocker severity)

**Main Section — Intern Overview Table:**
- Searchable, sortable table listing all assigned interns:
  - Intern name (clickable → opens intern detail view)
  - Profile photo thumbnail
  - Department
  - Current week (Week 1–6)
  - Latest report status (Submitted / Pending / Late)
  - Task completion rate (this week)
  - AI risk indicator (Green / Yellow / Red)
  - Last activity timestamp

**Visual Elements:**
- Heatmap or sparkline per intern showing weekly performance trend
- Alerts/badges for interns with unresolved critical blockers

#### 9.4.2 Intern Detail View

When a mentor clicks on an intern's name, they see a comprehensive profile page:

**Profile Header:**
- Intern's photo, name, email, university, department
- Internship dates and current week
- Overall progress bar

**Tabs:**

**Tab 1 — Overview:**
- Summary statistics (total tasks, tasks completed, reports submitted, average self-assessment)
- Performance trend chart (line graph across 6 weeks)
- Cumulative skills gained (tag cloud)

**Tab 2 — Projects:**
- List of all projects the intern is working on
- Project details: title, description, technologies, status, repository link
- Read-only for the mentor

**Tab 3 — Tasks:**
- Full task list (all weeks), filterable by week, project, status, and priority
- Kanban view available
- Read-only for the mentor — mentors can see but cannot modify intern tasks

**Tab 4 — Weekly Reports:**
- Expandable accordion for each week (Week 1 through Week 6)
- Each week shows:
  - Full report content (tasks completed, in-progress, learnings, blockers, goals, self-assessment)
  - Submission date and time
  - Status: On Time / Late / Missed
  - AI-generated summary of the report (see Section 9.5)
  - Mentor feedback input area (see below)

**Tab 5 — Feedback History:**
- Chronological list of all feedback the mentor has provided for this intern
- Editable — mentor can update feedback for any week

**Tab 6 — AI Insights:**
- AI-generated analysis specific to this intern (see Section 9.5)
- Progress trajectory prediction
- Strength and improvement area identification
- Risk assessment

#### 9.4.3 Providing Weekly Feedback

For each submitted weekly report, the mentor can provide feedback:

**Feedback Form Fields:**
- **Written Feedback:** Rich text area for detailed comments, suggestions, and guidance.
- **Performance Rating:** 1–5 star scale for the week.
- **Categories (optional checkboxes):**
  - ✅ Meeting expectations
  - ⬆️ Exceeding expectations
  - ⚠️ Needs improvement
  - 🚨 Requires immediate attention
- **Action Items:** Specific things the intern should focus on next week (bullet point list).

**Behavior:**
- Feedback is saved and immediately visible to the intern.
- Mentor can edit feedback at any time.
- The system timestamps feedback submissions for audit purposes.

#### 9.4.4 Intern Assignment

Mentors can request new interns to be assigned to them:

- **Add Intern:** Enter an intern's official NETSOL email address to send an assignment request.
- If the intern account exists and is unassigned, the assignment is made immediately.
- If the intern account exists but is assigned to another mentor, a reassignment request is sent to the admin.
- If the intern account does not exist, the mentor is notified and can request the admin to create the account.

#### 9.4.5 End-of-Internship Evaluation

At the end of an intern's 6-week period, the mentor is prompted to complete a final evaluation:

**Evaluation Form:**
- **Overall Performance Rating:** 1–10 scale
- **Technical Skills Assessment:** Rating per skill tag accumulated during the internship
- **Soft Skills Assessment:** Communication, initiative, teamwork, time management (1–5 each)
- **Strengths:** Free text
- **Areas for Improvement:** Free text
- **Recommendation:** Hire / Extend Internship / Do Not Hire / Undecided
- **Final Comments:** Free text

**Output:**
- The evaluation, combined with AI-generated insights, produces a comprehensive **End-of-Internship Report** (downloadable as PDF).

---

### 9.5 AI-Powered Insights Engine

The AI layer is one of the system's differentiating features. It operates in the background, analyzing data submitted by interns and surfacing actionable insights for mentors and admins.

#### 9.5.1 Weekly Report Analysis

When an intern submits a weekly report, the AI processes it to generate:

- **Report Summary:** A concise 2–3 sentence summary of the week's progress.
- **Sentiment Analysis:** Detects the overall tone of the report (positive, neutral, negative). Flags reports that indicate frustration, confusion, or disengagement.
- **Blocker Severity Assessment:** Evaluates reported blockers and flags critical ones that may require immediate mentor attention.
- **Consistency Check:** Compares the report content with task statuses to identify discrepancies (e.g., tasks marked as done but not mentioned in the report, or vice versa).

#### 9.5.2 Progress Tracking & Risk Identification

The AI continuously monitors intern data to identify risk patterns:

- **Declining Performance:** Flags interns whose task completion rate, self-assessment scores, or report quality is trending downward.
- **Persistent Blockers:** Highlights interns with blockers that have remained unresolved for multiple weeks.
- **Late or Missing Reports:** Identifies interns who are consistently late or miss weekly submissions.
- **Low Engagement:** Detects minimal task activity or very brief report submissions.

**Risk Levels:**
- 🟢 **On Track** — Intern is progressing well.
- 🟡 **Monitor** — Some indicators suggest the intern may need additional support.
- 🔴 **At Risk** — Significant concerns detected; mentor should intervene.

These risk indicators are displayed on both the **Mentor Dashboard** and the **Admin Panel**.

#### 9.5.3 Comparative Insights (Mentor View)

For mentors managing multiple interns, the AI provides:

- **Relative Performance:** How each intern compares to their peers (anonymized in the final display to interns, detailed for mentors).
- **Common Blockers:** Identifies if multiple interns are facing similar challenges, suggesting systemic issues.
- **Skill Gap Analysis:** Highlights skill areas where interns are strong vs. where they need more support.

#### 9.5.4 End-of-Internship AI Summary

At the conclusion of the internship, the AI generates a comprehensive performance report:

- **Executive Summary:** A paragraph summarizing the intern's overall journey.
- **Week-by-Week Progress Narrative:** A brief summary of each week's highlights.
- **Skill Development Map:** Visual representation of skills at the start vs. end.
- **Key Achievements:** Automatically extracted from weekly reports and task data.
- **Areas for Growth:** Derived from blocker patterns, low-scoring weeks, and mentor feedback.
- **Performance Score:** A computed overall score based on weighted factors:
  - Task completion rate (25%)
  - Report timeliness (15%)
  - Blocker resolution speed (10%)
  - Mentor feedback scores (25%)
  - Self-assessment trend (10%)
  - Skill growth (15%)
- **Recommendation Support:** AI-generated recommendation (supportive, not binding) to assist the mentor's final evaluation.

#### 9.5.5 Admin-Level AI Analytics

For admins, the AI provides system-wide insights:

- **Cohort Performance Summary:** How the current batch of interns is performing overall.
- **Department Insights:** Which departments have the best intern outcomes and why.
- **Mentor Effectiveness:** (Handled sensitively) Which mentors' interns show the strongest growth patterns.
- **Trend Analysis:** How intern quality and performance compare across multiple internship cycles.

---

## 10. Interface Descriptions

This section describes the key screens and their layouts across all three roles.

### 10.1 Common Interfaces

#### Login Page
- Clean, centered login form
- Email and password fields
- "Remember Me" checkbox
- "Forgot Password" link
- "Sign Up" link for new users
- NETSOL branding and logo

#### Signup Page
- Registration form with: Name, Email, Password, Confirm Password, Role (dropdown), Department (dropdown)
- Terms and conditions checkbox
- Submit button
- "Already have an account? Login" link

#### Navigation Sidebar (All Roles)
- Persistent left sidebar with role-appropriate menu items
- User avatar and name at the top
- Collapsible for more screen space
- Active page indicator
- Logout option at the bottom

### 10.2 Admin Interfaces

| Screen | Description |
|---|---|
| **Admin Dashboard** | Metric cards, charts (department distribution, signup trends, status pie chart), activity feed |
| **Pending Approvals** | Table of pending signups with Approve/Reject actions, filters, bulk actions |
| **User Management** | Tabbed view: Interns / Mentors / Admins. Searchable tables with action buttons |
| **Bulk Import** | Template download, file upload area, validation results, import confirmation |
| **Performance Overview** | Department-wise and mentor-wise analytics with charts and data tables |
| **System Settings** | Form-based settings for departments, internship defaults, email templates, AI config |

### 10.3 Intern Interfaces

| Screen | Description |
|---|---|
| **Intern Dashboard** | Timeline bar, quick stats cards, recent activity, report status |
| **Profile Page** | Editable form with personal and internship details |
| **Projects Page** | Project cards with details, add/edit/delete actions |
| **Task Board** | Kanban board (drag-and-drop) and list view toggle |
| **Weekly Report Form** | Multi-section form: tasks, learnings, blockers, goals, self-assessment |
| **Timeline View** | Horizontal timeline with week cards, color-coded status |
| **Feedback View** | Chronological feedback entries per week |
| **Progress Page** | Charts: task completion trend, skill growth, blocker history, overall score |

### 10.4 Mentor Interfaces

| Screen | Description |
|---|---|
| **Mentor Dashboard** | Summary cards, intern overview table with risk indicators, alerts |
| **Intern Detail View** | Tabbed view: Overview / Projects / Tasks / Reports / Feedback / AI Insights |
| **Feedback Form** | Text area, star rating, category checkboxes, action items list |
| **End-of-Internship Evaluation** | Comprehensive evaluation form with ratings, assessments, and recommendation |
| **AI Insights Panel** | Risk indicators, trend analysis, comparative insights, skill gap analysis |

---

## 11. Data Models

The following are the core entities and their relationships:

### 11.1 Entity Relationship Overview

```
┌──────────┐       ┌──────────┐       ┌──────────────┐
│   User   │──1:1──│  Profile  │       │   Project    │
│          │       │          │       │              │
│ id       │       │ user_id  │  ┌───▶│ id           │
│ email    │       │ phone    │  │    │ intern_id    │
│ password │       │ univ     │  │    │ title        │
│ role     │       │ degree   │  │    │ description  │
│ status   │       │ linkedin │  │    │ technologies │
│ created  │       │ github   │  │    │ status       │
└────┬─────┘       │ photo    │  │    │ repo_url     │
     │             └──────────┘  │    └──────┬───────┘
     │                           │           │
     │  ┌────────────────────┐   │           │
     │  │   Internship       │   │    ┌──────▼───────┐
     ├──│                    │───┘    │    Task      │
     │  │ id                 │        │              │
     │  │ intern_id          │        │ id           │
     │  │ mentor_id          │        │ project_id   │
     │  │ department         │        │ intern_id    │
     │  │ start_date         │        │ title        │
     │  │ end_date           │        │ description  │
     │  │ status             │        │ priority     │
     │  └────────┬───────────┘        │ status       │
     │           │                    │ week         │
     │           │                    │ due_date     │
     │    ┌──────▼───────┐            │ est_hours    │
     │    │ WeeklyReport │            │ actual_hours │
     │    │              │            └──────────────┘
     │    │ id           │
     │    │ internship_id│       ┌────────────────┐
     │    │ week_number  │       │ MentorFeedback │
     │    │ tasks_done   │       │                │
     │    │ tasks_wip    │◀──1:1─│ id             │
     │    │ learnings    │       │ report_id      │
     │    │ blockers     │       │ mentor_id      │
     │    │ goals_next   │       │ feedback_text  │
     │    │ self_score   │       │ rating         │
     │    │ submitted_at │       │ category       │
     │    │ status       │       │ action_items   │
     │    └──────┬───────┘       └────────────────┘
     │           │
     │    ┌──────▼───────┐       ┌────────────────┐
     │    │   Blocker    │       │   AIInsight    │
     │    │              │       │                │
     │    │ id           │       │ id             │
     │    │ report_id    │       │ report_id      │
     │    │ description  │       │ intern_id      │
     │    │ severity     │       │ type           │
     │    │ status       │       │ content        │
     │    │ help_needed  │       │ risk_level     │
     │    └──────────────┘       │ generated_at   │
     │                           └────────────────┘
     │
     │    ┌──────────────────┐
     │    │ EndOfInternship  │
     └───▶│ Evaluation       │
          │                  │
          │ id               │
          │ internship_id    │
          │ mentor_id        │
          │ overall_rating   │
          │ technical_scores │
          │ soft_skill_scores│
          │ strengths        │
          │ improvements     │
          │ recommendation   │
          │ ai_summary       │
          │ final_score      │
          └──────────────────┘
```

### 11.2 Key Entity Details

| Entity | Description |
|---|---|
| **User** | Core authentication entity. Stores email, hashed password, role (admin/mentor/intern), and account status (pending/active/deactivated/archived). |
| **Profile** | Extended user information. One-to-one with User. Contains personal and academic details. |
| **Internship** | Represents an intern's internship period. Links intern (User) to mentor (User). Tracks dates, department, and overall status. |
| **Project** | A project the intern is working on. Belongs to an Internship. Contains title, description, tech stack, and status. |
| **Task** | An individual unit of work within a Project. Tracks title, description, priority, status, assigned week, due date, and hours. |
| **WeeklyReport** | The intern's weekly submission. Belongs to an Internship. One per week (max 6). Contains structured sections for tasks, learnings, blockers, goals, and self-assessment. |
| **Blocker** | A specific challenge or impediment reported by the intern. Linked to a WeeklyReport. Tracks severity and resolution status. |
| **MentorFeedback** | Mentor's response to a WeeklyReport. One-to-one with WeeklyReport. Contains text feedback, rating, category, and action items. |
| **AIInsight** | AI-generated analysis data. Can be linked to a specific report or an intern overall. Stores insight type, content, and risk level. |
| **EndOfInternshipEvaluation** | Mentor's final assessment. One per Internship. Contains ratings, assessments, recommendation, and AI-generated summary. |

---

## 12. API Design Overview

The backend API follows RESTful conventions with versioned endpoints. All endpoints require JWT authentication unless marked as public.

### 12.1 Authentication Endpoints

| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/api/v1/auth/signup` | Register a new user | Public |
| POST | `/api/v1/auth/login` | Authenticate and receive JWT | Public |
| POST | `/api/v1/auth/refresh` | Refresh access token | Authenticated |
| POST | `/api/v1/auth/forgot-password` | Request password reset email | Public |
| POST | `/api/v1/auth/reset-password` | Reset password with token | Public |
| PUT | `/api/v1/auth/change-password` | Change current password | Authenticated |

### 12.2 Admin Endpoints

| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/api/v1/admin/dashboard` | Get admin dashboard metrics | Admin |
| GET | `/api/v1/admin/approvals` | List pending signup requests | Admin |
| PUT | `/api/v1/admin/approvals/{id}/approve` | Approve a signup request | Admin |
| PUT | `/api/v1/admin/approvals/{id}/reject` | Reject a signup request | Admin |
| GET | `/api/v1/admin/users` | List all users (filterable by role) | Admin |
| POST | `/api/v1/admin/users` | Create a user account | Admin |
| PUT | `/api/v1/admin/users/{id}` | Update user details | Admin |
| DELETE | `/api/v1/admin/users/{id}` | Deactivate a user | Admin |
| POST | `/api/v1/admin/users/bulk-import` | Bulk import interns via CSV | Admin |
| GET | `/api/v1/admin/analytics` | Get system-wide analytics | Admin |
| GET | `/api/v1/admin/settings` | Get system settings | Admin |
| PUT | `/api/v1/admin/settings` | Update system settings | Admin |

### 12.3 Intern Endpoints

| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/api/v1/intern/profile` | Get own profile | Intern |
| PUT | `/api/v1/intern/profile` | Update own profile | Intern |
| GET | `/api/v1/intern/internship` | Get internship details | Intern |
| GET | `/api/v1/intern/projects` | List own projects | Intern |
| POST | `/api/v1/intern/projects` | Create a project | Intern |
| PUT | `/api/v1/intern/projects/{id}` | Update a project | Intern |
| DELETE | `/api/v1/intern/projects/{id}` | Delete a project | Intern |
| GET | `/api/v1/intern/tasks` | List own tasks (filterable) | Intern |
| POST | `/api/v1/intern/tasks` | Create a task | Intern |
| PUT | `/api/v1/intern/tasks/{id}` | Update a task | Intern |
| DELETE | `/api/v1/intern/tasks/{id}` | Delete a task | Intern |
| GET | `/api/v1/intern/reports` | List own weekly reports | Intern |
| POST | `/api/v1/intern/reports` | Submit a weekly report | Intern |
| GET | `/api/v1/intern/reports/{week}` | Get report for a specific week | Intern |
| GET | `/api/v1/intern/feedback` | Get all mentor feedback | Intern |
| GET | `/api/v1/intern/progress` | Get progress analytics | Intern |
| GET | `/api/v1/intern/timeline` | Get timeline data | Intern |

### 12.4 Mentor Endpoints

| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/api/v1/mentor/dashboard` | Get mentor dashboard data | Mentor |
| GET | `/api/v1/mentor/interns` | List assigned interns | Mentor |
| POST | `/api/v1/mentor/interns/assign` | Assign an intern by email | Mentor |
| GET | `/api/v1/mentor/interns/{id}` | Get intern detail view | Mentor |
| GET | `/api/v1/mentor/interns/{id}/projects` | Get intern's projects | Mentor |
| GET | `/api/v1/mentor/interns/{id}/tasks` | Get intern's tasks | Mentor |
| GET | `/api/v1/mentor/interns/{id}/reports` | Get intern's weekly reports | Mentor |
| GET | `/api/v1/mentor/interns/{id}/reports/{week}` | Get specific week's report | Mentor |
| POST | `/api/v1/mentor/interns/{id}/feedback/{week}` | Submit feedback for a week | Mentor |
| PUT | `/api/v1/mentor/interns/{id}/feedback/{week}` | Update feedback for a week | Mentor |
| GET | `/api/v1/mentor/interns/{id}/insights` | Get AI insights for an intern | Mentor |
| POST | `/api/v1/mentor/interns/{id}/evaluation` | Submit final evaluation | Mentor |
| GET | `/api/v1/mentor/interns/{id}/report/export` | Export intern report as PDF | Mentor |

### 12.5 AI Endpoints

| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/api/v1/ai/analyze-report` | Trigger AI analysis on a report | System/Internal |
| GET | `/api/v1/ai/insights/{intern_id}` | Get AI insights for an intern | Mentor, Admin |
| GET | `/api/v1/ai/summary/{intern_id}` | Get AI end-of-internship summary | Mentor, Admin |
| GET | `/api/v1/ai/cohort-analysis` | Get AI cohort-level analysis | Admin |

---

## 13. AI Integration Details

### 13.1 Technology

The AI layer integrates with a Large Language Model (LLM) via API — initially OpenAI's GPT-4 or equivalent. The integration is abstracted behind a service layer, making it straightforward to switch providers.

### 13.2 Data Pipeline

```
Intern submits       AI Service processes      Results stored in
weekly report  ───▶  report via LLM API  ───▶  AIInsight table
                                                    │
                                                    ▼
                                            Displayed on Mentor
                                            and Admin dashboards
```

### 13.3 Prompt Engineering

The system uses carefully crafted prompts for each AI function:

- **Report Summarization:** *"Summarize the following weekly intern report in 2-3 sentences, highlighting key accomplishments and any concerns..."*
- **Sentiment Analysis:** *"Analyze the tone and sentiment of this weekly report. Classify as positive, neutral, or negative. Identify any language indicating frustration, confusion, or disengagement..."*
- **Risk Assessment:** *"Based on the following 6-week data for an intern (tasks, reports, blockers, feedback), assess the intern's performance trajectory and flag any risk indicators..."*
- **End-of-Internship Summary:** *"Generate a comprehensive performance summary for this intern based on their complete 6-week data..."*

### 13.4 Rate Limiting & Cost Management

- AI analysis is triggered only on report submission (not on every page load)
- Results are cached in the database after generation
- AI endpoints are rate-limited to prevent abuse
- Token usage is logged for cost tracking
- Admins can enable/disable AI features from system settings

---

## 14. Security Considerations

| Area | Approach |
|---|---|
| **Authentication** | JWT-based with short-lived access tokens (15 min) and longer refresh tokens (7 days) |
| **Password Storage** | Bcrypt hashing with salt |
| **Authorization** | Role-based access control (RBAC) enforced at the API middleware level |
| **Data Isolation** | Interns can only access their own data. Mentors can only access their assigned interns' data. Admins have full access. |
| **Input Validation** | All API inputs validated using Pydantic schemas (FastAPI's built-in validation) |
| **CORS** | Configured to allow only the frontend domain |
| **Rate Limiting** | Applied to auth endpoints (login, signup) to prevent brute force attacks |
| **HTTPS** | All traffic encrypted via TLS in production |
| **SQL Injection** | Prevented by using SQLAlchemy ORM (parameterized queries) |
| **XSS Protection** | React's built-in JSX escaping + Content Security Policy headers |
| **Audit Logging** | All admin actions and sensitive operations are logged with timestamps and user IDs |

---

## 15. Deployment Strategy

### 15.1 Environments

| Environment | Purpose |
|---|---|
| **Development** | Local development with hot-reload. Docker Compose for services. |
| **Staging** | Pre-production testing. Mirrors production configuration. |
| **Production** | Live environment accessible to NETSOL users. |

### 15.2 Containerization

The application is fully containerized using Docker:

- **Frontend Container:** Next.js application served via Node.js
- **Backend Container:** FastAPI application served via Uvicorn
- **Database Container:** PostgreSQL (or managed database service in production)
- **Reverse Proxy:** Nginx for routing, SSL termination, and static file serving

### 15.3 Docker Compose Structure

```yaml
services:
  frontend:    # Next.js app on port 3000
  backend:     # FastAPI app on port 8000
  db:          # PostgreSQL on port 5432
  nginx:       # Reverse proxy on port 80/443
```

### 15.4 CI/CD Pipeline

- **Version Control:** Git with feature branch workflow
- **CI:** Automated linting, testing, and build verification on every pull request
- **CD:** Automated deployment to staging on merge to `develop`, manual promotion to production from `main`

---

## 16. Future Extensibility

The system is designed with extensibility in mind. The following features are candidates for future phases:

| Phase | Feature | Description |
|---|---|---|
| **v1.1** | **Email Notifications** | Automated emails for report deadlines, feedback availability, approval status changes |
| **v1.1** | **In-App Notifications** | Real-time notification bell with unread count for all roles |
| **v1.2** | **Chat/Messaging** | Direct messaging between intern and mentor within the platform |
| **v1.2** | **File Attachments** | Allow interns to attach files, screenshots, or documents to reports and tasks |
| **v2.0** | **NETSOL Portal Integration** | SSO integration with NETSOL's existing portal, shared authentication, and attendance data sync |
| **v2.0** | **Mobile Application** | Native mobile apps (React Native) for interns and mentors |
| **v2.0** | **Custom Internship Durations** | Support for internships longer or shorter than 6 weeks |
| **v2.1** | **Mentor Matching Algorithm** | AI-assisted mentor-intern matching based on skills, department, and availability |
| **v2.1** | **Certification Generation** | Auto-generated internship completion certificates with performance grades |
| **v3.0** | **Multi-Tenant Support** | Allow other organizations to use the platform (SaaS model) |
| **v3.0** | **Advanced Analytics Dashboard** | Executive-level dashboards with drill-down capability and export to BI tools |

---

## 17. Timeline & Milestones

The estimated development timeline for v1.0 is **8–10 weeks**:

| Week | Phase | Deliverables |
|---|---|---|
| **Week 1** | Project Setup & Design | Repository setup, database schema design, UI/UX wireframes, API contract definition |
| **Week 2** | Authentication & Admin Core | Signup, login, JWT auth, admin panel scaffold, approval workflow |
| **Week 3** | Admin Panel Completion | User management, bulk import, settings, admin dashboard metrics |
| **Week 4** | Intern Dashboard — Core | Profile management, project CRUD, task management (Kanban + list) |
| **Week 5** | Intern Dashboard — Reports | Weekly report submission, timeline view, blocker tracking |
| **Week 6** | Mentor Dashboard — Core | Intern overview, detail view, report review, feedback submission |
| **Week 7** | AI Integration | Report analysis, risk assessment, insight generation, end-of-internship summary |
| **Week 8** | Analytics & Polish | Progress charts, performance analytics, UI polish, responsive design |
| **Week 9** | Testing & QA | Unit tests, integration tests, end-to-end testing, bug fixes |
| **Week 10** | Deployment & Launch | Staging deployment, UAT, production deployment, documentation |

---

## 18. Conclusion

The AI-Powered Intern Progress Management System is designed to transform how NETSOL manages its internship program. By providing structured workflows for interns, powerful monitoring tools for mentors, and comprehensive oversight for administrators — all enhanced by AI-driven insights — the system eliminates manual overhead, ensures no intern falls through the cracks, and produces data-driven evaluations.

The chosen technology stack (Next.js, Tailwind CSS, FastAPI, PostgreSQL) ensures a modern, performant, and maintainable application. The modular architecture and API-first design make the system ready for future integration with NETSOL's existing infrastructure.

This proposal serves as the foundation for development. Upon approval, the team will proceed with detailed UI/UX design, database schema finalization, and sprint planning based on the timeline outlined above.

---

*End of Proposal*
