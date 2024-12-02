import { createClient, RedisClientType, RedisClientOptions } from 'redis';

export interface RedisOptions {
    password: string;
    socket: {
        host: string;
        port: number;
        reconnectStrategy?: (retries: number) => number | Error;
    };
}

export class RedisClient {
    static instance: RedisClient;
    private client: RedisClientType | null = null;

    private constructor(private options: RedisOptions) {
        if (!options?.socket?.reconnectStrategy) {
            options.socket.reconnectStrategy = this.defaultReconnectStrategy;
        }
        this.client = createClient({
            password: this.options.password,
            socket: this.options.socket,
        });
        this.attachListeners();
    }

    async healthCheck(): Promise<boolean> {
        const redisHealth = await this.client?.ping();
        if (redisHealth === 'PONG') {
            return true;
        } else {
            return false;
        }
    }

    static async getInstance(options?: RedisOptions): Promise<RedisClient> {
        if (!RedisClient.instance) {
            if (!options) {
                throw {
                    message: 'Redis options are required to create a Redis client instance',
                }
            }
            RedisClient.instance = new RedisClient(options);
            await RedisClient.instance.connect();
        }
        return RedisClient.instance;
    }

    private async connect(): Promise<void> {
        if (!this.client) return;

        try {
            await this.client.connect();
            logger.info('Connected to Redis');
        } catch (err) {
            logger.error('Error connecting to Redis:', err);
            process.exit(1); // Exit the process if Redis connection fails
        }
    }

    private defaultReconnectStrategy(retries: number): number | Error {
        if (retries > 5) {
            process.exit(1); // Exit the process if Redis connection fails
            return new Error('Redis retry limit exceeded');
        }
        return Math.min(retries * 100, 3000); // Exponential backoff
    }

    async get(key: string): Promise<string | null> {
        if (!this.client) throw new Error('Redis client is not connected');
        try {
            return await this.client.get(key);
        } catch (err) {
            console.error(`Error getting key "${key}" from Redis:`, err);
            return null;
        }
    }

    async set(key: string, value: string, seconds: number = 86400): Promise<void> {
        if (!this.client) throw new Error('Redis client is not connected');
        try {
            await this.client.setEx(key, seconds, value);
        } catch (err) {
            console.error(`Error setting key "${key}" in Redis:`, err);
        }
    }

    async del(key: string): Promise<void> {
        if (!this.client) throw new Error('Redis client is not connected');
        try {
            await this.client.del(key);
        } catch (err) {
            console.error(`Error deleting key "${key}" from Redis:`, err);
        }
    }

    async disconnect(): Promise<void> {
        if (!this.client) return;
        try {
            await this.client.disconnect();
            logger.info('Disconnected from Redis');
        } catch (err) {
            logger.error('Error disconnecting from Redis:', err);
            throw err;
        }
    }

    private closeConnection(): void {
        try {
            if (this.client) {
                this.client.disconnect();
            }
        } catch (err) {
            console.error('Error closing Redis connection:', err);
        }
    }

    private attachListeners(): void {
        this.client?.on('error', (err: Error) => console.error('Redis Client Error:', err));
        process.on('exit', () => {
            this.closeConnection();
            process.exit(1);
        });
        process.on('SIGINT', () => {
            this.closeConnection();
            process.exit(1);
        });
        process.on('SIGTERM', () => {
            this.closeConnection();
            process.exit(1);
        });
        process.on('uncaughtException', () => {
            this.closeConnection();
            process.exit(1);
        });
    }
}


// Usage example
// const redisOptions = {
//   password: 'example-password',
//   socket: {
//     host: 'redis-16034.c273.us-east-1-2.ec2.redns.redis-cloud.com',
//     port: 16034,
//   },
// };
// const redisClient = RedisClient.getInstance(redisOptions);
