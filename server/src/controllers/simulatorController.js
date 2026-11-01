import {
  SCENARIOS,
  startSimulation,
  pauseSimulation,
  resumeSimulation,
  stopSimulation,
  resetSimulation,
  getCurrentSimulation,
  getSimulationAnalytics
} from '../services/simulatorService.js';

export const getScenarios = (req, res) => {
  return res.status(200).json({
    success: true,
    scenarios: Object.values(SCENARIOS)
  });
};

export const handleStartSimulation = async (req, res) => {
  try {
    const { scenarioKey, targetAccount, targetSystem } = req.body;
    const simulation = await startSimulation({ scenarioKey, targetAccount, targetSystem });
    return res.status(200).json({
      success: true,
      message: 'Simulation initiated successfully.',
      simulation
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to start simulation',
      error: error.message
    });
  }
};

export const handlePauseSimulation = (req, res) => {
  const simulation = pauseSimulation();
  return res.status(200).json({
    success: true,
    message: 'Simulation paused.',
    simulation
  });
};

export const handleResumeSimulation = (req, res) => {
  const simulation = resumeSimulation();
  return res.status(200).json({
    success: true,
    message: 'Simulation resumed.',
    simulation
  });
};

export const handleStopSimulation = (req, res) => {
  const simulation = stopSimulation();
  return res.status(200).json({
    success: true,
    message: 'Simulation stopped.',
    simulation
  });
};

export const handleResetSimulation = (req, res) => {
  const result = resetSimulation();
  return res.status(200).json(result);
};

export const handleGetCurrent = (req, res) => {
  const simulation = getCurrentSimulation();
  return res.status(200).json({
    success: true,
    simulation
  });
};

export const handleGetAnalytics = async (req, res) => {
  try {
    const analytics = await getSimulationAnalytics();
    return res.status(200).json({
      success: true,
      data: analytics
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve simulation analytics',
      error: error.message
    });
  }
};
