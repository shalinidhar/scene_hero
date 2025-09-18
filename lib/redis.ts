// lib/redis.ts
import { createClient } from 'redis';

//let redisClient: ReturnType<typeof createClient>;

const redisClient = createClient()
let connected = false;

async function getRedisClient() {
  if (!connected) {
    await redisClient.connect();
    connected = true;
  }
  return redisClient;
}

export default getRedisClient;
