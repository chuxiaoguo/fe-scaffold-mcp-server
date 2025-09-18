import { promises as fs } from "fs";
import { join } from "path";
import { DependencyInfo, StackTemplate, ScaffoldOptions } from "../types.js";
import { ErrorHandler, ErrorCode, Result } from "../core/error-handling-v2.js";

/**
 * 配置文件加载服务
 */
export class ConfigLoader {
  private configPath: string;
  private cache = new Map<string, unknown>();

  constructor(configPath = join(process.cwd(), "src", "config")) {
    this.configPath = configPath;
  }

  /**
   * 加载依赖配置
   */
  async loadDependencies(): Promise<Result<DependencyConfig>> {
    return this.loadJsonFile<DependencyConfig>("dependencies.json");
  }

  /**
   * 加载模板配置
   */
  async loadTemplates(): Promise<Result<StackTemplate[]>> {
    return this.loadJsonFile<StackTemplate[]>("templates.json");
  }

  /**
   * 加载脚本配置
   */
  async loadScripts(): Promise<Result<ScriptConfig>> {
    return this.loadJsonFile<ScriptConfig>("scripts.json");
  }

  /**
   * 加载推荐配置
   */
  async loadRecommendations(): Promise<
    Result<Record<string, Partial<ScaffoldOptions>>>
  > {
    return this.loadJsonFile<Record<string, Partial<ScaffoldOptions>>>(
      "recommendations.json"
    );
  }

  /**
   * 加载JSON文件
   */
  private async loadJsonFile<T>(filename: string): Promise<Result<T>> {
    const cacheKey = filename;

    // 检查缓存
    if (this.cache.has(cacheKey)) {
      return ErrorHandler.wrapSync(
        () => this.cache.get(cacheKey) as T,
        ErrorCode.CONFIG_NOT_FOUND
      );
    }

    const filePath = join(this.configPath, filename);

    return ErrorHandler.wrap(
      async () => {
        const content = await fs.readFile(filePath, "utf-8");
        const data = JSON.parse(content) as T;

        // 缓存结果
        this.cache.set(cacheKey, data);

        return data;
      },
      ErrorCode.CONFIG_NOT_FOUND,
      { filePath }
    );
  }

  /**
   * 清除缓存
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * 预加载所有配置文件
   */
  async preloadAll(): Promise<Result<boolean>> {
    return ErrorHandler.wrap(async () => {
      await Promise.all([
        this.loadDependencies(),
        this.loadTemplates(),
        this.loadScripts(),
        this.loadRecommendations(),
      ]);
      return true;
    }, ErrorCode.CONFIG_NOT_FOUND);
  }
}

/**
 * 依赖配置接口
 */
export interface DependencyConfig {
  frameworks: Record<
    string,
    {
      dependencies: DependencyInfo[];
      devDependencies: DependencyInfo[];
    }
  >;
  buildTools: Record<
    string,
    {
      devDependencies: DependencyInfo[];
    }
  >;
  qualityTools: Record<string, DependencyInfo[]>;
  styleFrameworks: Record<string, DependencyInfo[]>;
  uiLibraries: Record<string, DependencyInfo[]>;
  testing: Record<string, DependencyInfo[]>;
  mockSolutions: Record<string, DependencyInfo[]>;
  bundleAnalyzer: Record<string, DependencyInfo[]>;
  typescript: DependencyInfo[];
}

/**
 * 脚本配置接口
 */
export interface ScriptConfig {
  vite: Record<string, string>;
  webpack: Record<string, string>;
  typescript: Record<string, string>;
  testing: Record<string, Record<string, string>>;
  qualityTools: Record<string, Record<string, string>>;
}
