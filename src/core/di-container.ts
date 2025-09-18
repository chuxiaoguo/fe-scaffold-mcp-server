/**
 * 简单的依赖注入容器
 * 用于管理服务实例和依赖关系
 */
export interface ServiceConstructor<T = any> {
  new (...args: any[]): T;
}

export interface ServiceFactory<T = any> {
  (): T;
}

export type ServiceDefinition<T = any> =
  | ServiceConstructor<T>
  | ServiceFactory<T>;

/**
 * 依赖注入容器
 */
export class DIContainer {
  private services = new Map<string | symbol, any>();
  private singletons = new Map<string | symbol, any>();
  private factories = new Map<string | symbol, ServiceDefinition>();

  /**
   * 注册服务
   */
  register<T>(
    token: string | symbol,
    definition: ServiceDefinition<T>,
    singleton = true
  ): void {
    this.factories.set(token, definition);
    if (singleton && this.singletons.has(token)) {
      this.singletons.delete(token);
    }
  }

  /**
   * 注册单例服务
   */
  registerSingleton<T>(
    token: string | symbol,
    definition: ServiceDefinition<T>
  ): void {
    this.register(token, definition, true);
  }

  /**
   * 注册实例
   */
  registerInstance<T>(token: string | symbol, instance: T): void {
    this.singletons.set(token, instance);
  }

  /**
   * 解析服务
   */
  resolve<T>(token: string | symbol): T {
    // 检查是否有单例实例
    if (this.singletons.has(token)) {
      return this.singletons.get(token);
    }

    // 检查是否有服务定义
    const factory = this.factories.get(token);
    if (!factory) {
      throw new Error(`Service not found: ${String(token)}`);
    }

    // 创建实例
    const instance = this.createInstance(factory);

    // 如果是单例，保存实例
    if (this.factories.has(token)) {
      this.singletons.set(token, instance);
    }

    return instance;
  }

  /**
   * 检查服务是否已注册
   */
  has(token: string | symbol): boolean {
    return this.factories.has(token) || this.singletons.has(token);
  }

  /**
   * 创建实例
   */
  private createInstance<T>(factory: ServiceDefinition<T>): T {
    if (typeof factory === "function") {
      // 检查是否是构造函数
      if (factory.prototype && factory.prototype.constructor === factory) {
        return new (factory as ServiceConstructor<T>)();
      } else {
        // 工厂函数
        return (factory as ServiceFactory<T>)();
      }
    }
    throw new Error("Invalid service definition");
  }

  /**
   * 清除所有服务
   */
  clear(): void {
    this.services.clear();
    this.singletons.clear();
    this.factories.clear();
  }
}

// 全局容器实例
export const container = new DIContainer();

// 服务token定义
export const SERVICE_TOKENS = {
  // 配置服务
  CONFIG_LOADER: Symbol("ConfigLoader"),
  DEPENDENCY_SERVICE: Symbol("DependencyService"),
  TEMPLATE_SERVICE: Symbol("TemplateService"),

  // 生成器服务
  CONFIG_GENERATOR: Symbol("ConfigGenerator"),
  TEMPLATE_GENERATOR: Symbol("TemplateGenerator"),
  PROJECT_GENERATOR: Symbol("ProjectGenerator"),

  // 工具服务
  FILE_SERVICE: Symbol("FileService"),
  VALIDATION_SERVICE: Symbol("ValidationService"),
  CACHE_SERVICE: Symbol("CacheService"),
  OPTIONS_BUILDER: Symbol("OptionsBuilder"),
  SCRIPT_SERVICE: Symbol("ScriptService"),

  // 业务服务
  SCAFFOLD_SERVICE: Symbol("ScaffoldService"),
  STACK_SERVICE: Symbol("StackService"),
} as const;
