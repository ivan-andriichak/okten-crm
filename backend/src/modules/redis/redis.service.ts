import { Inject, Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';

import { REDIS_CLIENT } from './redis.constants';

@Injectable()
export class RedisService {
  constructor(
    @Inject(REDIS_CLIENT)
    private readonly redisClient: Redis,
  ) {
    this.redisClient = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: Number(process.env.REDIS_PORT) || 6379,
      retryStrategy: (times) => Math.min(times * 100, 3000), // Retry logic
    });

    this.redisClient.on('connect', () => {
      console.log('Connected to Redis');
    });

    this.redisClient.on('error', (err) => {
      console.error('Redis connection error:', err);
    });
  }

  /**
   * Add member to hash set.
   */
  public async addOneToSet(hash: string, value: string): Promise<number> {
    return await this.redisClient.sadd(hash, value);
  }

  /**
   * Remove one member from hash set.
   */
  public async remOneFromSet(key: string, setMember: string): Promise<number> {
    return await this.redisClient.srem(key, setMember);
  }

  /**
   * Delete all records by key from Redis.
   */
  public async deleteByKey(key: string): Promise<number> {
    return await this.redisClient.del(key);
  }

  /**
   * Get all the members in a set.
   */
  public async sMembers(key: string): Promise<string[]> {
    return await this.redisClient.smembers(key);
  }

  /**
   * Sets a timeout on a key.
   * After the timeout, the key will be automatically deleted.
   */
  public async expire(key: string, time: number): Promise<number> {
    return await this.redisClient.expire(key, time);
  }

  public async keys(pattern: string): Promise<string[]> {
    return await this.redisClient.keys(pattern);
  }
}
