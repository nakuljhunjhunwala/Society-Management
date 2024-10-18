import * as dotenv from 'dotenv';
import * as path from 'path';

const getEnvFileName = (): string => {
  const env = process.env.NODE_ENV || 'dev'; // Default to 'dev'
  switch (env) {
    case 'prod':
      return '.env.prod';
    case 'stage':
      return '.env.stage';
    case 'dev':
    default:
      return '.env';
  }
};
if (process.env.NODE_ENV !== 'prod') {
  const fileName = getEnvFileName();
  const envConfig = dotenv.config({
    path: path.join(process.cwd(), '/', fileName),
  });

  if (envConfig.error) {
    console.error(`Failed to load .env file: ${envConfig.error}`);
  }
} else {
  dotenv.config();
}

export const getEnv = (key: string) => {
  return process.env[key]; // Prioritize system-level environment variables
};
