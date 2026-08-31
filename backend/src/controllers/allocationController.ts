import { Request, Response } from 'express';
import { ApiResponse } from '../utils/apiResponse';
import { AllocationService } from '../services/allocationService';
import { PdfService } from '../services/pdfService';
import { prisma } from '../config/db';

export class AllocationController {
  static async selectBed(req: Request, res: Response) {
    try {
      const studentId = req.user?.studentId;
      const { bedId } = req.body;

      if (!studentId) {
        return ApiResponse.error(res, 'Student account required for bed selection', 400);
      }

      if (!bedId) {
        return ApiResponse.error(res, 'bedId parameter is required', 400);
      }

      const allocation = await AllocationService.allocateBed({
        userId: req.user!.userId,
        studentId,
        bedId,
        allocatedBy: 'SELF',
      });

      return ApiResponse.success(res, allocation, 'Bed successfully allocated!');
    } catch (err: any) {
      const statusCode = err.statusCode || 500;
      return ApiResponse.error(res, err.message || 'Room allocation failed', statusCode, err);
    }
  }

  static async manualAllocate(req: Request, res: Response) {
    try {
      const { studentId, bedId, reason } = req.body;

      if (!studentId || !bedId) {
        return ApiResponse.error(res, 'studentId and bedId are required for manual allocation', 400);
      }

      if (!reason || !reason.trim()) {
        return ApiResponse.error(res, 'Administrative reason is required for manual allocation', 400);
      }

      const allocation = await AllocationService.allocateBed({
        userId: req.user!.userId,
        studentId,
        bedId,
        allocatedBy: 'ADMIN',
        adminReason: reason,
        adminUserId: req.user!.userId,
      });

      return ApiResponse.success(res, allocation, 'Student manually allocated successfully');
    } catch (err: any) {
      const statusCode = err.statusCode || 500;
      return ApiResponse.error(res, err.message || 'Manual allocation failed', statusCode, err);
    }
  }

  static async getMyAllocation(req: Request, res: Response) {
    try {
      const studentId = req.user?.studentId;

      if (!studentId) {
        return ApiResponse.error(res, 'Student session required', 400);
      }

      const activeAcademicYear = await prisma.academicYear.findFirst({
        where: { isActive: true },
      });

      if (!activeAcademicYear) {
        return ApiResponse.error(res, 'No active academic year found', 404);
      }

      const application = await prisma.application.findUnique({
        where: {
          studentId_academicYearId: {
            studentId,
            academicYearId: activeAcademicYear.id,
          },
        },
        include: {
          allocation: {
            include: {
              bed: {
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
              },
            },
          },
        },
      });

      if (!application || !application.allocation) {
        return ApiResponse.error(res, 'No active allocation found for current student', 404);
      }

      return ApiResponse.success(res, application.allocation);
    } catch (err) {
      return ApiResponse.error(res, 'Failed to fetch allocation', 500, err);
    }
  }

  static async getAllocationLetterHtml(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const allocation = await prisma.allocation.findUnique({
        where: { id },
        include: {
          academicYear: true,
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
          },
        },
      });

      if (!allocation) {
        return ApiResponse.error(res, 'Allocation letter record not found', 404);
      }

      const student = allocation.application.student;
      const user = student.user;
      const room = allocation.bed.room;
      const floor = room.floor;
      const block = floor.block;
      const hostel = block.hostel;

      const html = PdfService.generateAllocationLetterHtml({
        institutionName: 'MADRAS INSTITUTE OF TECHNOLOGY',
        academicYear: allocation.academicYear.name,
        studentName: user.name,
        rollNumber: student.rollNumber,
        department: student.department,
        gender: student.gender,
        phone: student.phone,
        hostelName: hostel.name || 'MIT Hostels',
        blockName: block.name,
        floorName: floor.name,
        roomNumber: room.roomNumber,
        bedNumber: allocation.bed.bedNumber,
        allocationDate: new Date(allocation.allocationDate).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        letterRefCode: allocation.letterRefCode,
        authorizedOfficer: 'Mr. Ajith',
        issueTimestamp: new Date(allocation.createdAt).toLocaleDateString(),
      });

      res.setHeader('Content-Type', 'text/html');
      return res.send(html);
    } catch (err) {
      return ApiResponse.error(res, 'Failed to generate allocation letter HTML', 500, err);
    }
  }
}
