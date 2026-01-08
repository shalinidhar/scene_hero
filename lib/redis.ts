import { createClient } from 'redis';

//let redisClient: ReturnType<typeof createClient>;

const redisClient = createClient()
let connected = false;

redisClient.on('error', (err) => console.log('Redis Client Error', err));

async function getRedisClient() {
  if (!connected) {
    await redisClient.connect();
    connected = true;
  }
  return redisClient;
}

export default getRedisClient;
