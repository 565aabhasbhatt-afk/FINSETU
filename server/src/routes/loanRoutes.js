import { Router } from 'express';
import { getLoanOffers, applyForLoan, getMyApplications } from '../controllers/loanController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/offers', authenticate, getLoanOffers);
router.post('/apply', authenticate, applyForLoan);
router.get('/my-applications', authenticate, getMyApplications);

export default router;
