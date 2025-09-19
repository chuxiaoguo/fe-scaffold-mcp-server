#!/usr/bin/env tsx

/**
 * 性能基准测试脚本
 * 测试脚手架生成项目的性能指标
 */

import fs from "node:fs";
import path from "node:path";
import { performance } from "node:perf_hooks";
import { execSync, spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "../..");

interface BenchmarkResult {
  framework: string;
  buildTool: string;
  language: string;
  generateTime: number;
  installTime: number;
  buildTime: number;
  bundleSize: number;
  error?: string;
}

class PerformanceBenchmark {
  private results: BenchmarkResult[] = [];
  private testDir: string;

  constructor() {
    this.testDir = path.join(tmpdir(), "fe-scaffold-benchmark");
  }

  /**
   * 彩色日志输出
   */
  private log(
    message: string,
    color: "green" | "yellow" | "red" | "blue" = "blue"
  ) {
    const colors = {
      green: "\x1b[32m",
      yellow: "\x1b[33m",
      red: "\x1b[31m",
      blue: "\x1b[34m",
      reset: "\x1b[0m",
    };
    console.log(`${colors[color]}${message}${colors.reset}`);
  }

  /**
   * 执行命令并返回执行时间
   */
  private async executeCommand(
    command: string,
    cwd: string
  ): Promise<{ time: number; output: string }> {
    return new Promise((resolve, reject) => {
      const startTime = performance.now();

      const child = spawn("sh", ["-c", command], {
        cwd,
        stdio: "pipe",
      });

      let stdout = "";
      let stderr = "";

      child.stdout?.on("data", (data) => {
        stdout += data.toString();
      });

      child.stderr?.on("data", (data) => {
        stderr += data.toString();
      });

      child.on("close", (code) => {
        const endTime = performance.now();
        const time = endTime - startTime;

        if (code === 0) {
          resolve({ time, output: stdout });
        } else {
          reject(new Error(`Command failed with code ${code}: ${stderr}`));
        }
      });
    });
  }

  /**
   * 获取目录大小
   */
  private getDirSize(dirPath: string): number {
    if (!fs.existsSync(dirPath)) return 0;

    let totalSize = 0;
    const files = fs.readdirSync(dirPath);

    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stats = fs.statSync(filePath);

      if (stats.isDirectory()) {
        totalSize += this.getDirSize(filePath);
      } else {
        totalSize += stats.size;
      }
    }

