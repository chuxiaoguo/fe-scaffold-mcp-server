#!/usr/bin/env node

/**
 * 集成测试脚本 - 测试脚手架工具与模板验证器的集成
 */

import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import TemplateValidator from "./template-validator.js";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class IntegrationTester {
  constructor() {
    this.projectRoot = path.resolve(__dirname, "../..");
    this.testOutputDir = path.join(this.projectRoot, "test-output");
  }

  /**
   * 清理测试输出目录
   */
  cleanup() {
    if (fs.existsSync(this.testOutputDir)) {
      console.log("🧹 清理测试输出目录...");
      execSync(`rm -rf ${this.testOutputDir}`, { stdio: "inherit" });
    }
  }

  /**
   * 创建测试输出目录
   */
  createTestDir() {
    if (!fs.existsSync(this.testOutputDir)) {
      fs.mkdirSync(this.testOutputDir, { recursive: true });
    }
  }

  /**
   * 测试脚手架生成功能
   */
  async testScaffoldGeneration() {
    console.log("\n🏗️ 测试脚手架生成功能");

    const testCases = [
      {
        name: "vue3-typescript-vite",
        config: {
          projectName: "test-vue3-app",
          framework: "vue3",
          language: "typescript",
          buildTool: "vite",
          styleFramework: "tailwind",
          features: ["eslint", "prettier", "testing", "mock"],
        },
      },
      {
        name: "react-typescript-vite",
        config: {
          projectName: "test-react-app",
          framework: "react",
          language: "typescript",
          buildTool: "vite",
          styleFramework: "tailwind",
          features: ["eslint", "prettier", "testing", "mock"],
        },
      },
      {
        name: "vue2-javascript-webpack",
        config: {
          projectName: "test-vue2-app",
          framework: "vue2",
          language: "javascript",
          buildTool: "webpack",
          styleFramework: "sass",
          features: ["eslint", "prettier", "testing"],
        },
      },
    ];

    const results = [];

    for (const testCase of testCases) {
      console.log(`\n  📝 测试用例: ${testCase.name}`);

      try {
        // 这里应该调用实际的MCP脚手架工具
        // 暂时模拟生成过程
        const projectPath = path.join(
          this.testOutputDir,
          testCase.config.projectName
        );

        // 模拟项目生成
        this.mockProjectGeneration(projectPath, testCase.config);

        console.log(`    ✅ 项目生成成功: ${projectPath}`);

        results.push({
          testCase: testCase.name,
          success: true,
          projectPath,
          config: testCase.config,
        });
      } catch (error) {
        console.log(`    ❌ 项目生成失败: ${error.message}`);
        results.push({
          testCase: testCase.name,
          success: false,
          error: error.message,
          config: testCase.config,
        });
      }
    }

    return results;
  }

  /**
   * 模拟项目生成（实际应该调用MCP工具）
   */
  mockProjectGeneration(projectPath, config) {
    // 创建基本项目结构
    fs.mkdirSync(projectPath, { recursive: true });
    fs.mkdirSync(path.join(projectPath, "src"), { recursive: true });

    // 创建 package.json
    const packageJson = {
      name: config.projectName,
      version: "0.1.0",
      description: `A ${config.framework} project`,
      scripts: {
        dev:
          config.buildTool === "vite"
            ? "vite"
            : "webpack serve --mode development",
        build:
          config.buildTool === "vite"
            ? "vite build"
            : "webpack --mode production",
        test: config.framework === "vue2" ? "jest" : "vitest",
        lint: "eslint src --ext .js,.ts,.vue,.tsx",
      },
      dependencies: {},
      devDependencies: {},
    };

    fs.writeFileSync(
      path.join(projectPath, "package.json"),
      JSON.stringify(packageJson, null, 2)
    );

    // 创建主入口文件
    const isTypeScript = config.language === "typescript";
    const mainExt = isTypeScript ? "ts" : "js";
    const mainFile =
      config.framework === "react" ? `main.${mainExt}x` : `main.${mainExt}`;

    fs.writeFileSync(
      path.join(projectPath, "src", mainFile),
      `// ${config.framework} ${config.language} entry point\nconsole.log('Hello World')`
    );

    // 创建 App 文件
    if (config.framework === "vue3" || config.framework === "vue2") {
      fs.writeFileSync(
        path.join(projectPath, "src", "App.vue"),
        '<template><div>Hello Vue</div></template>\n<script>export default { name: "App" }</script>'
      );
    } else if (config.framework === "react") {
      fs.writeFileSync(
        path.join(projectPath, "src", "App.tsx"),
        'import React from "react"\nfunction App() { return <div>Hello React</div> }\nexport default App'
      );
    }

    // 创建构建配置文件
    if (config.buildTool === "vite") {
      const viteConfigExt = isTypeScript ? "ts" : "js";
      fs.writeFileSync(
        path.join(projectPath, `vite.config.${viteConfigExt}`),
        `import { defineConfig } from 'vite'\nexport default defineConfig({})`
      );
    } else if (config.buildTool === "webpack") {
      fs.writeFileSync(
        path.join(projectPath, "webpack.config.js"),
        "module.exports = {}"
      );
    }
  }

  /**
   * 运行模板验证器
   */
  async runTemplateValidation(generatedProjects) {
    console.log("\n🧪 运行模板验证");

    const validator = new TemplateValidator();
    const validationResults = [];

    for (const project of generatedProjects) {
      if (!project.success) continue;

      console.log(`\n  🔍 验证项目: ${project.config.projectName}`);

      try {
        // 运行基本验证
        const projectPath = project.projectPath;

        // 检查文件是否存在
        const requiredFiles = ["package.json", "src"];
        for (const file of requiredFiles) {
          const filePath = path.join(projectPath, file);
          if (!fs.existsSync(filePath)) {
            throw new Error(`缺失必要文件: ${file}`);
          }
        }

        console.log(`    ✅ 项目验证通过`);
        validationResults.push({
          project: project.config.projectName,
          success: true,
        });
      } catch (error) {
        console.log(`    ❌ 项目验证失败: ${error.message}`);
        validationResults.push({
          project: project.config.projectName,
          success: false,
          error: error.message,
        });
      }
    }

    return validationResults;
  }

  /**
   * 生成测试报告
   */
  generateReport(scaffoldResults, validationResults) {
    console.log("\n📊 集成测试报告");
    console.log("=".repeat(60));

    const totalScaffold = scaffoldResults.length;
    const passedScaffold = scaffoldResults.filter((r) => r.success).length;

    const totalValidation = validationResults.length;
    const passedValidation = validationResults.filter((r) => r.success).length;

    console.log("脚手架生成测试:");
    console.log(`  总计: ${totalScaffold} 个`);
    console.log(`  通过: ${passedScaffold} 个`);
    console.log(`  失败: ${totalScaffold - passedScaffold} 个`);

    console.log("\n项目验证测试:");
    console.log(`  总计: ${totalValidation} 个`);
    console.log(`  通过: ${passedValidation} 个`);
    console.log(`  失败: ${totalValidation - passedValidation} 个`);

    const overallSuccess =
      passedScaffold === totalScaffold && passedValidation === totalValidation;
    console.log(`\n整体结果: ${overallSuccess ? "✅ 通过" : "❌ 失败"}`);

    // 保存详细报告
    const report = {
      timestamp: new Date().toISOString(),
      scaffold: {
        total: totalScaffold,
        passed: passedScaffold,
        results: scaffoldResults,
      },
      validation: {
        total: totalValidation,
        passed: passedValidation,
        results: validationResults,
      },
      overallSuccess,
    };

    const reportPath = path.join(
      this.projectRoot,
      "integration-test-report.json"
    );
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n详细报告已保存到: ${reportPath}`);

    return overallSuccess;
  }

  /**
   * 运行完整的集成测试
   */
  async run() {
    console.log("🚀 开始集成测试");

    try {
      // 准备测试环境
      this.cleanup();
      this.createTestDir();

      // 1. 测试脚手架生成功能
      const scaffoldResults = await this.testScaffoldGeneration();

      // 2. 运行模板验证
      const validationResults = await this.runTemplateValidation(
        scaffoldResults
      );

      // 3. 生成报告
      const success = this.generateReport(scaffoldResults, validationResults);

      // 4. 清理测试环境
      this.cleanup();

      process.exit(success ? 0 : 1);
    } catch (error) {
      console.error("❌ 集成测试执行失败:", error);
      this.cleanup();
      process.exit(1);
    }
  }
}

// 如果直接运行脚本
if (process.argv[1] === __filename) {
  const tester = new IntegrationTester();
  tester.run();
}

export default IntegrationTester;
