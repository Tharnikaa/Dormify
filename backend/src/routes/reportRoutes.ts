import { Router } from 'express';
import { ReportController } from '../controllers/reportController';
import { authenticateToken, requireRole } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticateToken);
router.use(requireRole(['ADMIN', 'HOD']));

router.get('/occupancy', ReportController.getOccupancyReport);
router.get('/departments', ReportController.getDepartmentDistribution);

export default router;
