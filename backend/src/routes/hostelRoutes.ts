import { Router } from 'express';
import { HostelController } from '../controllers/hostelController';
import { authenticateToken, requireRole } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticateToken);

router.get('/', HostelController.getHostels);
router.get('/blocks', HostelController.getBlocks);
router.get('/floor-plan', HostelController.getFloorPlan);

router.post('/rooms', requireRole(['ADMIN', 'HOD']), HostelController.createRoom);
router.patch('/rooms/:roomId/status', requireRole(['ADMIN', 'HOD']), HostelController.updateRoomStatus);

export default router;
