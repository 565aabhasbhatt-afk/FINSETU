import { Router } from 'express';
import { getAccountOverview } from '../controllers/accountController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/overview', authenticate, getAccountOverview);

export default router;
