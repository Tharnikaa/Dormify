import { prisma } from '../config/db';
import { logAudit } from '../utils/auditLogger';
import { NotificationService } from './notificationService';
import { randomUUID } from 'crypto';

export interface SelectBedParams {
  userId: string;
  studentId: string;
  bedId: string;
  allocatedBy?: string;
  adminReason?: string;
  adminUserId?: string;
}

export class AllocationService {
  static async allocateBed(params: SelectBedParams) {
    const { userId, studentId, bedId, allocatedBy = 'SELF', adminReason, adminUserId } = params;

    const activeAcademicYear = await prisma.academicYear.findFirst({
      where: { isActive: true },
    });

    if (!activeAcademicYear) {
      const error: any = new Error('No active academic year found for room allocation.');
      error.statusCode = 400;
      throw error;
    }

    const application = await prisma.application.findUnique({
      where: {
        studentId_academicYearId: {
          studentId,
          academicYearId: activeAcademicYear.id,
        },
      },
      include: {
        student: {
          include: {
            user: true,
          },
        },
        feeReceipt: true,
        allocation: true,
      },
    });

    if (!application) {
      const error: any = new Error('No active hostel application found for this academic year.');
      error.statusCode = 404;
      throw error;
    }

    if (allocatedBy === 'SELF') {
      if (!application.feeReceipt || application.feeReceipt.status !== 'APPROVED') {
        const error: any = new Error('Hostel fee receipt must be approved by administration before room selection.');
        error.statusCode = 403;
        throw error;
      }

      if (application.status !== 'FEE_VERIFIED' && application.status !== 'ROOM_SELECTION') {
        const error: any = new Error(`Cannot select room at current application lifecycle stage: ${application.status}`);
        error.statusCode = 403;
        throw error;
      }
    }

    if (application.allocation && application.allocation.status === 'ACTIVE') {
      const error: any = new Error('Student already has an active bed allocation for this academic year.');
      error.statusCode = 400;
      throw error;
    }

    try {
      const result = await prisma.$transaction(async (tx) => {
        const targetBed = await tx.bed.findUnique({
          where: { id: bedId },
          include: {
            room: {
              include: {
                floor: {
                  include: {
                    block: {
                      include: {
                        hostel: true,
                      },
                    },
                  },
                },
              },
            },
          },
        });

        if (!targetBed) {
          const error: any = new Error('Selected bed does not exist.');
          error.statusCode = 404;
          throw error;
        }

        if (targetBed.room.status === 'MAINTENANCE') {
          const error: any = new Error('Selected room is currently undergoing maintenance.');
          error.statusCode = 400;
          throw error;
        }

        if (targetBed.status !== 'AVAILABLE') {
          const error: any = new Error('The selected bed is no longer available. Please select another bed.');
          error.statusCode = 409;
          throw error;
        }

        const existingBedAllocation = await tx.allocation.findFirst({
          where: {
            bedId,
            academicYearId: activeAcademicYear.id,
            status: 'ACTIVE',
          },
        });

        if (existingBedAllocation) {
          const error: any = new Error('The selected bed is no longer available. Please select another bed.');
          error.statusCode = 409;
          throw error;
        }

        const letterRefCode = `DORM-${activeAcademicYear.name.replace('-', '')}-${targetBed.room.roomNumber}-${targetBed.bedNumber}-${randomUUID().substring(0, 8).toUpperCase()}`;

        const newAllocation = await tx.allocation.create({
          data: {
            applicationId: application.id,
            bedId,
            academicYearId: activeAcademicYear.id,
            allocatedBy,
            reason: adminReason || 'Student self-selection',
            letterRefCode,
          },
        });

        await tx.bed.update({
          where: { id: bedId },
          data: { status: 'OCCUPIED' },
        });

        await tx.application.update({
          where: { id: application.id },
          data: { status: 'ALLOCATED' },
        });

        const totalBedsInRoom = await tx.bed.count({ where: { roomId: targetBed.roomId } });
        const occupiedBedsInRoom = await tx.bed.count({
          where: { roomId: targetBed.roomId, status: 'OCCUPIED' },
        });

        let newRoomStatus = 'PARTIALLY_OCCUPIED';
        if (occupiedBedsInRoom >= totalBedsInRoom) {
          newRoomStatus = 'FULL';
        }

        await tx.room.update({
          where: { id: targetBed.roomId },
          data: { status: newRoomStatus },
        });

        return { newAllocation, targetBed };
      });

      const actorId = adminUserId || userId;
      const hostelName = result.targetBed.room.floor.block.hostel.name;
      const blockName = result.targetBed.room.floor.block.name;
      const roomNum = result.targetBed.room.roomNumber;
      const bedNum = result.targetBed.bedNumber;

      await logAudit(
        actorId,
        'ALLOCATION_CREATED',
        'Allocation',
        `Allocated Bed ${bedNum} in Room ${roomNum} (${blockName}, ${hostelName}) to student ${application.student.user.name} (${application.student.rollNumber}).`,
        result.newAllocation.id
      );

      await NotificationService.sendNotification(
        application.student.userId,
        'Hostel Room Allocated!',
        `Your room allocation has been confirmed. Bed ${bedNum}, Room ${roomNum} in ${blockName}. You can now view and print your official Allocation Letter.`,
        'ROOM_ALLOCATED'
      );

      return result.newAllocation;
    } catch (err: any) {
      if (err.code === 'P2002') {
        const error: any = new Error('The selected bed is no longer available. Please select another bed.');
        error.statusCode = 409;
        throw error;
      }
      throw err;
    }
  }
}
