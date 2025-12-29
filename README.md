# Requisition App

A Multi-Tenant SaaS Requisition Management System with Offline-First support.

## Architecture

- **Backend**: Spring Boot 3 (Java 17+)
- **Frontend**: React 18 + TypeScript + Vite
- **Database**: PostgreSQL
- **Caching**: Redis
- **Security**: JWT Authentication

## Getting Started

### Prerequisites

**Option A: Running with Docker (Recommended)**
- Docker Desktop (includes Docker Compose)
- *Nothing else required!*

**Option B: Local Development (Manual)**
- Java 17+ (for Backend)
- Node.js 18+ (for Frontend)
- *Note: We use **Maven** for the backend (wrapper included) and **npm** for the frontend. You do NOT need Gradle or Bun.*

### Running Locally

To run the full stack (Frontend + Backend + DB) in production mode:

```bash
docker-compose up -d --build
```

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8081

### Development Mode

To run backend and frontend separately for development:

1. **Backend**:
   ```bash
   cd backend
   ./mvnw spring-boot:run
   ```

2. **Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## Features

- **Role-based workflow**
  - **Purchaser**: creates and submits requisitions.
  - **Manager**: reviews requisitions and can Approve / Reject / Hold / mark To Review, with optional notes.
  - **Accountant**: updates payment status (Done / Partial / Not Done), mode, UTR number, date and amount, and can upload payment proof.
  - **Admin**: manages users and organization, can delete draft or completed requisitions (including bulk delete from the dashboard).

- **Requisition lifecycle & status timeline**
  - Lifecycle: **Submitted → Approved → Paid → Dispatched → Completed**.
  - Requisition detail page shows a **Status Timeline** with date/time for each step.
  - For each step, the responsible user is displayed (e.g. "By John Manager"), and for approvals/payments also notes and UTR where available.

- **Attachments & uploads**
  - Supports uploading and viewing:
    - Bill / Invoice
    - Vendor payment details (QR / bank info)
    - Payment proof
    - Material proof
  - Images are compressed on the client (when possible) before upload to keep files small.

- **Dashboard & filtering**
  - Overview stats cards for **Pending**, **Approved**, **To Pay**, and **Total** requisitions.
  - Each card is **clickable** and acts as a quick filter for the list/table.
  - Additional filters:
    - Search by ID, description, site, vendor, or creator.
    - Filter by approval status and priority.
  - Responsive UI:
    - Mobile: card-based list.
    - Desktop: paginated table with actions.

- **Admin bulk delete for completed requisitions**
  - On the desktop table view, admins see a **selection checkbox** column.
  - Header checkbox selects/unselects all visible rows on the current page.
  - Only **COMPLETED** (and draft, if needed) requisitions are selectable for admins.
  - When one or more rows are selected, an admin-only **"Delete Selected (N)"** button appears next to **Export Excel**.

- **Exports & reports**
  - From the dashboard, requisitions can be exported to an **Excel (.xlsx)** report.

- **Offline-friendly client** (foundation)
  - Frontend includes IndexedDB and WebSocket helpers to support offline-first and real-time updates as the app evolves.

## User Guide

### Typical Flow: From Request to Completion

1. **Purchaser – Create & submit a requisition**
   - Go to **Dashboard → New Requisition**.
   - Fill in item details, amount, site, vendor and priority.
   - Save as draft or **Submit** to send for approval.

2. **Manager – Review & approve/reject**
   - On the dashboard, open a **Pending** requisition.
   - Click **Process Approval**.
   - Choose a decision: **APPROVED / REJECTED / HOLD / TO_REVIEW**.
   - Optionally add notes/comments and confirm.

3. **Accountant – Update payment**
   - Open an **Approved** requisition.
   - Click **Update Payment**.
   - Set payment status (**DONE / PARTIAL / NOT_DONE**), UTR number, mode, date, and amount.
   - Optionally upload payment proof (screenshot/photo).

4. **Purchaser – Dispatch & close**
   - When material is dispatched, click **Mark as Dispatched**.
   - Upload material/bill/vendor payment proofs as needed.
   - When business rules are met, the requisition can be treated as **Completed**.

5. **Admin – Cleanup (bulk delete completed)**
   - Switch to desktop/table view on the dashboard.
   - Use filters/cards (e.g. **To Pay**, **Approved**) to narrow the list.
   - For completed requisitions, use the checkbox column to select rows.
   - Click **Delete Selected (N)** to remove them in bulk.

### Key Screens

- **Dashboard** – Stats cards, filters, list/table of requisitions, export to Excel, and admin bulk delete.
- **Requisition Detail** – Full information, attachments, and the status timeline (with user names and timestamps).
- **User Management** – Admin-only screen to add/edit/deactivate/delete users and manage roles.

### Notes for Windows Development

- Docker commands (e.g. `docker-compose up -d --build`) work in PowerShell as written.
- If `./mvnw` or `mvn` is not available on your PATH, run the backend from Docker or install Maven/Java 17 and adjust the command accordingly.
