import { promises as fs } from "fs";
import { dirname, join } from "path";
import { GeneratedFile } from "../types.js";

/**
 * 文件操作工具类
 */
export class FileUtils {
  /**
   * 确保目录存在
   */
  static async ensureDir(dirPath: string): Promise<void> {
    try {
      await fs.access(dirPath);
    } catch {
      await fs.mkdir(dirPath, { recursive: true });
    }
  }

  /**
   * 写入文件
   */
  static async writeFile(filePath: string, content: string): Promise<void> {
    const dir = dirname(filePath);
    await this.ensureDir(dir);
    await fs.writeFile(filePath, content, "utf-8");
  }

  /**
   * 批量写入文件
   */
  static async writeFiles(
    outputDir: string,
    files: GeneratedFile[]
  ): Promise<{ success: string[]; failed: { file: string; error: string }[] }> {
    const success: string[] = [];
    const failed: { file: string; error: string }[] = [];

    // 确保输出目录存在
    await this.ensureDir(outputDir);

    for (const file of files) {
      try {
        const fullPath = join(outputDir, file.path);
        await this.writeFile(fullPath, file.content);
        success.push(file.path);
      } catch (error) {
        failed.push({
          file: file.path,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    return { success, failed };
  }

  /**
   * 检查文件是否存在
   */
  static async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 读取文件内容
   */
  static async readFile(filePath: string): Promise<string> {
    return fs.readFile(filePath, "utf-8");
  }

  /**
   * 复制文件
   */
  static async copyFile(src: string, dest: string): Promise<void> {
    const dir = dirname(dest);
    await this.ensureDir(dir);
    await fs.copyFile(src, dest);
  }
}
