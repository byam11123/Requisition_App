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

- **Dashboard & Filtering**
  - Overview stats cards for **Pending**, **Approved**, **To Pay**, and **Total** requisitions.
  - **Clickable Rows**: Select rows by clicking anywhere on them.
  - **Search**: Improved search by **Item Name (Material Description)**, ID, Site, Vendor, or Creator.
  - **Export Selected**: Select specific rows to export a custom Excel report, or export all current filters.
  - **Admin Bulk Delete**: Admin-only "Delete Selected" button for efficient cleanup.
  - Responsive UI:
    - Mobile: Card-based view with **selection checkboxes**.
    - Desktop: Paginated table with bulk actions.

- **Customizable Request IDs**
  - Organizations can set their own ID prefix (e.g., ORB, BLR).
  - IDs follow the format `PREFIX/YY/P00001` (Year-based sequence).
  - Sequence resets annually automatically.

- **Exports & Reports**
  - **Export Selected**: Dynamically generated Excel reports based on user selection.
  - Includes company logo, header details, and full requisition data.

- **Offline-friendly client** (foundation)
  - Frontend includes IndexedDB and WebSocket helpers to support offline-first and real-time updates as the app evolves.

## User Guide

### Typical Flow: From Request to Completion

1. **Purchaser – Create & submit a requisition**
   - Go to **Dashboard → New Requisition**.
   - Fill in details. **Item Name** is now a primary field.
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
