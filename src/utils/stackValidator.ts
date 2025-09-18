import { ScaffoldOptions } from '../types.js';

/**
 * 技术栈验证器
 */
export class StackValidator {
  /**
   * 验证技术栈组合的兼容性
   */
  static validate(options: ScaffoldOptions): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 验证框架和构建工具兼容性
    this.validateFrameworkBuildTool(options, errors, warnings);

    // 验证UI组件库兼容性
    this.validateUILibrary(options, errors, warnings);

    // 验证测试框架兼容性
    this.validateTestingFramework(options, errors, warnings);

    // 验证Mock方案兼容性
    this.validateMockSolution(options, errors, warnings);

    // 验证样式方案兼容性
    this.validateStyleFramework(options, errors, warnings);

    // 验证打包分析工具兼容性
    this.validateBundleAnalyzer(options, errors, warnings);

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * 验证框架和构建工具兼容性
   */
  private static validateFrameworkBuildTool(
    options: ScaffoldOptions,
    _errors: string[],
    warnings: string[]
  ): void {
    // Vue2 + Webpack 组合警告
    if (options.framework === 'vue2' && options.buildTool === 'webpack') {
      warnings.push('Vue2 + Webpack组合可能需要额外的loader配置');
    }

    // Vue2 + Vite 兼容性检查
    if (options.framework === 'vue2' && options.buildTool === 'vite') {
      warnings.push('Vue2 + Vite需要使用@vitejs/plugin-vue2插件');
    }

    // React + TypeScript 推荐
    if (options.framework === 'react' && options.language === 'javascript') {
      warnings.push('React项目推荐使用TypeScript以获得更好的开发体验');
    }
  }

  /**
   * 验证UI组件库兼容性
   */
  private static validateUILibrary(
    options: ScaffoldOptions,
    errors: string[],
    _warnings: string[]
  ): void {
    if (!options.uiLibrary) return;

    const compatibilityMap = {
      'element-ui': ['vue2'],
      'element-plus': ['vue3'],
      'antd': ['react'],
    };

    const supportedFrameworks = compatibilityMap[options.uiLibrary as keyof typeof compatibilityMap];
    
    if (supportedFrameworks && !supportedFrameworks.includes(options.framework)) {
      errors.push(`UI组件库 ${options.uiLibrary} 不兼容框架 ${options.framework}`);
    }
  }

  /**
   * 验证测试框架兼容性
   */
  private static validateTestingFramework(
    options: ScaffoldOptions,
    errors: string[],
    warnings: string[]
  ): void {
    // Vitest 主要为 Vite 项目设计
    if (options.testing.framework === 'vitest' && options.buildTool === 'webpack') {
      warnings.push('Vitest主要为Vite项目设计，Webpack项目推荐使用Jest');
    }

    // Jest 在 Vite 项目中需要额外配置
    if (options.testing.framework === 'jest' && options.buildTool === 'vite') {
      warnings.push('Jest在Vite项目中需要额外的配置，推荐使用Vitest');
    }
  }

  /**
   * 验证Mock方案兼容性
   */
  private static validateMockSolution(
    options: ScaffoldOptions,
    errors: string[],
    warnings: string[]
  ): void {
    const { buildTool, testing } = options;

    // Vite项目的Mock方案检查
    if (buildTool === 'vite') {
      if (!['msw', 'vite-plugin-mock'].includes(testing.mockSolution)) {
        warnings.push(`Mock方案 ${testing.mockSolution} 不是Vite项目的推荐选择`);
      }
    }

    // Webpack项目的Mock方案检查
    if (buildTool === 'webpack') {
      if (!['webpack-proxy', 'mocker-api', 'msw'].includes(testing.mockSolution)) {
        warnings.push(`Mock方案 ${testing.mockSolution} 不是Webpack项目的推荐选择`);
      }
    }
  }

  /**
   * 验证样式方案兼容性
   */
  private static validateStyleFramework(
    options: ScaffoldOptions,
    _errors: string[],
    warnings: string[]
  ): void {
    // Tailwind CSS 在所有框架中都支持
    if (options.styleFramework === 'tailwind') {
      return;
    }

    // Sass/Less 需要相应的loader或插件
    if (['sass', 'less'].includes(options.styleFramework)) {
      if (options.buildTool === 'webpack') {
        warnings.push(`${options.styleFramework}需要在Webpack中配置相应的loader`);
      }
    }
  }

