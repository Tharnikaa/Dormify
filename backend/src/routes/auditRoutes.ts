import { Router } from 'express';
import { AuditController } from '../controllers/auditController';
import { authenticateToken, requireRole } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticateToken);
router.use(requireRole(['ADMIN', 'HOD']));

router.get('/', AuditController.getLogs);

export default router;
