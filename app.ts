// /src/app.ts
import 'reflect-metadata';
import express from 'express';
import healthRoute from '@module/health/health.route.js';
import userRoute from '@module/user/user.route.js';
import societyRoute from '@module/society/society.route.js';
import authRoute from '@module/authentication/auth.route.js';
import inviteRoute from '@module/invite/invite.route.js';
import maintenanceRoute from '@module/maintenance/maintenance.route.js';
import approvalRoute from '@module/approval/approval.route.js';
import 'newrelic';
import deviceTokenRoute from '@module/deviceToken/deviceToken.route.js';
import settingsRoute from '@module/settings/settings.route.js';
import apiWatcher from './middleware/api-watcher.middleware.js';
import { generateDeviceIdMiddleware } from './middleware/deviceId-generator.middleware.js';
import swaggerUi from 'swagger-ui-express';
import cors from 'cors';
import { swaggerDocs, swaggerUiOptions } from '@config/swagger.config.js';
import { NewRelicTracker } from '@middleware/newrelic-tracker.js';

const app = express();

// Serve Swagger API documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs, swaggerUiOptions));


// Middleware
app.use(cors());
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(apiWatcher);
const deviceIDGenerator = generateDeviceIdMiddleware();
app.use(deviceIDGenerator);

NewRelicTracker.initialize(app, {
  excludePaths: ['/api/health', '/public'],
  sensitiveKeys: ['password', 'token', 'secret', 'ssn', 'cardNumber'],
  samplingRate: 1.0, // Track all requests in production
  enableBodyTracking: true,
  customMetricPrefix: 'MyApp/',
  errorStatuses: [400, 401, 403, 404, 429, 500, 502, 503, 504],
  enablePerformanceMetrics: true,
  enableBusinessMetrics: true,
  businessMetricKeys: ['userId', 'societyId', 'userRole'],
  apdexTarget: 500, // 500ms target for response time
  slowThreshold: 2000,
  verySlowThreshold: 5000
});

// Sample route
app.get('/', (req, res) => {
  logger.info('Root route accessed');
  res.send('Welcome to the Express TypeScript App!');
});

app.use('/api', healthRoute);
app.use('/api/auth', authRoute);
app.use('/api/user', userRoute);
app.use('/api/society', societyRoute);
app.use('/api/invite', inviteRoute);
app.use('/api/maintenance', maintenanceRoute);
app.use('/api/approval', approvalRoute);
app.use('/api/device-token', deviceTokenRoute);
app.use('/api/settings', settingsRoute);
app.use('/api/*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

export default app;
