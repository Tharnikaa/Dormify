import { Router } from 'express';
import { FeeController } from '../controllers/feeController';
import { authenticateToken, requireRole } from '../middleware/authMiddleware';
import { uploadReceipt } from '../middleware/uploadMiddleware';

const router = Router();

router.use(authenticateToken);

router.post('/upload', requireRole(['STUDENT']), uploadReceipt.single('receipt'), FeeController.uploadReceipt);
router.get('/pending', requireRole(['ADMIN', 'WARDEN']), FeeController.getPendingReceipts);
router.post('/:id/verify', requireRole(['ADMIN', 'WARDEN']), FeeController.verifyReceipt);

export default router;
