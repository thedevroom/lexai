import Redis from 'ioredis';

let redisClient: Redis | null = null;
let redisUnavailable = false;
let redisErrorLogged = false;

export function getRedis(): Redis | null {
  if (redisUnavailable) {
    return null;
  }

  if (redisClient) {
    return redisClient;
  }

  const url = process.env['REDIS_URL'];
  if (!url) {
    return null;
  }

  redisClient = new Redis(url, {
    maxRetriesPerRequest: 1,
    lazyConnect: true,
    enableOfflineQueue: false,
    retryStrategy: () => null,
    reconnectOnError: () => false,
  });

  redisClient.on('error', (error: Error) => {
    if (!redisErrorLogged) {
      redisErrorLogged = true;
      console.warn(
        '[redis] unavailable — using in-memory rate limit fallback:',
        error.message,
      );
    }
    redisUnavailable = true;
    const client = redisClient;
    redisClient = null;
    if (client) {
      client.disconnect();
    }
  });

  return redisClient;
}

export async function disconnectRedis(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
  }
}