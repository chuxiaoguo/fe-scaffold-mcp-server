import {
  ScaffoldOptions,
  DependencyInfo,
  DependencyType,
  PackageVersion,
} from "../types.js";
import { DependencyConfig } from "./config-loader.js";

/**
 * 重构后的依赖管理服务
 */
export class DependencyService {
  constructor(private config: DependencyConfig) {}

  /**
   * 获取项目依赖
   */
  getDependencies(options: ScaffoldOptions): {
    dependencies: DependencyInfo[];
    devDependencies: DependencyInfo[];
  } {
    const dependencies: DependencyInfo[] = [];
    const devDependencies: DependencyInfo[] = [];

    // 基础框架依赖
    this.addFrameworkDependencies(
      options.framework,
      dependencies,
      devDependencies
    );

    // 构建工具依赖
    this.addBuildToolDependencies(options.buildTool, devDependencies);

    // TypeScript依赖
    if (options.language === "typescript") {
      devDependencies.push(...this.config.typescript);
    }

    // 代码质量工具依赖
    this.addQualityToolsDependencies(options.qualityTools, devDependencies);

    // 样式框架依赖
    this.addStyleDependencies(options.styleFramework, devDependencies);

    // UI组件库依赖
    if (options.uiLibrary) {
      this.addUILibraryDependencies(options.uiLibrary, dependencies);
    }

    // 测试框架依赖
    this.addTestingDependencies(options.testing.framework, devDependencies);

    // Mock方案依赖
    this.addMockDependencies(options.testing.mockSolution, devDependencies);

    // 打包分析工具依赖
    this.addBundleAnalyzerDependencies(options.bundleAnalyzer, devDependencies);

    return { dependencies, devDependencies };
  }

  /**
   * 添加框架依赖
   */
  private addFrameworkDependencies(
    framework: string,
    dependencies: DependencyInfo[],
    devDependencies: DependencyInfo[]
  ): void {
    const frameworkConfig = this.config.frameworks[framework];
    if (frameworkConfig) {
      dependencies.push(...frameworkConfig.dependencies);
      devDependencies.push(...frameworkConfig.devDependencies);
    }
  }

  /**
   * 添加构建工具依赖
   */
  private addBuildToolDependencies(
    buildTool: string,
    devDependencies: DependencyInfo[]
  ): void {
    const buildToolConfig = this.config.buildTools[buildTool];
    if (buildToolConfig) {
      devDependencies.push(...buildToolConfig.devDependencies);
    }
  }

  /**
   * 添加代码质量工具依赖
   */
  private addQualityToolsDependencies(
    qualityTools: ScaffoldOptions["qualityTools"],
    devDependencies: DependencyInfo[]
  ): void {
    Object.entries(qualityTools).forEach(([tool, enabled]) => {
      if (enabled && tool in this.config.qualityTools) {
        const toolDeps = this.config.qualityTools[tool];
        if (toolDeps) {
          devDependencies.push(...toolDeps);
        }
      }
    });
  }

  /**
   * 添加样式依赖
   */
  private addStyleDependencies(
    styleFramework: string,
    devDependencies: DependencyInfo[]
  ): void {
    const styleDeps = this.config.styleFrameworks[styleFramework];
    if (styleDeps) {
      devDependencies.push(...styleDeps);
    }
  }

  /**
   * 添加UI组件库依赖
   */
  private addUILibraryDependencies(
    uiLibrary: string,
    dependencies: DependencyInfo[]
  ): void {
    const uiDeps = this.config.uiLibraries[uiLibrary];
    if (uiDeps) {
      dependencies.push(...uiDeps);
    }
  }

  /**
   * 添加测试框架依赖
   */
  private addTestingDependencies(
    testingFramework: string,
    devDependencies: DependencyInfo[]
  ): void {
    const testingDeps = this.config.testing[testingFramework];
    if (testingDeps) {
      devDependencies.push(...testingDeps);
    }
  }

  /**
   * 添加Mock方案依赖
   */
  private addMockDependencies(
    mockSolution: string,
    devDependencies: DependencyInfo[]
  ): void {
    const mockDeps = this.config.mockSolutions[mockSolution];
    if (mockDeps) {
      devDependencies.push(...mockDeps);
    }
  }

  /**
   * 添加打包分析工具依赖
   */
  private addBundleAnalyzerDependencies(
    bundleAnalyzer: string,
    devDependencies: DependencyInfo[]
  ): void {
    const analyzerDeps = this.config.bundleAnalyzer[bundleAnalyzer];
    if (analyzerDeps) {
      devDependencies.push(...analyzerDeps);
    }
  }

  /**
   * 检查依赖冲突
   */
  checkConflicts(dependencies: DependencyInfo[]): DependencyConflict[] {
    const conflicts: DependencyConflict[] = [];
    const depMap = new Map<string, DependencyInfo[]>();

    // 按包名分组
    dependencies.forEach((dep) => {
      if (!depMap.has(dep.name)) {
        depMap.set(dep.name, []);
      }
      depMap.get(dep.name)!.push(dep);
    });

    // 检查版本冲突
    depMap.forEach((deps, name) => {
      if (deps.length > 1) {
        const versions = deps.map((d) => d.version);
        const uniqueVersions = new Set(versions);

        if (uniqueVersions.size > 1) {
          conflicts.push({
            packageName: name,
            conflictingVersions: Array.from(uniqueVersions),
            dependencies: deps,
          });
        }
      }
    });

    return conflicts;
  }

  /**
   * 解决依赖冲突
   */
  resolveConflicts(conflicts: DependencyConflict[]): DependencyInfo[] {
    const resolved: DependencyInfo[] = [];

    conflicts.forEach((conflict) => {
      // 选择最高版本
      const sortedDeps = conflict.dependencies.sort((a, b) => {
        return this.compareVersions(b.version, a.version);
      });

      resolved.push(sortedDeps[0]);
    });

    return resolved;
  }

  /**
   * 比较版本号
   */
  private compareVersions(v1: string, v2: string): number {
    const clean1 = v1.replace(/[^0-9.]/g, "");
    const clean2 = v2.replace(/[^0-9.]/g, "");

    const parts1 = clean1.split(".").map(Number);
    const parts2 = clean2.split(".").map(Number);

    for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
      const p1 = parts1[i] || 0;
      const p2 = parts2[i] || 0;

      if (p1 > p2) return 1;
      if (p1 < p2) return -1;
    }

    return 0;
  }
}

/**
 * 依赖冲突接口
 */
export interface DependencyConflict {
  packageName: string;
  conflictingVersions: string[];
  dependencies: DependencyInfo[];
}
