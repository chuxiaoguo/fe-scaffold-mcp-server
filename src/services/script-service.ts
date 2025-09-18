import { ScaffoldOptions } from "../types.js";
import { ScriptConfig } from "./config-loader.js";

/**
 * 脚本生成服务
 */
export class ScriptService {
  constructor(private config: ScriptConfig) {}

  /**
   * 生成package.json的scripts
   */
  generateScripts(options: ScaffoldOptions): Record<string, string> {
    const scripts: Record<string, string> = {};

    // 添加构建工具脚本
    this.addBuildToolScripts(options.buildTool, scripts);

    // 添加TypeScript脚本
    if (options.language === "typescript") {
      this.addTypeScriptScripts(scripts);
    }

    // 添加测试脚本
    this.addTestingScripts(options.testing.framework, scripts);

    // 添加代码质量脚本
    this.addQualityToolsScripts(options.qualityTools, scripts);

    return scripts;
  }

  /**
   * 添加构建工具脚本
   */
  private addBuildToolScripts(
    buildTool: string,
    scripts: Record<string, string>
  ): void {
    const buildToolScripts = this.config[buildTool as keyof ScriptConfig];
    if (buildToolScripts && typeof buildToolScripts === "object") {
      Object.assign(scripts, buildToolScripts);
    }
  }

  /**
   * 添加TypeScript脚本
   */
  private addTypeScriptScripts(scripts: Record<string, string>): void {
    Object.assign(scripts, this.config.typescript);
  }

  /**
   * 添加测试脚本
   */
  private addTestingScripts(
    testingFramework: string,
    scripts: Record<string, string>
  ): void {
    const testingScripts = this.config.testing[testingFramework];
    if (testingScripts) {
      Object.assign(scripts, testingScripts);
    }
  }

  /**
   * 添加代码质量工具脚本
   */
  private addQualityToolsScripts(
    qualityTools: ScaffoldOptions["qualityTools"],
    scripts: Record<string, string>
  ): void {
    Object.entries(qualityTools).forEach(([tool, enabled]) => {
      if (enabled) {
        const toolScripts = this.config.qualityTools[tool];
        if (toolScripts) {
          Object.assign(scripts, toolScripts);
        }
      }
    });
  }

  /**
   * 自定义脚本
   */
  addCustomScript(
    scripts: Record<string, string>,
    name: string,
    command: string
  ): void {
    scripts[name] = command;
  }

  /**
   * 移除脚本
   */
  removeScript(scripts: Record<string, string>, name: string): void {
    delete scripts[name];
  }

  /**
   * 验证脚本命令
   */
  validateScript(command: string): boolean {
    // 基本验证：检查命令是否为空或包含危险字符
    if (!command || command.trim().length === 0) {
      return false;
    }

    // 检查是否包含危险字符或命令
    const dangerousPatterns = [
      /rm\s+-rf/,
      /del\s+\/[fs]/i,
      /format\s+[cd]:/i,
      /sudo/,
      /chmod\s+777/,
    ];

    return !dangerousPatterns.some((pattern) => pattern.test(command));
  }
}
