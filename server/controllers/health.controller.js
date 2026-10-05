import { getSystemHealth } from '../services/health.service.js';
import { ApiResponse } from '../utils/apiResponse.js';

/**
 * Health check controller
 * @route GET /api/v1/health
 */
export const checkHealth = async (req, res, next) => {
  try {
    const healthData = await getSystemHealth();
    const isHealthy = healthData.database.connected;
    const statusCode = isHealthy ? 200 : 503;
    const message = isHealthy
      ? 'System and database operational'
      : 'Database degraded or disconnected';

    return ApiResponse.success(res, healthData, message, statusCode);
  } catch (error) {
    next(error);
  }
};
