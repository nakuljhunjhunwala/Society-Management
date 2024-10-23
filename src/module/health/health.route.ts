import { Request, Response, Router } from 'express';
import { HealthController } from './health.controller.js';

const router = Router();

const healthController = new HealthController();

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Get my pending maintenance
 *     description: Get my pending maintenance for the society
 *     tags:
 *       - Health
 *     responses:
 *      200:
 *        description: Health check status
 */
router.get('/health', (req: Request, res: Response) => {
  const healthStatus = healthController.getHealth();
  res.status(200).json(healthStatus);
});

/**
 * @swagger
 * /redis-health:
 *   get:
 *     summary: Get my pending maintenance
 *     description: Get my pending maintenance for the society
 *     tags:
 *       - Health
 *     responses:
 *       200:
 *         description: Health check status
 *       500:
 *         description: Internal server error
 */
router.get('/redis-health', async (req: Request, res: Response) => {
  const healthStatus = await healthController.getRedisHealth();
  res.status(200).json(healthStatus);
});

export default router;
