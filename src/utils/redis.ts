import { createClient } from 'redis';

const url = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

export const redis = createClient({ url });

redis.on('error', (err) => {
    console.error('Redis Client Error', err);
});

export async function ensureRedis() {
    if (!redis.isOpen) {
        await redis.connect();
    }
    return redis;
}

export  function cacheGet(key: string){
  return null;
}

export  function cacheSet(key: string, value: any, ttlSeconds = 300) {
   
}
