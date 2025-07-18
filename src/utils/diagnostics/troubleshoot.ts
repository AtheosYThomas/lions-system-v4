import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { globSync } from 'glob';
import chalk from 'chalk';
import { execSync } from 'child_process';
import http from 'http';

interface TroubleshootResult {
  category: string;
  status: 'pass' | 'warning' | 'error';
  message: string;
  details?: string;
  suggestion?: string;
}

class SystemTroubleshooter {
  private results: TroubleshootResult[] = [];

  async runFullDiagnostics() {
    console.log(chalk.cyan('🔍 北大獅子會系統問題排查報告\n'));
    console.log(chalk.cyan('=' .repeat(60)));

    await this.scanSourceFiles();
    await this.checkEnvironmentVariables();
    await this.checkFrontendFiles();
    await this.runHealthCheck();
    await this.runDatabaseCheck();

    this.generateReport();
  }

  private addResult(category: string, status: 'pass' | 'warning' | 'error', message: string, details?: string, suggestion?: string) {
    this.results.push({ category, status, message, details, suggestion });
  }

  // 1. 掃描 /src 目錄下所有檔案錯誤
  private async scanSourceFiles() {
    console.log(chalk.blue('\n1️⃣ 掃描 /src 目錄檔案錯誤...'));

    try {
      // 檢查 TypeScript 編譯錯誤
      try {
        const output = execSync('npx tsc --noEmit --skipLibCheck', { stdio: 'pipe', encoding: 'utf-8' });
        this.addResult('TypeScript編譯', 'pass', 'TypeScript 編譯成功');
        console.log(chalk.green('✅ TypeScript 編譯成功'));
      } catch (error: any) {
        const errorOutput = error.stdout?.toString() || error.stderr?.toString() || '';
        this.addResult('TypeScript編譯', 'error', 'TypeScript 編譯錯誤', errorOutput, '請修正 TypeScript 語法錯誤');
        console.log(chalk.red('❌ TypeScript 編譯錯誤'));
        console.log(chalk.red(errorOutput));
      }

      // 掃描各類型檔案
      const patterns = [
        { pattern: 'src/routes/**/*.ts', type: 'Routes' },
        { pattern: 'src/controllers/**/*.ts', type: 'Controllers' },
        { pattern: 'src/middleware/**/*.ts', type: 'Middleware' },
        { pattern: 'src/models/**/*.ts', type: 'Models' },
        { pattern: 'src/utils/**/*.ts', type: 'Utils' }
      ];

      patterns.forEach(({ pattern, type }) => {
        const files = globSync(pattern);
        if (files.length === 0) {
          this.addResult(type, 'warning', `未找到 ${type} 檔案`, `模式: ${pattern}`);
          console.log(chalk.yellow(`⚠️ 未找到 ${type} 檔案`));
        } else {
          files.forEach(file => {
            try {
              const content = fs.readFileSync(file, 'utf-8');

              // 檢查常見問題
              const issues = [];

              if (content.includes('import') && content.match(/import.*from\s*$/m)) {
                issues.push('不完整的 import 語句');
              }

              if (content.includes('async') && !content.includes('try') && !content.includes('catch')) {
                issues.push('async 函數缺少錯誤處理');
              }

              if (content.includes('process.env.') && !content.includes('dotenv')) {
                const envVars = content.match(/process\.env\.(\w+)/g);
                if (envVars) {
                  issues.push(`使用環境變數但未載入 dotenv: ${envVars.join(', ')}`);
                }
              }

              if (issues.length > 0) {
                this.addResult(type, 'warning', `${file} 有潛在問題`, issues.join('; '), '建議修正上述問題');
                console.log(chalk.yellow(`⚠️ ${file}: ${issues.join(', ')}`));
              } else {
                console.log(chalk.green(`✅ ${file} 檢查通過`));
              }

            } catch (err: any) {
              this.addResult(type, 'error', `${file} 讀取錯誤`, err.message, '檢查檔案權限和語法');
              console.log(chalk.red(`❌ ${file}: ${err.message}`));
            }
          });
        }
      });

    } catch (error: any) {
      this.addResult('檔案掃描', 'error', '無法執行檔案掃描', error.message);
      console.log(chalk.red(`❌ 檔案掃描失敗: ${error.message}`));
    }
  }

