import { Request, Response } from 'express';
import { prisma } from '../config/db';
import { ApiResponse } from '../utils/apiResponse';

export class StudentController {
  static async getProfile(req: Request, res: Response) {
    try {
      const studentId = req.user?.studentId || req.params.id;

      if (!studentId) {
        return ApiResponse.error(res, 'Student ID missing', 400);
      }

      const student = await prisma.studentProfile.findUnique({
        where: { id: studentId },
        include: {
          user: true,
          applications: {
            include: {
              academicYear: true,
              feeReceipt: true,
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
          },
        },
      });

      if (!student) {
        return ApiResponse.error(res, 'Student profile not found', 404);
      }

      return ApiResponse.success(res, student);
    } catch (err) {
      return ApiResponse.error(res, 'Failed to fetch student profile', 500, err);
    }
  }

  static async updateProfile(req: Request, res: Response) {
    try {
      const studentId = req.user?.studentId || req.params.id;
      const { phone, guardianName, guardianPhone, address } = req.body;

      if (!studentId) {
        return ApiResponse.error(res, 'Student profile ID missing', 400);
      }

      const updated = await prisma.studentProfile.update({
        where: { id: studentId },
        data: {
          phone,
          guardianName,
          guardianPhone,
          address,
        },
      });

      return ApiResponse.success(res, updated, 'Profile updated successfully');
    } catch (err) {
      return ApiResponse.error(res, 'Failed to update profile', 500, err);
    }
  }

  static async getCurrentApplication(req: Request, res: Response) {
    try {
      const studentId = req.user?.studentId;

      if (!studentId) {
        return ApiResponse.error(res, 'Student ID not found in session', 400);
      }

      const activeAcademicYear = await prisma.academicYear.findFirst({
        where: { isActive: true },
      });

      if (!activeAcademicYear) {
        return ApiResponse.error(res, 'No active academic year found', 404);
      }

      let application = await prisma.application.findUnique({
        where: {
          studentId_academicYearId: {
            studentId,
            academicYearId: activeAcademicYear.id,
          },
        },
        include: {
          academicYear: true,
          feeReceipt: true,
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

      // Auto-create application if student is registered but has no application for active academic year
      if (!application) {
        application = await prisma.application.create({
          data: {
            studentId,
            academicYearId: activeAcademicYear.id,
          },
          include: {
            academicYear: true,
            feeReceipt: true,
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
      }

      return ApiResponse.success(res, application);
    } catch (err) {
      return ApiResponse.error(res, 'Failed to fetch current application', 500, err);
    }
  }

  static async listStudents(req: Request, res: Response) {
    try {
      const { search, department, status, page = '1', limit = '10' } = req.query;
      const skip = (parseInt(page as string, 10) - 1) * parseInt(limit as string, 10);
      const take = parseInt(limit as string, 10);

      const where: any = {};

      if (search) {
        where.OR = [
          { rollNumber: { contains: search as string, mode: 'insensitive' } },
          { user: { name: { contains: search as string, mode: 'insensitive' } } },
          { user: { email: { contains: search as string, mode: 'insensitive' } } },
        ];
      }

      if (department) {
        where.department = department;
      }

      const total = await prisma.studentProfile.count({ where });

      const students = await prisma.studentProfile.findMany({
        where,
        include: {
          user: true,
          applications: {
            include: {
              academicYear: true,
              feeReceipt: true,
              allocation: {
                include: {
                  bed: {
                    include: {
                      room: true,
                    },
                  },
                },
              },
            },
            take: 1,
            orderBy: { submittedAt: 'desc' },
          },
        },
        skip,
        take,
        orderBy: { rollNumber: 'asc' },
      });

      return ApiResponse.success(res, students, 'Students list retrieved', 200, {
        total,
        page: parseInt(page as string, 10),
        limit: take,
        totalPages: Math.ceil(total / take),
      });
    } catch (err) {
      return ApiResponse.error(res, 'Failed to list students', 500, err);
    }
  }
}
