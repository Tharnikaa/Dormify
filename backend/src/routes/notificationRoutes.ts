import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/authMiddleware';
import { NotificationService } from '../services/notificationService';
import { ApiResponse } from '../utils/apiResponse';

const router = Router();

router.use(authenticateToken);

router.get('/', async (req: Request, res: Response) => {
  try {
    const notifications = await NotificationService.getUserNotifications(req.user!.userId);
    return ApiResponse.success(res, notifications);
  } catch (err) {
    return ApiResponse.error(res, 'Failed to fetch notifications', 500, err);
  }
});

router.patch('/:id/read', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await NotificationService.markAsRead(id, req.user!.userId);
    return ApiResponse.success(res, null, 'Notification marked as read');
  } catch (err) {
    return ApiResponse.error(res, 'Failed to update notification status', 500, err);
  }
});

export default router;
