import { Router, Request, Response, NextFunction } from 'express';
import { AllocationController } from '../controllers/allocationController';
import { authenticateToken, requireRole } from '../middleware/authMiddleware';

const router = Router();

// Allow letter HTML retrieval via query token or session token
router.get('/:id/letter-html', (req: Request, res: Response, next: NextFunction) => {
  if (req.headers['authorization'] || req.query.token) {
    return authenticateToken(req, res, next);
  }
  next();
}, AllocationController.getAllocationLetterHtml);

router.use(authenticateToken);

router.post('/select-bed', requireRole(['STUDENT']), AllocationController.selectBed);
router.post('/manual', requireRole(['ADMIN', 'HOD']), AllocationController.manualAllocate);
router.get('/my-allocation', requireRole(['STUDENT']), AllocationController.getMyAllocation);

export default router;
