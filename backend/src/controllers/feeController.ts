import { Request, Response } from 'express';
import { prisma } from '../config/db';
import { ApiResponse } from '../utils/apiResponse';
import { supabaseStorageProvider as storageProvider } from '../services/storage/supabaseStorageProvider';
import { logAudit } from '../utils/auditLogger';
import { NotificationService } from '../services/notificationService';

export class FeeController {
  static async uploadReceipt(req: Request, res: Response) {
    try {
      const studentId = req.user?.studentId;
      const file = req.file;
      const { receiptNumber, amount } = req.body;

      if (!studentId) {
        return ApiResponse.error(res, 'Student ID not found in session', 400);
      }

      if (!file) {
        return ApiResponse.error(res, 'Receipt file document is required', 400);
      }

      if (!receiptNumber || !amount) {
        return ApiResponse.error(res, 'Receipt number and amount are required', 400);
      }

      const activeAcademicYear = await prisma.academicYear.findFirst({
        where: { isActive: true },
      });

      if (!activeAcademicYear) {
        return ApiResponse.error(res, 'No active academic year found', 400);
      }

      let application = await prisma.application.findUnique({
        where: {
          studentId_academicYearId: {
            studentId,
            academicYearId: activeAcademicYear.id,
          },
        },
      });

      if (!application) {
        application = await prisma.application.create({
          data: {
            studentId,
            academicYearId: activeAcademicYear.id,
          },
        });
      }

      const stored = await storageProvider.saveFile(file);

      const receipt = await prisma.feeReceipt.upsert({
        where: { applicationId: application.id },
        update: {
          receiptNumber,
          amount: parseFloat(amount),
          fileUrl: stored.fileUrl,
          originalFilename: stored.originalFilename,
          mimeType: stored.mimeType,
          fileSize: stored.fileSize,
          submissionDate: new Date(),
          status: 'PENDING',
          rejectionReason: null,
        },
        create: {
          applicationId: application.id,
          receiptNumber,
          amount: parseFloat(amount),
          fileUrl: stored.fileUrl,
          originalFilename: stored.originalFilename,
          mimeType: stored.mimeType,
          fileSize: stored.fileSize,
          status: 'PENDING',
        },
      });

      await prisma.application.update({
        where: { id: application.id },
        data: { status: 'FEE_SUBMITTED' },
      });

      await logAudit(
        req.user!.userId,
        'FEE_SUBMITTED',
        'FeeReceipt',
        `Student uploaded fee receipt ${receiptNumber} (₹${amount}).`,
        receipt.id
      );

      await NotificationService.sendNotification(
        req.user!.userId,
        'Fee Receipt Submitted',
        `Your hostel fee receipt (${receiptNumber}) has been submitted and is currently pending verification by administration.`,
        'FEE_SUBMITTED'
      );

      return ApiResponse.success(res, receipt, 'Fee receipt submitted successfully');
    } catch (err) {
      console.error('[FeeController.uploadReceipt] Error:', err);
      return ApiResponse.error(res, 'Failed to upload fee receipt', 500, err);
    }
  }

  static async getPendingReceipts(req: Request, res: Response) {
    try {
      const receipts = await prisma.feeReceipt.findMany({
        where: { status: 'PENDING' },
        include: {
          application: {
            include: {
              student: {
                include: {
                  user: true,
                },
              },
              academicYear: true,
            },
          },
        },
        orderBy: { submissionDate: 'asc' },
      });

      return ApiResponse.success(res, receipts);
    } catch (err) {
      return ApiResponse.error(res, 'Failed to fetch pending fee receipts', 500, err);
    }
  }

  static async verifyReceipt(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status, rejectionReason } = req.body;
      const adminId = req.user?.userId;

      if (!['APPROVED', 'REJECTED'].includes(status)) {
        return ApiResponse.error(res, 'Invalid status. Must be APPROVED or REJECTED.', 400);
      }

      if (status === 'REJECTED' && (!rejectionReason || !rejectionReason.trim())) {
        return ApiResponse.error(res, 'Rejection reason is required when rejecting a receipt.', 400);
      }

      const receipt = await prisma.feeReceipt.findUnique({
        where: { id },
        include: {
          application: {
            include: {
              student: true,
            },
          },
        },
      });

      if (!receipt) {
        return ApiResponse.error(res, 'Fee receipt not found', 404);
      }

      const updatedFee = await prisma.feeReceipt.update({
        where: { id },
        data: {
          status,
          verificationDate: new Date(),
          reviewerAdminId: adminId,
          rejectionReason: status === 'REJECTED' ? rejectionReason : null,
        },
      });

      const nextAppStatus = status === 'APPROVED' ? 'FEE_VERIFIED' : 'FEE_SUBMITTED';
      await prisma.application.update({
        where: { id: receipt.applicationId },
        data: { status: nextAppStatus },
      });

      if (status === 'APPROVED') {
        const student = await prisma.studentProfile.findUnique({
          where: { id: receipt.application.studentId },
        });
        if (student) {
          await prisma.studentProfile.update({
            where: { id: student.id },
            data: {
              totalFeePaid: (student.totalFeePaid || 0) + receipt.amount,
              remainingFeeDue: 0,
            },
          });
        }
      }

      const actionName = status === 'APPROVED' ? 'FEE_APPROVED' : 'FEE_REJECTED';
      const desc = status === 'APPROVED'
        ? `Approved fee receipt ${receipt.receiptNumber} for student roll ${receipt.application.student.rollNumber}`
        : `Rejected fee receipt ${receipt.receiptNumber} (Reason: ${rejectionReason})`;

      await logAudit(adminId!, actionName, 'FeeReceipt', desc, receipt.id);

      const notifTitle = status === 'APPROVED' ? 'Fee Receipt Approved!' : 'Fee Receipt Rejected';
      const notifMessage = status === 'APPROVED'
        ? `Your hostel fee receipt (${receipt.receiptNumber}) has been verified. You can now proceed to Room & Bed Selection!`
        : `Your fee receipt (${receipt.receiptNumber}) was rejected: "${rejectionReason}". Please re-upload a valid receipt.`;

      await NotificationService.sendNotification(
        receipt.application.student.userId,
        notifTitle,
        notifMessage,
        actionName
      );

      return ApiResponse.success(res, updatedFee, `Fee receipt ${status.toLowerCase()} successfully`);
    } catch (err) {
      return ApiResponse.error(res, 'Failed to verify receipt', 500, err);
    }
  }
}
