import { Router } from 'express';
import { StudentController } from '../controllers/studentController';
import { authenticateToken, requireRole } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticateToken);

router.get('/me/profile', requireRole(['STUDENT']), StudentController.getProfile);
router.put('/me/profile', requireRole(['STUDENT']), StudentController.updateProfile);
router.get('/me/application', requireRole(['STUDENT']), StudentController.getCurrentApplication);

// Admin / Warden access
router.get('/', requireRole(['ADMIN', 'WARDEN']), StudentController.listStudents);
router.post('/batch-shift', requireRole(['ADMIN', 'WARDEN']), StudentController.adminBatchShiftHostels);
router.get('/:id', requireRole(['ADMIN', 'WARDEN']), StudentController.getProfile);
router.get('/:id/details', requireRole(['ADMIN', 'WARDEN']), StudentController.getStudentById);
router.put('/:id/change-hostel', requireRole(['ADMIN', 'WARDEN']), StudentController.adminChangeHostel);

export default router;
