import { Router } from 'express';
import { getLoginHistory } from '../controllers/loginHistoryController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', authenticate, getLoginHistory);

export default router;
