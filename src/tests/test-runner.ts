import { testCacheService } from "./cache-service.test.js";
import { testOptionsBuilder } from "./options-builder.test.js";

/**
 * 主测试运行器
 */
async function runAllTests() {
  console.log("🚀 Starting test suite...\n");

  const results = [];

  try {
    // 运行缓存服务测试
    const cacheResults = await testCacheService();
    results.push(cacheResults);

    console.log(""); // 空行分隔

    // 运行选项构建器测试
    const optionsResults = await testOptionsBuilder();
    results.push(optionsResults);

    // 汇总结果
    const totalPassed = results.reduce((sum, result) => sum + result.passed, 0);
    const totalFailed = results.reduce((sum, result) => sum + result.failed, 0);

    console.log("\n🏁 Test Suite Summary");
    console.log("=".repeat(50));
    console.log(`Total tests: ${totalPassed + totalFailed}`);
    console.log(`✅ Passed: ${totalPassed}`);
    console.log(`❌ Failed: ${totalFailed}`);
    console.log(
      `📈 Success rate: ${(
        (totalPassed / (totalPassed + totalFailed)) *
        100
      ).toFixed(1)}%`
    );

    if (totalFailed === 0) {
      console.log("\n🎉 All tests passed!");
    } else {
      console.log("\n💥 Some tests failed. Please check the output above.");
    }

    return { totalPassed, totalFailed };
  } catch (error) {
    console.error("❌ Test runner failed:", error);
    return { totalPassed: 0, totalFailed: 1 };
  }
}

// 如果直接运行此文件
if (
  import.meta.url.endsWith("/test-runner.ts") ||
  import.meta.url.endsWith("/test-runner.js")
) {
  runAllTests()
    .then(({ totalFailed }) => {
      console.log(`\n🏁 Test run completed with ${totalFailed} failures`);
    })
    .catch((error) => {
      console.error("Unexpected error:", error);
    });
}

export { runAllTests };
