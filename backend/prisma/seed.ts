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

  // 4. Create Hostel Structure (Hostel -> Blocks -> Floors -> Rooms -> Beds)
  const hostel = await prisma.hostel.upsert({
    where: { code: 'GUH' },
    update: {
      name: 'MIT Hostels',
    },
    create: {
      name: 'MIT Hostels',
      code: 'MITH',
      gender: 'COED',
      description: 'Madras Institute Of Technology Residential Hostel Complex',
    },
  });

  // Block A (Men)
  const blockA = await prisma.block.upsert({
    where: { hostelId_code: { hostelId: hostel.id, code: 'BLK-A' } },
    update: {},
    create: {
      hostelId: hostel.id,
      name: 'Block A - Men\'s Wing',
      code: 'BLK-A',
    },
  });

  // Block B (Women)
  const blockB = await prisma.block.upsert({
    where: { hostelId_code: { hostelId: hostel.id, code: 'BLK-B' } },
    update: {},
    create: {
      hostelId: hostel.id,
      name: 'Block B - Women\'s Wing',
      code: 'BLK-B',
    },
  });

  // Create Floors for Block A
  for (let floorNum = 1; floorNum <= 3; floorNum++) {
    const floor = await prisma.floor.upsert({
      where: { blockId_floorNumber: { blockId: blockA.id, floorNumber: floorNum } },
      update: {},
      create: {
        blockId: blockA.id,
        floorNumber: floorNum,
        name: `Floor ${floorNum}`,
      },
    });

    // Create Rooms for Floor
    for (let r = 1; r <= 5; r++) {
      const roomNum = `A-${floorNum}0${r}`;
      let roomStatus = 'AVAILABLE';
      
      if (r === 4 && floorNum === 1) roomStatus = 'MAINTENANCE';
      if (r === 5 && floorNum === 1) roomStatus = 'RESERVED';

      const room = await prisma.room.upsert({
        where: { floorId_roomNumber: { floorId: floor.id, roomNumber: roomNum } },
        update: {},
        create: {
          floorId: floor.id,
          roomNumber: roomNum,
          capacity: 2,
          roomType: 'DOUBLE',
          status: roomStatus,
        },
      });

      // Create 2 Beds per room
      for (const bedLetter of ['A', 'B']) {
        const bedStatus = roomStatus === 'MAINTENANCE' ? 'MAINTENANCE' : 
                          roomStatus === 'RESERVED' ? 'RESERVED' : 'AVAILABLE';
        await prisma.bed.upsert({
          where: { roomId_bedNumber: { roomId: room.id, bedNumber: bedLetter } },
          update: {},
          create: {
            roomId: room.id,
            bedNumber: bedLetter,
            status: bedStatus,
          },
        });
      }
    }
  }

  // Create Floors for Block B
  for (let floorNum = 1; floorNum <= 2; floorNum++) {
    const floor = await prisma.floor.upsert({
      where: { blockId_floorNumber: { blockId: blockB.id, floorNumber: floorNum } },
      update: {},
      create: {
        blockId: blockB.id,
        floorNumber: floorNum,
        name: `Floor ${floorNum}`,
      },
    });

    for (let r = 1; r <= 4; r++) {
      const roomNum = `B-${floorNum}0${r}`;
      const room = await prisma.room.upsert({
        where: { floorId_roomNumber: { floorId: floor.id, roomNumber: roomNum } },
        update: {},
        create: {
          floorId: floor.id,
          roomNumber: roomNum,
          capacity: 2,
          roomType: 'DOUBLE',
          status: 'AVAILABLE',
        },
      });

      for (const bedLetter of ['A', 'B']) {
        await prisma.bed.upsert({
          where: { roomId_bedNumber: { roomId: room.id, bedNumber: bedLetter } },
          update: {},
          create: {
            roomId: room.id,
            bedNumber: bedLetter,
            status: 'AVAILABLE',
          },
        });
      }
    }
  }

  console.log('[Seed] Hostel structure created with Blocks, Floors, Rooms, and Beds.');

  // 5. Seed Students with different lifecycle stages

  // Student 1: Fully Allocated (Alex Rivera)
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
          rollNumber: 'STU2026001',
          department: 'Computer Science',
          phone: '+1 (555) 234-5678',
          guardianName: 'Carlos Rivera',
          guardianPhone: '+1 (555) 876-5432',
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
        amount: 12500.0,
        fileUrl: '/uploads/receipts/sample_receipt_1.pdf',
        originalFilename: 'Hostel_Fee_Receipt_2026.pdf',
        mimeType: 'application/pdf',
        fileSize: 245000,
        status: 'APPROVED',
        verificationDate: new Date(),
        reviewerAdminId: adminUser.id,
      },
    });

    const targetRoom = await prisma.room.findFirst({ where: { roomNumber: 'A-101' } });
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

  // Student 2: Fee Verified (Priya Sharma)
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
          phone: '+1 (555) 345-6789',
          guardianName: 'Rajesh Sharma',
          guardianPhone: '+1 (555) 987-6543',
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
        amount: 12500.0,
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

  // Student 3: Fee Submitted (Marcus Vance)
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
          phone: '+1 (555) 456-7890',
          guardianName: 'David Vance',
          guardianPhone: '+1 (555) 876-1122',
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
        amount: 12500.0,
        fileUrl: '/uploads/receipts/sample_receipt_3.pdf',
        originalFilename: 'Marcus_Receipt_Copy.pdf',
        mimeType: 'application/pdf',
        fileSize: 310000,
        status: 'PENDING',
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
