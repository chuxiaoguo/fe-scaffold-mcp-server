/**
 * 统一错误处理机制
 */

export enum ErrorCode {
  // 通用错误
  UNKNOWN_ERROR = "UNKNOWN_ERROR",
  INVALID_INPUT = "INVALID_INPUT",
  VALIDATION_FAILED = "VALIDATION_FAILED",

  // 配置错误
  CONFIG_NOT_FOUND = "CONFIG_NOT_FOUND",
  CONFIG_INVALID = "CONFIG_INVALID",
  TEMPLATE_NOT_FOUND = "TEMPLATE_NOT_FOUND",

  // 文件系统错误
  FILE_NOT_FOUND = "FILE_NOT_FOUND",
  FILE_WRITE_FAILED = "FILE_WRITE_FAILED",
  FILE_READ_FAILED = "FILE_READ_FAILED",
  DIRECTORY_CREATE_FAILED = "DIRECTORY_CREATE_FAILED",

  // 依赖管理错误
  DEPENDENCY_RESOLUTION_FAILED = "DEPENDENCY_RESOLUTION_FAILED",
  VERSION_CONFLICT = "VERSION_CONFLICT",

  // 技术栈验证错误
  STACK_INCOMPATIBLE = "STACK_INCOMPATIBLE",
  FRAMEWORK_NOT_SUPPORTED = "FRAMEWORK_NOT_SUPPORTED",
  BUILD_TOOL_NOT_SUPPORTED = "BUILD_TOOL_NOT_SUPPORTED",

  // 项目生成错误
  PROJECT_GENERATION_FAILED = "PROJECT_GENERATION_FAILED",
  TEMPLATE_GENERATION_FAILED = "TEMPLATE_GENERATION_FAILED",
  CONFIG_GENERATION_FAILED = "CONFIG_GENERATION_FAILED",
}

export class ScaffoldError extends Error {
  public readonly code: ErrorCode;
  public readonly details?: Record<string, unknown>;
  public readonly timestamp: Date;

  constructor(
    code: ErrorCode,
    message: string,
    details?: Record<string, unknown>,
    cause?: Error
  ) {
    super(message);
    this.name = "ScaffoldError";
    this.code = code;
    this.details = details;
    this.timestamp = new Date();

    if (cause) {
      this.cause = cause;
    }
  }

  /**
   * 转换为JSON格式
   */
  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      details: this.details,
      timestamp: this.timestamp.toISOString(),
      stack: this.stack,
    };
  }

  /**
   * 转换为用户友好的消息
   */
  toUserMessage(): string {
    const codeMessages: Record<ErrorCode, string> = {
      [ErrorCode.UNKNOWN_ERROR]: "发生了未知错误",
      [ErrorCode.INVALID_INPUT]: "输入参数无效",
      [ErrorCode.VALIDATION_FAILED]: "验证失败",
      [ErrorCode.CONFIG_NOT_FOUND]: "配置文件未找到",
      [ErrorCode.CONFIG_INVALID]: "配置文件格式无效",
      [ErrorCode.TEMPLATE_NOT_FOUND]: "模板未找到",
      [ErrorCode.FILE_NOT_FOUND]: "文件未找到",
      [ErrorCode.FILE_WRITE_FAILED]: "文件写入失败",
      [ErrorCode.FILE_READ_FAILED]: "文件读取失败",
      [ErrorCode.DIRECTORY_CREATE_FAILED]: "目录创建失败",
      [ErrorCode.DEPENDENCY_RESOLUTION_FAILED]: "依赖解析失败",
      [ErrorCode.VERSION_CONFLICT]: "版本冲突",
      [ErrorCode.STACK_INCOMPATIBLE]: "技术栈不兼容",
      [ErrorCode.FRAMEWORK_NOT_SUPPORTED]: "不支持的框架",
      [ErrorCode.BUILD_TOOL_NOT_SUPPORTED]: "不支持的构建工具",
      [ErrorCode.PROJECT_GENERATION_FAILED]: "项目生成失败",
      [ErrorCode.TEMPLATE_GENERATION_FAILED]: "模板生成失败",
      [ErrorCode.CONFIG_GENERATION_FAILED]: "配置生成失败",
    };

    const baseMessage = codeMessages[this.code] || this.message;
    return this.details
      ? `${baseMessage}: ${JSON.stringify(this.details)}`
      : baseMessage;
  }
}

/**
 * 简化的结果类型
 */
export interface SuccessResult<T> {
  success: true;
  data: T;
  error?: never;
}

export interface FailureResult<E = ScaffoldError> {
  success: false;
  data?: never;
  error: E;
}

export type Result<T, E = ScaffoldError> = SuccessResult<T> | FailureResult<E>;

/**
 * 结果工具类
 */
export class ResultUtils {
  /**
   * 创建成功结果
   */
  static success<T>(data: T): SuccessResult<T> {
    return { success: true, data };
  }

  /**
   * 创建失败结果
   */
  static failure<E = ScaffoldError>(error: E): FailureResult<E> {
    return { success: false, error };
  }

  /**
   * 检查是否成功
   */
  static isSuccess<T, E>(result: Result<T, E>): result is SuccessResult<T> {
    return result.success;
  }

  /**
   * 检查是否失败
   */
  static isFailure<T, E>(result: Result<T, E>): result is FailureResult<E> {
    return !result.success;
  }
}

/**
 * 错误处理工具类
 */
export class ErrorHandler {
  /**
   * 包装异步操作
   */
  static async wrap<T>(
    operation: () => Promise<T>,
    code: ErrorCode,
    context?: Record<string, unknown>
  ): Promise<Result<T>> {
    try {
      const result = await operation();
      return ResultUtils.success(result);
    } catch (error) {
      const scaffoldError = new ScaffoldError(
        code,
        error instanceof Error ? error.message : String(error),
        context,
        error instanceof Error ? error : undefined
      );
      return ResultUtils.failure(scaffoldError);
    }
  }

  /**
   * 包装同步操作
   */
  static wrapSync<T>(
    operation: () => T,
    code: ErrorCode,
    context?: Record<string, unknown>
  ): Result<T> {
    try {
      const result = operation();
      return ResultUtils.success(result);
    } catch (error) {
      const scaffoldError = new ScaffoldError(
        code,
        error instanceof Error ? error.message : String(error),
        context,
        error instanceof Error ? error : undefined
      );
      return ResultUtils.failure(scaffoldError);
    }
  }

  /**
   * 创建验证错误
   */
  static validationError(
    field: string,
    message: string,
    value?: unknown
  ): ScaffoldError {
    return new ScaffoldError(
      ErrorCode.VALIDATION_FAILED,
      `Validation failed for field '${field}': ${message}`,
      { field, value }
    );
  }

  /**
   * 创建文件操作错误
   */
  static fileError(
    operation: string,
    path: string,
    cause?: Error
  ): ScaffoldError {
    return new ScaffoldError(
      operation === "read"
        ? ErrorCode.FILE_READ_FAILED
        : ErrorCode.FILE_WRITE_FAILED,
      `File ${operation} failed for: ${path}`,
      { operation, path },
      cause
    );
  }
}
