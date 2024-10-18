import os from 'os';

/**
 * @controller
 * Controller responsible for providing health status of the application.
 */
export class HealthController {
  /**
   * @method
   * Retrieves the current health status of the application.
   * 
   * @returns {Object} An object containing various health metrics.
   */
  getHealth() {
    const healthStatus = {
      status: 'OK',
      uptime: process.uptime(),
      uptimeUnit: 'seconds',
      timestamp: Date.now(),
      memoryUsage: process.memoryUsage(),
      platform: os.platform(),
      release: os.release(),
      cpuCount: os.cpus().length,
    };

    return healthStatus;
  }
}
