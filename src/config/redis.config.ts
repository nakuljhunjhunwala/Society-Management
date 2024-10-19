import { redisHost, redisPassword, redisPort } from "@constants/env.constants.js";
import { RedisClient, RedisOptions } from "@utils/redis.util.js";

async function createRedisClient(): Promise<RedisClient> {
    const options: RedisOptions = {
        password: redisPassword!,
        socket: {
            host: redisHost!,
            port: parseInt(redisPort!),
        },
    }

    return await RedisClient.getInstance(options);
}

export default createRedisClient;