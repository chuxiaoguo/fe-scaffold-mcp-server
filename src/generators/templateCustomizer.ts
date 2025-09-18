import { promises as fs } from "fs";
import { join } from "path";
import { ScaffoldOptions } from "../types.js";
import { DependencyManager } from "../utils/dependencyManager.js";

/**
 * 模板定制器 - 负责根据配置定制模板文件
 */
export class TemplateCustomizer {
  /**
   * 定制模板文件
   */
  static async customizeTemplate(
    targetPath: string,
    options: ScaffoldOptions,
    projectName: string
  ): Promise<{ success: string[]; failed: { file: string; error: string }[] }> {
    const result = {
      success: [] as string[],
      failed: [] as { file: string; error: string }[],
    };

    try {
      // 1. 定制 package.json
      await this.customizePackageJson(targetPath, options, projectName, result);

      // 2. 定制模板文件中的占位符
      await this.replacePlaceholders(targetPath, options, projectName, result);

      // 3. 根据选项添加或删除文件
      await this.addOptionalFiles(targetPath, options, result);

      return result;
    } catch (error) {
      result.failed.push({
        file: "template",
        error: `模板定制失败: ${
          error instanceof Error ? error.message : String(error)
        }`,
      });
      return result;
    }
  }

  /**
   * 定制 package.json 文件
   */
  private static async customizePackageJson(
    targetPath: string,
    options: ScaffoldOptions,
    projectName: string,
    result: { success: string[]; failed: { file: string; error: string }[] }
  ): Promise<void> {
    const packageJsonPath = join(targetPath, "package.json");

    try {
      const content = await fs.readFile(packageJsonPath, "utf-8");
      
      // 调试信息：打印完整的原始内容
      console.log("[DEBUG] Raw package.json content:");
      console.log(content);
      console.log("[DEBUG] End of raw content");
      
      const packageJson = JSON.parse(content);

      // 调试信息：打印初始状态
      console.log("[DEBUG] Initial package.json dependencies:", packageJson.dependencies);
      
      // 获取依赖信息
      const { dependencies, devDependencies } =
        DependencyManager.getDependencies(options);
      const scripts = DependencyManager.generateScripts(options);

      // 调试信息：打印DependencyManager生成的依赖
      console.log("[DEBUG] DependencyManager dependencies:", dependencies.map(d => `${d.name}@${d.version}`));
      
      // 更新 package.json
      packageJson.name = projectName;
      packageJson.scripts = { ...packageJson.scripts, ...scripts };

      // 合并依赖
      packageJson.dependencies = packageJson.dependencies || {};
      packageJson.devDependencies = packageJson.devDependencies || {};

      // 调试信息：打印删除占位符后的状态
      console.log("[DEBUG] After deleting placeholders:", packageJson.dependencies);

      dependencies.forEach((dep) => {
        packageJson.dependencies[dep.name] = dep.version;
      });

      devDependencies.forEach((dep) => {
        packageJson.devDependencies[dep.name] = dep.version;
      });

      // 更新关键词
      packageJson.keywords = [
        options.framework,
        options.buildTool,
        options.language,
        options.styleFramework,
        ...(options.uiLibrary ? [options.uiLibrary] : []),
      ];

      // 调试信息：打印最终结果
      console.log("[DEBUG] Final package.json dependencies:", packageJson.dependencies);

      // 写入更新的 package.json
      await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));
      result.success.push("package.json");
    } catch (error) {
      result.failed.push({
        file: "package.json",
        error: `定制 package.json 失败: ${
          error instanceof Error ? error.message : String(error)
        }`,
      });
    }
  }

  /**
   * 替换模板文件中的占位符
   */
  private static async replacePlaceholders(
    targetPath: string,
    options: ScaffoldOptions,
    projectName: string,
    result: { success: string[]; failed: { file: string; error: string }[] }
  ): Promise<void> {
    // 定义占位符替换映射
    const placeholders = {
      "{{PROJECT_NAME}}": projectName,
      "{{FRAMEWORK}}": options.framework.toUpperCase(),
      "{{BUILD_TOOL}}": options.buildTool.toUpperCase(),
      "{{LANGUAGE}}": options.language.toUpperCase(),
      "{{STYLE_FRAMEWORK}}": options.styleFramework.toUpperCase(),
      "{{UI_LIBRARY}}": options.uiLibrary || "",
      "{{TESTING_FRAMEWORK}}": options.testing.framework || "vitest",
    };

    try {
      // 需要替换的文件扩展名
      const textFileExtensions = [
        ".html",
        ".vue",
        ".tsx",
        ".ts",
        ".js",
        ".jsx",
        ".css",
        ".scss",
        ".less",
        ".md",
      ];

      await this.replaceInDirectory(
        targetPath,
        placeholders,
        textFileExtensions,
        result
      );
    } catch (error) {
      result.failed.push({
        file: "placeholders",
        error: `替换占位符失败: ${
          error instanceof Error ? error.message : String(error)
        }`,
      });
    }
  }

  /**
   * 在目录中递归替换占位符
   */
  private static async replaceInDirectory(
    dirPath: string,
    placeholders: Record<string, string>,
    textFileExtensions: string[],
    result: { success: string[]; failed: { file: string; error: string }[] }
  ): Promise<void> {
    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = join(dirPath, entry.name);

        if (entry.isDirectory()) {
          // 递归处理子目录
          await this.replaceInDirectory(
            fullPath,
            placeholders,
            textFileExtensions,
            result
          );
        } else {
          // 检查是否是需要处理的文本文件
          const shouldProcess = textFileExtensions.some((ext) =>
            entry.name.endsWith(ext)
          );

          if (shouldProcess) {
            try {
              await this.replaceInFile(fullPath, placeholders);
              result.success.push(this.getRelativePath(fullPath));
            } catch (error) {
              result.failed.push({
                file: this.getRelativePath(fullPath),
                error: error instanceof Error ? error.message : String(error),
              });
            }
          }
        }
      }
    } catch (error) {
      result.failed.push({
        file: this.getRelativePath(dirPath),
        error: `处理目录失败: ${
          error instanceof Error ? error.message : String(error)
        }`,
      });
    }
  }

  /**
   * 在单个文件中替换占位符
   */
  private static async replaceInFile(
    filePath: string,
    placeholders: Record<string, string>
  ): Promise<void> {
    let content = await fs.readFile(filePath, "utf-8");

    // 替换所有占位符
    for (const [placeholder, replacement] of Object.entries(placeholders)) {
      content = content.replaceAll(placeholder, replacement);
    }

    await fs.writeFile(filePath, content, "utf-8");
  }

  /**
   * 添加可选文件
   */
  private static async addOptionalFiles(
    targetPath: string,
    options: ScaffoldOptions,
    result: { success: string[]; failed: { file: string; error: string }[] }
  ): Promise<void> {
    try {
      // 根据选项添加特定文件
      const filesToAdd = this.getOptionalFiles(options);

      for (const fileInfo of filesToAdd) {
        try {
          const filePath = join(targetPath, fileInfo.path);

          // 确保目录存在
          await fs.mkdir(join(filePath, ".."), { recursive: true });

          // 写入文件
          await fs.writeFile(filePath, fileInfo.content);
          result.success.push(fileInfo.path);
        } catch (error) {
          result.failed.push({
            file: fileInfo.path,
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }
    } catch (error) {
      result.failed.push({
        file: "optional-files",
        error: `添加可选文件失败: ${
          error instanceof Error ? error.message : String(error)
        }`,
      });
    }
  }

  /**
   * 获取可选文件列表
   */
  private static getOptionalFiles(
    options: ScaffoldOptions
  ): Array<{ path: string; content: string }> {
    const files: Array<{ path: string; content: string }> = [];

    // Git忽略文件
    files.push({
      path: ".gitignore",
      content: `# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Production builds
dist/
build/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
logs
*.log

# Coverage
coverage/
.nyc_output/

# TypeScript
*.tsbuildinfo
`,
    });

    // README
    files.push({
      path: "README.md",
      content: `# ${options.framework.toUpperCase()} Project

这是一个使用 fe-scaffold-mcp-server 生成的 ${options.framework} 项目。

## 技术栈

- 框架: ${options.framework}
- 构建工具: ${options.buildTool}
- 语言: ${options.language}
- 样式方案: ${options.styleFramework}
${options.uiLibrary ? `- UI组件库: ${options.uiLibrary}` : ""}
- 测试框架: ${options.testing.framework}

## 开发

\`\`\`bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 运行测试
npm run test
\`\`\`

## 代码质量

\`\`\`bash
# 代码检查
npm run lint

# 代码格式化
npm run format
\`\`\`
`,
    });

    return files;
  }

  /**
   * 获取相对路径
   */
  private static getRelativePath(fullPath: string): string {
    const cwd = process.cwd();
    return fullPath.startsWith(cwd)
      ? fullPath.substring(cwd.length + 1)
      : fullPath;
  }
}
