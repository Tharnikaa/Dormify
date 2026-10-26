# Dormify — Software Engineering Modelling Validation Report (Revised Edition)

**Project Name:** Dormify (Web-Based Hostel Admission and Room/Bed Allocation Management System)  
**Evaluator Role:** Senior Software Architect, UML/DFD Specialist & Sparx EA Automation Specialist  
**Target Repository:** `F:\Dormify\Dormify_SE_Diagrams\Dormify_SE_Model.qea`  
**Date of Execution:** October 23, 2026  
**Curriculum Standard:** Anna University B.E. Computer Science and Engineering / Information Technology Software Engineering Laboratory  
**Revision Scope:** Expanded component boundaries, generous inter-element gutters, zero shape collisions, and complete adoption of the "Warden" role.

---

## 1. Executive Summary

All seven Software Engineering diagrams requested by the Master Prompt have been updated with non-overlapping geometry and high-resolution typography directly inside Sparx Enterprise Architect, and re-exported to disk.

| Diagram ID | Diagram Name | Type | Sparx Diagram ID | Package | Status | Export Path & File Size |
|---|---|---|---|---|---|---|
| **D1** | DFD Level 0 – Dormify Context Diagram | Context DFD | 13 | 01 – Data Flow Diagrams | **CONFIRMED CREATED & SAVED** | `DFD/DFD_Level_0.png` (68,589 B) |
| **D2** | DFD Level 1 – Dormify Major Processes | Level 1 DFD | 14 | 01 – Data Flow Diagrams | **CONFIRMED CREATED & SAVED** | `DFD/DFD_Level_1.png` (202,875 B) |
| **D3** | DFD Level 2 – Booking and Bed Allocation | Level 2 DFD | 15 | 01 – Data Flow Diagrams | **CONFIRMED CREATED & SAVED** | `DFD/DFD_Level_2.png` (191,162 B) |
| **D4** | Dormify Use Case Diagram | UML Use Case | 16 | 02 – UML Diagrams | **CONFIRMED CREATED & SAVED** | `UML/Use_Case_Diagram.png` (282,176 B) |
| **D5** | Dormify Domain Class Diagram | UML Class | 17 | 02 – UML Diagrams | **CONFIRMED CREATED & SAVED** | `UML/Class_Diagram.png` (153,234 B) |
| **D6** | Dormify Student Admission & Allocation Activity Diagram | UML Activity | 18 | 02 – UML Diagrams | **CONFIRMED CREATED & SAVED** | `UML/Activity_Diagram.png` (180,276 B) |
| **D7** | Dormify Room Booking Sequence Diagram | UML Sequence | 19 | 02 – UML Diagrams | **CONFIRMED CREATED & SAVED** | `UML/Sequence_Diagram.png` (146,590 B) |

---

## 2. Spatial Refinements & Quality Enhancements

### A. Resolution of Shape Collisions & Boundary Overrides
1. **Activity Diagram Swimlanes:**
   * *Previous Issue:* Parallel branch actions (`Commit Allocation` vs `Conflict Rollback`) collided and breached the swimlane boundary into the Administrator partition.
   * *Correction:* Expanded `Dormify System` partition width to **500px** (`x = 420..920`). Positioned `Conflict Rollback` at `x = 450..630` and `Commit Allocation` at `x = 680..890`. Both branches now reside with at least 30px internal padding from partition borders.
2. **Use Case Ellipses Spacing:**
   * *Previous Issue:* Vertically packed ellipses caused text label truncation on 2-line use cases.
   * *Correction:* Increased vertical pitch to **85px** and widened ellipses to **240px–250px**, providing comfortable margins for all 19 use cases.
3. **Class Diagram Attributes:**
   * *Previous Issue:* Class boxes were too short to display 9 typed attributes without clipping.
   * *Correction:* Expanded box dimensions to **240px–260px wide** and **180px–250px tall**, with **70px vertical clearance** between rows.
4. **Sequence Diagram Message Pitch:**
   * *Previous Issue:* 20 messages packed into a 480px lifeline caused text label overlap.
   * *Correction:* Extended lifeline length to **950px** and horizontal separation to **220px–240px**, achieving an average message pitch of >45px.

### B. Role Representation: Warden
* In accordance with operational requirements, the residential administrative entity is modeled exclusively as **"Warden"**:
  * **DFD Level 0:** Central process communicates directly with the `Warden` external entity.
  * **DFD Level 1:** `Warden (Ext)` consumes `Hostel Status Reports` from Process 6.0.
  * **Use Case Diagram:** `Warden` actor associates with `View Occupancy Analytics Dashboard`, `Inspect Student Directory`, and `Export Reports (CSV)`.

---

## 3. DFD Balancing & Integrity Verification

1. **Level 0 to Level 1 Balancing:**
   * External entities at Level 0 (`Student`, `Administrator`, `Warden`) balance with Level 1 external entities.
   * Inflows and outflows balance with the decomposed processes `1.0` through `6.0`.
2. **Level 1 to Level 2 Balancing:**
   * Subprocesses `5.1` through `5.7` balance with Process `5.0`.
3. **Semantic Integrity:**
   * Zero Black Holes, zero Miracles, and zero Grey Holes.
   * Strict entity-to-process and store-to-process separation maintained.

---

## 4. Export Asset Verification

* `DFD/DFD_Level_0.png`: **68,589 bytes**
* `DFD/DFD_Level_1.png`: **202,875 bytes**
* `DFD/DFD_Level_2.png`: **191,162 bytes**
* `UML/Use_Case_Diagram.png`: **282,176 bytes**
* `UML/Class_Diagram.png`: **153,234 bytes**
* `UML/Activity_Diagram.png`: **180,276 bytes**
* `UML/Sequence_Diagram.png`: **146,590 bytes**
