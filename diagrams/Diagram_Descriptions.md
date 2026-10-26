# Dormify — Software Engineering Diagram Descriptions

**Project:** Dormify (Web-Based Hostel Admission & Bed Allocation System)  
**Authoritative Source Repository:** [Dormify GitHub](https://github.com/Tharnikaa/Dormify) / Local Workspace `F:\Dormify`  
**Enterprise Architect Repository:** `F:\Dormify\Dormify_SE_Diagrams\Dormify_SE_Model.qea`  
**Target Submission Standard:** Anna University B.E./B.Tech Software Engineering Curriculum  
**Layout Optimization:** Enhanced spatial separation, non-overlapping component geometry, and dedicated Warden operational role.

---

## 1. Diagram 1: DFD Level 0 — Dormify Context Diagram

* **Diagram Title:** DFD Level 0 – Dormify Context Diagram
* **Type:** Data Flow Diagram (Context Level)
* **File Location:** `DFD/DFD_Level_0.png`
* **Enterprise Architect ID:** Diagram ID 13, Package: `01 – Data Flow Diagrams`

### Purpose
Provides the highest-level architectural abstraction of the Dormify Hostel Management System. It models the system as a single central process interacting with external environmental entities (Student, Administrator, Warden), establishing clear system boundaries and identifying external data interfaces without revealing internal storage or implementation mechanisms.

### Main Elements
* **Central Process:** `0 – Dormify Hostel Management System` (Dimension: 320px $\times$ 180px, centered with generous padding).
* **External Entities:**
  * `Student`: Enrolled students seeking hostel admission, room selection, and status updates.
  * `Administrator`: Managerial authorities handling application verification and system-wide infrastructure.
  * `Warden`: Hostel residential authority managing floor monitoring, occupancy tracking, and residency reports.

### Data Flows
1. **Student $\rightarrow$ System:**
   * `Student Credentials, Profile & Bed Request`
2. **System $\rightarrow$ Student:**
   * `Auth Token, Status, Room Details & Letter`
3. **Administrator $\leftrightarrow$ System:**
   * **Inflow:** `Fee Decisions, Infrastructure Setup & Manual Override`
   * **Outflow:** `Verification Queue, Student Directory & Reports`
4. **Warden $\leftrightarrow$ System:**
   * **Inflow:** `Hostel Residency & Allocation Inquiries`
   * **Outflow:** `Hostel Occupancy & Floor Status Reports`

### Source-Code Evidence
* `backend/routes/authRoutes.js`: Login and registration contracts.
* `backend/routes/applicationRoutes.js`: Application lifecycle data submission.
* `backend/routes/receiptRoutes.js`: Multer file receipt uploads and status queries.
* `backend/routes/allocationRoutes.js`: Room/bed selection endpoints.

---

## 2. Diagram 2: DFD Level 1 — Dormify Major Processes

* **Diagram Title:** DFD Level 1 – Dormify Major Processes
* **Type:** Data Flow Diagram (Level 1 Decomposition)
* **File Location:** `DFD/DFD_Level_1.png`
* **Enterprise Architect ID:** Diagram ID 14, Package: `01 – Data Flow Diagrams`

### Purpose
Decomposes the context process into six core functional subsystems across five distinct vertical columns, exposing internal data stores and the precise paths of data communication between processes, stores, and external agents with zero overlapping components.

### Main Elements & Column Architecture
* **Column 1 (Left - External Entity):**
  * `Student (Ext)` (130px $\times$ 110px)
* **Column 2 (Processes):**
  * `1.0 – User Authentication & Profile Management` (270px $\times$ 75px)
  * `2.0 – Student Profile & Admission Processing` (270px $\times$ 75px)
  * `3.0 – Fee Receipt Submission & Verification` (270px $\times$ 75px)
* **Column 3 (Data Stores):**
  * `D1 – Users & Student Profiles` (250px $\times$ 65px)
  * `D2 – Fee Receipts & Verification Records` (250px $\times$ 65px)
  * `D3 – Hostel Infrastructure Inventory` (250px $\times$ 65px)
  * `D4 – Room Allocations & Overrides` (250px $\times$ 65px)
  * `D5 – Notifications & System Audit Logs` (250px $\times$ 65px)
* **Column 4 (Processes):**
  * `4.0 – Hostel Infrastructure & Bed Management` (270px $\times$ 75px)
  * `5.0 – Room & Bed Selection & Concurrency Allocation` (270px $\times$ 75px)
  * `6.0 – Notification Broadcast & Reporting Engine` (270px $\times$ 75px)
* **Column 5 (Right - External Entities):**
  * `Administrator (Ext)` (140px $\times$ 110px)
  * `Warden (Ext)` (140px $\times$ 110px)

### Data Flows & Balancing
* **Input Balancing from Level 0:** Student credentials route to `1.0`; applications route to `2.0`; receipts route to `3.0`; bed selections route to `5.0`. Admin decisions route to `3.0` and `4.0`. Warden inquiries route to `6.0`.
* **Store Interactions:**
  * `1.0` reads/writes `D1`.
  * `2.0` reads `D1`, writes `D2`.
  * `3.0` reads `D2`, writes `D2`.
  * `4.0` writes `D3`.
  * `5.0` reads `D2`, `D3`, reads/updates `D3`, and writes `D4`.
  * `6.0` reads `D4`, writes `D5`, and outputs `Hostel Status Reports` to `Warden (Ext)`.
* **Integrity Constraints:** No external entity directly accesses a data store; all flows pass through explicit process transformations.

---

## 3. Diagram 3: DFD Level 2 — Booking and Bed Allocation

* **Diagram Title:** DFD Level 2 – Booking and Bed Allocation Subprocesses
* **Type:** Data Flow Diagram (Level 2 Decomposition of Process 5.0)
* **File Location:** `DFD/DFD_Level_2.png`
* **Enterprise Architect ID:** Diagram ID 15, Package: `01 – Data Flow Diagrams`

### Purpose
Exposes the granular subprocesses, validation gates, concurrency controls, and transactional commits governing the room and bed allocation engine with wide layout margins.

### Main Elements
* **Subprocesses (Columns 2 & 4):**
  * `5.1 – Validate Student Eligibility (Profile >=80% & Fee)`
  * `5.2 – Retrieve Available Hostels, Floors, Rooms & Beds`
  * `5.3 – Present Interactive Floor Plan & Room Inspect`
  * `5.4 – Receive Bed Selection Request (bedId)`
  * `5.5 – Concurrency Check & Row Lock (SELECT FOR UPDATE)`
  * `5.6 – Commit Bed Allocation & Recalculate Room Status`
  * `5.7 – Generate Allocation Confirmation & Notification`
* **Participating Stores (Column 3):**
  * `D1 – Student Profiles (L2)` (verifies profile completion $\ge 80\%$)
  * `D2 – Fee Receipts (L2)` (verifies fee status `APPROVED`)
  * `D3 – Hostel Inventory (L2)` (reads layout, executes row lock)
  * `D4 – Room Allocations (L2)` (persists allocation record)
  * `D5 – Notifications & Logs (L2)` (creates confirmation alerts)

### Concurrency and Transaction Logic Verified in Code
* The implementation in `backend/services/allocationService.js` relies on PostgreSQL native transactions (`BEGIN` ... `COMMIT`/`ROLLBACK`) with explicit row-level locking:
  ```sql
  SELECT id, status FROM beds WHERE id = $1 FOR UPDATE;
  ```
* This prevents double-booking across concurrent student requests. If `status != 'AVAILABLE'`, the transaction rolls back and aborts at `5.5`, returning HTTP 409 Conflict.

---

## 4. Diagram 4: UML Use Case Diagram

* **Diagram Title:** Dormify Use Case Diagram
* **Type:** UML Use Case Diagram
* **File Location:** `UML/Use_Case_Diagram.png`
* **Enterprise Architect ID:** Diagram ID 16, Package: `02 – UML Diagrams`

### Purpose
Defines the functional scope of Dormify by mapping interactions between system boundary use cases and primary/secondary human actors with comfortable 85px vertical spacing between ellipses.

### Actors and Use Cases
* **Student (Primary Actor):**
  * `Register Account`
  * `Login to System`
  * `Manage Student Profile`
  * `Upload Fee Receipt PDF`
  * `View Fee Verification Status`
  * `Browse Hostel Corridors & Rooms`
  * `Inspect Room & Co-Residents`
  * `Select & Reserve Bed`
  * `Download Allocation Certificate`
  * `View Notifications`
* **Included Use Cases ($\ll\text{include}\gg$):**
  * `Verify Eligibility & Receipt`
  * `Lock Bed Transactionally`
* **Administrator (Primary Actor):**
  * `Review Fee Verification Queue`
  * `Approve / Reject Fee Receipt`
  * `Manage Hostel Infrastructure`
  * `Perform Manual Allocation Override`
  * `Broadcast Notifications`
  * `View Occupancy Analytics Dashboard`
  * `Inspect Student Directory`
  * `View System Audit Logs`
  * `Export Reports (CSV)`
* **Warden (Residential Administrative Actor):**
  * `View Occupancy Analytics Dashboard`
  * `Inspect Student Directory`
  * `Export Reports (CSV)`

---

## 5. Diagram 5: UML Class Diagram

* **Diagram Title:** Dormify Domain Class Diagram
* **Type:** UML Class Diagram
* **File Location:** `UML/Class_Diagram.png`
* **Enterprise Architect ID:** Diagram ID 17, Package: `02 – UML Diagrams`

### Purpose
Represents the static structure of the Dormify persistent domain model, showing entity attributes, types, structural associations, compositions, and exact multiplicity constraints derived from `database/schema/schema.sql`.

### Spatial Layout
* **Expanded Box Dimensions:** 240px to 260px wide, 180px to 250px tall.
* **Vertical Gap:** 70px between rows to guarantee zero attribute text truncation.
* **Domain Classes:**
  1. `User` (7 typed attributes)
  2. `StudentProfile` (9 typed attributes)
  3. `FeeReceipt` (9 typed attributes)
  4. `RoomAllocation` (7 typed attributes)
  5. `HostelBlock` (4 typed attributes)
  6. `Floor` (4 typed attributes)
  7. `Room` (5 typed attributes)
  8. `Bed` (4 typed attributes)
  9. `Notification` (6 typed attributes)
  10. `AuditLog` (7 typed attributes)

---

## 6. Diagram 6: UML Activity Diagram

* **Diagram Title:** Dormify Student Admission and Allocation Activity Diagram
* **Type:** UML Activity Diagram with Swimlanes
* **File Location:** `UML/Activity_Diagram.png`
* **Enterprise Architect ID:** Diagram ID 18, Package: `02 – UML Diagrams`

### Purpose
Models the end-to-end procedural workflow and business logic of student admission, receipt verification, eligibility gating, and transactional bed selection across organizational responsibilities.

### Partitioned Swimlanes (Non-Overlapping Layout)
1. **`Student`:** Width 340px (`x = 50..390`). Actions: Register, Profile, Upload Receipt, Browse Rooms, Select Bed, Download Certificate.
2. **`Dormify System`:** Width 500px (`x = 420..920`). Actions: Update Fee Status, Fetch Real-time Layout, Validate Eligibility & Lock Bed, Commit Allocation (`x = 680..890`), Conflict Rollback (`x = 450..630`). Both branches reside safely within the swimlane with zero partition crossing.
3. **`Administrator`:** Width 340px (`x = 950..1290`). Actions: Review Queue, Fee Decision, Enter Rejection Reason, Approve Receipt.

---

## 7. Diagram 7: UML Sequence Diagram

* **Diagram Title:** Dormify Room Booking Sequence Diagram
* **Type:** UML Sequence Diagram
* **File Location:** `UML/Sequence_Diagram.png`
* **Enterprise Architect ID:** Diagram ID 19, Package: `02 – UML Diagrams`

### Purpose
Visualizes the dynamic time-ordered message exchange between lifelines during the critical bed allocation transaction.

### Spatial Specifications
* **Lifelines (Height 950px, Width 130px..150px):**
  1. `s : Student` (`x = 60`)
  2. `ui : React Frontend` (`x = 280`)
  3. `auth : Auth Middleware` (`x = 520`)
  4. `ctrl : Allocation Controller` (`x = 760`)
  5. `svc : Allocation Service` (`x = 1000`)
  6. `db : PostgreSQL Database` (`x = 1240`)
* **Message Spacing:** Over 45px vertical pitch between consecutive messages across the 950px lifeline span, guaranteeing readable call and return labels without crowding.
