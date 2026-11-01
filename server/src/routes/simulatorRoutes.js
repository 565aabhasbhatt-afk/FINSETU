import { Router } from 'express';
import {
  getScenarios,
  handleStartSimulation,
  handlePauseSimulation,
  handleResumeSimulation,
  handleStopSimulation,
  handleResetSimulation,
  handleGetCurrent,
  handleGetAnalytics
} from '../controllers/simulatorController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/scenarios', authenticate, getScenarios);
router.get('/current', authenticate, handleGetCurrent);
router.get('/analytics', authenticate, handleGetAnalytics);
router.post('/start', authenticate, handleStartSimulation);
router.post('/pause', authenticate, handlePauseSimulation);
router.post('/resume', authenticate, handleResumeSimulation);
router.post('/stop', authenticate, handleStopSimulation);
router.post('/reset', authenticate, handleResetSimulation);

export default router;
