import { Router } from 'express';
import { AdminController } from '../controllers/adminController';
import { authenticateToken, requireRole } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticateToken);
router.use(requireRole(['ADMIN', 'HOD']));

router.get('/dashboard-stats', AdminController.getDashboardStats);

export default router;
