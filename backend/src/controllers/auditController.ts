import { Request, Response } from 'express';
import { prisma } from '../config/db';
import { ApiResponse } from '../utils/apiResponse';

export class AuditController {
  static async getLogs(req: Request, res: Response) {
    try {
      const { action, page = '1', limit = '20' } = req.query;
      const skip = (parseInt(page as string, 10) - 1) * parseInt(limit as string, 10);
      const take = parseInt(limit as string, 10);

      const where: any = {};
      if (action) {
        where.action = action as string;
      }

      const total = await prisma.auditLog.count({ where });

      const logs = await prisma.auditLog.findMany({
        where,
        include: {
          actor: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
        orderBy: { timestamp: 'desc' },
        skip,
        take,
      });

      return ApiResponse.success(res, logs, 'Audit logs retrieved', 200, {
        total,
        page: parseInt(page as string, 10),
        limit: take,
        totalPages: Math.ceil(total / take),
      });
    } catch (err) {
      return ApiResponse.error(res, 'Failed to fetch audit logs', 500, err);
    }
  }
}
