import { Request, Response } from 'express';
import { prisma } from '../config/db';
import { ApiResponse } from '../utils/apiResponse';

export class ReportController {
  static async getOccupancyReport(req: Request, res: Response) {
    try {
      const blocks = await prisma.block.findMany({
        include: {
          hostel: true,
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

      const report = blocks.map((block) => {
        let totalRooms = 0;
        let totalBeds = 0;
        let occupiedBeds = 0;
        let availableBeds = 0;
        let maintenanceBeds = 0;

        block.floors.forEach((floor) => {
          totalRooms += floor.rooms.length;
          floor.rooms.forEach((room) => {
            totalBeds += room.beds.length;
            occupiedBeds += room.beds.filter((b) => b.status === 'OCCUPIED').length;
            availableBeds += room.beds.filter((b) => b.status === 'AVAILABLE').length;
            maintenanceBeds += room.beds.filter((b) => b.status === 'MAINTENANCE').length;
          });
        });

        return {
          blockId: block.id,
          blockName: block.name,
          blockCode: block.code,
          hostelName: block.hostel.name,
          totalRooms,
          totalBeds,
          occupiedBeds,
          availableBeds,
          maintenanceBeds,
          occupancyPercentage: totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0,
        };
      });

      return ApiResponse.success(res, report);
    } catch (err) {
      return ApiResponse.error(res, 'Failed to generate occupancy report', 500, err);
    }
  }

  static async getDepartmentDistribution(req: Request, res: Response) {
    try {
      const students = await prisma.studentProfile.findMany({
        select: {
          department: true,
          applications: {
            select: {
              status: true,
            },
          },
        },
      });

      const deptMap: { [key: string]: { total: number; allocated: number } } = {};

      students.forEach((s) => {
        const dept = s.department || 'Unassigned';
        if (!deptMap[dept]) {
          deptMap[dept] = { total: 0, allocated: 0 };
        }
        deptMap[dept].total += 1;
        const isAllocated = s.applications.some((app) => app.status === 'ALLOCATED');
        if (isAllocated) deptMap[dept].allocated += 1;
      });

      const report = Object.keys(deptMap).map((dept) => ({
        department: dept,
        totalStudents: deptMap[dept].total,
        allocatedStudents: deptMap[dept].allocated,
        unallocatedStudents: deptMap[dept].total - deptMap[dept].allocated,
      }));

      return ApiResponse.success(res, report);
    } catch (err) {
      return ApiResponse.error(res, 'Failed to generate department distribution report', 500, err);
    }
  }
}
