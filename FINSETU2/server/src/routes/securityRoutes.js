import { Router } from 'express';
import { getSecurityIncidents } from '../controllers/securityController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/incidents', authenticate, getSecurityIncidents);

export default router;
