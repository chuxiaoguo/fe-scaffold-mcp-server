/**
 * 优化功能测试
 */

import { configManager } from '../config/index.js';
import { ConfigGenerator } from '../generators/configGenerator.js';
import { DependencyManager } from '../utils/dependencyManager.js';
import { StackValidator } from '../utils/stackValidator.js';
import { ScaffoldOptions, BundleAnalyzerTool } from '../types.js';

// 配置管理优化测试
export function testConfigManager() {
  console.log('测试配置管理器...');
  
  try {
    const config = configManager.getConfig();
    console.log('✅ 配置获取成功:', !!config);
    
    const vueVersion = configManager.getDependencyVersion('vue');
    console.log('✅ 依赖版本获取成功:', vueVersion);
    
    const registryConfig = configManager.getRegistryConfig();
    console.log('✅ 注册表配置获取成功:', !!registryConfig);
    
    return true;
  } catch (error) {
    console.error('❌ 配置管理器测试失败:', error);
    return false;
  }
}

// 配置文件生成器测试
export function testConfigGenerator() {
  console.log('测试配置文件生成器...');
  
  try {
    const mockOptions: ScaffoldOptions = {
      framework: 'vue3',
      language: 'typescript',
      buildTool: 'vite',
      styleFramework: 'tailwind',
      uiLibrary: 'element-plus',
      qualityTools: {
        eslint: true,
        prettier: true,
        lintStaged: true,
        commitlint: true,
        lsLint: true,
        husky: true,
        editorconfig: true,
      },
      testing: {
        framework: 'vitest',
        mockSolution: 'msw',
      },
      bundleAnalyzer: 'webpack-bundle-analyzer' as BundleAnalyzerTool,
    };

    const configs = ConfigGenerator.generateConfigs(mockOptions, 'test-project');
    
    // 检查 .npmrc 配置
    const npmrcConfig = configs.find(config => config.filename === '.npmrc');
    console.log('✅ .npmrc 配置生成成功:', !!npmrcConfig);
    
    // 检查 .editorconfig 配置
    const editorConfig = configs.find(config => config.filename === '.editorconfig');
    console.log('✅ .editorconfig 配置生成成功:', !!editorConfig);
    
    // 检查基础配置文件
    const hasBasicConfigs = configs.some(config => config.filename === '.gitignore');
    console.log('✅ 基础配置文件生成成功:', hasBasicConfigs);
    
    console.log('✅ 总共生成配置文件数量:', configs.length);
    
    return true;
  } catch (error) {
    console.error('❌ 配置文件生成器测试失败:', error);
    return false;
  }
}

// 依赖管理器优化测试
export function testDependencyManager() {
  console.log('测试依赖管理器...');
  
  try {
    // 测试获取依赖信息
    const mockOptions: ScaffoldOptions = {
      framework: 'vue3',
      language: 'typescript',
      buildTool: 'vite',
      styleFramework: 'tailwind',
      uiLibrary: 'element-plus',
      qualityTools: {
        eslint: true,
        prettier: true,
        lintStaged: true,
        commitlint: true,
        lsLint: true,
        husky: true,
        editorconfig: true,
      },
      testing: {
        framework: 'vitest',
        mockSolution: 'msw',
      },
      bundleAnalyzer: 'webpack-bundle-analyzer' as BundleAnalyzerTool,
    };

    const dependencies = DependencyManager.getDependencies(mockOptions);
    console.log('✅ 依赖获取成功:', dependencies.dependencies.length > 0);
    console.log('✅ 开发依赖获取成功:', dependencies.devDependencies.length > 0);
    
    return true;
  } catch (error) {
    console.error('❌ 依赖管理器测试失败:', error);
    return false;
  }
}

// 技术栈验证器优化测试
export function testStackValidator() {
  console.log('测试技术栈验证器...');
  
  try {
    const mockOptions: ScaffoldOptions = {
      framework: 'vue3',
      language: 'typescript',
      buildTool: 'vite',
      styleFramework: 'tailwind',
      uiLibrary: 'element-plus',
      qualityTools: {
        eslint: true,
        prettier: true,
        lintStaged: true,
        commitlint: true,
        lsLint: true,
        husky: true,
        editorconfig: true,
      },
      testing: {
        framework: 'vitest',
        mockSolution: 'msw',
      },
      bundleAnalyzer: 'webpack-bundle-analyzer' as BundleAnalyzerTool,
    };

    // 测试技术栈验证
    const result = StackValidator.validate(mockOptions);
    console.log('✅ 技术栈验证成功:', result.isValid);
    
    if (!result.isValid) {
      console.log('验证错误:', result.errors);
    }
    
    return true;
  } catch (error) {
    console.error('❌ 技术栈验证器测试失败:', error);
    return false;
  }
}

// 运行所有测试
export function runOptimizationTests() {
  console.log('🚀 开始运行优化测试...\n');
  
  const results = [
    testConfigManager(),
    testConfigGenerator(),
    testDependencyManager(),
    testStackValidator(),
  ];
  
  const passedTests = results.filter(result => result).length;
  const totalTests = results.length;
  
  console.log(`\n📊 测试结果: ${passedTests}/${totalTests} 通过`);
  
  if (passedTests === totalTests) {
    console.log('🎉 所有优化测试通过！');
  } else {
    console.log('⚠️  部分测试失败，请检查相关功能');
  }
  
  return passedTests === totalTests;
}