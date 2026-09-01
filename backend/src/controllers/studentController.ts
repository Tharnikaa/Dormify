import { Request, Response } from 'express';
import { prisma } from '../config/db';
import { ApiResponse } from '../utils/apiResponse';
import { logAudit } from '../utils/auditLogger';
import { NotificationService } from '../services/notificationService';
import { calculateFeeDifference, getHostelFee } from '../utils/feeStructure';

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
      const { search, department, status, hostel, page = '1', limit = '10' } = req.query;
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

      if (hostel) {
        where.preferredHostel = hostel as string;
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

  static async getStudentById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const student = await prisma.studentProfile.findUnique({
        where: { id },
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
            orderBy: { submittedAt: 'desc' },
          },
        },
      });

      if (!student) {
        return ApiResponse.error(res, 'Student profile not found', 404);
      }

      return ApiResponse.success(res, student, 'Student details retrieved');
    } catch (err) {
      return ApiResponse.error(res, 'Failed to retrieve student details', 500, err);
    }
  }

  static async adminChangeHostel(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { preferredHostel, hostelType, reason } = req.body;

      if (!id || !preferredHostel) {
        return ApiResponse.error(res, 'Student ID and new preferred hostel are required', 400);
      }

      const student = await prisma.studentProfile.findUnique({
        where: { id },
        include: {
          user: true,
          applications: {
            include: {
              feeReceipt: true,
              allocation: true,
            },
            take: 1,
            orderBy: { submittedAt: 'desc' },
          },
        },
      });

      if (!student) {
        return ApiResponse.error(res, 'Student profile not found', 404);
      }

      const boysHostels = ['ORCHID', 'BIRLA', 'BHAVANI', 'KURINJI', 'MARUDHAM', 'THAMIRA', 'AMARAVATHI'];
      const girlsHostels = ['RAJAM_NRI', 'PONNI', 'KAVERI', 'CAUVERY', 'VAIGAI'];

      if (student.gender === 'MALE' && girlsHostels.includes(preferredHostel)) {
        return ApiResponse.error(res, 'Male students cannot be assigned to Girls Hostels.', 400);
      }
      if (student.gender === 'FEMALE' && boysHostels.includes(preferredHostel)) {
        return ApiResponse.error(res, 'Female students cannot be assigned to Boys Hostels.', 400);
      }

      const currentHostel = student.preferredHostel;
      const yearOfStudy = student.yearOfStudy || 1;
      const totalPaid = student.totalFeePaid || 0;

      // Calculate official fee difference
      const feeDiff = calculateFeeDifference(yearOfStudy, currentHostel, preferredHostel, totalPaid);

      // De-allocate old room if student was already allocated to a bed
      const activeApp = student.applications[0];
      if (activeApp && activeApp.allocation) {
        const bedId = activeApp.allocation.bedId;
        await prisma.allocation.delete({ where: { id: activeApp.allocation.id } });
        await prisma.bed.update({
          where: { id: bedId },
          data: { status: 'AVAILABLE' },
        });
      }

      // Update student profile with new hostel and remaining balance
      const updated = await prisma.studentProfile.update({
        where: { id },
        data: {
          preferredHostel,
          remainingFeeDue: feeDiff.remainingDue,
          ...(hostelType ? { hostelType } : {}),
        },
      });

      // Update application status
      if (activeApp) {
        const newStatus = feeDiff.remainingDue > 0 ? 'FEE_PENDING' : 'ROOM_SELECTION';
        await prisma.application.update({
          where: { id: activeApp.id },
          data: {
            status: newStatus,
            isHostelChanged: true,
          },
        });
      }

      // Log Audit
      await logAudit(
        req.user!.userId,
        'ADMIN_HOSTEL_CHANGE',
        'StudentProfile',
        `Admin reassigned hostel for ${student.user.name} (${student.rollNumber}) from ${currentHostel || 'None'} to ${preferredHostel}. Remaining Fee Due: ₹${feeDiff.remainingDue}. Reason: ${reason || 'Administrative re-allocation'}`,
        student.id
      );

      // Notify Student
      const feeMsg = feeDiff.remainingDue > 0
        ? ` Note: A remaining fee difference of ₹${feeDiff.remainingDue.toLocaleString('en-IN')} is due. Please upload your payment receipt to unlock room booking in ${preferredHostel}.`
        : ` You may now proceed directly to select your room in ${preferredHostel}.`;

      await NotificationService.sendNotification(
        student.userId,
        'Hostel Reassignment Notice',
        `Your assigned hostel complex has been changed to ${preferredHostel} by the administration.${feeMsg}${reason ? ` Reason: ${reason}` : ''}`,
        'HOSTEL_CHANGED'
      );

      return ApiResponse.success(
        res,
        {
          student: updated,
          feeDifference: feeDiff,
        },
        'Hostel successfully changed by administrator'
      );
    } catch (err) {
      console.error('[StudentController.adminChangeHostel] Error:', err);
      return ApiResponse.error(res, 'Failed to change hostel', 500, err);
    }
  }

  static async adminBatchShiftHostels(req: Request, res: Response) {
    try {
      const { yearOfStudy, gender, fromHostel, toHostel, department, reason } = req.body;

      if (!toHostel) {
        return ApiResponse.error(res, 'Destination hostel (toHostel) is required', 400);
      }

      const boysHostels = ['ORCHID', 'BIRLA', 'BHAVANI', 'KURINJI', 'MARUDHAM', 'THAMIRA', 'AMARAVATHI'];
      const girlsHostels = ['RAJAM_NRI', 'PONNI', 'KAVERI', 'CAUVERY', 'VAIGAI'];

      if (gender === 'MALE' && girlsHostels.includes(toHostel)) {
        return ApiResponse.error(res, 'Male students cannot be batch shifted to Girls Hostels.', 400);
      }
      if (gender === 'FEMALE' && boysHostels.includes(toHostel)) {
        return ApiResponse.error(res, 'Female students cannot be batch shifted to Boys Hostels.', 400);
      }

      const where: any = {};
      if (yearOfStudy) where.yearOfStudy = parseInt(yearOfStudy, 10);
      if (gender) where.gender = gender;
      if (fromHostel) where.preferredHostel = fromHostel;
      if (department) where.department = department;

      // Fetch all matching students
      const students = await prisma.studentProfile.findMany({
        where,
        include: {
          user: true,
          applications: {
            include: { allocation: true },
            take: 1,
            orderBy: { submittedAt: 'desc' },
          },
        },
      });

      if (students.length === 0) {
        return ApiResponse.success(res, { shiftedCount: 0 }, 'No students matched the batch shift criteria.');
      }

      let shiftedCount = 0;

      for (const student of students) {
        // Enforce gender integrity
        if (student.gender === 'MALE' && girlsHostels.includes(toHostel)) continue;
        if (student.gender === 'FEMALE' && boysHostels.includes(toHostel)) continue;

        const currentHostel = student.preferredHostel;
        const studentYear = student.yearOfStudy || 1;
        const totalPaid = student.totalFeePaid || 0;

        const feeDiff = calculateFeeDifference(studentYear, currentHostel, toHostel, totalPaid);

        // De-allocate old room if active
        const activeApp = student.applications[0];
        if (activeApp && activeApp.allocation) {
          const bedId = activeApp.allocation.bedId;
          await prisma.allocation.delete({ where: { id: activeApp.allocation.id } });
          await prisma.bed.update({
            where: { id: bedId },
            data: { status: 'AVAILABLE' },
          });
        }

        // Update student profile
        await prisma.studentProfile.update({
          where: { id: student.id },
          data: {
            preferredHostel: toHostel,
            remainingFeeDue: feeDiff.remainingDue,
          },
        });

        // Update application
        if (activeApp) {
          const newStatus = feeDiff.remainingDue > 0 ? 'FEE_PENDING' : 'ROOM_SELECTION';
          await prisma.application.update({
            where: { id: activeApp.id },
            data: {
              status: newStatus,
              isHostelChanged: true,
            },
          });
        }

        // Notify Student
        const feeMsg = feeDiff.remainingDue > 0
          ? ` Note: A fee difference of ₹${feeDiff.remainingDue.toLocaleString('en-IN')} is due. Please submit your fee receipt to select a room.`
          : ` You may now select your room in ${toHostel}.`;

        await NotificationService.sendNotification(
          student.userId,
          'Batch Hostel Reassignment',
          `Your hostel residence has been updated to ${toHostel} under institutional batch shifting.${feeMsg}`,
          'HOSTEL_CHANGED'
        );

        shiftedCount++;
      }

      // Log Batch Audit
      await logAudit(
        req.user!.userId,
        'ADMIN_BATCH_HOSTEL_SHIFT',
        'StudentProfile',
        `Admin performed batch hostel shift for ${shiftedCount} students to ${toHostel}. Filter criteria: ${JSON.stringify({ yearOfStudy, gender, fromHostel, department })}. Reason: ${reason || 'Institutional Batch Shifting'}`
      );

      return ApiResponse.success(
        res,
        {
          shiftedCount,
          targetHostel: toHostel,
        },
        `Successfully batch shifted ${shiftedCount} students to ${toHostel}`
      );
    } catch (err) {
      console.error('[StudentController.adminBatchShiftHostels] Error:', err);
      return ApiResponse.error(res, 'Failed to perform batch hostel shift', 500, err);
    }
  }
}
