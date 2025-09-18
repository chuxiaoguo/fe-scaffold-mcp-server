import {
  ErrorHandler,
  ErrorCode,
  Result,
  ResultUtils,
} from "../core/error-handling-v2.js";

/**
 * 缓存条目
 */
export interface CacheEntry<T> {
  value: T;
  timestamp: number;
  ttl: number; // 生存时间（毫秒）
  hits: number; // 命中次数
}

/**
 * 缓存配置
 */
export interface CacheConfig {
  maxSize: number; // 最大缓存条目数
  defaultTtl: number; // 默认生存时间（毫秒）
  cleanupInterval: number; // 清理间隔（毫秒）
}

/**
 * 缓存服务
 */
export class CacheService {
  private cache = new Map<string, CacheEntry<any>>();
  private cleanupTimer?: ReturnType<typeof setInterval>;
  private config: CacheConfig;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      maxSize: config.maxSize || 1000,
      defaultTtl: config.defaultTtl || 5 * 60 * 1000, // 5分钟
      cleanupInterval: config.cleanupInterval || 60 * 1000, // 1分钟
    };

    this.startCleanupTimer();
  }

  /**
   * 获取缓存值
   */
  get<T>(key: string): Result<T | undefined> {
    return ErrorHandler.wrapSync(
      () => {
        const entry = this.cache.get(key);

        if (!entry) {
          return undefined;
        }

        // 检查是否过期
        if (this.isExpired(entry)) {
          this.cache.delete(key);
          return undefined;
        }

        // 增加命中次数
        entry.hits++;

        return entry.value as T;
      },
      ErrorCode.UNKNOWN_ERROR,
      { key }
    );
  }

  /**
   * 设置缓存值
   */
  set<T>(key: string, value: T, ttl?: number): Result<boolean> {
    return ErrorHandler.wrapSync(
      () => {
        // 检查缓存大小限制
        if (this.cache.size >= this.config.maxSize && !this.cache.has(key)) {
          this.evictLeastUsed();
        }

        const entry: CacheEntry<T> = {
          value,
          timestamp: Date.now(),
          ttl: ttl || this.config.defaultTtl,
          hits: 0,
        };

        this.cache.set(key, entry);
        return true;
      },
      ErrorCode.UNKNOWN_ERROR,
      { key }
    );
  }

  /**
   * 删除缓存值
   */
  delete(key: string): Result<boolean> {
    return ErrorHandler.wrapSync(
      () => {
        return this.cache.delete(key);
      },
      ErrorCode.UNKNOWN_ERROR,
      { key }
    );
  }

  /**
   * 检查缓存是否存在
   */
  has(key: string): Result<boolean> {
    return ErrorHandler.wrapSync(
      () => {
        const entry = this.cache.get(key);
        if (!entry) {
          return false;
        }

        if (this.isExpired(entry)) {
          this.cache.delete(key);
          return false;
        }

        return true;
      },
      ErrorCode.UNKNOWN_ERROR,
      { key }
    );
  }

  /**
   * 清空缓存
   */
  clear(): Result<boolean> {
    return ErrorHandler.wrapSync(() => {
      this.cache.clear();
      return true;
    }, ErrorCode.UNKNOWN_ERROR);
  }

  /**
   * 获取缓存统计信息
   */
  getStats(): CacheStats {
    const entries = Array.from(this.cache.values());
    const totalHits = entries.reduce((sum, entry) => sum + entry.hits, 0);
    const expiredCount = entries.filter((entry) =>
      this.isExpired(entry)
    ).length;

    return {
      size: this.cache.size,
      maxSize: this.config.maxSize,
      totalHits,
      expiredCount,
      hitRate: this.cache.size > 0 ? totalHits / this.cache.size : 0,
    };
  }

  /**
   * 带缓存的异步操作
   */
  async withCache<T>(
    key: string,
    factory: () => Promise<T>,
    ttl?: number
  ): Promise<Result<T>> {
    // 先尝试从缓存获取
    const cached = this.get<T>(key);
    if (cached.success && cached.data !== undefined) {
      return ResultUtils.success(cached.data);
    }

    // 缓存未命中，执行工厂函数
    return ErrorHandler.wrap(
      async () => {
        const value = await factory();

        // 将结果存入缓存
        this.set(key, value, ttl);

        return value;
      },
      ErrorCode.UNKNOWN_ERROR,
      { key }
    );
  }

  /**
   * 带缓存的同步操作
   */
  withCacheSync<T>(key: string, factory: () => T, ttl?: number): Result<T> {
    // 先尝试从缓存获取
    const cached = this.get<T>(key);
    if (cached.success && cached.data !== undefined) {
      return ResultUtils.success(cached.data);
    }

    // 缓存未命中，执行工厂函数
    return ErrorHandler.wrapSync(
      () => {
        const value = factory();

        // 将结果存入缓存
        this.set(key, value, ttl);

        return value;
      },
      ErrorCode.UNKNOWN_ERROR,
      { key }
    );
  }

  /**
   * 检查条目是否过期
   */
  private isExpired(entry: CacheEntry<any>): boolean {
    return Date.now() - entry.timestamp > entry.ttl;
  }

  /**
   * 淘汰最少使用的条目
   */
  private evictLeastUsed(): void {
    let leastUsedKey = "";
    let leastHits = Infinity;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.hits < leastHits) {
        leastHits = entry.hits;
        leastUsedKey = key;
      }
    }

    if (leastUsedKey) {
      this.cache.delete(leastUsedKey);
    }
  }

  /**
   * 清理过期条目
   */
  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach((key) => this.cache.delete(key));
  }

  /**
   * 启动清理定时器
   */
  private startCleanupTimer(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, this.config.cleanupInterval);
  }

  /**
   * 停止清理定时器
   */
  private stopCleanupTimer(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = undefined;
    }
  }

  /**
   * 销毁缓存服务
   */
  destroy(): void {
    this.stopCleanupTimer();
    this.cache.clear();
  }
}

