import { Router } from 'express';
import { StudentController } from '../controllers/studentController';
import { authenticateToken, requireRole } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticateToken);

router.get('/me/profile', requireRole(['STUDENT']), StudentController.getProfile);
router.put('/me/profile', requireRole(['STUDENT']), StudentController.updateProfile);
router.get('/me/application', requireRole(['STUDENT']), StudentController.getCurrentApplication);

// Admin / HOD access
router.get('/', requireRole(['ADMIN', 'HOD']), StudentController.listStudents);
router.get('/:id', requireRole(['ADMIN', 'HOD']), StudentController.getProfile);

export default router;
