#!/usr/bin/env node

/**
 * 测试运行器 - 整合所有测试用例
 * 支持运行生命周期测试、模板完整性测试等
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

class TestRunner {
  constructor() {
    this.testSuites = [
      {
        name: '模板完整性测试',
        script: 'template-integrity-test.js',
        timeout: 30000
      },
      {
        name: '项目生命周期测试',
        script: 'project-lifecycle-test.js', 
        timeout: 300000 // 5分钟
      }
    ];
    
    this.results = {
      total: 0,
      passed: 0,
      failed: 0,
      suites: []
    };
  }

  /**
   * 运行所有测试
   */
  async runAllTests() {
    console.log('🚀 开始运行完整测试套件...\n');
    console.log('=' * 60);
    
    const startTime = Date.now();

    for (const suite of this.testSuites) {
      const suiteResult = await this.runTestSuite(suite);
      this.results.suites.push(suiteResult);
      this.results.total++;
      
      if (suiteResult.success) {
        this.results.passed++;
      } else {
        this.results.failed++;
      }
    }

    const totalTime = Date.now() - startTime;
    
    // 生成测试报告
    this.generateReport(totalTime);
    
    // 输出结果
    this.printSummary();
    
    // 根据结果设置退出码
    process.exit(this.results.failed === 0 ? 0 : 1);
  }

  /**
   * 运行单个测试套件
   */
  async runTestSuite(suite) {
    console.log(`\n🧪 运行测试套件: ${suite.name}`);
    console.log('-'.repeat(40));
    
    const scriptPath = path.join(__dirname, suite.script);
    const startTime = Date.now();
    
    try {
      await this.execTestScript(scriptPath, suite.timeout);
      const duration = Date.now() - startTime;
      
      console.log(`✅ ${suite.name} 测试通过 (${(duration / 1000).toFixed(1)}s)`);
      
      return {
        name: suite.name,
        success: true,
        duration,
        error: null
      };
      
    } catch (error) {
      const duration = Date.now() - startTime;
      
      console.log(`❌ ${suite.name} 测试失败 (${(duration / 1000).toFixed(1)}s)`);
      console.log(`   错误: ${error.message}`);
      
      return {
        name: suite.name,
        success: false,
        duration,
        error: error.message
      };
    }
  }

  /**
   * 执行测试脚本
   */
  execTestScript(scriptPath, timeout) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        testProcess.kill();
        reject(new Error(`测试超时 (${timeout / 1000}s)`));
      }, timeout);

      const testProcess = spawn('node', [scriptPath], {
        stdio: 'inherit'
      });

      testProcess.on('close', (code) => {
        clearTimeout(timer);
        
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`测试进程退出码: ${code}`));
        }
      });

      testProcess.on('error', (error) => {
        clearTimeout(timer);
        reject(new Error(`进程错误: ${error.message}`));
      });
    });
  }

  /**
   * 生成测试报告
   */
  generateReport(totalTime) {
    const report = {
      timestamp: new Date().toISOString(),
      duration: totalTime,
      summary: {
        total: this.results.total,
        passed: this.results.passed,
        failed: this.results.failed,
        success_rate: ((this.results.passed / this.results.total) * 100).toFixed(1)
      },
      suites: this.results.suites.map(suite => ({
        name: suite.name,
        success: suite.success,
        duration: suite.duration,
        error: suite.error
      })),
      environment: {
        node_version: process.version,
        platform: process.platform,
        arch: process.arch,
        cwd: process.cwd()
      }
    };

    const reportPath = path.join(__dirname, '../..', 'test-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log(`\n📊 测试报告已生成: ${reportPath}`);
  }

  /**
   * 打印测试总结
   */
  printSummary() {
    console.log('\n' + '='.repeat(60));
    console.log('🎯 测试总结');
    console.log('='.repeat(60));
    
    console.log(`📊 总计: ${this.results.total}`);
    console.log(`✅ 通过: ${this.results.passed}`);
    console.log(`❌ 失败: ${this.results.failed}`);
    console.log(`📈 成功率: ${((this.results.passed / this.results.total) * 100).toFixed(1)}%`);

    if (this.results.failed > 0) {
      console.log('\n❌ 失败的测试套件:');
      this.results.suites
        .filter(suite => !suite.success)
        .forEach(suite => {
          console.log(`   • ${suite.name}: ${suite.error}`);
        });
    }

    const success = this.results.failed === 0;
    console.log(`\n🏁 ${success ? '所有测试通过！' : '存在测试失败！'}`);
  }

  /**
   * 运行特定测试套件
   */
  async runSpecificTest(testName) {
    const suite = this.testSuites.find(s => 
      s.name.includes(testName) || s.script.includes(testName)
    );

    if (!suite) {
      console.error(`❌ 未找到测试套件: ${testName}`);
      console.log('可用的测试套件:');
      this.testSuites.forEach(s => console.log(`  • ${s.name}`));
      process.exit(1);
    }

    console.log(`🎯 运行指定测试: ${suite.name}\n`);
    
    const result = await this.runTestSuite(suite);
    
    if (result.success) {
      console.log(`\n✅ 测试完成`);
      process.exit(0);
    } else {
      console.log(`\n❌ 测试失败`);
      process.exit(1);
    }
  }
}

// 解析命令行参数
const args = process.argv.slice(2);
const testRunner = new TestRunner();

if (args.length === 0) {
  // 运行所有测试
  testRunner.runAllTests().catch(error => {
    console.error('🔥 测试运行失败:', error);
    process.exit(1);
  });
} else if (args[0] === '--list') {
  // 列出所有可用测试
  console.log('可用的测试套件:');
  testRunner.testSuites.forEach(suite => {
    console.log(`  • ${suite.name} (${suite.script})`);
  });
} else {
  // 运行指定测试
  testRunner.runSpecificTest(args[0]).catch(error => {
    console.error('🔥 测试运行失败:', error);
    process.exit(1);
  });
}

module.exports = { TestRunner };