/**
 * 缓存统计信息
 */
export interface CacheStats {
  size: number;
  maxSize: number;
  totalHits: number;
  expiredCount: number;
  hitRate: number;
}

/**
 * 内存缓存实现（单例）
 */
export class MemoryCache extends CacheService {
  private static instance?: MemoryCache;

  static getInstance(config?: Partial<CacheConfig>): MemoryCache {
    if (!MemoryCache.instance) {
      MemoryCache.instance = new MemoryCache(config);
    }
    return MemoryCache.instance;
  }

  static resetInstance(): void {
    if (MemoryCache.instance) {
      MemoryCache.instance.destroy();
      MemoryCache.instance = undefined;
    }
  }
}

/**
 * 分层缓存（L1: 内存, L2: 可扩展）
 */
export class TieredCache {
  constructor(private l1Cache: CacheService, private l2Cache?: CacheService) {}

  async get<T>(key: string): Promise<Result<T | undefined>> {
    // 先尝试L1缓存
    const l1Result = this.l1Cache.get<T>(key);
    if (l1Result.success && l1Result.data !== undefined) {
      return ResultUtils.success(l1Result.data);
    }

    // 如果有L2缓存，尝试L2
    if (this.l2Cache) {
      const l2Result = this.l2Cache.get<T>(key);
      if (l2Result.success && l2Result.data !== undefined) {
        // 将L2的数据写入L1
        this.l1Cache.set(key, l2Result.data);
        return ResultUtils.success(l2Result.data);
      }
    }

    return ResultUtils.success(undefined);
  }

  set<T>(key: string, value: T, ttl?: number): Result<boolean> {
    // 同时写入L1和L2
    const l1Result = this.l1Cache.set(key, value, ttl);

    if (this.l2Cache) {
      const l2Result = this.l2Cache.set(key, value, ttl);
      return ResultUtils.success(l1Result.success && l2Result.success);
    }

    return l1Result;
  }
}
