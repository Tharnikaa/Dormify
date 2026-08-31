export class PdfService {
  static generateAllocationLetterHtml(data: {
    institutionName: string;
    academicYear: string;
    studentName: string;
    rollNumber: string;
    department: string;
    gender: string;
    phone: string;
    hostelName: string;
    blockName: string;
    floorName: string;
    roomNumber: string;
    bedNumber: string;
    allocationDate: string;
    letterRefCode: string;
    authorizedOfficer: string;
    issueTimestamp: string;
  }): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Hostel Allocation Letter - ${data.rollNumber}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 12mm;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: 'Times New Roman', Times, 'Georgia', serif;
      color: #111111;
      background: #FFFFFF;
      padding: 24px;
      line-height: 1.5;
      font-size: 13px;
    }
    .letter-card {
      border: 2px solid #111111;
      padding: 36px 40px;
      position: relative;
      background: #FFFFFF;
      box-shadow: 0 0 0 6px #F5F5F0;
    }
    /* Official Header */
    .header-table {
      width: 100%;
      border-bottom: 2px double #111111;
      padding-bottom: 16px;
      margin-bottom: 24px;
    }
    .inst-logo {
      width: 64px;
      height: 64px;
      border: 2px solid #111111;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: sans-serif;
      font-weight: 900;
      font-size: 16px;
      letter-spacing: 1px;
      background: #111111;
      color: #FFFFFF;
      margin-right: 16px;
    }
    .inst-title {
      font-size: 20px;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: #111111;
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    }
    .inst-subtitle {
      font-size: 12px;
      color: #333333;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      margin-top: 3px;
      font-family: sans-serif;
    }
    .inst-address {
      font-size: 11px;
      color: #555555;
      margin-top: 2px;
      font-family: sans-serif;
    }
    /* Meta Ref Box */
    .meta-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #F8F8F5;
      border: 1px solid #D8D8D0;
      padding: 8px 16px;
      font-size: 11px;
      font-family: sans-serif;
      margin-bottom: 24px;
    }
    .meta-item strong {
      color: #111111;
      font-weight: 700;
    }
    /* Document Title */
    .doc-title-container {
      text-align: center;
      margin-bottom: 24px;
    }
    .doc-title {
      font-size: 16px;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      text-decoration: underline;
      text-underline-offset: 5px;
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    }
    .doc-subject {
      font-size: 12px;
      font-style: italic;
      margin-top: 6px;
      color: #333333;
    }
    /* Section Headers */
    .section-title {
      font-size: 11px;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      font-family: sans-serif;
      border-bottom: 1px solid #111111;
      padding-bottom: 4px;
      margin-bottom: 10px;
      margin-top: 20px;
    }
    /* Data Grid Tables */
    .info-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 16px;
      font-family: sans-serif;
      font-size: 12px;
    }
    .info-table td {
      padding: 8px 12px;
      border: 1px solid #D8D8D0;
    }
    .info-table td.label-cell {
      background: #F2F2EC;
      font-weight: 700;
      width: 25%;
      color: #333333;
      text-transform: uppercase;
      font-size: 10px;
      letter-spacing: 0.05em;
    }
    .info-table td.val-cell {
      color: #111111;
      width: 25%;
      font-size: 12px;
    }
    /* Authorization Paragraph */
    .auth-text {
      font-size: 13px;
      line-height: 1.6;
      margin: 16px 0;
      text-align: justify;
    }
    /* Regulations Box */
    .rules-box {
      border: 1px solid #C8C8C0;
      background: #FAFDF9;
      padding: 12px 16px;
      font-size: 11px;
      font-family: sans-serif;
      margin-bottom: 24px;
    }
    .rules-box h4 {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      margin-bottom: 6px;
      color: #111111;
    }
    .rules-box ol {
      padding-left: 18px;
      color: #333333;
    }
    .rules-box li {
      margin-bottom: 3px;
    }
    /* Signatures & Seal Section */
    .footer-signatures {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-top: 36px;
      padding-top: 16px;
    }
    .seal-box {
      width: 115px;
      height: 115px;
      border: 2px double #111111;
      border-radius: 50%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      font-family: sans-serif;
      font-size: 8px;
      font-weight: 800;
      text-transform: uppercase;
      color: #111111;
      letter-spacing: 0.05em;
      line-height: 1.3;
      padding: 6px;
      background: #FFFFFF;
    }
    .sig-column {
      text-align: center;
      width: 210px;
      font-family: sans-serif;
    }
    .sig-line {
      border-top: 1px dashed #111111;
      margin-top: 45px;
      padding-top: 6px;
      font-size: 12px;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .sig-sub {
      font-size: 11px;
      color: #444444;
      margin-top: 3px;
      font-weight: 500;
    }
    /* Security Footnote */
    .security-hash {
      margin-top: 24px;
      padding-top: 8px;
      border-top: 1px solid #E0E0D8;
      font-family: monospace;
      font-size: 9px;
      color: #777777;
      display: flex;
      justify-content: space-between;
    }
    @media print {
      body {
        padding: 0;
        background: #FFFFFF;
      }
      .letter-card {
        border: none;
        box-shadow: none;
        padding: 0;
      }
      .no-print {
        display: none !important;
      }
    }
  </style>
</head>
<body>

  <div class="letter-card">
    <!-- Header -->
    <table class="header-table">
      <tr>
        <td style="width: 74px; vertical-align: middle;">
          <div class="inst-logo">MIT</div>
        </td>
        <td style="vertical-align: middle;">
          <div class="inst-title">MADRAS INSTITUTE OF TECHNOLOGY</div>
          <div class="inst-subtitle">MIT Hostels • Office of Hostel Administration</div>
          <div class="inst-address">Chromepet, Chennai, Tamil Nadu - 600044 • Tel: +91 44 2251 6000 • Email: hosteladmin@mitindia.edu</div>
        </td>
      </tr>
    </table>

    <!-- Metadata Bar -->
    <div class="meta-bar">
      <div class="meta-item">Letter Ref: <strong>${data.letterRefCode}</strong></div>
      <div class="meta-item">Issue Date: <strong>${data.issueTimestamp}</strong></div>
      <div class="meta-item">Academic Year: <strong>${data.academicYear}</strong></div>
      <div class="meta-item">Status: <strong style="color: #0F6826; text-transform: uppercase;">VERIFIED & ISSUED</strong></div>
    </div>

    <!-- Document Title -->
    <div class="doc-title-container">
      <div class="doc-title">OFFICIAL HOSTEL ALLOCATION PERMIT</div>
      <div class="doc-subject">Subject: Official Allotment Order for MIT Hostel Residence (${data.academicYear})</div>
    </div>

    <!-- Section 1: Student Details -->
    <div class="section-title">1. Resident Student Details</div>
    <table class="info-table">
      <tr>
        <td class="label-cell">Student Name</td>
        <td class="val-cell"><strong>${data.studentName}</strong></td>
        <td class="label-cell">Roll Number</td>
        <td class="val-cell"><strong>${data.rollNumber}</strong></td>
      </tr>
      <tr>
        <td class="label-cell">Department</td>
        <td class="val-cell">${data.department}</td>
        <td class="label-cell">Gender</td>
        <td class="val-cell">${data.gender}</td>
      </tr>
      <tr>
        <td class="label-cell">Contact Phone</td>
        <td class="val-cell">${data.phone}</td>
        <td class="label-cell">Academic Session</td>
        <td class="val-cell">${data.academicYear}</td>
      </tr>
    </table>

    <!-- Section 2: Allotment Details -->
    <div class="section-title">2. Allotted Accommodation Details</div>
    <table class="info-table">
      <tr>
        <td class="label-cell">Hostel Complex</td>
        <td class="val-cell"><strong>${data.hostelName}</strong></td>
        <td class="label-cell">Hostel Block</td>
        <td class="val-cell"><strong>${data.blockName}</strong></td>
      </tr>
      <tr>
        <td class="label-cell">Floor Level</td>
        <td class="val-cell">${data.floorName}</td>
        <td class="label-cell">Room Number</td>
        <td class="val-cell"><strong>Room ${data.roomNumber}</strong></td>
      </tr>
      <tr>
        <td class="label-cell">Bed Designation</td>
        <td class="val-cell"><strong style="font-size: 14px; color: #111111;">Bed ${data.bedNumber}</strong></td>
        <td class="label-cell">Allocation Date</td>
        <td class="val-cell">${data.allocationDate}</td>
      </tr>
    </table>

    <!-- Authorization Statement -->
    <div class="auth-text">
      This is to certify that <strong>${data.studentName}</strong> (Roll No: <strong>${data.rollNumber}</strong>) has successfully fulfilled all hostel admission prerequisites and fee verifications for <strong>Madras Institute Of Technology</strong>. The competent authority hereby approves the allotment of <strong>Bed ${data.bedNumber} in Room ${data.roomNumber} (${data.blockName}, MIT Hostels)</strong> for the Academic Session <strong>${data.academicYear}</strong>. The resident student is authorized to report to the hostel caretaker for key assignment.
    </div>

    <!-- Rules & Regulations Box -->
    <div class="rules-box">
      <h4>Important Regulations for MIT Hostel Resident:</h4>
      <ol>
        <li>This permit is strictly non-transferable and valid only for the allocated student for Academic Year ${data.academicYear}.</li>
        <li>The student must present this original allotment permit alongside a valid MIT ID card upon physical check-in.</li>
        <li>Unauthorized room or bed swapping is strictly prohibited and constitutes a major disciplinary violation.</li>
        <li>The resident must abide by all MIT Hostel rules, quiet hours, and institutional residency policies at all times.</li>
      </ol>
    </div>

    <!-- Signatures Section -->
    <div class="footer-signatures">
      <div class="seal-box">
        ★ OFFICIAL ★<br>
        <strong>MIT HOSTELS</strong><br>
        VERIFIED SEAL<br>
        2025–2026
      </div>

      <div class="sig-column">
        <div class="sig-line">${data.studentName}</div>
        <div class="sig-sub">Resident Student Signature</div>
      </div>

      <div class="sig-column">
        <div class="sig-line">MR. AJITH</div>
        <div class="sig-sub">Hostel Office Admin</div>
      </div>
    </div>

    <!-- Security Footnote -->
    <div class="security-hash">
      <span>DOC REF: ${data.letterRefCode}</span>
      <span>MADRAS INSTITUTE OF TECHNOLOGY • MIT HOSTELS OFFICIAL PERMIT</span>
    </div>
  </div>

</body>
</html>`;
  }
}
