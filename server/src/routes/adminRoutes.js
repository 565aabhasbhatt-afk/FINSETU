import { Router } from 'express';
import { getAdminMetrics, toggleUserLock } from '../controllers/adminController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = Router();

router.get('/metrics', authenticate, authorizeRoles('ADMIN', 'AUDITOR'), getAdminMetrics);
router.post('/users/:userId/lock', authenticate, authorizeRoles('ADMIN'), toggleUserLock);

export default router;
