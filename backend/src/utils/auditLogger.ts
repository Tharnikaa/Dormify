import { prisma } from '../config/db';

export async function logAudit(
  actorUserId: string,
  action: string,
  targetType: string,
  description: string,
  targetId?: string
) {
  try {
    const audit = await prisma.auditLog.create({
      data: {
        actorUserId,
        action,
        targetType,
        targetId,
        description,
      },
    });
    return audit;
  } catch (error) {
    console.error('[AuditLogger] Failed to write audit log:', error);
  }
}
