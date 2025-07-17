
import fs from 'fs';
import path from 'path';
import { globSync } from 'glob';
import chalk from 'chalk';
import axios from 'axios';

interface DiagnosticResult {
  category: string;
  status: 'PASS' | 'FAIL' | 'WARNING';
  message: string;
  details?: any;
}

class SystemDiagnostics {
  private results: DiagnosticResult[] = [];
  private baseUrl = 'http://0.0.0.0:5000';

  private addResult(category: string, status: 'PASS' | 'FAIL' | 'WARNING', message: string, details?: any) {
    this.results.push({ category, status, message, details });
  }

  // 1. 掃描 /src 目錄下所有 route、middleware 的錯誤
  async scanSourceFiles() {
    console.log(chalk.yellow('📁 掃描 /src 目錄...'));
    
    try {
      // 掃描路由檔案
      const routeFiles = globSync('src/routes/*.ts');
      console.log(`找到 ${routeFiles.length} 個路由檔案:`, routeFiles);
      
      for (const file of routeFiles) {
        try {
          const content = fs.readFileSync(file, 'utf8');
          
          // 檢查常見錯誤模式
          const issues = [];
          
          // 檢查是否有未處理的 async/await
          if (content.includes('async') && !content.includes('try') && !content.includes('catch')) {
            issues.push('缺少錯誤處理 (try/catch)');
          }
          
          // 檢查是否有未定義的導入
          const imports = content.match(/import.*from ['"](.+)['"];?/g);
          if (imports) {
            for (const imp of imports) {
              const modulePath = imp.match(/from ['"](.+)['"];?/)?.[1];
              if (modulePath?.startsWith('.') || modulePath?.startsWith('../')) {
                const resolvedPath = path.resolve(path.dirname(file), modulePath);
                if (!fs.existsSync(resolvedPath) && !fs.existsSync(resolvedPath + '.ts') && !fs.existsSync(resolvedPath + '.js')) {
                  issues.push(`找不到模組: ${modulePath}`);
                }
              }
            }
          }
          
          if (issues.length > 0) {
            this.addResult('路由檔案', 'WARNING', `${file} 有潛在問題`, issues);
          } else {
            this.addResult('路由檔案', 'PASS', `${file} 檢查通過`);
          }
        } catch (err) {
          this.addResult('路由檔案', 'FAIL', `無法讀取 ${file}`, err);
        }
      }
      
      // 掃描中介軟體檔案
      const middlewareFiles = globSync('src/middleware/*.ts');
      console.log(`找到 ${middlewareFiles.length} 個中介軟體檔案:`, middlewareFiles);
      
      for (const file of middlewareFiles) {
        try {
          const content = fs.readFileSync(file, 'utf8');
          
          // 檢查中介軟體基本結構
          if (!content.includes('Request') || !content.includes('Response') || !content.includes('NextFunction')) {
            this.addResult('中介軟體', 'WARNING', `${file} 可能缺少正確的型別定義`);
          } else {
            this.addResult('中介軟體', 'PASS', `${file} 結構正確`);
          }
        } catch (err) {
          this.addResult('中介軟體', 'FAIL', `無法讀取 ${file}`, err);
        }
      }
      
    } catch (err) {
      this.addResult('檔案掃描', 'FAIL', '掃描過程發生錯誤', err);
    }
  }

  // 2. 比對 .env 檔與實際程式使用
  async checkEnvironmentVariables() {
    console.log(chalk.yellow('🔍 檢查環境變數...'));
    
    try {
      // 讀取 .env 檔案
      let envVars: string[] = [];
      if (fs.existsSync('.env')) {
        const envContent = fs.readFileSync('.env', 'utf8');
        envVars = envContent.split('\n')
          .filter(line => line.includes('='))
          .map(line => line.split('=')[0]);
      }

      // 掃描程式碼中使用的環境變數
      const sourceFiles = globSync('src/**/*.ts');
      const usedVars = new Set<string>();
      
      for (const file of sourceFiles) {
        const content = fs.readFileSync(file, 'utf8');
        const matches = content.match(/process\.env\.([A-Z_]+)/g);
        if (matches) {
          matches.forEach(match => {
            const varName = match.replace('process.env.', '');
            usedVars.add(varName);
          });
        }
      }

      // 檢查未定義的變數
      const undefinedVars = Array.from(usedVars).filter(v => !envVars.includes(v) && !process.env[v]);
      const unusedVars = envVars.filter(v => !usedVars.has(v));

      if (undefinedVars.length > 0) {
        this.addResult('環境變數', 'FAIL', '發現未定義的環境變數', undefinedVars);
      }
      
      if (unusedVars.length > 0) {
        this.addResult('環境變數', 'WARNING', '發現未使用的環境變數', unusedVars);
      }
      
      if (undefinedVars.length === 0 && unusedVars.length === 0) {
        this.addResult('環境變數', 'PASS', '環境變數檢查通過');
      }

    } catch (err) {
      this.addResult('環境變數', 'FAIL', '環境變數檢查失敗', err);
    }
  }

  // 3. 檢查前端檔案
  async checkFrontendFiles() {
    console.log(chalk.yellow('🌐 檢查前端檔案...'));
    
    try {
      // 檢查 public 目錄
      if (fs.existsSync('public')) {
        const publicFiles = fs.readdirSync('public');
        this.addResult('前端檔案', 'PASS', `public 目錄存在，包含 ${publicFiles.length} 個檔案`, publicFiles);
      } else {
        this.addResult('前端檔案', 'WARNING', 'public 目錄不存在');
      }

      // 檢查 client 目錄
      if (fs.existsSync('client')) {
        // 檢查 package.json
        if (fs.existsSync('client/package.json')) {
          const clientPackage = JSON.parse(fs.readFileSync('client/package.json', 'utf8'));
          this.addResult('前端設定', 'PASS', 'client/package.json 存在', clientPackage.name);
        }

        // 檢查主要檔案
        const clientMainFiles = ['client/src/main.tsx', 'client/src/App.tsx', 'client/index.html'];
        for (const file of clientMainFiles) {
          if (fs.existsSync(file)) {
            this.addResult('前端檔案', 'PASS', `${file} 存在`);
          } else {
            this.addResult('前端檔案', 'FAIL', `${file} 不存在`);
          }
        }
      } else {
        this.addResult('前端檔案', 'WARNING', 'client 目錄不存在');
      }

    } catch (err) {
      this.addResult('前端檔案', 'FAIL', '前端檔案檢查失敗', err);
    }
  }

  // 4. 執行 health check 測試
  async performHealthCheck() {
    console.log(chalk.yellow('🏥 執行 Health Check...'));
    
    const healthChecks = [
      { endpoint: '/health', description: '系統健康檢查' },
      { endpoint: '/api/admin/quick-summary', description: '快速系統摘要' },
      { endpoint: '/', description: '根路徑' }
    ];

    for (const check of healthChecks) {
      try {
        const response = await axios.get(`${this.baseUrl}${check.endpoint}`, {
          timeout: 3000,
          validateStatus: () => true // 接受所有狀態碼
        });

        if (response.status === 200) {
          this.addResult('Health Check', 'PASS', `${check.description} 正常 (${response.status})`, response.data);
        } else {
          this.addResult('Health Check', 'WARNING', `${check.description} 異常狀態 (${response.status})`, response.data);
        }
      } catch (err: any) {
        this.addResult('Health Check', 'FAIL', `${check.description} 連線失敗`, {
          message: err.message,
          code: err.code
        });
      }
    }
  }

  // 5. 彙整報告
  generateReport() {
    console.log(chalk.cyan('\n📋 系統診斷報告\n'));
    console.log('='.repeat(60));

    const categories = [...new Set(this.results.map(r => r.category))];
    
    for (const category of categories) {
      console.log(chalk.bold(`\n📁 ${category}`));
      console.log('-'.repeat(40));
      
      const categoryResults = this.results.filter(r => r.category === category);
      
      for (const result of categoryResults) {
        const icon = result.status === 'PASS' ? '✅' : result.status === 'WARNING' ? '⚠️' : '❌';
        console.log(`${icon} ${result.message}`);
        
        if (result.details) {
          console.log(`   詳情: ${JSON.stringify(result.details, null, 2)}`);
        }
      }
    }

    // 統計摘要
    const passCount = this.results.filter(r => r.status === 'PASS').length;
    const warningCount = this.results.filter(r => r.status === 'WARNING').length;
    const failCount = this.results.filter(r => r.status === 'FAIL').length;

    console.log(chalk.cyan('\n📊 診斷摘要'));
    console.log('='.repeat(30));
    console.log(`✅ 通過: ${passCount}`);
    console.log(`⚠️ 警告: ${warningCount}`);
    console.log(`❌ 失敗: ${failCount}`);
    console.log(`📋 總計: ${this.results.length}`);

    // 建議修正
    console.log(chalk.yellow('\n🔧 建議修正'));
    console.log('='.repeat(30));
    
    const failedResults = this.results.filter(r => r.status === 'FAIL');
    const warningResults = this.results.filter(r => r.status === 'WARNING');
    
    if (failedResults.length > 0) {
      console.log(chalk.red('🚨 嚴重問題:'));
      failedResults.forEach((result, index) => {
        console.log(`${index + 1}. ${result.category}: ${result.message}`);
      });
    }
    
    if (warningResults.length > 0) {
      console.log(chalk.orange('\n⚠️ 需要注意:'));
      warningResults.forEach((result, index) => {
        console.log(`${index + 1}. ${result.category}: ${result.message}`);
      });
    }

    if (failedResults.length === 0 && warningResults.length === 0) {
      console.log(chalk.green('🎉 系統狀態良好，無需修正！'));
    }

    // 儲存報告
    const reportData = {
      timestamp: new Date().toISOString(),
      summary: { pass: passCount, warning: warningCount, fail: failCount },
      results: this.results
    };
    
    fs.writeFileSync('system_diagnostic_report.json', JSON.stringify(reportData, null, 2));
    console.log(chalk.cyan('\n💾 報告已儲存至: system_diagnostic_report.json'));
  }

  async run() {
    console.log(chalk.cyan('🚀 開始系統診斷...\n'));
    
    await this.scanSourceFiles();
    await this.checkEnvironmentVariables();
    await this.checkFrontendFiles();
    await this.performHealthCheck();
    
    this.generateReport();
  }
}

// 執行診斷
const diagnostics = new SystemDiagnostics();
diagnostics.run().catch(console.error);
