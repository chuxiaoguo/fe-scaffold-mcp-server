import { CacheService } from "../services/cache-service.js";

/**
 * 简单的断言函数
 */
function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

/**
 * 缓存服务测试
 */
export async function testCacheService(): Promise<{
  passed: number;
  failed: number;
}> {
  console.log("🧪 Testing CacheService...\n");

  let passed = 0;
  let failed = 0;

  const tests = [
    {
      name: "should set and get values",
      fn: () => {
        const cache = new CacheService();
        const setResult = cache.set("key1", "value1");
        assert(setResult.success, "Set should succeed");

        const getResult = cache.get<string>("key1");
        assert(getResult.success, "Get should succeed");
        assert(getResult.data === "value1", "Should get correct value");
      },
    },
    {
      name: "should return undefined for non-existent keys",
      fn: () => {
        const cache = new CacheService();
        const result = cache.get("non-existent");
        assert(result.success, "Get should succeed");
        assert(
          result.data === undefined,
          "Should return undefined for non-existent key"
        );
      },
    },
    {
      name: "should respect TTL",
      fn: async () => {
        const cache = new CacheService();
        const setResult = cache.set("key2", "value2", 100); // 100ms TTL
        assert(setResult.success, "Set should succeed");

        // 立即获取应该成功
        const getResult1 = cache.get<string>("key2");
        assert(
          getResult1.success && getResult1.data === "value2",
          "Should get value immediately"
        );

        // 等待TTL过期
        await new Promise((resolve) => setTimeout(resolve, 150));

        const getResult2 = cache.get<string>("key2");
        assert(
          getResult2.success && getResult2.data === undefined,
          "Should return undefined after TTL"
        );
      },
    },
    {
      name: "should delete values",
      fn: () => {
        const cache = new CacheService();
        cache.set("key3", "value3");

        const deleteResult = cache.delete("key3");
        assert(deleteResult.success, "Delete should succeed");

        const getResult = cache.get("key3");
        assert(
          getResult.success && getResult.data === undefined,
          "Should not find deleted value"
        );
      },
    },
    {
      name: "should clear all values",
      fn: () => {
        const cache = new CacheService();
        cache.set("key4", "value4");
        cache.set("key5", "value5");

        const clearResult = cache.clear();
        assert(clearResult.success, "Clear should succeed");

        const getResult1 = cache.get("key4");
        const getResult2 = cache.get("key5");
        assert(
          getResult1.success && getResult1.data === undefined,
          "Key4 should be cleared"
        );
        assert(
          getResult2.success && getResult2.data === undefined,
          "Key5 should be cleared"
        );
      },
    },
    {
      name: "should provide cache stats",
      fn: () => {
        const cache = new CacheService();
        cache.set("key6", "value6");
        cache.get("key6"); // 增加命中次数

        const stats = cache.getStats();
        assert(stats.size === 1, "Size should be 1");
        assert(stats.totalHits === 1, "Total hits should be 1");
      },
    },
    {
      name: "should work with withCacheSync",
      fn: () => {
        const cache = new CacheService();
        let callCount = 0;

        const factory = () => {
          callCount++;
          return "computed-value";
        };

        // 第一次调用
        const result1 = cache.withCacheSync("computed-key", factory);
        assert(
          result1.success && result1.data === "computed-value",
          "Should return computed value"
        );
        assert(callCount === 1, "Factory should be called once");

        // 第二次调用（从缓存）
        const result2 = cache.withCacheSync("computed-key", factory);
        assert(
          result2.success && result2.data === "computed-value",
          "Should return cached value"
        );
        assert(callCount === 1, "Factory should not be called again");
      },
    },
  ];

  for (const test of tests) {
    try {
      await test.fn();
      console.log(`✅ ${test.name}`);
      passed++;
    } catch (error) {
      console.log(`❌ ${test.name}`);
      console.log(
        `   Error: ${error instanceof Error ? error.message : String(error)}`
      );
      failed++;
    }
  }

  console.log(`\n📊 CacheService Results: ${passed} passed, ${failed} failed`);
  return { passed, failed };
}
