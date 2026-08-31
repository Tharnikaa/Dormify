# DORMIFY — University Hostel Admission & Allocation ERP

**DORMIFY** is an enterprise-grade university hostel administration, fee verification, interactive room selection, bed allocation, and residential management system built with a minimal, Swiss-inspired editorial enterprise aesthetic.

---

## Technical Stack & Architecture

- **Frontend**: React 18, TypeScript, Vite, Vanilla CSS Design System, `lucide-react` icons.
- **Backend**: Node.js, Express.js, TypeScript, REST APIs.
- **Database & ORM**: PostgreSQL with Prisma ORM (`@prisma/client`).
- **Authentication**: JWT authentication with bcryptjs password hashing and Role-Based Access Control (`STUDENT`, `ADMIN`, `HOD`).
- **File Storage**: `Multer` with storage abstraction layer storing metadata in PostgreSQL and raw files in `backend/uploads/receipts/`.
- **Document Generation**: HTML/CSS to PDF printable format for official Institutional Allocation Letters.

---

## Key Features

1. **Student Admission Lifecycle**:
   `REGISTERED` → `PROFILE_COMPLETED` → `FEE_SUBMITTED` → `ADMIN_VERIFIED` → `ROOM_SELECTION` → `BED_ALLOCATED` → `ALLOCATION_LETTER`.
2. **Interactive Hostel Floor Plan**:
   Vector floor map depicting Hostel Blocks, Floors, Corridors, Rooms, and Bed positions with live capacity metrics and visual status badges (`AVAILABLE`, `PARTIALLY_OCCUPIED`, `FULL`, `MAINTENANCE`, `RESERVED`).
3. **Atomic Concurrency Protection**:
   Backend database transactions with row-level locks and `@@unique([bedId, academicYearId, status])` constraints to prevent double-booking under concurrent student requests. Returns controlled `409 Conflict` errors on simultaneous bed booking.
4. **Fee Verification Module**:
   Split-screen reviewer UI for administrators to inspect uploaded payment receipts and approve or reject with mandatory rejection reasons.
5. **Administrative & HOD Portal**:
   - Real-time database metrics dashboard (Total Students, Verified Count, Pending Queue, Bed Occupancy %, Block breakdowns).
   - Searchable, filterable, paginated Student Directory.
   - Hostel Structure Manager for Blocks, Floors, Rooms, and Beds.
   - Manual Allocation Override with administrative reason tracking.
   - Live Reports (Occupancy rate, Department distribution, CSV export).
   - Immutable System Audit Logs.
6. **Official Allocation Letter**:
   Print-ready institutional document with university header, student details, allocation reference code, QR verification block, and official signature section.

---

## Demo Credentials (Development Seed Data)

| Role | Email | Password | Status / Notes |
| :--- | :--- | :--- | :--- |
| **HOD** | `hod.cs@dormify.edu` | `Password123!` | Chief Warden & HOD Computer Science |
| **Admin** | `admin@dormify.edu` | `Password123!` | Senior Hostel Registrar |
| **Student 1** | `alex.rivera@student.dormify.edu` | `Password123!` | Roll: `STU2026001` (Bed Allocated) |
| **Student 2** | `priya.sharma@student.dormify.edu` | `Password123!` | Roll: `STU2026002` (Fee Verified, Ready for Room Selection) |
| **Student 3** | `marcus.vance@student.dormify.edu` | `Password123!` | Roll: `STU2026003` (Fee Submitted, Pending Review) |

---

## Setup & Execution Commands

### 1. Environment Configuration
Copy `.env.example` to `.env` in both root and `backend/`:
```bash
cp .env.example .env
cp .env.example backend/.env
```

### 2. Backend Setup
```bash
cd backend
npm install
npx prisma generate
npm run build
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run build
npm run dev
```

### 4. Run Concurrency Test Suite
```bash
cd backend
npm run test:concurrency
```
