"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('[Seed] Starting institutional seed data population...');
    // Password hash for standard dev accounts
    const passwordHash = await bcryptjs_1.default.hash('Password123!', 10);
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
            role: client_1.Role.HOD,
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
    // 3. Create Admin User & Profile
    const adminUser = await prisma.user.upsert({
        where: { email: 'admin@dormify.edu' },
        update: {},
        create: {
            email: 'admin@dormify.edu',
            passwordHash,
            role: client_1.Role.ADMIN,
            name: 'Sarah Jenkins',
            adminProfile: {
                create: {
                    employeeId: 'EMP-ADM-002',
                    department: 'Hostel Administration',
                    designation: 'Senior Hostel Registrar',
                },
            },
        },
    });
    console.log(`[Seed] Admin User created: ${adminUser.email}`);
    // 4. Create Hostel Structure (Hostel -> Blocks -> Floors -> Rooms -> Beds)
    const hostel = await prisma.hostel.upsert({
        where: { code: 'GUH' },
        update: {},
        create: {
            name: 'Grand University Hostel',
            code: 'GUH',
            gender: 'COED',
            description: 'Main Campus Residential Complex with modern amenities & 24/7 security',
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
            let roomStatus = client_1.RoomStatus.AVAILABLE;
            // Give diverse room statuses for realistic demo
            if (r === 4 && floorNum === 1)
                roomStatus = client_1.RoomStatus.MAINTENANCE;
            if (r === 5 && floorNum === 1)
                roomStatus = client_1.RoomStatus.RESERVED;
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
                const bedStatus = roomStatus === client_1.RoomStatus.MAINTENANCE ? client_1.BedStatus.MAINTENANCE :
                    roomStatus === client_1.RoomStatus.RESERVED ? client_1.BedStatus.RESERVED : client_1.BedStatus.AVAILABLE;
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
                    status: client_1.RoomStatus.AVAILABLE,
                },
            });
            for (const bedLetter of ['A', 'B']) {
                await prisma.bed.upsert({
                    where: { roomId_bedNumber: { roomId: room.id, bedNumber: bedLetter } },
                    update: {},
                    create: {
                        roomId: room.id,
                        bedNumber: bedLetter,
                        status: client_1.BedStatus.AVAILABLE,
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
            role: client_1.Role.STUDENT,
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
                status: client_1.ApplicationStatus.ALLOCATED,
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
                status: client_1.FeeStatus.APPROVED,
                verificationDate: new Date(),
                reviewerAdminId: adminUser.id,
            },
        });
        // Find Room A-101 Bed A and allocate
        const targetRoom = await prisma.room.findFirst({ where: { roomNumber: 'A-101' } });
        if (targetRoom) {
            const targetBed = await prisma.bed.findFirst({ where: { roomId: targetRoom.id, bedNumber: 'A' } });
            if (targetBed) {
                await prisma.bed.update({ where: { id: targetBed.id }, data: { status: client_1.BedStatus.OCCUPIED } });
                await prisma.room.update({ where: { id: targetRoom.id }, data: { status: client_1.RoomStatus.PARTIALLY_OCCUPIED } });
                await prisma.allocation.upsert({
                    where: { applicationId: app1.id },
                    update: {},
                    create: {
                        applicationId: app1.id,
                        bedId: targetBed.id,
                        academicYearId: academicYear.id,
                        allocatedBy: client_1.AllocationMode.SELF,
                        letterRefCode: 'LTR-2026-ALEX-001',
                    },
                });
            }
        }
    }
    // Student 2: Fee Verified, Ready for Room Selection (Priya Sharma)
    const user2 = await prisma.user.upsert({
        where: { email: 'priya.sharma@student.dormify.edu' },
        update: {},
        create: {
            email: 'priya.sharma@student.dormify.edu',
            passwordHash,
            role: client_1.Role.STUDENT,
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
                status: client_1.ApplicationStatus.FEE_VERIFIED,
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
                status: client_1.FeeStatus.APPROVED,
                verificationDate: new Date(),
                reviewerAdminId: adminUser.id,
            },
        });
    }
    // Student 3: Fee Submitted, Pending Verification (Marcus Vance)
    const user3 = await prisma.user.upsert({
        where: { email: 'marcus.vance@student.dormify.edu' },
        update: {},
        create: {
            email: 'marcus.vance@student.dormify.edu',
            passwordHash,
            role: client_1.Role.STUDENT,
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
                status: client_1.ApplicationStatus.FEE_SUBMITTED,
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
                status: client_1.FeeStatus.PENDING,
            },
        });
    }
    // Student 4: Profile Completed (David Chen)
    const user4 = await prisma.user.upsert({
        where: { email: 'david.chen@student.dormify.edu' },
        update: {},
        create: {
            email: 'david.chen@student.dormify.edu',
            passwordHash,
            role: client_1.Role.STUDENT,
            name: 'David Chen',
            studentProfile: {
                create: {
                    rollNumber: 'STU2026004',
                    department: 'Civil Engineering',
                    phone: '+1 (555) 567-8901',
                    guardianName: 'Li Wei Chen',
                    guardianPhone: '+1 (555) 334-5566',
                    gender: 'MALE',
                    address: '102 Metro Station Road',
                },
            },
        },
        include: { studentProfile: true },
    });
    if (user4.studentProfile) {
        await prisma.application.upsert({
            where: { studentId_academicYearId: { studentId: user4.studentProfile.id, academicYearId: academicYear.id } },
            update: {},
            create: {
                studentId: user4.studentProfile.id,
                academicYearId: academicYear.id,
                status: client_1.ApplicationStatus.PROFILE_COMPLETED,
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
    console.log('----------------------------------------------------');
    console.log('DEMO ACCOUNTS FOR TESTING:');
    console.log('  HOD User:     email: hod.cs@dormify.edu / password: Password123!');
    console.log('  Admin User:   email: admin@dormify.edu / password: Password123!');
    console.log('  Student 1:    email: alex.rivera@student.dormify.edu / password: Password123! (ALLOCATED)');
    console.log('  Student 2:    email: priya.sharma@student.dormify.edu / password: Password123! (FEE_VERIFIED)');
    console.log('  Student 3:    email: marcus.vance@student.dormify.edu / password: Password123! (FEE_SUBMITTED)');
    console.log('----------------------------------------------------');
}
main()
    .catch((e) => {
    console.error('[Seed Error]:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