  // 2. 檢查環境變數
  private async checkEnvironmentVariables() {
    console.log(chalk.blue('\n2️⃣ 檢查環境變數...'));

    try {
      // 檢查 .env 檔案
      const envPath = path.resolve('.env');
      if (!fs.existsSync(envPath)) {
        this.addResult('環境變數', 'error', '缺少 .env 檔案', '', '建立 .env 檔案並設定必要變數');
        console.log(chalk.red('❌ 缺少 .env 檔案'));
        return;
      }

      const envVars = dotenv.parse(fs.readFileSync(envPath));
      console.log(chalk.green('✅ .env 檔案存在'));

      // 掃描程式中使用的環境變數
      const sourceFiles = globSync('src/**/*.ts');
      const usedEnvVars = new Set<string>();

      sourceFiles.forEach(file => {
        const content = fs.readFileSync(file, 'utf-8');
        const envMatches = content.match(/process\.env\.([A-Z_]+)/g);
        if (envMatches) {
          envMatches.forEach(match => {
            const varName = match.replace('process.env.', '');
            usedEnvVars.add(varName);
          });
        }
      });

      // 檢查必要的環境變數
      const requiredVars = ['LINE_CHANNEL_ACCESS_TOKEN', 'LINE_CHANNEL_SECRET', 'DATABASE_URL', 'PORT'];
      const missingRequired = requiredVars.filter(varName => !envVars[varName]);
      const missingUsed = Array.from(usedEnvVars).filter(varName => !envVars[varName]);

      if (missingRequired.length > 0) {
        this.addResult('環境變數', 'error', '缺少必要環境變數', missingRequired.join(', '), '在 .env 檔案中設定這些變數');
        console.log(chalk.red(`❌ 缺少必要變數: ${missingRequired.join(', ')}`));
      }

      if (missingUsed.length > 0) {
        this.addResult('環境變數', 'warning', '程式中使用但未定義的變數', missingUsed.join(', '), '檢查是否需要在 .env 中定義');
        console.log(chalk.yellow(`⚠️ 使用但未定義: ${missingUsed.join(', ')}`));
      }

      if (missingRequired.length === 0 && missingUsed.length === 0) {
        this.addResult('環境變數', 'pass', '所有環境變數都已正確設定');
        console.log(chalk.green('✅ 環境變數檢查通過'));
      }

      console.log(chalk.cyan(`📋 已設定變數: ${Object.keys(envVars).join(', ')}`));

    } catch (error: any) {
      this.addResult('環境變數', 'error', '環境變數檢查失敗', error.message);
      console.log(chalk.red(`❌ 環境變數檢查失敗: ${error.message}`));
    }
  }

  // 3. 檢查前端檔案
  private async checkFrontendFiles() {
    console.log(chalk.blue('\n3️⃣ 檢查前端檔案...'));

    const frontendDirs = ['public', 'src/frontend', 'client/src', 'client'];
    let frontendFound = false;

    for (const dir of frontendDirs) {
      if (fs.existsSync(dir)) {
        frontendFound = true;
        console.log(chalk.green(`✅ 發現前端目錄: ${dir}`));

        // 檢查 HTML 檔案
        const htmlFiles = globSync(`${dir}/**/*.html`);
        htmlFiles.forEach(file => {
          try {
            const content = fs.readFileSync(file, 'utf-8');

            if (!content.includes('<script') && !content.includes('<link')) {
              this.addResult('前端檔案', 'warning', `${file} 未包含 JS 或 CSS 資源`, '', '確認是否需要載入必要資源');
              console.log(chalk.yellow(`⚠️ ${file} 未包含 JS/CSS 資源`));
            } else {
              console.log(chalk.green(`✅ ${file} 包含必要資源`));
            }
          } catch (error: any) {
            this.addResult('前端檔案', 'error', `${file} 讀取錯誤`, error.message);
            console.log(chalk.red(`❌ ${file}: ${error.message}`));
          }
        });

        // 檢查 JS/TS 檔案語法
        const jsFiles = globSync(`${dir}/**/*.{js,ts,tsx,jsx}`);
        if (jsFiles.length > 0) {
          try {
            // 嘗試編譯前端 TypeScript（如果有）
            if (fs.existsSync('client/package.json')) {
              console.log(chalk.cyan('📦 檢查前端套件...'));
              try {
                execSync('cd client && npm list', { stdio: 'pipe' });
                this.addResult('前端套件', 'pass', '前端套件安裝正常');
                console.log(chalk.green('✅ 前端套件正常'));
              } catch (error) {
                this.addResult('前端套件', 'warning', '前端套件可能有問題', '', '執行 cd client && npm install');
                console.log(chalk.yellow('⚠️ 前端套件可能需要重新安裝'));
              }
            }
          } catch (error: any) {
            this.addResult('前端檢查', 'error', '前端檢查失敗', error.message);
          }
        }
      }
    }

    if (!frontendFound) {
      this.addResult('前端檔案', 'warning', '未發現前端檔案目錄', '', '確認前端檔案位置是否正確');
      console.log(chalk.yellow('⚠️ 未發現前端檔案目錄'));
    }
  }

  // 4. 執行 Health Check
  private async runHealthCheck() {
    console.log(chalk.blue('\n4️⃣ 執行 Health Check...'));

    const PORT = process.env.PORT || 5000;

    return new Promise<void>((resolve) => {
      const req = http.get(`http://0.0.0.0:${PORT}/health`, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          if (res.statusCode === 200) {
            this.addResult('Health Check', 'pass', 'Health check 成功', `狀態碼: ${res.statusCode}, 回應: ${data}`);
            console.log(chalk.green(`✅ Health check 成功 (狀態: ${res.statusCode})`));
            console.log(chalk.cyan(`📋 回應: ${data}`));
          } else {
            this.addResult('Health Check', 'error', 'Health check 失敗', `狀態碼: ${res.statusCode}`, '檢查伺服器是否正常運行');
            console.log(chalk.red(`❌ Health check 失敗 (狀態: ${res.statusCode})`));
          }
          resolve();
        });
      });

