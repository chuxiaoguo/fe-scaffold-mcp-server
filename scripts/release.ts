#!/usr/bin/env tsx

/**
 * 发布脚本 - 自动化执行代码校验、打包和发布到npm
 *
 * 功能包括：
 * - 版本号管理
 * - 代码质量检查
 * - 自动化测试
 * - 构建打包
 * - Git提交和标签
 * - NPM发布
 * - 发布后清理
 */

import fs from "fs";
import path from "path";
import { execSync, spawn } from "child_process";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

// ANSI 颜色代码
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
};

class ReleaseManager {
  private packagePath: string;
  private packageJson: any;
  private currentVersion: string;
  private newVersion: string = "";
  private releaseType: "patch" | "minor" | "major" | "custom" = "patch";
  private skipTests: boolean = false;
  private dryRun: boolean = false;
  private tag: string = "latest";

  constructor() {
    this.packagePath = path.join(projectRoot, "package.json");
    this.packageJson = JSON.parse(fs.readFileSync(this.packagePath, "utf8"));
    this.currentVersion = this.packageJson.version;
  }

  /**
   * 彩色日志输出
   */
  private log(message: string, color: keyof typeof colors = "white") {
    console.log(`${colors[color]}${message}${colors.reset}`);
  }

  /**
   * 执行命令并处理错误
   */
  private async runCommand(
    command: string,
    cwd: string = projectRoot
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      this.log(`📝 执行命令: ${command}`, "cyan");

      const child = spawn("sh", ["-c", command], {
        cwd,
        stdio: "pipe",
      });

      let stdout = "";
      let stderr = "";

      child.stdout.on("data", (data) => {
        const output = data.toString();
        stdout += output;
        process.stdout.write(output);
      });

      child.stderr.on("data", (data) => {
        const output = data.toString();
        stderr += output;
        process.stderr.write(output);
      });

      child.on("close", (code) => {
        if (code === 0) {
          resolve(stdout);
        } else {
          reject(new Error(`命令执行失败 (code: ${code}): ${stderr}`));
        }
      });

      child.on("error", (error) => {
        reject(error);
      });
    });
  }

  /**
   * 解析命令行参数
   */
  private parseArguments() {
    const args = process.argv.slice(2);

    for (let i = 0; i < args.length; i++) {
      const arg = args[i];

      switch (arg) {
        case "--patch":
          this.releaseType = "patch";
          break;
        case "--minor":
          this.releaseType = "minor";
          break;
        case "--major":
          this.releaseType = "major";
          break;
        case "--version":
          this.releaseType = "custom";
          this.newVersion = args[i + 1];
          i++;
          break;
        case "--skip-tests":
          this.skipTests = true;
          break;
        case "--dry-run":
          this.dryRun = true;
          break;
        case "--tag":
          this.tag = args[i + 1];
          i++;
          break;
        case "--help":
        case "-h":
          this.showHelp();
          process.exit(0);
          break;
      }
    }
  }

  /**
   * 显示帮助信息
   */
  private showHelp() {
    console.log(`
${colors.bright}前端脚手架发布工具${colors.reset}

${colors.green}用法:${colors.reset}
  npm run release [选项]

${colors.green}选项:${colors.reset}
  --patch                    发布补丁版本 (默认)
  --minor                    发布次要版本
  --major                    发布主要版本
  --version <版本号>         指定自定义版本号
  --skip-tests              跳过测试
  --dry-run                 试运行，不实际发布
  --tag <标签>              NPM发布标签 (默认: latest)
  --help, -h                显示帮助信息

${colors.green}示例:${colors.reset}
  npm run release                    # 发布补丁版本
  npm run release -- --minor        # 发布次要版本
  npm run release -- --version 2.0.0 # 发布指定版本
  npm run release -- --dry-run      # 试运行
`);
  }

  /**
   * 计算新版本号
   */
  private calculateNewVersion(): string {
    if (this.releaseType === "custom") {
      return this.newVersion;
    }

    const [major, minor, patch] = this.currentVersion.split(".").map(Number);

    switch (this.releaseType) {
      case "major":
        return `${major + 1}.0.0`;
      case "minor":
        return `${major}.${minor + 1}.0`;
      case "patch":
        return `${major}.${minor}.${patch + 1}`;
      default:
        throw new Error(`不支持的发布类型: ${this.releaseType}`);
    }
  }

  /**
   * 检查Git状态
   */
  private async checkGitStatus() {
    this.log("🔍 检查Git状态...", "blue");

    // 检查是否有未提交的更改
    try {
      const status = await this.runCommand("git status --porcelain");
      if (status.trim()) {
        const files = status
          .trim()
          .split("\n")
          .map((line) => line.trim())
          .join("\n");
        throw new Error(`存在未提交的更改，请先提交或暂存这些文件：\n${files}`);
      }
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes("存在未提交的更改")
      ) {
        throw error;
      }
      throw new Error("请确保在Git仓库中运行此脚本");
    }

    // 检查是否在主分支
    const branch = await this.runCommand("git rev-parse --abbrev-ref HEAD");
    const currentBranch = branch.trim();

    if (currentBranch !== "main" && currentBranch !== "master") {
      this.log(`⚠️ 当前分支: ${currentBranch}`, "yellow");
      this.log("建议在主分支(main/master)上发布", "yellow");
    }

    this.log("✅ Git状态检查通过", "green");
  }

  /**
   * 检查NPM登录状态
   */
  private async checkNpmAuth() {
    this.log("🔍 检查NPM认证状态...", "blue");

    try {
      await this.runCommand("npm whoami");
      this.log("✅ NPM认证检查通过", "green");
    } catch (error) {
      throw new Error("请先登录NPM: npm login");
    }
  }

  /**
   * 运行代码质量检查
   */
  private async runQualityChecks() {
    this.log("🔍 运行代码质量检查...", "blue");

    // TypeScript类型检查
    this.log("📝 TypeScript类型检查...", "cyan");
    await this.runCommand("npm run type-check");

    // ESLint检查
    this.log("📝 ESLint代码检查...", "cyan");
    await this.runCommand("npm run lint");

    this.log("✅ 代码质量检查通过", "green");
  }

  /**
   * 运行测试套件
   */
  private async runTests() {
    if (this.skipTests) {
      this.log("⏭️ 跳过测试", "yellow");
      return;
    }

    this.log("🧪 运行自动化测试...", "blue");

    try {
      await this.runCommand("npm run test:automation");
      this.log("✅ 所有测试通过", "green");
    } catch (error) {
      throw new Error("测试失败，请修复后重试");
    }
  }

  /**
   * 构建项目
   */
  private async buildProject() {
    this.log("🏗️ 构建项目...", "blue");

    await this.runCommand("npm run build");

    // 检查构建产物
    const distPath = path.join(projectRoot, "dist");
    if (!fs.existsSync(distPath)) {
      throw new Error("构建失败：找不到dist目录");
    }

    const distFiles = fs.readdirSync(distPath);
    if (distFiles.length === 0) {
      throw new Error("构建失败：dist目录为空");
    }

    this.log("✅ 项目构建成功", "green");
  }

  /**
   * 更新版本号
   */
  private updateVersion() {
    this.log(
      `📝 更新版本号: ${this.currentVersion} → ${this.newVersion}`,
      "blue"
    );

    if (this.dryRun) {
      this.log("🔍 试运行模式：跳过版本号更新", "yellow");
      return;
    }

    this.packageJson.version = this.newVersion;
    fs.writeFileSync(
      this.packagePath,
      JSON.stringify(this.packageJson, null, 2) + "\n"
    );

    this.log("✅ 版本号更新完成", "green");
  }

  /**
   * 创建Git提交和标签
   */
  private async createGitCommitAndTag() {
    if (this.dryRun) {
      this.log("🔍 试运行模式：跳过Git提交和标签", "yellow");
      return;
    }

    this.log("📝 创建Git提交和标签...", "blue");

    // 添加package.json到暂存区
    await this.runCommand("git add package.json");

    // 创建提交
    await this.runCommand(`git commit -m "chore: release v${this.newVersion}"`);

    // 创建标签
    await this.runCommand(
      `git tag -a v${this.newVersion} -m "Release v${this.newVersion}"`
    );

    this.log("✅ Git提交和标签创建完成", "green");
  }

  /**
   * 发布到NPM
   */
  private async publishToNpm() {
    if (this.dryRun) {
      this.log("🔍 试运行模式：跳过NPM发布", "yellow");
      return;
    }

    this.log("📦 发布到NPM...", "blue");

    const publishCommand = `npm publish --tag ${this.tag}`;
    await this.runCommand(publishCommand);

    this.log("✅ NPM发布成功", "green");
  }

  /**
   * 推送到远程仓库
   */
  private async pushToRemote() {
    if (this.dryRun) {
      this.log("🔍 试运行模式：跳过推送到远程仓库", "yellow");
      return;
    }

    this.log("📤 推送到远程仓库...", "blue");

    // 推送代码
    await this.runCommand("git push origin HEAD");

    // 推送标签
    await this.runCommand(`git push origin v${this.newVersion}`);

    this.log("✅ 推送到远程仓库完成", "green");
  }

  /**
   * 发布后清理
   */
  private async postReleaseCleanup() {
    this.log("🧹 发布后清理...", "blue");

    // 这里可以添加发布后的清理工作
    // 比如清理临时文件、发送通知等

    this.log("✅ 清理完成", "green");
  }

  /**
   * 显示发布总结
   */
  private showReleaseSummary() {
    this.log("\n🎉 发布完成！", "green");
    this.log("=".repeat(50), "green");
    this.log(`📦 包名: ${this.packageJson.name}`, "white");
    this.log(`🏷️ 版本: ${this.currentVersion} → ${this.newVersion}`, "white");
    this.log(`🔖 标签: ${this.tag}`, "white");
    this.log(`📅 时间: ${new Date().toLocaleString()}`, "white");

    if (!this.dryRun) {
      this.log(
        `\n📥 安装命令: npm install ${this.packageJson.name}@${this.newVersion}`,
        "cyan"
      );
      this.log(
        `🌐 NPM链接: https://www.npmjs.com/package/${this.packageJson.name}`,
        "cyan"
      );
    } else {
      this.log("\n🔍 这是试运行模式，实际未发布", "yellow");
    }
  }

  /**
   * 主发布流程
   */
  async release() {
    try {
      this.log(
        `\n🚀 开始发布流程 ${this.dryRun ? "(试运行模式)" : ""}`,
        "bright"
      );
      this.log("=".repeat(50), "blue");

      // 解析命令行参数
      this.parseArguments();

      // 计算新版本号
      this.newVersion = this.calculateNewVersion();
      this.log(`🎯 目标版本: ${this.newVersion}`, "magenta");

      // 检查Git状态
      await this.checkGitStatus();

      // 检查NPM认证
      if (!this.dryRun) {
        await this.checkNpmAuth();
      }

      // 代码质量检查
      await this.runQualityChecks();

      // 运行测试
      await this.runTests();

      // 构建项目
      await this.buildProject();

      // 更新版本号
      this.updateVersion();

      // 创建Git提交和标签
      await this.createGitCommitAndTag();

      // 发布到NPM
      await this.publishToNpm();

      // 推送到远程仓库
      await this.pushToRemote();

      // 发布后清理
      await this.postReleaseCleanup();

      // 显示发布总结
      this.showReleaseSummary();

      process.exit(0);
    } catch (error) {
      this.log(
        `\n❌ 发布失败: ${
          error instanceof Error ? error.message : String(error)
        }`,
        "red"
      );

      if (!this.dryRun && this.newVersion) {
        this.log("\n🔄 尝试回滚...", "yellow");
        try {
          // 回滚package.json
          this.packageJson.version = this.currentVersion;
          fs.writeFileSync(
            this.packagePath,
            JSON.stringify(this.packageJson, null, 2) + "\n"
          );
          this.log("✅ package.json已回滚", "green");
        } catch (rollbackError) {
          this.log(`❌ 回滚失败: ${rollbackError}`, "red");
        }
      }

      process.exit(1);
    }
  }
}

// 运行发布流程
if (process.argv[1] === __filename) {
  const releaseManager = new ReleaseManager();
  releaseManager.release();
}

export default ReleaseManager;
