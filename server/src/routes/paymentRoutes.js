import { Router } from 'express';
import { createRazorpayOrder, verifyPaymentSignature } from '../controllers/paymentController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/create-order', authenticate, createRazorpayOrder);
router.post('/verify', authenticate, verifyPaymentSignature);

export default router;
