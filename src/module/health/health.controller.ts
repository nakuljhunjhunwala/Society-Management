import { RedisClient } from '@utils/redis.util.js';
import os from 'os';

/**
 * @controller
 * Controller responsible for providing health status of the application.
 */
export class HealthController {

  private redisClient: RedisClient;

  constructor() {
    // Initialize the Redis client
    this.redisClient = RedisClient.getInstance();
  }

  /**
   * @method
   * Retrieves the current health status of the application.
   * 
   * @returns {Object} An object containing various health metrics.
   */
  getHealth(): object {
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

  /**
   * @method
   * Retrieves the health status of the Redis server.
   * 
   * @returns {Object} An object containing the health status of the Redis server.
   */
  async getRedisHealth(): Promise<object> {
    const healthStatus = await this.redisClient.healthCheck();
    return {
      status: healthStatus ? 'OK' : 'DOWN',
      timestamp: Date.now(),
      message: healthStatus ? 'Redis server is up and running' : 'Redis server is down',
    }
  }
}
