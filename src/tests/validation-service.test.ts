import assert from "assert";
import { ValidationService } from "../services/validation-service.js";
import { CreateScaffoldParams } from "../types.js";

/**
 * 简单的测试运行器
 */
class TestRunner {
  private tests: Array<{ name: string; fn: () => void | Promise<void> }> = [];

  test(name: string, fn: () => void | Promise<void>) {
    this.tests.push({ name, fn });
  }

  async run() {
    console.log("🧪 Running tests...\n");

    let passed = 0;
    let failed = 0;

    for (const test of this.tests) {
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

    console.log(`\n📊 Results: ${passed} passed, ${failed} failed`);
    return { passed, failed };
  }
}

/**
 * ValidationService 测试套件
 */
async function runValidationServiceTests() {
  const runner = new TestRunner();
  const validationService = new ValidationService();

  runner.test("should validate valid parameters", () => {
    const params: CreateScaffoldParams = {
      projectName: "test-project",
      framework: "vue3",
      language: "typescript",
      buildTool: "vite",
      styleFramework: "tailwind",
      features: ["eslint", "prettier"],
    };

    const result = validationService.validateCreateScaffoldParams(params);
    assert.strictEqual(
      result.success,
      true,
      "Valid parameters should pass validation"
    );
  });

  runner.test("should reject empty project name", () => {
    const params: CreateScaffoldParams = {
      projectName: "",
      framework: "vue3",
    };

    const result = validationService.validateCreateScaffoldParams(params);
    assert.strictEqual(
      result.success,
      false,
      "Empty project name should fail validation"
    );

    if (!result.success) {
      const errors = result.error.details?.errors as any[];
      const projectNameError = errors?.find(
        (e) => e.field === "projectName" && e.code === "REQUIRED"
      );
      assert.ok(projectNameError, "Should have project name required error");
    }
  });

  runner.test("should reject invalid project name characters", () => {
    const params: CreateScaffoldParams = {
      projectName: "test@project!",
      framework: "vue3",
    };

    const result = validationService.validateCreateScaffoldParams(params);
    assert.strictEqual(
      result.success,
      false,
      "Invalid characters should fail validation"
    );

    if (!result.success) {
      const errors = result.error.details?.errors as any[];
      const formatError = errors?.find(
        (e) => e.field === "projectName" && e.code === "INVALID_FORMAT"
      );
      assert.ok(formatError, "Should have invalid format error");
    }
  });

  runner.test("should reject unsupported framework", () => {
    const params: CreateScaffoldParams = {
      projectName: "test-project",
      framework: "invalid-framework",
    };

    const result = validationService.validateCreateScaffoldParams(params);
    assert.strictEqual(
      result.success,
      false,
      "Unsupported framework should fail validation"
    );

    if (!result.success) {
      const errors = result.error.details?.errors as any[];
      const frameworkError = errors?.find(
        (e) => e.field === "framework" && e.code === "UNSUPPORTED"
      );
      assert.ok(frameworkError, "Should have unsupported framework error");
    }
  });

  runner.test("should reject reserved project names", () => {
    const params: CreateScaffoldParams = {
      projectName: "node_modules",
      framework: "vue3",
    };

    const result = validationService.validateCreateScaffoldParams(params);
    assert.strictEqual(
      result.success,
      false,
      "Reserved names should fail validation"
    );

    if (!result.success) {
      const errors = result.error.details?.errors as any[];
      const reservedError = errors?.find(
        (e) => e.field === "projectName" && e.code === "RESERVED_NAME"
      );
      assert.ok(reservedError, "Should have reserved name error");
    }
  });

  runner.test("should validate compatible stack", () => {
    const options = {
      framework: "vue3" as const,
      language: "typescript" as const,
      buildTool: "vite" as const,
      styleFramework: "tailwind" as const,
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
        framework: "vitest" as const,
        mockSolution: "msw" as const,
      },
      bundleAnalyzer: "rollup-plugin-visualizer" as const,
    };

    const result = validationService.validateStackCompatibility(options);
    assert.strictEqual(
      result.isCompatible,
      true,
      "Compatible stack should pass"
    );
    assert.ok(result.score > 80, "Compatible stack should have high score");
  });

  runner.test("should detect UI library incompatibility", () => {
    const options = {
      framework: "react" as const,
      language: "typescript" as const,
      buildTool: "vite" as const,
      styleFramework: "tailwind" as const,
      uiLibrary: "element-plus", // 不兼容react
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
        framework: "vitest" as const,
        mockSolution: "msw" as const,
      },
      bundleAnalyzer: "rollup-plugin-visualizer" as const,
    };

    const result = validationService.validateStackCompatibility(options);
    assert.strictEqual(
      result.isCompatible,
      false,
      "Incompatible UI library should fail"
    );

    const uiError = result.issues.find(
      (i) => i.severity === "error" && i.field === "uiLibrary"
    );
    assert.ok(uiError, "Should have UI library incompatibility error");
  });

  return runner.run();
}

// 运行测试
if (import.meta.url === `file://${process.argv[1]}`) {
  runValidationServiceTests()
    .then(({ passed, failed }) => {
      process.exit(failed > 0 ? 1 : 0);
    })
    .catch((error) => {
      console.error("Test runner failed:", error);
      process.exit(1);
    });
}

export { runValidationServiceTests };
