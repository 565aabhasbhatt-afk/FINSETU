import { prisma, isDbConnected, store } from '../services/db.js';

export const getSecurityIncidents = async (req, res) => {
  try {
    let incidents = [];
    if (isDbConnected) {
      incidents = await prisma.securityIncident.findMany({
        orderBy: { createdAt: 'desc' }
      });
    } else {
      incidents = store.securityIncidents;
    }

    return res.status(200).json({
      success: true,
      data: incidents
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve security incidents',
      error: error.message
    });
  }
};
