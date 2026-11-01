import { Router } from 'express';
import { sendMoney, getTransactions, setTransactionPin } from '../controllers/transactionController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/send', authenticate, sendMoney);
router.get('/', authenticate, getTransactions);
router.post('/set-pin', authenticate, setTransactionPin);

export default router;