      req.on('error', (err) => {
        this.addResult('Health Check', 'error', '無法連接到 health check 端點', err.message, `確認伺服器是否在 ${PORT} 埠執行`);
        console.log(chalk.red(`❌ Health check 連接失敗: ${err.message}`));
        console.log(chalk.yellow(`💡 請確認伺服器是否在 ${PORT} 埠執行`));
        resolve();
      });

      req.setTimeout(5000, () => {
        this.addResult('Health Check', 'error', 'Health check 逾時', '5秒逾時', '檢查伺服器回應時間');
        console.log(chalk.red('❌ Health check 逾時 (5秒)'));
        req.destroy();
        resolve();
      });
    });
  }

  // 5. 資料庫連線檢查
  private async runDatabaseCheck() {
    console.log(chalk.blue('\n5️⃣ 檢查資料庫連線...'));

    try {
      const { runSystemHealthCheck } = await import('./systemHealth');
      const healthResults = await runSystemHealthCheck();

      if (healthResults.database) {
        this.addResult('資料庫', 'pass', '資料庫連線正常');
      } else {
        this.addResult('資料庫', 'error', '資料庫連線失敗', healthResults.errors.join('; '), '檢查 DATABASE_URL 設定');
      }

      if (healthResults.models) {
        this.addResult('資料模型', 'pass', '資料模型查詢正常');
      } else {
        this.addResult('資料模型', 'error', '資料模型查詢失敗', '', '檢查模型定義和資料表結構');
      }

    } catch (error: any) {
      this.addResult('資料庫', 'error', '資料庫檢查失敗', error.message, '確認資料庫配置正確');
      console.log(chalk.red(`❌ 資料庫檢查失敗: ${error.message}`));
    }
  }

  // 生成最終報告
  private generateReport() {
    console.log(chalk.cyan('\n' + '=' .repeat(60)));
    console.log(chalk.cyan('📋 系統問題排查報告'));
    console.log(chalk.cyan('=' .repeat(60)));

    const errorResults = this.results.filter(r => r.status === 'error');
    const warningResults = this.results.filter(r => r.status === 'warning');
    const passResults = this.results.filter(r => r.status === 'pass');

    console.log(chalk.red(`\n🚨 錯誤項目 (${errorResults.length}個):`));
    errorResults.forEach(result => {
      console.log(chalk.red(`❌ [${result.category}] ${result.message}`));
      if (result.details) console.log(chalk.gray(`   詳細: ${result.details}`));
      if (result.suggestion) console.log(chalk.yellow(`   建議: ${result.suggestion}`));
    });

    console.log(chalk.yellow(`\n⚠️ 警告項目 (${warningResults.length}個):`));
    warningResults.forEach(result => {
      console.log(chalk.yellow(`⚠️ [${result.category}] ${result.message}`));
      if (result.details) console.log(chalk.gray(`   詳細: ${result.details}`));
      if (result.suggestion) console.log(chalk.yellow(`   建議: ${result.suggestion}`));
    });

    console.log(chalk.green(`\n✅ 正常項目 (${passResults.length}個):`));
    passResults.forEach(result => {
      console.log(chalk.green(`✅ [${result.category}] ${result.message}`));
    });

    // 修正建議摘要
    console.log(chalk.cyan('\n💡 修正建議摘要:'));
    if (errorResults.length > 0) {
      console.log(chalk.red('🔴 高優先級 (錯誤):'));
      errorResults.forEach((result, index) => {
        console.log(chalk.red(`${index + 1}. ${result.suggestion || '請檢查相關配置'}`));
      });
    }

    if (warningResults.length > 0) {
      console.log(chalk.yellow('\n🟡 中優先級 (警告):'));
      warningResults.forEach((result, index) => {
        console.log(chalk.yellow(`${index + 1}. ${result.suggestion || '建議改善'}`));
      });
    }

    console.log(chalk.cyan('\n📊 系統健康度評分:'));
    const totalItems = this.results.length;
    const healthScore = Math.round((passResults.length / totalItems) * 100);

    let scoreColor = chalk.red;
    if (healthScore >= 80) scoreColor = chalk.green;
    else if (healthScore >= 60) scoreColor = chalk.yellow;

    console.log(scoreColor(`${healthScore}% (${passResults.length}/${totalItems} 項目正常)`));

    console.log(chalk.cyan('\n' + '=' .repeat(60)));
  }
}

// 執行問題排查
const troubleshooter = new SystemTroubleshooter();
troubleshooter.runFullDiagnostics().catch(console.error);