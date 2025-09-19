import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { ValidateStackParams, ScaffoldOptions } from "../types.js";
import { StackValidator } from "../utils/stackValidator.js";

/**
 * 验证技术栈工具
 */
export const validateStackTool: Tool = {
  name: "validate-stack",
  description: "验证技术栈组合的兼容性和最佳实践",
  inputSchema: {
    type: "object",
    properties: {
      framework: {
        type: "string",
        enum: ["vue3", "vue2", "react"],
        description: "前端框架",
      },
      language: {
        type: "string",
        enum: ["javascript", "typescript"],
        description: "开发语言",
        default: "typescript",
      },
      buildTool: {
        type: "string",
        enum: ["vite", "webpack"],
        description: "构建工具",
      },
      styleFramework: {
        type: "string",
        enum: ["tailwind", "sass", "less"],
        description: "样式方案",
        default: "tailwind",
      },
      uiLibrary: {
        type: "string",
        enum: ["element-ui", "element-plus", "antd"],
        description: "UI组件库",
      },
      features: {
        type: "array",
        items: {
          type: "string",
          enum: [
            "eslint",
            "prettier",
            "lint-staged",
            "commitlint",
            "ls-lint",
            "testing",
            "mock",
            "bundle-analyzer",
          ],
        },
        description: "需要集成的功能特性",
        default: [
          "eslint",
          "prettier",
          "lint-staged",
          "commitlint",
          "ls-lint",
          "testing",
          "mock",
          "bundle-analyzer",
        ],
      },
      testingFramework: {
        type: "string",
        enum: ["vitest", "jest"],
        description: "测试框架",
      },
      mockSolution: {
        type: "string",
        enum: ["msw", "vite-plugin-mock", "webpack-proxy", "mocker-api"],
        description: "Mock方案",
      },
    },
    required: ["framework", "buildTool"],
  },
};

/**
 * 验证技术栈处理函数
 */
export async function handleValidateStack(
  params: ValidateStackParams & {
    language?: string;
    styleFramework?: string;
    uiLibrary?: string;
    features?: string[];
    testingFramework?: string;
    mockSolution?: string;
  }
): Promise<string> {
  try {
    // 构建选项
    const options = buildOptionsFromParams(params);

    // 执行验证
    const validation = StackValidator.validate(options);

    // 获取推荐配置
    const recommendations = StackValidator.getRecommendations(params.framework);

    // 自动修复配置
    const fixedOptions = StackValidator.autoFix(options);

    // 构建响应
    let response = `🔍 **技术栈兼容性验证结果**\n\n`;

    // 验证状态
    if (validation.isValid) {
      response += `✅ **验证状态**: 通过\n`;
    } else {
      response += `❌ **验证状态**: 失败\n`;
    }

    // 当前配置
    response += `\n📋 **当前配置**\n`;
    response += `- 框架: ${options.framework}\n`;
    response += `- 语言: ${options.language}\n`;
    response += `- 构建工具: ${options.buildTool}\n`;
    response += `- 样式方案: ${options.styleFramework}\n`;
    response += `- UI组件库: ${options.uiLibrary || "未指定"}\n`;
    response += `- 测试框架: ${options.testing.framework}\n`;
    response += `- Mock方案: ${options.testing.mockSolution}\n`;
    response += `- 打包分析: ${options.bundleAnalyzer}\n`;

    // 错误信息
    if (validation.errors.length > 0) {
      response += `\n❌ **错误信息** (${validation.errors.length}个)\n`;
      validation.errors.forEach((error, index) => {
        response += `${index + 1}. ${error}\n`;
      });
    }

    // 警告信息
    if (validation.warnings.length > 0) {
      response += `\n⚠️ **警告信息** (${validation.warnings.length}个)\n`;
      validation.warnings.forEach((warning, index) => {
        response += `${index + 1}. ${warning}\n`;
      });
    }

    // 推荐配置
    response += `\n🎯 **推荐配置**\n`;
    response += `- 框架: ${recommendations.framework}\n`;
    response += `- 语言: ${recommendations.language}\n`;
    response += `- 构建工具: ${recommendations.buildTool}\n`;
    response += `- 样式方案: ${recommendations.styleFramework}\n`;
    response += `- UI组件库: ${recommendations.uiLibrary}\n`;
    response += `- 测试框架: ${recommendations.testing?.framework}\n`;
    response += `- Mock方案: ${recommendations.testing?.mockSolution}\n`;

    // 自动修复建议
    const hasChanges = JSON.stringify(options) !== JSON.stringify(fixedOptions);
    if (hasChanges) {
      response += `\n🔧 **自动修复建议**\n`;

      if (options.testing.framework !== fixedOptions.testing.framework) {
        response += `- 测试框架: ${options.testing.framework} → ${fixedOptions.testing.framework}\n`;
      }

      if (options.testing.mockSolution !== fixedOptions.testing.mockSolution) {
        response += `- Mock方案: ${options.testing.mockSolution} → ${fixedOptions.testing.mockSolution}\n`;
      }

      if (options.bundleAnalyzer !== fixedOptions.bundleAnalyzer) {
        response += `- 打包分析: ${options.bundleAnalyzer} → ${fixedOptions.bundleAnalyzer}\n`;
      }

      if (options.uiLibrary !== fixedOptions.uiLibrary) {
        response += `- UI组件库: ${options.uiLibrary || "未指定"} → ${
          fixedOptions.uiLibrary
        }\n`;
      }
    }

    // 最佳实践建议
    response += `\n💡 **最佳实践建议**\n`;
    response += getBestPractices(options);

    // 兼容性评分
    const score = calculateCompatibilityScore(validation);
    response += `\n📊 **兼容性评分**: ${score}/100\n`;
    response += getScoreDescription(score);

    return response;
  } catch (error) {
    return `❌ 验证技术栈失败: ${
      error instanceof Error ? error.message : String(error)
    }`;
  }
}

