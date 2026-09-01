import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('[Seed] Starting institutional seed data population...');

  // Password hash for standard dev accounts
  const passwordHash = await bcrypt.hash('Password123!', 10);

  // 1. Create Academic Year
  const academicYear = await prisma.academicYear.upsert({
    where: { name: '2025-2026' },
    update: { isActive: true },
    create: {
      name: '2025-2026',
      startDate: new Date('2025-08-01'),
      endDate: new Date('2026-05-31'),
      isActive: true,
    },
  });
  console.log(`[Seed] Academic Year created: ${academicYear.name}`);

  // 2. Create HOD User & Profile
  const hodUser = await prisma.user.upsert({
    where: { email: 'hod.cs@dormify.edu' },
    update: {},
    create: {
      email: 'hod.cs@dormify.edu',
      passwordHash,
      role: 'HOD',
      name: 'Prof. Robert Vance',
      adminProfile: {
        create: {
          employeeId: 'EMP-HOD-001',
          department: 'Computer Science & Engineering',
          designation: 'Head of Department & Chief Hostel Warden',
        },
      },
    },
  });
  console.log(`[Seed] HOD User created: ${hodUser.email}`);

  // 3. Create Admin User & Profile (Mr. Ajith - Hostel Office Admin)
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@dormify.edu' },
    update: {
      name: 'Mr. Ajith',
    },
    create: {
      email: 'admin@dormify.edu',
      passwordHash,
      role: 'ADMIN',
      name: 'Mr. Ajith',
      adminProfile: {
        create: {
          employeeId: 'EMP-ADM-002',
          department: 'Hostel Administration',
          designation: 'Hostel Office Admin',
        },
      },
    },
  });
  console.log(`[Seed] Admin User created: ${adminUser.email}`);

  // Clean up legacy/dummy blocks, rooms, and hostels
  await prisma.allocation.deleteMany({});
  await prisma.bed.deleteMany({});
  await prisma.room.deleteMany({});
  await prisma.floor.deleteMany({});
  await prisma.block.deleteMany({});
  await prisma.hostel.deleteMany({});

  // 4. Create MIT Institutional Hostels & Blocks Structure
  const boysHostels = [
    { name: 'Orchid International', code: 'ORCHID' },
    { name: 'Birla', code: 'BIRLA' },
    { name: 'Bhavani', code: 'BHAVANI' },
    { name: 'Kurinji', code: 'KURINJI' },
    { name: 'Marudham', code: 'MARUDHAM' },
    { name: 'Thamira Bhavani', code: 'THAMIRA' },
    { name: 'Amaravathi', code: 'AMARAVATHI' },
  ];

  const girlsHostels = [
    { name: 'Rajam NRI', code: 'RAJAM_NRI' },
    { name: 'Ponni', code: 'PONNI' },
    { name: 'Cauvery', code: 'CAUVERY' },
    { name: 'Vaigai', code: 'VAIGAI' },
  ];

  // Seed Boys Hostels & Blocks
  for (const bh of boysHostels) {
    const h = await prisma.hostel.upsert({
      where: { code: bh.code },
      update: { name: bh.name, gender: 'MALE' },
      create: { name: bh.name, code: bh.code, gender: 'MALE' },
    });

    const blk = await prisma.block.upsert({
      where: { hostelId_code: { hostelId: h.id, code: `BLK-${bh.code}` } },
      update: { name: bh.name, gender: 'MALE' },
      create: { hostelId: h.id, name: bh.name, code: `BLK-${bh.code}`, gender: 'MALE' },
    });

    for (let fNum = 1; fNum <= 3; fNum++) {
      const flr = await prisma.floor.upsert({
        where: { blockId_floorNumber: { blockId: blk.id, floorNumber: fNum } },
        update: {},
        create: { blockId: blk.id, floorNumber: fNum, name: `Floor ${fNum}` },
      });

      for (let r = 1; r <= 4; r++) {
        const roomNum = `${bh.code.substring(0, 3)}-${fNum}0${r}`;
        const room = await prisma.room.upsert({
          where: { floorId_roomNumber: { floorId: flr.id, roomNumber: roomNum } },
          update: {},
          create: { floorId: flr.id, roomNumber: roomNum, capacity: 2, roomType: 'DOUBLE', status: 'AVAILABLE' },
        });

        for (const bLetter of ['A', 'B']) {
          await prisma.bed.upsert({
            where: { roomId_bedNumber: { roomId: room.id, bedNumber: bLetter } },
            update: {},
            create: { roomId: room.id, bedNumber: bLetter, status: 'AVAILABLE' },
          });
        }
      }
    }
  }

  // Seed Girls Hostels & Blocks
  for (const gh of girlsHostels) {
    const h = await prisma.hostel.upsert({
      where: { code: gh.code },
      update: { name: gh.name, gender: 'FEMALE' },
      create: { name: gh.name, code: gh.code, gender: 'FEMALE' },
    });

    const blk = await prisma.block.upsert({
      where: { hostelId_code: { hostelId: h.id, code: `BLK-${gh.code}` } },
      update: { name: gh.name, gender: 'FEMALE' },
      create: { hostelId: h.id, name: gh.name, code: `BLK-${gh.code}`, gender: 'FEMALE' },
    });

    // Special exact architectural layout for Rajam NRI Hostel
    if (gh.code === 'RAJAM_NRI') {
      const floorsConfig = [
        { floorNum: 1, prefix: '21' },
        { floorNum: 2, prefix: '22' },
      ];

      for (const fc of floorsConfig) {
        const flr = await prisma.floor.upsert({
          where: { blockId_floorNumber: { blockId: blk.id, floorNumber: fc.floorNum } },
          update: {},
          create: { blockId: blk.id, floorNumber: fc.floorNum, name: `Floor ${fc.floorNum}` },
        });

        // Double Occupancy Rooms: 2101-2111 (Floor 1) and 2201-2211 (Floor 2)
        for (let num = 1; num <= 11; num++) {
          const roomSuffix = num < 10 ? `0${num}` : `${num}`;
          const roomNum = `${fc.prefix}${roomSuffix}`;

          const room = await prisma.room.upsert({
            where: { floorId_roomNumber: { floorId: flr.id, roomNumber: roomNum } },
            update: { capacity: 2, roomType: 'DOUBLE' },
            create: { floorId: flr.id, roomNumber: roomNum, capacity: 2, roomType: 'DOUBLE', status: 'AVAILABLE' },
          });

          for (const bLetter of ['A', 'B']) {
            await prisma.bed.upsert({
              where: { roomId_bedNumber: { roomId: room.id, bedNumber: bLetter } },
              update: {},
              create: { roomId: room.id, bedNumber: bLetter, status: 'AVAILABLE' },
            });
          }
        }

        // Single Occupancy Rooms: 2112-2121 (Floor 1) and 2212-2221 (Floor 2)
        for (let num = 12; num <= 21; num++) {
          const roomNum = `${fc.prefix}${num}`;

          const room = await prisma.room.upsert({
            where: { floorId_roomNumber: { floorId: flr.id, roomNumber: roomNum } },
            update: { capacity: 1, roomType: 'SINGLE' },
            create: { floorId: flr.id, roomNumber: roomNum, capacity: 1, roomType: 'SINGLE', status: 'AVAILABLE' },
          });

          await prisma.bed.upsert({
            where: { roomId_bedNumber: { roomId: room.id, bedNumber: 'A' } },
            update: {},
            create: { roomId: room.id, bedNumber: 'A', status: 'AVAILABLE' },
          });
        }
      }
    } else if (gh.code === 'VAIGAI') {
      // Vaigai Hostel Architectural Layout: 2 Floors (1st & 2nd), 27 rooms per floor facing opposite each other
      const floorsConfig = [
        { floorNum: 1, prefix: '1' },
        { floorNum: 2, prefix: '2' },
      ];

      for (const fc of floorsConfig) {
        const flr = await prisma.floor.upsert({
          where: { blockId_floorNumber: { blockId: blk.id, floorNumber: fc.floorNum } },
          update: {},
          create: { blockId: blk.id, floorNumber: fc.floorNum, name: `Floor ${fc.floorNum}` },
        });

        // 27 rooms per floor: VAI-101 to VAI-127 (Floor 1) and VAI-201 to VAI-227 (Floor 2)
        // 5 occupants per room: Beds A, B, C, D, E (Capacity 5, 5-Sharing)
        // Opposite-facing corridor layout: Wing A (1-14) facing Wing B (15-27)
        for (let num = 1; num <= 27; num++) {
          const roomSuffix = num < 10 ? `0${num}` : `${num}`;
          const roomNum = `VAI-${fc.prefix}${roomSuffix}`;

          const room = await prisma.room.upsert({
            where: { floorId_roomNumber: { floorId: flr.id, roomNumber: roomNum } },
            update: { capacity: 5, roomType: '5-SHARING' },
            create: { floorId: flr.id, roomNumber: roomNum, capacity: 5, roomType: '5-SHARING', status: 'AVAILABLE' },
          });

          for (const bLetter of ['A', 'B', 'C', 'D', 'E']) {
            await prisma.bed.upsert({
              where: { roomId_bedNumber: { roomId: room.id, bedNumber: bLetter } },
              update: {},
              create: { roomId: room.id, bedNumber: bLetter, status: 'AVAILABLE' },
            });
          }
        }
      }
    } else if (gh.code === 'PONNI') {
      // Ponni Hostel Architectural Layout: 3 Floors (Ground, 1st & 2nd), 29 rooms per floor (4 girls per room)
      // Rectangular Quad Perimeter Layout surrounding central open courtyard
      const floorsConfig = [
        { floorNum: 0, name: 'Ground Floor', prefix: 'G' },
        { floorNum: 1, name: 'First Floor', prefix: '1' },
        { floorNum: 2, name: 'Second Floor', prefix: '2' },
      ];

      for (const fc of floorsConfig) {
        const flr = await prisma.floor.upsert({
          where: { blockId_floorNumber: { blockId: blk.id, floorNumber: fc.floorNum } },
          update: { name: fc.name },
          create: { blockId: blk.id, floorNumber: fc.floorNum, name: fc.name },
        });

        // 29 rooms per floor: PON-G01 to PON-G29, PON-101 to PON-129, PON-201 to PON-229
        // 4 girls per room: Beds A, B, C, D (Capacity 4, 4-Sharing)
        // Rectangular quad perimeter wings: North (1-8), East (9-15), South (16-23), West (24-29)
        for (let num = 1; num <= 29; num++) {
          const roomSuffix = num < 10 ? `0${num}` : `${num}`;
          const roomNum = `PON-${fc.prefix}${roomSuffix}`;

          const room = await prisma.room.upsert({
            where: { floorId_roomNumber: { floorId: flr.id, roomNumber: roomNum } },
            update: { capacity: 4, roomType: '4-SHARING' },
            create: { floorId: flr.id, roomNumber: roomNum, capacity: 4, roomType: '4-SHARING', status: 'AVAILABLE' },
          });

          for (const bLetter of ['A', 'B', 'C', 'D']) {
            await prisma.bed.upsert({
              where: { roomId_bedNumber: { roomId: room.id, bedNumber: bLetter } },
              update: {},
              create: { roomId: room.id, bedNumber: bLetter, status: 'AVAILABLE' },
            });
          }
        }
      }
    } else if (gh.code === 'CAUVERY' || gh.code === 'KAVERI') {
      // Cauvery Hostel Architectural Layout: 4 Floors (Ground, 1st, 2nd & 3rd), 29 rooms per floor (4 persons per room)
      const floorsConfig = [
        { floorNum: 0, name: 'Ground Floor', prefix: 'G' },
        { floorNum: 1, name: 'First Floor', prefix: '1' },
        { floorNum: 2, name: 'Second Floor', prefix: '2' },
        { floorNum: 3, name: 'Third Floor', prefix: '3' },
      ];

      for (const fc of floorsConfig) {
        const flr = await prisma.floor.upsert({
          where: { blockId_floorNumber: { blockId: blk.id, floorNumber: fc.floorNum } },
          update: { name: fc.name },
          create: { blockId: blk.id, floorNumber: fc.floorNum, name: fc.name },
        });

        // 29 rooms per floor: CAU-G01 to CAU-G29, CAU-101 to CAU-129, CAU-201 to CAU-229, CAU-301 to CAU-329
        // 4 occupants per room: Beds A, B, C, D (Capacity 4, 4-Sharing)
        for (let num = 1; num <= 29; num++) {
          const roomSuffix = num < 10 ? `0${num}` : `${num}`;
          const roomNum = `CAU-${fc.prefix}${roomSuffix}`;

          const room = await prisma.room.upsert({
            where: { floorId_roomNumber: { floorId: flr.id, roomNumber: roomNum } },
            update: { capacity: 4, roomType: '4-SHARING' },
            create: { floorId: flr.id, roomNumber: roomNum, capacity: 4, roomType: '4-SHARING', status: 'AVAILABLE' },
          });

          for (const bLetter of ['A', 'B', 'C', 'D']) {
            await prisma.bed.upsert({
              where: { roomId_bedNumber: { roomId: room.id, bedNumber: bLetter } },
              update: {},
              create: { roomId: room.id, bedNumber: bLetter, status: 'AVAILABLE' },
            });
          }
        }
      }
    } else {
      // Standard 3 floors for other girls residences
      for (let fNum = 1; fNum <= 3; fNum++) {
        const flr = await prisma.floor.upsert({
          where: { blockId_floorNumber: { blockId: blk.id, floorNumber: fNum } },
          update: {},
          create: { blockId: blk.id, floorNumber: fNum, name: `Floor ${fNum}` },
        });

        for (let r = 1; r <= 4; r++) {
          const roomNum = `${gh.code.substring(0, 3)}-${fNum}0${r}`;
          const room = await prisma.room.upsert({
            where: { floorId_roomNumber: { floorId: flr.id, roomNumber: roomNum } },
            update: {},
            create: { floorId: flr.id, roomNumber: roomNum, capacity: 2, roomType: 'DOUBLE', status: 'AVAILABLE' },
          });

          for (const bLetter of ['A', 'B']) {
            await prisma.bed.upsert({
              where: { roomId_bedNumber: { roomId: room.id, bedNumber: bLetter } },
              update: {},
              create: { roomId: room.id, bedNumber: bLetter, status: 'AVAILABLE' },
            });
          }
        }
      }
    }
  }

  console.log('[Seed] All MIT Boys Hostels (7) and Girls Hostels (4) seeded with Blocks, Floors, and Beds.');

  // 5. Seed Students with different lifecycle stages

  // Student 1: Fully Allocated (Alex Rivera - 2nd Year CS, Orchid International)
  const user1 = await prisma.user.upsert({
    where: { email: 'alex.rivera@student.dormify.edu' },
    update: {},
    create: {
      email: 'alex.rivera@student.dormify.edu',
      passwordHash,
      role: 'STUDENT',
      name: 'Alex Rivera',
      studentProfile: {
        create: {
          rollNumber: '2025503600',
          department: 'Computer Science',
          yearOfStudy: 2,
          preferredHostel: 'ORCHID',
          totalFeePaid: 124735.0,
          remainingFeeDue: 0,
          quota: 'TNEA',
          phone: '+91 98401 23456',
          guardianName: 'Carlos Rivera',
          guardianPhone: '+91 98401 87654',
          gender: 'MALE',
          address: '42 Campus Way, North Wing',
        },
      },
    },
    include: { studentProfile: true },
  });

  if (user1.studentProfile) {
    const app1 = await prisma.application.upsert({
      where: { studentId_academicYearId: { studentId: user1.studentProfile.id, academicYearId: academicYear.id } },
      update: {},
      create: {
        studentId: user1.studentProfile.id,
        academicYearId: academicYear.id,
        status: 'ALLOCATED',
      },
    });

    await prisma.feeReceipt.upsert({
      where: { applicationId: app1.id },
      update: {},
      create: {
        applicationId: app1.id,
        receiptNumber: 'REC-2026-001',
        amount: 124735.0,
        fileUrl: '/uploads/receipts/sample_receipt_1.pdf',
        originalFilename: 'Hostel_Fee_Receipt_2026.pdf',
        mimeType: 'application/pdf',
        fileSize: 245000,
        status: 'APPROVED',
        verificationDate: new Date(),
        reviewerAdminId: adminUser.id,
      },
    });

    const targetRoom = await prisma.room.findFirst({ where: { roomNumber: 'ORC-101' } }) || await prisma.room.findFirst();
    if (targetRoom) {
      const targetBed = await prisma.bed.findFirst({ where: { roomId: targetRoom.id, bedNumber: 'A' } });
      if (targetBed) {
        await prisma.bed.update({ where: { id: targetBed.id }, data: { status: 'OCCUPIED' } });
        await prisma.room.update({ where: { id: targetRoom.id }, data: { status: 'PARTIALLY_OCCUPIED' } });
        await prisma.allocation.upsert({
          where: { applicationId: app1.id },
          update: {},
          create: {
            applicationId: app1.id,
            bedId: targetBed.id,
            academicYearId: academicYear.id,
            allocatedBy: 'SELF',
            letterRefCode: 'LTR-2026-ALEX-001',
          },
        });
      }
    }
  }

  // Student 2: Fee Verified (Priya Sharma - 1st Year, Rajam NRI)
  const user2 = await prisma.user.upsert({
    where: { email: 'priya.sharma@student.dormify.edu' },
    update: {},
    create: {
      email: 'priya.sharma@student.dormify.edu',
      passwordHash,
      role: 'STUDENT',
      name: 'Priya Sharma',
      studentProfile: {
        create: {
          rollNumber: 'STU2026002',
          department: 'Electrical Engineering',
          yearOfStudy: 1,
          preferredHostel: 'RAJAM_NRI',
          totalFeePaid: 107084.0,
          remainingFeeDue: 0,
          quota: 'TNEA',
          phone: '+91 94441 34567',
          guardianName: 'Rajesh Sharma',
          guardianPhone: '+91 94441 98765',
          gender: 'FEMALE',
          address: '88 Innovation Boulevard',
        },
      },
    },
    include: { studentProfile: true },
  });

  if (user2.studentProfile) {
    const app2 = await prisma.application.upsert({
      where: { studentId_academicYearId: { studentId: user2.studentProfile.id, academicYearId: academicYear.id } },
      update: {},
      create: {
        studentId: user2.studentProfile.id,
        academicYearId: academicYear.id,
        status: 'FEE_VERIFIED',
      },
    });

    await prisma.feeReceipt.upsert({
      where: { applicationId: app2.id },
      update: {},
      create: {
        applicationId: app2.id,
        receiptNumber: 'REC-2026-002',
        amount: 107084.0,
        fileUrl: '/uploads/receipts/sample_receipt_2.pdf',
        originalFilename: 'Priya_Hostel_Fee.pdf',
        mimeType: 'application/pdf',
        fileSize: 198000,
        status: 'APPROVED',
        verificationDate: new Date(),
        reviewerAdminId: adminUser.id,
      },
    });
  }

  // Student 3: Fee Submitted (Marcus Vance - 1st Year, Birla General Hostel)
  const user3 = await prisma.user.upsert({
    where: { email: 'marcus.vance@student.dormify.edu' },
    update: {},
    create: {
      email: 'marcus.vance@student.dormify.edu',
      passwordHash,
      role: 'STUDENT',
      name: 'Marcus Vance',
      studentProfile: {
        create: {
          rollNumber: 'STU2026003',
          department: 'Mechanical Engineering',
          yearOfStudy: 1,
          preferredHostel: 'BIRLA',
          totalFeePaid: 47197.0,
          remainingFeeDue: 0,
          quota: 'TNEA',
          phone: '+91 97891 45678',
          guardianName: 'David Vance',
          guardianPhone: '+91 97891 87611',
          gender: 'MALE',
          address: '15 Science Park Ave',
        },
      },
    },
    include: { studentProfile: true },
  });

  if (user3.studentProfile) {
    const app3 = await prisma.application.upsert({
      where: { studentId_academicYearId: { studentId: user3.studentProfile.id, academicYearId: academicYear.id } },
      update: {},
      create: {
        studentId: user3.studentProfile.id,
        academicYearId: academicYear.id,
        status: 'FEE_SUBMITTED',
      },
    });

    await prisma.feeReceipt.upsert({
      where: { applicationId: app3.id },
      update: {},
      create: {
        applicationId: app3.id,
        receiptNumber: 'REC-2026-003',
        amount: 47197.0,
        fileUrl: '/uploads/receipts/sample_receipt_3.pdf',
        originalFilename: 'Marcus_Receipt_Copy.pdf',
        mimeType: 'application/pdf',
        fileSize: 310000,
        status: 'PENDING',
      },
    });
  }

  // Student 4: Fee Verified (Kavya Nair - 1st Year, Vaigai Residence)
  const user4 = await prisma.user.upsert({
    where: { email: 'kavya.nair@student.dormify.edu' },
    update: {},
    create: {
      email: 'kavya.nair@student.dormify.edu',
      passwordHash,
      role: 'STUDENT',
      name: 'Kavya Nair',
      studentProfile: {
        create: {
          rollNumber: 'STU2026004',
          department: 'Information Technology',
          yearOfStudy: 1,
          preferredHostel: 'VAIGAI',
          totalFeePaid: 47197.0,
          remainingFeeDue: 0,
          quota: 'TNEA',
          phone: '+91 98402 77889',
          guardianName: 'Suresh Nair',
          guardianPhone: '+91 98402 11223',
          gender: 'FEMALE',
          address: '24 Green Meadows, Anna Nagar',
        },
      },
    },
    include: { studentProfile: true },
  });

  if (user4.studentProfile) {
    const app4 = await prisma.application.upsert({
      where: { studentId_academicYearId: { studentId: user4.studentProfile.id, academicYearId: academicYear.id } },
      update: {},
      create: {
        studentId: user4.studentProfile.id,
        academicYearId: academicYear.id,
        status: 'FEE_VERIFIED',
      },
    });

    await prisma.feeReceipt.upsert({
      where: { applicationId: app4.id },
      update: {},
      create: {
        applicationId: app4.id,
        receiptNumber: 'REC-2026-004',
        amount: 47197.0,
        fileUrl: '/uploads/receipts/sample_receipt_4.pdf',
        originalFilename: 'Kavya_Vaigai_Receipt.pdf',
        mimeType: 'application/pdf',
        fileSize: 220000,
        status: 'APPROVED',
        verificationDate: new Date(),
        reviewerAdminId: adminUser.id,
      },
    });
  }

  // Student 5: Fee Verified (Ananya Deshmukh - 1st Year, Ponni Residence)
  const user5 = await prisma.user.upsert({
    where: { email: 'ananya.deshmukh@student.dormify.edu' },
    update: {},
    create: {
      email: 'ananya.deshmukh@student.dormify.edu',
      passwordHash,
      role: 'STUDENT',
      name: 'Ananya Deshmukh',
      studentProfile: {
        create: {
          rollNumber: 'STU2026005',
          department: 'Electronics & Communication',
          yearOfStudy: 1,
          preferredHostel: 'PONNI',
          totalFeePaid: 47197.0,
          remainingFeeDue: 0,
          quota: 'TNEA',
          phone: '+91 98403 66778',
          guardianName: 'Vikram Deshmukh',
          guardianPhone: '+91 98403 99887',
          gender: 'FEMALE',
          address: '56 Lake View Road, Adyar',
        },
      },
    },
    include: { studentProfile: true },
  });

  if (user5.studentProfile) {
    const app5 = await prisma.application.upsert({
      where: { studentId_academicYearId: { studentId: user5.studentProfile.id, academicYearId: academicYear.id } },
      update: {},
      create: {
        studentId: user5.studentProfile.id,
        academicYearId: academicYear.id,
        status: 'FEE_VERIFIED',
      },
    });

    await prisma.feeReceipt.upsert({
      where: { applicationId: app5.id },
      update: {},
      create: {
        applicationId: app5.id,
        receiptNumber: 'REC-2026-005',
        amount: 47197.0,
        fileUrl: '/uploads/receipts/sample_receipt_5.pdf',
        originalFilename: 'Ananya_Ponni_Receipt.pdf',
        mimeType: 'application/pdf',
        fileSize: 215000,
        status: 'APPROVED',
        verificationDate: new Date(),
        reviewerAdminId: adminUser.id,
      },
    });
  }

  // Student 6: Fee Verified (Sneha Patel - 1st Year, Cauvery Residence)
  const user6 = await prisma.user.upsert({
    where: { email: 'sneha.patel@student.dormify.edu' },
    update: {},
    create: {
      email: 'sneha.patel@student.dormify.edu',
      passwordHash,
      role: 'STUDENT',
      name: 'Sneha Patel',
      studentProfile: {
        create: {
          rollNumber: 'STU2026006',
          department: 'Chemical Engineering',
          yearOfStudy: 1,
          preferredHostel: 'CAUVERY',
          totalFeePaid: 47197.0,
          remainingFeeDue: 0,
          quota: 'TNEA',
          phone: '+91 98404 11335',
          guardianName: 'Manoj Patel',
          guardianPhone: '+91 98404 99771',
          gender: 'FEMALE',
          address: '77 Riverfront Road, Guindy',
        },
      },
    },
    include: { studentProfile: true },
  });

  if (user6.studentProfile) {
    const app6 = await prisma.application.upsert({
      where: { studentId_academicYearId: { studentId: user6.studentProfile.id, academicYearId: academicYear.id } },
      update: {},
      create: {
        studentId: user6.studentProfile.id,
        academicYearId: academicYear.id,
        status: 'FEE_VERIFIED',
      },
    });

    await prisma.feeReceipt.upsert({
      where: { applicationId: app6.id },
      update: {},
      create: {
        applicationId: app6.id,
        receiptNumber: 'REC-2026-006',
        amount: 47197.0,
        fileUrl: '/uploads/receipts/sample_receipt_6.pdf',
        originalFilename: 'Sneha_Cauvery_Receipt.pdf',
        mimeType: 'application/pdf',
        fileSize: 210000,
        status: 'APPROVED',
        verificationDate: new Date(),
        reviewerAdminId: adminUser.id,
      },
    });
  }

  // 6. Create Seed Audit Logs
  await prisma.auditLog.createMany({
    data: [
      {
        actorUserId: adminUser.id,
        action: 'SYSTEM_INITIALIZED',
        targetType: 'System',
        description: 'Institutional database initialized with Academic Year 2025-2026',
      },
      {
        actorUserId: adminUser.id,
        action: 'FEE_APPROVED',
        targetType: 'FeeReceipt',
        targetId: 'REC-2026-001',
        description: 'Fee receipt approved for student Alex Rivera (STU2026001)',
      },
      {
        actorUserId: adminUser.id,
        action: 'ALLOCATION_CREATED',
        targetType: 'Allocation',
        description: 'Bed A in Room A-101 allocated to student Alex Rivera (STU2026001)',
      },
    ],
  });

  console.log('[Seed] Audit logs created.');
  console.log('[Seed] Institutional seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('[Seed Error]:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
