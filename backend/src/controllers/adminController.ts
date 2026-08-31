import { Request, Response } from 'express';
import { prisma } from '../config/db';
import { ApiResponse } from '../utils/apiResponse';

export class AdminController {
  static async getDashboardStats(req: Request, res: Response) {
    try {
      const activeAcademicYear = await prisma.academicYear.findFirst({
        where: { isActive: true },
      });

      const totalStudents = await prisma.studentProfile.count();

      const verifiedStudents = await prisma.feeReceipt.count({
        where: { status: 'APPROVED' },
      });

      const pendingVerification = await prisma.feeReceipt.count({
        where: { status: 'PENDING' },
      });

      const totalBeds = await prisma.bed.count();
      const occupiedBeds = await prisma.bed.count({ where: { status: 'OCCUPIED' } });
      const availableBeds = await prisma.bed.count({ where: { status: 'AVAILABLE' } });

      const occupancyPercentage = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

      const unallocatedStudents = await prisma.application.count({
        where: {
          status: 'FEE_VERIFIED',
        },
      });

      const recentAllocations = await prisma.allocation.findMany({
        take: 5,
        orderBy: { allocationDate: 'desc' },
        include: {
          application: {
            include: {
              student: {
                include: {
                  user: true,
                },
              },
            },
          },
          bed: {
            include: {
              room: {
                include: {
                  floor: {
                    include: {
                      block: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      const blocks = await prisma.block.findMany({
        include: {
          floors: {
            include: {
              rooms: {
                include: {
                  beds: true,
                },
              },
            },
          },
        },
      });

      const blockMetrics = blocks.map((b) => {
        let bTotal = 0;
        let bOccupied = 0;
        b.floors.forEach((f) => {
          f.rooms.forEach((r) => {
            bTotal += r.beds.length;
            bOccupied += r.beds.filter((bed) => bed.status === 'OCCUPIED').length;
          });
        });
        return {
          id: b.id,
          name: b.name,
          code: b.code,
          totalBeds: bTotal,
          occupiedBeds: bOccupied,
          availableBeds: bTotal - bOccupied,
          occupancyRate: bTotal > 0 ? Math.round((bOccupied / bTotal) * 100) : 0,
        };
      });

      return ApiResponse.success(res, {
        activeAcademicYear: activeAcademicYear?.name || 'N/A',
        totalStudents,
        verifiedStudents,
        pendingVerification,
        totalBeds,
        occupiedBeds,
        availableBeds,
        occupancyPercentage,
        unallocatedStudents,
        recentAllocations,
        blockMetrics,
      });
    } catch (err) {
      return ApiResponse.error(res, 'Failed to calculate admin dashboard statistics', 500, err);
    }
  }
}
