import '@config/dotenv.config.js';
import { connectDB } from '@config/db.config.js';
import { port } from '@constants/env.constants.js';
import createRedisClient from '@config/redis.config.js';
import { logger } from './logger/logger.js';
import { seedPermissions } from '@scripts/seedPermission.js';

logger.info('Logger is working');

const PORT = port || 3000;

// Start the server and connect to the database
const startServer = async () => {
  try {
    await Promise.all([
      connectDB(),
      createRedisClient(),
    ]);
    const app = (await import('./app.js')).default;
    app.listen(PORT, () => {
      logger.info(`Server is running on http://localhost:${PORT}`);
      try {
        seedPermissions();
      } catch (error) {
        if (error instanceof Error) {
          logger.error(`Error while seeding permissions: ${error.message}`);
        } else {
          logger.error('Unknown error while seeding permissions', error);
        }
      }
    });
  } catch (error: any) {
    logger.error(`Error: ${error.message}`);
    console.error(error);
    process.exit(1); // Exit the process if the connection fails
  }
};

startServer();
