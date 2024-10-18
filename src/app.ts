// /src/app.ts
import 'reflect-metadata';
import express from 'express';
import { logger } from './logger/logger.js';
import healthRoute from '@module/health/health.route.js';
import userRoute from '@module/user/user.route.js';
import societyRoute from '@module/society/society.route.js';
import authRoute from '@module/authentication/auth.route.js';
import apiWatcher from './middleware/api-watcher.middleware.js';
import { generateDeviceIdMiddleware } from './middleware/deviceId-generator.middleware.js';
import swaggerUi from 'swagger-ui-express';
import cors from 'cors';
import { swaggerDocs, swaggerUiOptions } from '@config/swagger.config.js';


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

// Sample route
app.get('/', (req, res) => {
  logger.info('Root route accessed');
  res.send('Welcome to the Express TypeScript App!');
});
// Register health check route
app.use('/api', healthRoute);
app.use('/api/auth', authRoute);
app.use('/api/user', userRoute);
app.use('/api/society', societyRoute);

export default app;
