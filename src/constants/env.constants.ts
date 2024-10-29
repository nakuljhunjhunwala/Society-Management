import { getEnv } from '@config/dotenv.config.js';

export const port = getEnv('PORT');
export const dbHost = getEnv('DB_HOST');
export const dbName = getEnv('DB_NAME');
export const dbUser = getEnv('DB_USER');
export const dbPassword = getEnv('DB_PASSWORD');
export const jwtAccessSecret = getEnv('JWT_ACCESS_SECRET');
export const jwtRefreshSecret = getEnv('JWT_REFRESH_SECRET');
export const accessTokenExpiry = getEnv('ACCESS_TOKEN_EXPIRY');
export const refreshTokenExpiry = getEnv('REFRESH_TOKEN_EXPIRY');
export const debugInConsole = getEnv('DEBUG_CONSOLE');
export const logToFile = getEnv('LOG_TO_FILE');
export const baseUrl = getEnv('BASE_URL');
export const redisHost = getEnv('REDIS_HOST');
export const redisPort = getEnv('REDIS_PORT');
export const redisPassword = getEnv('REDIS_PASSWORD');
export const firebaseType = getEnv('FIREBASE_TYPE');
export const firebaseProjectId = getEnv('FIREBASE_PROJECT_ID');
export const firebasePrivateKeyId = getEnv('FIREBASE_PRIVATE_KEY_ID');
export const firebasePrivateKey = getEnv('FIREBASE_PRIVATE_KEY');
export const firebaseClientEmail = getEnv('FIREBASE_CLIENT_EMAIL');
export const firebaseClientId = getEnv('FIREBASE_CLIENT_ID');
export const firebaseClientCertUrl = getEnv('FIREBASE_CLIENT_X509_CERT_URL');
export const sendgridApiKey = getEnv('SENDGRID_API_KEY');

