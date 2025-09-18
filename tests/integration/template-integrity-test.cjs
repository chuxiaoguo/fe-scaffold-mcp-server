/**
 * 模板配置完整性测试
 * 验证所有模板中的占位符变量都能被正确替换
 */

const fs = require('fs');
const path = require('path');

class TemplateIntegrityTest {
  constructor() {
    this.templateDir = path.resolve(__dirname, '../../templates');
    this.testResults = {
      passed: 0,
      failed: 0,
      errors: []
    };
  }

  /**
   * 运行完整性测试
   */
  async runTests() {
    console.log('🔍 开始模板完整性测试...\n');

    const testCases = [
      { name: '占位符定义完整性测试', fn: () => this.testPlaceholderDefinitions() },
      { name: '依赖变量映射测试', fn: () => this.testDependencyVariables() },
      { name: '模板文件格式测试', fn: () => this.testTemplateFormats() },
      { name: '配置文件完整性测试', fn: () => this.testConfigCompleteness() },
      { name: '跨模板一致性测试', fn: () => this.testCrossTemplateConsistency() }
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

    this.printResults();
  }

  /**
   * 测试占位符定义完整性
   */
  testPlaceholderDefinitions() {
    const placeholders = this.extractAllPlaceholders();
    const validPlaceholders = new Set([
      'PROJECT_NAME',
      'FRAMEWORK',
      'BUILD_TOOL', 
      'LANGUAGE',
      'STYLE_FRAMEWORK',
      'UI_LIBRARY',
      'TESTING_FRAMEWORK',
      'UI_LIBRARY_DEPS',
      'UI_LIBRARY_VERSION',
      'ADDITIONAL_DEPS',
      'DEV_DEPS'
    ]);

    const invalidPlaceholders = placeholders.filter(p => !validPlaceholders.has(p));
    
    if (invalidPlaceholders.length > 0) {
      throw new Error(`发现未定义的占位符: ${invalidPlaceholders.join(', ')}`);
    }

    console.log(`   💡 检查了 ${placeholders.length} 个占位符，全部有效`);
  }

  /**
   * 测试依赖变量映射
   */
  testDependencyVariables() {
    const packageFiles = this.findPackageJsonFiles();
    const problematicDeps = [];

    for (const file of packageFiles) {
      const content = fs.readFileSync(file, 'utf-8');
      const packageJson = JSON.parse(content);

      // 检查是否存在占位符依赖项
      const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };
      
      for (const [name, version] of Object.entries(allDeps)) {
        if (name.includes('{{') || version.includes('{{')) {
          // 验证这些占位符是否有对应的处理逻辑
          if (name === '{{UI_LIBRARY_DEPS}}' && version === '{{UI_LIBRARY_VERSION}}') {
            // 这是预期的占位符，需要确保有处理逻辑
            continue;
          }
          
          problematicDeps.push(`${file}: ${name}@${version}`);
        }
      }
    }

    if (problematicDeps.length > 0) {
      console.log(`   ⚠️  发现占位符依赖项，需要确保有对应处理逻辑:`);
      problematicDeps.forEach(dep => console.log(`     - ${dep}`));
    } else {
      console.log(`   💡 所有依赖项格式正确`);
    }
  }

  /**
   * 测试模板文件格式
   */
  testTemplateFormats() {
    const templates = this.getTemplateDirectories();
    const errors = [];

    for (const template of templates) {
      try {
        this.validateTemplateStructure(template);
      } catch (error) {
        errors.push(`${template}: ${error.message}`);
      }
    }

    if (errors.length > 0) {
      throw new Error(`模板格式错误:\n${errors.join('\n')}`);
    }

    console.log(`   💡 验证了 ${templates.length} 个模板的格式`);
  }

  /**
   * 测试配置文件完整性
   */
  testConfigCompleteness() {
    const sharedConfigPath = path.join(this.templateDir, 'shared', 'configs');
    const requiredConfigs = [
      '_eslintrc.js',
      '_prettierrc.json', 
      '_commitlint.config.js',
      '_tailwind.config.js',
      '_vitest.config.ts',
      'mock/_msw.ts',
      'mock/_viteMock.ts'
    ];

    const missingConfigs = [];

    for (const config of requiredConfigs) {
      const configPath = path.join(sharedConfigPath, config);
      if (!fs.existsSync(configPath)) {
        missingConfigs.push(config);
      }
    }

    if (missingConfigs.length > 0) {
      throw new Error(`缺失配置文件: ${missingConfigs.join(', ')}`);
    }

    console.log(`   💡 所有必需配置文件都存在`);
  }

