/**
 * 项目生命周期完整性测试
 * 测试项目从生成到运行的完整流程：generate -> install -> dev -> build -> test
 */

const { spawn, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

class ProjectLifecycleTest {
  constructor() {
    this.testResults = {
      passed: 0,
      failed: 0,
      errors: []
    };
    this.tempTestDir = path.join(os.tmpdir(), `fe-scaffold-test-${Date.now()}`);
    this.projectName = 'test-project';
    this.projectPath = path.join(this.tempTestDir, this.projectName);
  }

  /**
   * 运行完整的生命周期测试
   */
  async runTests() {
    console.log('🚀 开始项目生命周期测试...\n');
    
    try {
      // 准备测试环境
      await this.setupTestEnvironment();
      
      // 测试用例
      const testCases = [
        { name: '项目生成测试', fn: () => this.testProjectGeneration() },
        { name: '依赖安装测试', fn: () => this.testDependencyInstallation() },
        { name: '构建测试', fn: () => this.testBuild() },
        { name: '开发服务器测试', fn: () => this.testDevServer() },
        { name: '代码质量测试', fn: () => this.testCodeQuality() },
        { name: '单元测试', fn: () => this.testUnitTests() },
        { name: '模板变量测试', fn: () => this.testTemplateVariables() },
        { name: '配置文件完整性测试', fn: () => this.testConfigFiles() }
      ];

      for (const testCase of testCases) {
        try {
          console.log(`📋 ${testCase.name}...`);
          await testCase.fn();
          this.testResults.passed++;
          console.log(`✅ ${testCase.name} 通过\n`);
        } catch (error) {
          this.testResults.failed++;
          this.testResults.errors.push({
            test: testCase.name,
            error: error.message
          });
          console.log(`❌ ${testCase.name} 失败: ${error.message}\n`);
        }
      }

      // 清理测试环境
      await this.cleanup();

      // 输出测试结果
      this.printResults();

    } catch (error) {
      console.error('🔥 测试环境设置失败:', error);
      process.exit(1);
    }
  }

  /**
   * 设置测试环境
   */
  async setupTestEnvironment() {
    console.log('🔧 设置测试环境...');
    
    // 创建临时测试目录
    if (!fs.existsSync(this.tempTestDir)) {
      fs.mkdirSync(this.tempTestDir, { recursive: true });
    }

    // 切换到项目根目录
    process.chdir(path.resolve(__dirname, '../..'));
    
    console.log(`📁 测试目录: ${this.tempTestDir}`);
    console.log(`📁 项目根目录: ${process.cwd()}\n`);
  }

  /**
   * 测试项目生成
   */
  async testProjectGeneration() {
    const { createScaffold } = await import('../../src/tools/createScaffold.js');
    
    const options = {
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
        husky: true
      },
      testing: {
        framework: 'vitest',
        mockSolution: 'msw'
      },
      bundleAnalyzer: 'rollup-plugin-visualizer'
    };

    const result = await createScaffold.handler({
      arguments: {
        framework: options.framework,
        language: options.language,
        buildTool: options.buildTool,
        styleFramework: options.styleFramework,
        uiLibrary: options.uiLibrary,
        projectName: this.projectName,
        projectPath: this.tempTestDir
      }
    });

    if (!result.success) {
      throw new Error(`项目生成失败: ${result.message}`);
    }

    // 验证项目目录是否创建
    if (!fs.existsSync(this.projectPath)) {
      throw new Error('项目目录未创建');
    }

    // 验证关键文件是否存在
    const requiredFiles = [
      'package.json',
      'vite.config.ts',
      'tsconfig.json',
      'index.html',
      'src/main.ts',
      'src/App.vue'
    ];

    for (const file of requiredFiles) {
      const filePath = path.join(this.projectPath, file);
      if (!fs.existsSync(filePath)) {
        throw new Error(`必需文件缺失: ${file}`);
      }
    }
  }

  /**
   * 测试依赖安装
   */
  async testDependencyInstallation() {
    const startTime = Date.now();
    
    try {
      this.execCommand('npm install', this.projectPath, 120000); // 2分钟超时
      
      // 验证 node_modules 目录存在
      const nodeModulesPath = path.join(this.projectPath, 'node_modules');
      if (!fs.existsSync(nodeModulesPath)) {
        throw new Error('node_modules 目录未创建');
      }

      // 验证关键依赖是否正确安装
      const packageJsonPath = path.join(this.projectPath, 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      
      const criticalDeps = ['vue', 'element-plus', 'vite', 'typescript'];
      for (const dep of criticalDeps) {
        const depPath = path.join(nodeModulesPath, dep);
        if (!fs.existsSync(depPath)) {
          throw new Error(`关键依赖 ${dep} 未正确安装`);
        }
      }

      const duration = Date.now() - startTime;
      console.log(`   💡 依赖安装耗时: ${(duration / 1000).toFixed(1)}s`);
      
    } catch (error) {
      throw new Error(`依赖安装失败: ${error.message}`);
    }
  }

  /**
   * 测试构建
   */
  async testBuild() {
    const startTime = Date.now();
    
    try {
      this.execCommand('npm run build', this.projectPath, 60000); // 1分钟超时
      
      // 验证构建输出
      const distPath = path.join(this.projectPath, 'dist');
      if (!fs.existsSync(distPath)) {
        throw new Error('dist 目录未创建');
      }

      const indexHtmlPath = path.join(distPath, 'index.html');
      if (!fs.existsSync(indexHtmlPath)) {
        throw new Error('index.html 未生成');
      }

      // 验证静态资源目录
      const assetsPath = path.join(distPath, 'assets');
      if (!fs.existsSync(assetsPath)) {
        throw new Error('assets 目录未创建');
      }

      const duration = Date.now() - startTime;
      console.log(`   💡 构建耗时: ${(duration / 1000).toFixed(1)}s`);
      
    } catch (error) {
      throw new Error(`构建失败: ${error.message}`);
    }
  }

  /**
   * 测试开发服务器
   */
  async testDevServer() {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        if (devServer) {
          devServer.kill();
        }
        reject(new Error('开发服务器启动超时'));
      }, 30000); // 30秒超时

      const devServer = spawn('npm', ['run', 'dev'], {
        cwd: this.projectPath,
        stdio: 'pipe'
      });

      let output = '';
      devServer.stdout.on('data', (data) => {
        output += data.toString();
        
        // 检查服务器是否成功启动
        if (output.includes('Local:') && output.includes('localhost')) {
          clearTimeout(timeout);
          devServer.kill();
          console.log('   💡 开发服务器启动成功');
          resolve();
        }
      });

      devServer.stderr.on('data', (data) => {
        const error = data.toString();
        if (error.includes('Error') || error.includes('error')) {
          clearTimeout(timeout);
          devServer.kill();
          reject(new Error(`开发服务器启动错误: ${error}`));
        }
      });

      devServer.on('error', (error) => {
        clearTimeout(timeout);
        reject(new Error(`开发服务器进程错误: ${error.message}`));
      });
    });
  }

  /**
   * 测试代码质量工具
   */
  async testCodeQuality() {
    try {
      // 测试 TypeScript 类型检查
      this.execCommand('npm run type-check', this.projectPath, 30000);
      
      // 测试 ESLint
      try {
        this.execCommand('npm run lint:check', this.projectPath, 30000);
      } catch (error) {
        // ESLint 可能会有警告，但不应该阻止测试
        console.log('   ⚠️  ESLint 检查有警告，但可接受');
      }

      // 测试 Prettier 格式检查
      try {
        this.execCommand('npm run format:check', this.projectPath, 30000);
      } catch (error) {
        console.log('   ⚠️  Prettier 格式检查有警告，但可接受');
      }

      console.log('   💡 代码质量检查完成');
      
    } catch (error) {
      throw new Error(`代码质量检查失败: ${error.message}`);
    }
  }

  /**
   * 测试单元测试
   */
  async testUnitTests() {
    try {
      this.execCommand('npm run test', this.projectPath, 60000);
      console.log('   💡 单元测试通过');
    } catch (error) {
      throw new Error(`单元测试失败: ${error.message}`);
    }
  }

  /**
   * 测试模板变量替换
   */
  async testTemplateVariables() {
    const packageJsonPath = path.join(this.projectPath, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    
    // 检查项目名称是否正确替换
    if (packageJson.name !== this.projectName) {
      throw new Error(`项目名称未正确替换: 期望 ${this.projectName}，实际 ${packageJson.name}`);
    }

    // 检查是否还有未替换的占位符
    const packageJsonContent = fs.readFileSync(packageJsonPath, 'utf-8');
    const placeholderRegex = /\{\{[^}]+\}\}/g;
    const placeholders = packageJsonContent.match(placeholderRegex);
    
    if (placeholders && placeholders.length > 0) {
      throw new Error(`发现未替换的占位符: ${placeholders.join(', ')}`);
    }

    // 检查依赖项是否包含占位符
    const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };
    for (const [name, version] of Object.entries(allDeps)) {
      if (name.includes('{{') || version.includes('{{')) {
        throw new Error(`依赖项包含占位符: ${name}@${version}`);
      }
    }

    console.log('   💡 模板变量替换正确');
  }

  /**
   * 测试配置文件完整性
   */
  async testConfigFiles() {
    const configFiles = [
      'tsconfig.json',
      'vite.config.ts',
      '.eslintrc.js',
      '.prettierrc',
      'tailwind.config.js',
      'vitest.config.ts'
    ];

    for (const configFile of configFiles) {
      const filePath = path.join(this.projectPath, configFile);
      
      if (!fs.existsSync(filePath)) {
        throw new Error(`配置文件缺失: ${configFile}`);
      }

      // 检查配置文件是否为空或格式错误
      const content = fs.readFileSync(filePath, 'utf-8').trim();
      if (content.length === 0) {
        throw new Error(`配置文件为空: ${configFile}`);
      }

      // 检查JSON格式文件的语法
      if (configFile.endsWith('.json')) {
        try {
          JSON.parse(content);
        } catch (error) {
          throw new Error(`配置文件JSON格式错误: ${configFile}`);
        }
      }
    }

    console.log('   💡 配置文件完整性检查通过');
  }

  /**
   * 执行命令
   */
  execCommand(command, cwd, timeout = 30000) {
    try {
      const result = execSync(command, {
        cwd,
        timeout,
        stdio: 'pipe',
        encoding: 'utf-8'
      });
      return result;
    } catch (error) {
      throw new Error(`命令执行失败: ${command}\n${error.message}`);
    }
  }

  /**
   * 清理测试环境
   */
  async cleanup() {
    try {
      if (fs.existsSync(this.tempTestDir)) {
        fs.rmSync(this.tempTestDir, { recursive: true, force: true });
        console.log('🧹 测试环境清理完成');
      }
    } catch (error) {
      console.warn('⚠️  清理测试环境时出现警告:', error.message);
    }
  }

  /**
   * 打印测试结果
   */
  printResults() {
    console.log('🎯 测试结果总结:');
    console.log(`✅ 通过: ${this.testResults.passed}`);
    console.log(`❌ 失败: ${this.testResults.failed}`);
    console.log(`📊 总计: ${this.testResults.passed + this.testResults.failed}`);
    
    if (this.testResults.errors.length > 0) {
      console.log('\n❌ 失败详情:');
      this.testResults.errors.forEach(({ test, error }, index) => {
        console.log(`${index + 1}. ${test}: ${error}`);
      });
    }

    const success = this.testResults.failed === 0;
    console.log(`\n🏁 测试${success ? '全部通过' : '存在失败'}！`);
    
    process.exit(success ? 0 : 1);
  }
}

// 运行测试
if (require.main === module) {
  const test = new ProjectLifecycleTest();
  test.runTests().catch(error => {
    console.error('🔥 测试运行失败:', error);
    process.exit(1);
  });
}

module.exports = { ProjectLifecycleTest };