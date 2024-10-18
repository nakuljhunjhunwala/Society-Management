import { Request, Response, Router } from 'express';
import { HealthController } from './health.controller.js';

const router = Router();

const healthController = new HealthController();

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health Check
 *     description: Returns the health status of the application.
 *     parameters:
 *       -$ref: '#/components/parameters/OptionalDeviceTokenHeader'
 *     responses:
 *       200:
 *         description: Health status of the application
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: OK
 *                 uptime:
 *                   type: number
 *                   example: 14.206265875
 *                 uptimeUnit:
 *                   type: string
 *                   example: seconds
 *                 timestamp:
 *                   type: number
 *                   example: 1729243875964
 *                 memoryUsage:
 *                   type: object
 *                   properties:
 *                     rss:
 *                       type: number
 *                       example: 98500608
 *                     heapTotal:
 *                       type: number
 *                       example: 36274176
 *                     heapUsed:
 *                       type: number
 *                       example: 33201704
 *                     external:
 *                       type: number
 *                       example: 22051680
 *                     arrayBuffers:
 *                       type: number
 *                       example: 18343961
 *                 platform:
 *                   type: string
 *                   example: darwin
 *                 release:
 *                   type: string
 *                   example: 23.5.0
 *                 cpuCount:
 *                   type: number
 *                   example: 8
 *     tags:
 *       - Health
 *     security:
 *       - bearerAuth: []
 */
router.get('/health', (_req: Request, res: Response) => {
  const healthStatus = healthController.getHealth();
  res.status(200).json(healthStatus);
});

export default router;
