import { OptionsBuilder } from "../services/options-builder.js";
import { CreateScaffoldParams, ScaffoldOptions } from "../types.js";

/**
 * 简单的断言函数
 */
function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

/**
 * OptionsBuilder 测试
 */
export async function testOptionsBuilder(): Promise<{
  passed: number;
  failed: number;
}> {
  console.log("🧪 Testing OptionsBuilder...\n");

  let passed = 0;
  let failed = 0;

  const recommendations = {
    vue3: {
      framework: "vue3" as const,
      language: "typescript" as const,
      buildTool: "vite" as const,
      styleFramework: "tailwind" as const,
      uiLibrary: "element-plus",
    },
    react: {
      framework: "react" as const,
      language: "typescript" as const,
      buildTool: "vite" as const,
      styleFramework: "tailwind" as const,
      uiLibrary: "antd",
    },
  };

  const builder = new OptionsBuilder(recommendations);

  const tests = [
    {
      name: "should build options from create params",
      fn: () => {
        const params: CreateScaffoldParams = {
          projectName: "test-project",
          framework: "vue3",
          language: "typescript",
          buildTool: "vite",
        };

        const options = builder.buildFromCreateParams(params);

        assert(options.framework === "vue3", "Framework should be vue3");
        assert(
          options.language === "typescript",
          "Language should be typescript"
        );
        assert(options.buildTool === "vite", "Build tool should be vite");
        assert(
          options.styleFramework === "tailwind",
          "Style framework should default to tailwind"
        );
        assert(
          options.uiLibrary === "element-plus",
          "UI library should be recommended value"
        );
      },
    },
    {
      name: "should use defaults when params are missing",
      fn: () => {
        const params: CreateScaffoldParams = {
          projectName: "test-project",
          framework: "react",
        };

        const options = builder.buildFromCreateParams(params);

        assert(options.framework === "react", "Framework should be react");
        assert(
          options.language === "typescript",
          "Language should default to typescript"
        );
        assert(
          options.buildTool === "vite",
          "Build tool should default to vite"
        );
        assert(
          options.styleFramework === "tailwind",
          "Style framework should default to tailwind"
        );
        assert(
          options.uiLibrary === "antd",
          "UI library should be recommended value"
        );
      },
    },
    {
      name: "should build quality tools config from features",
      fn: () => {
        const params: CreateScaffoldParams = {
          projectName: "test-project",
          framework: "vue3",
          features: ["eslint", "prettier", "lint-staged"],
        };

        const options = builder.buildFromCreateParams(params);

        assert(
          options.qualityTools.eslint === true,
          "ESLint should be enabled"
        );
        assert(
          options.qualityTools.prettier === true,
          "Prettier should be enabled"
        );
        assert(
          options.qualityTools.lintStaged === true,
          "Lint-staged should be enabled"
        );
        assert(
          options.qualityTools.commitlint === false,
          "Commitlint should be disabled"
        );
        assert(
          options.qualityTools.editorconfig === true,
          "EditorConfig should be enabled by default"
        );
      },
    },
    {
      name: "should build testing config based on build tool",
      fn: () => {
        const viteParams: CreateScaffoldParams = {
          projectName: "vite-project",
          framework: "vue3",
          buildTool: "vite",
        };

        const webpackParams: CreateScaffoldParams = {
          projectName: "webpack-project",
          framework: "vue3",
          buildTool: "webpack",
        };

        const viteOptions = builder.buildFromCreateParams(viteParams);
        const webpackOptions = builder.buildFromCreateParams(webpackParams);

        assert(
          viteOptions.testing.framework === "vitest",
          "Vite should use Vitest"
        );
        assert(
          webpackOptions.testing.framework === "jest",
          "Webpack should use Jest"
        );
      },
    },
    {
      name: "should auto-fix incompatible options",
      fn: () => {
        const incompatibleOptions: ScaffoldOptions = {
          framework: "vue3",
          language: "typescript",
          buildTool: "vite",
          styleFramework: "tailwind",
          uiLibrary: undefined,
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
            framework: "jest", // 不适合Vite
            mockSolution: "webpack-proxy", // 不适合Vite
          },
          bundleAnalyzer: "webpack-bundle-analyzer", // 不适合Vite
        };

        const fixedOptions = builder.autoFixOptions(incompatibleOptions);

        assert(
          fixedOptions.testing.framework === "vitest",
          "Should fix testing framework to Vitest"
        );
        assert(
          fixedOptions.testing.mockSolution === "msw",
          "Should fix mock solution to MSW"
        );
        assert(
          fixedOptions.bundleAnalyzer === "rollup-plugin-visualizer",
          "Should fix bundle analyzer"
        );
        assert(
          fixedOptions.uiLibrary === "element-plus",
          "Should set recommended UI library"
        );
      },
    },
    {
      name: "should validate options completeness",
      fn: () => {
        const completeOptions: ScaffoldOptions = {
          framework: "vue3",
          language: "typescript",
          buildTool: "vite",
          styleFramework: "tailwind",
          uiLibrary: "element-plus",
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
            framework: "vitest",
            mockSolution: "msw",
          },
          bundleAnalyzer: "rollup-plugin-visualizer",
        };

        const incompleteOptions = {
          framework: "vue3",
          // 缺少其他必需字段
        } as any;

        const completeValidation = builder.validateOptions(completeOptions);
        const incompleteValidation = builder.validateOptions(incompleteOptions);

        assert(
          completeValidation.isValid === true,
          "Complete options should be valid"
        );
        assert(
          incompleteValidation.isValid === false,
          "Incomplete options should be invalid"
        );
        assert(
          incompleteValidation.missingFields.length > 0,
          "Should identify missing fields"
        );
      },
    },
    {
      name: "should merge options correctly",
      fn: () => {
        const base: Partial<ScaffoldOptions> = {
          framework: "vue3" as const,
          language: "javascript" as const,
          qualityTools: {
            eslint: true,
            prettier: false,
            lintStaged: false,
            commitlint: false,
            lsLint: false,
            husky: false,
            editorconfig: false,
          },
        };

        const overrides: Partial<ScaffoldOptions> = {
          language: "typescript" as const,
          qualityTools: {
            eslint: false,
            prettier: true,
            lintStaged: true,
            commitlint: false,
            lsLint: false,
            husky: false,
            editorconfig: false,
          },
        };

        const merged = builder.mergeOptions(base, overrides);

        assert(merged.framework === "vue3", "Should keep base framework");
        assert(merged.language === "typescript", "Should override language");
        assert(
          merged.qualityTools?.eslint === false,
          "Should override eslint setting"
        );
        assert(
          merged.qualityTools?.prettier === true,
          "Should override prettier setting"
        );
        assert(
          merged.qualityTools?.lintStaged === true,
          "Should add new lintStaged setting"
        );
      },
    },
  ];

  for (const test of tests) {
    try {
      await test.fn();
      console.log(`✅ ${test.name}`);
      passed++;
    } catch (error) {
      console.log(`❌ ${test.name}`);
      console.log(
        `   Error: ${error instanceof Error ? error.message : String(error)}`
      );
      failed++;
    }
  }

  console.log(
    `\n📊 OptionsBuilder Results: ${passed} passed, ${failed} failed`
  );
  return { passed, failed };
}