    return totalSize;
  }

  /**
   * 准备测试环境
   */
  private async setupTestEnvironment() {
    this.log("🔧 准备测试环境...", "blue");

    // 清理并创建测试目录
    if (fs.existsSync(this.testDir)) {
      fs.rmSync(this.testDir, { recursive: true });
    }
    fs.mkdirSync(this.testDir, { recursive: true });

    // 构建脚手架工具
    this.log("📦 构建脚手架工具...", "blue");
    execSync("npm run build", { cwd: projectRoot });

    // 全局安装脚手架工具
    execSync("npm link", { cwd: projectRoot });

    this.log("✅ 测试环境准备完成", "green");
  }

  /**
   * 测试单个项目配置
   */
  private async benchmarkConfiguration(
    framework: string,
    buildTool: string,
    language: string
  ): Promise<BenchmarkResult> {
    const projectName = `benchmark-${framework}-${buildTool}-${language}`;
    const projectPath = path.join(this.testDir, projectName);

    this.log(`⚡ 测试配置: ${framework} + ${buildTool} + ${language}`, "blue");

    const result: BenchmarkResult = {
      framework,
      buildTool,
      language,
      generateTime: 0,
      installTime: 0,
      buildTime: 0,
      bundleSize: 0,
    };

    try {
      // 测试项目生成时间
      this.log("  📝 生成项目...", "yellow");
      const generateStart = performance.now();

      execSync(
        `fe-scaffold-mcp-server create-scaffold --projectName="${projectName}" --framework=${framework} --buildTool=${buildTool} --language=${language} --styleFramework=tailwind`,
        {
          cwd: this.testDir,
          stdio: "pipe",
        }
      );

      result.generateTime = performance.now() - generateStart;

      // 测试依赖安装时间
      this.log("  📦 安装依赖...", "yellow");
      const installResult = await this.executeCommand(
        "npm install",
        projectPath
      );
      result.installTime = installResult.time;

      // 测试构建时间
      this.log("  🏗️ 构建项目...", "yellow");
      const buildResult = await this.executeCommand(
        "npm run build",
        projectPath
      );
      result.buildTime = buildResult.time;

      // 计算构建产物大小
      const distPath = path.join(projectPath, "dist");
      result.bundleSize = this.getDirSize(distPath);

      this.log(
        `  ✅ 完成 - 生成:${Math.round(
          result.generateTime
        )}ms, 安装:${Math.round(result.installTime)}ms, 构建:${Math.round(
          result.buildTime
        )}ms, 大小:${Math.round(result.bundleSize / 1024)}KB`,
        "green"
      );
    } catch (error) {
      result.error = error instanceof Error ? error.message : String(error);
      this.log(`  ❌ 失败: ${result.error}`, "red");
    }

    // 清理项目目录
    if (fs.existsSync(projectPath)) {
      fs.rmSync(projectPath, { recursive: true });
    }

    return result;
  }

  /**
   * 运行所有基准测试
   */
  async runBenchmarks() {
    this.log("🚀 开始性能基准测试", "blue");

    await this.setupTestEnvironment();

    // 定义测试配置
    const configurations = [
      { framework: "vue3", buildTool: "vite", language: "typescript" },
      { framework: "vue3", buildTool: "vite", language: "javascript" },
      { framework: "react", buildTool: "vite", language: "typescript" },
      { framework: "react", buildTool: "vite", language: "javascript" },
      { framework: "vue2", buildTool: "webpack", language: "javascript" },
    ];

    // 运行基准测试
    for (const config of configurations) {
      const result = await this.benchmarkConfiguration(
        config.framework,
        config.buildTool,
        config.language
      );
      this.results.push(result);
    }

    // 生成报告
    this.generateReport();

    this.log("🎉 性能基准测试完成", "green");
  }

  /**
   * 生成性能报告
   */
  private generateReport() {
    this.log("📊 生成性能报告...", "blue");

    // 控制台输出
    console.log("\n" + "=".repeat(80));
    console.log("📊 性能基准测试报告");
    console.log("=".repeat(80));

    const successResults = this.results.filter((r) => !r.error);
    const failedResults = this.results.filter((r) => r.error);

    if (successResults.length > 0) {
      console.log("\n✅ 成功的测试:");
      console.log(
        "| 框架 | 构建工具 | 语言 | 生成时间 | 安装时间 | 构建时间 | Bundle大小 |"
      );
      console.log(
        "|------|----------|------|----------|----------|----------|------------|"
      );

      successResults.forEach((result) => {
        console.log(
          `| ${result.framework} | ${result.buildTool} | ${result.language} | ` +
            `${Math.round(result.generateTime)}ms | ${Math.round(
              result.installTime
            )}ms | ` +
            `${Math.round(result.buildTime)}ms | ${Math.round(
              result.bundleSize / 1024
            )}KB |`
        );
      });

      // 统计数据
      const avgGenerateTime =
        successResults.reduce((sum, r) => sum + r.generateTime, 0) /
        successResults.length;
      const avgInstallTime =
        successResults.reduce((sum, r) => sum + r.installTime, 0) /
        successResults.length;
      const avgBuildTime =
        successResults.reduce((sum, r) => sum + r.buildTime, 0) /
        successResults.length;
      const avgBundleSize =
        successResults.reduce((sum, r) => sum + r.bundleSize, 0) /
        successResults.length;

      console.log("\n📈 平均性能指标:");
      console.log(`  - 平均生成时间: ${Math.round(avgGenerateTime)}ms`);
      console.log(`  - 平均安装时间: ${Math.round(avgInstallTime)}ms`);
      console.log(`  - 平均构建时间: ${Math.round(avgBuildTime)}ms`);
      console.log(`  - 平均Bundle大小: ${Math.round(avgBundleSize / 1024)}KB`);
    }

    if (failedResults.length > 0) {
      console.log("\n❌ 失败的测试:");
      failedResults.forEach((result) => {
        console.log(
          `  - ${result.framework} + ${result.buildTool} + ${result.language}: ${result.error}`
        );
      });
    }

    // 生成JSON报告
    const reportPath = path.join(projectRoot, "performance-report.json");
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        total: this.results.length,
        success: successResults.length,
        failed: failedResults.length,
        averages:
          successResults.length > 0
            ? {
                generateTime:
                  successResults.reduce((sum, r) => sum + r.generateTime, 0) /
                  successResults.length,
                installTime:
                  successResults.reduce((sum, r) => sum + r.installTime, 0) /
                  successResults.length,
                buildTime:
                  successResults.reduce((sum, r) => sum + r.buildTime, 0) /
                  successResults.length,
                bundleSize:
                  successResults.reduce((sum, r) => sum + r.bundleSize, 0) /
                  successResults.length,
              }
            : null,
      },
      results: this.results,
    };

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    this.log(`📄 JSON报告已保存到: ${reportPath}`, "green");

    console.log("\n" + "=".repeat(80));
  }

  /**
   * 清理测试环境
   */
  cleanup() {
    if (fs.existsSync(this.testDir)) {
      fs.rmSync(this.testDir, { recursive: true });
    }
  }
}

// 运行基准测试
if (process.argv[1] === __filename) {
  const benchmark = new PerformanceBenchmark();

  benchmark
    .runBenchmarks()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ 基准测试失败:", error);
      process.exit(1);
    })
    .finally(() => {
      benchmark.cleanup();
    });
}

export default PerformanceBenchmark;
