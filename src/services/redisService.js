const { createClient } = require('redis');
const config = require('../config');
const logger = require('../config/logger');

class RedisService {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.defaultTTL = config.redis.ttl || 3600; // 1 hour default TTL
    this.initialize();
  }

  async initialize() {
    try {
      // Create Redis client
      this.client = createClient({
        url: `redis://${config.redis.password ? `:${config.redis.password}@` : ''}${config.redis.host}:${config.redis.port}`,
      });

      // Set up event handlers
      this.client.on('error', (err) => {
        logger.error(`Redis Error: ${err}`);
        this.isConnected = false;
      });

      this.client.on('connect', () => {
        logger.info('Redis client connected');
        this.isConnected = true;
      });

      this.client.on('reconnecting', () => {
        logger.info('Redis client reconnecting');
      });

      this.client.on('end', () => {
        logger.info('Redis client connection ended');
        this.isConnected = false;
      });

      // Connect to Redis
      await this.client.connect();
    } catch (error) {
      logger.error(`Redis initialization error: ${error.message}`);
      this.isConnected = false;
    }
  }

  /**
   * Get a value from cache
   * @param {string} key - Cache key
   * @returns {Promise<any>} - The cached value or null if not found
   */
  async get(key) {
    try {
      if (!this.isConnected) {
        logger.warn('Redis not connected, skipping cache get');
        return null;
      }

      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error(`Redis get error for key ${key}: ${error.message}`);
      return null;
    }
  }

  /**
   * Set a value in cache
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   * @param {number} ttl - Time to live in seconds (optional)
   * @returns {Promise<boolean>} - Success status
   */
  async set(key, value, ttl = this.defaultTTL) {
    try {
      if (!this.isConnected) {
        logger.warn('Redis not connected, skipping cache set');
        return false;
      }

      // Store the value as JSON
      await this.client.set(key, JSON.stringify(value), { EX: ttl });
      return true;
    } catch (error) {
      logger.error(`Redis set error for key ${key}: ${error.message}`);
      return false;
    }
  }

  /**
   * Delete a value from cache
   * @param {string} key - Cache key
   * @returns {Promise<boolean>} - Success status
   */
  async del(key) {
    try {
      if (!this.isConnected) {
        logger.warn('Redis not connected, skipping cache delete');
        return false;
      }

      await this.client.del(key);
      return true;
    } catch (error) {
      logger.error(`Redis delete error for key ${key}: ${error.message}`);
      return false;
    }
  }

  /**
   * Flush all cache
   * @returns {Promise<boolean>} - Success status
   */
  async flushAll() {
    try {
      if (!this.isConnected) {
        logger.warn('Redis not connected, skipping flush');
        return false;
      }

      await this.client.flushAll();
      return true;
    } catch (error) {
      logger.error(`Redis flush error: ${error.message}`);
      return false;
    }
  }
}

// Create and export a singleton instance
module.exports = new RedisService(); 