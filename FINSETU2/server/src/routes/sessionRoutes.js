import { Router } from 'express';
import { revokeSession, revokeAllSessions } from '../controllers/sessionController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.delete('/:id/revoke', authenticate, revokeSession);
router.post('/revoke-all', authenticate, revokeAllSessions);

export default router;