/**
 * 从参数构建选项
 */
function buildOptionsFromParams(params: any): ScaffoldOptions {
  const features = params.features || [
    "eslint",
    "prettier",
    "lint-staged",
    "commitlint",
    "ls-lint",
    "testing",
    "mock",
    "bundle-analyzer",
  ];

  return {
    framework: params.framework,
    language: params.language || "typescript",
    buildTool: params.buildTool,
    styleFramework: params.styleFramework || "tailwind",
    uiLibrary: params.uiLibrary,
    qualityTools: {
      eslint: features.includes("eslint"),
      prettier: features.includes("prettier"),
      lintStaged: features.includes("lint-staged"),
      commitlint: features.includes("commitlint"),
      lsLint: features.includes("ls-lint"),
      husky: features.includes("lint-staged"),
      editorconfig: true,
    },
    testing: {
      framework:
        params.testingFramework ||
        (params.buildTool === "vite" ? "vitest" : "jest"),
      mockSolution:
        params.mockSolution ||
        (params.buildTool === "vite" ? "msw" : "mocker-api"),
    },
    bundleAnalyzer:
      params.buildTool === "vite"
        ? "rollup-plugin-visualizer"
        : "webpack-bundle-analyzer",
  };
}

/**
 * 获取最佳实践建议
 */
function getBestPractices(options: ScaffoldOptions): string {
  const practices: string[] = [];

  // TypeScript推荐
  if (options.language === "javascript") {
    practices.push("推荐使用TypeScript以获得更好的类型安全和开发体验");
  }

  // 现代构建工具推荐
  if (options.buildTool === "webpack" && options.framework !== "vue2") {
    practices.push("对于新项目，推荐使用Vite以获得更快的开发体验");
  }

  // Tailwind CSS推荐
  if (options.styleFramework !== "tailwind") {
    practices.push("推荐使用Tailwind CSS以提高开发效率和样式一致性");
  }

  // 代码质量工具推荐
  const missingQualityTools = Object.entries(options.qualityTools)
    .filter(([, enabled]) => !enabled)
    .map(([tool]) => tool);

  if (missingQualityTools.length > 0) {
    practices.push(
      `建议启用以下代码质量工具: ${missingQualityTools.join(", ")}`
    );
  }

  // Mock方案推荐
  if (
    options.testing.mockSolution === "webpack-proxy" &&
    options.buildTool === "vite"
  ) {
    practices.push("Vite项目推荐使用MSW或vite-plugin-mock进行API模拟");
  }

  if (practices.length === 0) {
    practices.push("当前配置符合最佳实践！");
  }

  return practices
    .map((practice, index) => `${index + 1}. ${practice}`)
    .join("\n");
}

/**
 * 计算兼容性评分
 */
function calculateCompatibilityScore(
  validation: ReturnType<typeof StackValidator.validate>
): number {
  let score = 100;

  // 错误扣分
  score -= validation.errors.length * 20;

  // 警告扣分
  score -= validation.warnings.length * 5;

  return Math.max(0, score);
}

/**
 * 获取评分描述
 */
function getScoreDescription(score: number): string {
  if (score >= 90) {
    return "🟢 优秀 - 技术栈配置非常合理，可以直接使用";
  } else if (score >= 70) {
    return "🟡 良好 - 技术栈配置基本合理，建议考虑警告建议";
  } else if (score >= 50) {
    return "🟠 一般 - 技术栈存在一些问题，建议进行调整";
  } else {
    return "🔴 较差 - 技术栈存在严重问题，需要重新配置";
  }
}
