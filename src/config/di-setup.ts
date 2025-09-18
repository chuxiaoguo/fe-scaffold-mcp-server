import { container, SERVICE_TOKENS } from "../core/di-container.js";
import { ValidationService } from "../services/validation-service.js";
import { OptionsBuilder } from "../services/options-builder.js";
import { FileService } from "../services/file-service.js";
import { DependencyService } from "../services/dependency-service.js";
import { ScriptService } from "../services/script-service.js";
import { ScaffoldService } from "../services/scaffold-service.js";
import { CacheService } from "../services/cache-service.js";

/**
 * 依赖注入容器配置
 */
export async function setupDependencyInjection(): Promise<void> {
  // 注册缓存服务
  container.registerSingleton(
    SERVICE_TOKENS.CACHE_SERVICE,
    () => new CacheService()
  );

  // 注册验证服务
  container.registerSingleton(
    SERVICE_TOKENS.VALIDATION_SERVICE,
    () => new ValidationService()
  );

  // 注册文件服务
  container.registerSingleton(
    SERVICE_TOKENS.FILE_SERVICE,
    () => new FileService()
  );

  // 注册选项构建器（需要推荐配置）
  container.registerSingleton(SERVICE_TOKENS.OPTIONS_BUILDER, () => {
    // 这里应该从配置加载器获取推荐配置
    const recommendations = {
      vue3: {
        framework: "vue3" as const,
        language: "typescript" as const,
        buildTool: "vite" as const,
        styleFramework: "tailwind" as const,
        uiLibrary: "element-plus",
      },
      vue2: {
        framework: "vue2" as const,
        language: "typescript" as const,
        buildTool: "vite" as const,
        styleFramework: "tailwind" as const,
        uiLibrary: "element-ui",
      },
      react: {
        framework: "react" as const,
        language: "typescript" as const,
        buildTool: "vite" as const,
        styleFramework: "tailwind" as const,
        uiLibrary: "antd",
      },
    };
    return new OptionsBuilder(recommendations);
  });

  // 注册依赖服务（需要依赖配置）
  container.registerSingleton(SERVICE_TOKENS.DEPENDENCY_SERVICE, () => {
    // 这里应该从配置加载器获取依赖配置
    const mockDependencyConfig = {
      frameworks: {},
      buildTools: {},
      qualityTools: {},
      styleFrameworks: {},
      uiLibraries: {},
      testing: {},
      mockSolutions: {},
      bundleAnalyzer: {},
      typescript: [],
    };
    return new DependencyService(mockDependencyConfig);
  });

  // 注册脚本服务（需要脚本配置）
  container.registerSingleton(SERVICE_TOKENS.SCRIPT_SERVICE, () => {
    // 这里应该从配置加载器获取脚本配置
    const mockScriptConfig = {
      vite: {},
      webpack: {},
      typescript: {},
      testing: {},
      qualityTools: {},
    };
    return new ScriptService(mockScriptConfig);
  });

  // 注册脚手架服务（组合其他服务）
  container.registerSingleton(SERVICE_TOKENS.SCAFFOLD_SERVICE, () => {
    const validationService = container.resolve<ValidationService>(
      SERVICE_TOKENS.VALIDATION_SERVICE
    );
    const optionsBuilder = container.resolve<OptionsBuilder>(
      SERVICE_TOKENS.OPTIONS_BUILDER
    );
    const fileService = container.resolve<FileService>(
      SERVICE_TOKENS.FILE_SERVICE
    );
    const dependencyService = container.resolve<DependencyService>(
      SERVICE_TOKENS.DEPENDENCY_SERVICE
    );
    const scriptService = container.resolve<ScriptService>(
      SERVICE_TOKENS.SCRIPT_SERVICE
    );

    // 临时使用空的项目生成器
    const mockProjectGenerator = {
      name: "mock",
      version: "1.0.0",
      supportedFrameworks: ["vue3", "vue2", "react"] as const,
      async generate() {
        return { success: true as const, data: [] };
      },
      validate() {
        return { success: true as const, data: true };
      },
      async generateProject() {
        return {
          success: true as const,
          data: {
            projectPath: "",
            files: [],
            stats: {
              totalFiles: 0,
              totalLines: 0,
              fileTypes: {},
              dependencies: { production: 0, development: 0 },
            },
            warnings: [],
          },
        };
      },
      async validateProject() {
        return {
          success: true as const,
          data: {
            isValid: true,
            missingFiles: [],
            errors: [],
            suggestions: [],
          },
        };
      },
    };

    return new ScaffoldService(
      validationService,
      optionsBuilder,
      fileService,
      dependencyService,
      scriptService,
      mockProjectGenerator
    );
  });
}

/**
 * 获取服务实例的便捷函数
 */
export function getService<T>(token: symbol): T {
  return container.resolve<T>(token);
}
