import dotenv from 'dotenv';
import Redis from 'ioredis';

dotenv.config();

const redisOptions = {
  enableOfflineQueue: false,
  maxRetriesPerRequest: 3,
  retryStrategy: (times: number) => Math.min(times * 200, 2000),
  reconnectOnError: () => true
};

export const redis = process.env.REDIS_URL
  ? new Redis(process.env.REDIS_URL, redisOptions)
  : new Redis({
      host: process.env.REDIS_HOST || '127.0.0.1',
      port: Number(process.env.REDIS_PORT || 6379),
      password: process.env.REDIS_PASSWORD,
      db: Number(process.env.REDIS_DB || 0),
      ...redisOptions
    });

redis.on('connect', () => {
  if (process.env.NODE_ENV !== 'test') {
    console.log('Redis connecting...');
  }
});

redis.on('ready', () => {
  if (process.env.NODE_ENV !== 'test') {
    console.log('Redis ready');
  }
});

redis.on('error', (error) => {
  if (process.env.NODE_ENV !== 'test') {
    console.error('Redis error', error.message);
  }
});

redis.on('close', () => {
  if (process.env.NODE_ENV !== 'test') {
    console.warn('Redis connection closed');
  }
});
