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

