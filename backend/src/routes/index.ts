import { Router } from 'express';
import authRoutes from './authRoutes';
import studentRoutes from './studentRoutes';
import feeRoutes from './feeRoutes';
import hostelRoutes from './hostelRoutes';
import allocationRoutes from './allocationRoutes';
import adminRoutes from './adminRoutes';
import reportRoutes from './reportRoutes';
import auditRoutes from './auditRoutes';
import notificationRoutes from './notificationRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/students', studentRoutes);
router.use('/fees', feeRoutes);
router.use('/hostels', hostelRoutes);
router.use('/allocations', allocationRoutes);
router.use('/admin', adminRoutes);
router.use('/reports', reportRoutes);
router.use('/audit-logs', auditRoutes);
router.use('/notifications', notificationRoutes);

export default router;