  /**
   * 验证打包分析工具兼容性
   */
  private static validateBundleAnalyzer(
    options: ScaffoldOptions,
    errors: string[],
    warnings: string[]
  ): void {
    // 检查打包分析工具与构建工具的匹配
    if (options.buildTool === 'vite' && options.bundleAnalyzer === 'webpack-bundle-analyzer') {
      errors.push('Vite项目应该使用rollup-plugin-visualizer而不是webpack-bundle-analyzer');
    }

    if (options.buildTool === 'webpack' && options.bundleAnalyzer === 'rollup-plugin-visualizer') {
      errors.push('Webpack项目应该使用webpack-bundle-analyzer而不是rollup-plugin-visualizer');
    }
  }

  /**
   * 获取推荐的技术栈组合
   */
  static getRecommendations(framework: string): Partial<ScaffoldOptions> {
    const recommendations: Record<string, Partial<ScaffoldOptions>> = {
      vue3: {
        framework: 'vue3',
        language: 'typescript',
        buildTool: 'vite',
        styleFramework: 'tailwind',
        uiLibrary: 'element-plus',
        testing: {
          framework: 'vitest',
          mockSolution: 'msw',
        },
        bundleAnalyzer: 'rollup-plugin-visualizer',
        qualityTools: {
          eslint: true,
          prettier: true,
          lintStaged: true,
          commitlint: true,
          lsLint: true,
          husky: true,
          editorconfig: true,
        },
      },
      vue2: {
        framework: 'vue2',
        language: 'typescript',
        buildTool: 'vite',
        styleFramework: 'tailwind',
        uiLibrary: 'element-ui',
        testing: {
          framework: 'vitest',
          mockSolution: 'vite-plugin-mock',
        },
        bundleAnalyzer: 'rollup-plugin-visualizer',
        qualityTools: {
          eslint: true,
          prettier: true,
          lintStaged: true,
          commitlint: true,
          lsLint: true,
          husky: true,
          editorconfig: true,
        },
      },
      react: {
        framework: 'react',
        language: 'typescript',
        buildTool: 'vite',
        styleFramework: 'tailwind',
        uiLibrary: 'antd',
        testing: {
          framework: 'vitest',
          mockSolution: 'msw',
        },
        bundleAnalyzer: 'rollup-plugin-visualizer',
        qualityTools: {
          eslint: true,
          prettier: true,
          lintStaged: true,
          commitlint: true,
          lsLint: true,
          husky: true,
          editorconfig: true,
        },
      },
    };

    return recommendations[framework] || {};
  }

  /**
   * 自动修复技术栈配置
   */
  static autoFix(options: ScaffoldOptions): ScaffoldOptions {
    // 创建新对象而不是修改现有对象
    let fixedTestingFramework = options.testing.framework;
    let fixedMockSolution = options.testing.mockSolution;
    let fixedBundleAnalyzer = options.bundleAnalyzer;
    let fixedUiLibrary = options.uiLibrary;

    // 自动修复测试框架
    if (options.buildTool === 'vite' && options.testing.framework === 'jest') {
      fixedTestingFramework = 'vitest';
    } else if (options.buildTool === 'webpack' && options.testing.framework === 'vitest') {
      fixedTestingFramework = 'jest';
    }

    // 自动修复Mock方案
    if (options.buildTool === 'vite' && !['msw', 'vite-plugin-mock'].includes(options.testing.mockSolution)) {
      fixedMockSolution = 'msw';
    } else if (options.buildTool === 'webpack' && !['webpack-proxy', 'mocker-api', 'msw'].includes(options.testing.mockSolution)) {
      fixedMockSolution = 'webpack-proxy';
    }

    // 自动修复打包分析工具
    if (options.buildTool === 'vite') {
      fixedBundleAnalyzer = 'rollup-plugin-visualizer';
    } else {
      fixedBundleAnalyzer = 'webpack-bundle-analyzer';
    }

    // 自动修复UI组件库
    if (!options.uiLibrary) {
      if (options.framework === 'vue2') {
        fixedUiLibrary = 'element-ui';
      } else if (options.framework === 'vue3') {
        fixedUiLibrary = 'element-plus';
      } else if (options.framework === 'react') {
        fixedUiLibrary = 'antd';
      }
    }

    // 返回新的不可变对象
    return {
      ...options,
      testing: {
        ...options.testing,
        framework: fixedTestingFramework,
        mockSolution: fixedMockSolution,
      },
      bundleAnalyzer: fixedBundleAnalyzer,
      uiLibrary: fixedUiLibrary,
    };
  }
}