  /**
   * 测试跨模板一致性
   */
  testCrossTemplateConsistency() {
    const templates = this.getTemplateDirectories();
    const inconsistencies = [];

    // 比较package.json中的公共字段
    const packageJsons = templates.map(template => {
      const packagePath = path.join(this.templateDir, template, '_package.json');
      if (fs.existsSync(packagePath)) {
        return {
          template,
          content: JSON.parse(fs.readFileSync(packagePath, 'utf-8'))
        };
      }
      return null;
    }).filter(Boolean);

    // 检查版本一致性
    const commonFields = ['version', 'license', 'author'];
    for (const field of commonFields) {
      const values = new Set(packageJsons.map(p => p.content[field]));
      if (values.size > 1) {
        inconsistencies.push(`${field} 字段在不同模板中不一致: ${Array.from(values).join(', ')}`);
      }
    }

    if (inconsistencies.length > 0) {
      throw new Error(`跨模板一致性问题:\n${inconsistencies.join('\n')}`);
    }

    console.log(`   💡 跨模板一致性检查通过`);
  }

  /**
   * 提取所有占位符
   */
  extractAllPlaceholders() {
    const placeholders = new Set();
    const templateFiles = this.getAllTemplateFiles();

    for (const file of templateFiles) {
      const content = fs.readFileSync(file, 'utf-8');
      const matches = content.match(/\{\{([^}]+)\}\}/g);
      
      if (matches) {
        matches.forEach(match => {
          const placeholder = match.replace(/[{}\s]/g, '');
          placeholders.add(placeholder);
        });
      }
    }

    return Array.from(placeholders);
  }

  /**
   * 查找所有package.json文件
   */
  findPackageJsonFiles() {
    const files = [];
    
    const search = (dir) => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          search(fullPath);
        } else if (entry.name === '_package.json') {
          files.push(fullPath);
        }
      }
    };

    search(this.templateDir);
    return files;
  }

  /**
   * 获取模板目录列表
   */
  getTemplateDirectories() {
    return fs.readdirSync(this.templateDir, { withFileTypes: true })
      .filter(entry => entry.isDirectory() && entry.name !== 'shared')
      .map(entry => entry.name);
  }

  /**
   * 获取所有模板文件
   */
  getAllTemplateFiles() {
    const files = [];
    
    const search = (dir) => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          search(fullPath);
        } else {
          files.push(fullPath);
        }
      }
    };

    search(this.templateDir);
    return files;
  }

  /**
   * 验证模板结构
   */
  validateTemplateStructure(templateName) {
    const templatePath = path.join(this.templateDir, templateName);
    
    // 检查必需文件
    const requiredFiles = ['_package.json'];
    
    for (const file of requiredFiles) {
      const filePath = path.join(templatePath, file);
      if (!fs.existsSync(filePath)) {
        throw new Error(`缺失必需文件: ${file}`);
      }
    }

    // 验证package.json格式
    const packageJsonPath = path.join(templatePath, '_package.json');
    try {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      
      // 检查必需字段
      const requiredFields = ['name', 'version', 'scripts'];
      for (const field of requiredFields) {
        if (!packageJson[field]) {
          throw new Error(`package.json 缺失必需字段: ${field}`);
        }
      }
      
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error(`package.json 格式错误: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * 打印测试结果
   */
  printResults() {
    console.log('🎯 模板完整性测试结果:');
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
    console.log(`\n🏁 模板完整性测试${success ? '全部通过' : '存在失败'}！`);
    
    if (!success) {
      process.exit(1);
    }
  }
}

// 运行测试
if (require.main === module) {
  const test = new TemplateIntegrityTest();
  test.runTests().catch(error => {
    console.error('🔥 测试运行失败:', error);
    process.exit(1);
  });
}

module.exports = { TemplateIntegrityTest };