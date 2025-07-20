import fs from 'fs';
import path from 'path';
import { globSync } from 'glob';
import chalk from 'chalk';
import http from 'http';
import dotenv from 'dotenv';

// 確保載入環境變數
dotenv.config();

interface TroubleshootResult {
  category: string;
  status: 'pass' | 'warning' | 'error';
  message: string;
  details?: string;
  suggestions?: string[];
}

class TroubleshootReporter {
  private results: TroubleshootResult[] = [];
  private PORT = process.env.PORT || 5000;

  private addResult(
    category: string,
    status: 'pass' | 'warning' | 'error',
    message: string,
    details?: string,
    suggestions?: string[]
  ) {
    this.results.push({
      category,
      status,
      message,
      details,
      suggestions,
    });
  }

  // 1. 掃描 /src 目錄下所有檔案錯誤
  scanSourceFiles() {
    console.log(chalk.blue('📁 1. 掃描 /src 目錄檔案...'));

    const patterns = [
      'src/routes/**/*.ts',
      'src/controllers/**/*.ts',
      'src/middleware/**/*.ts',
      'src/models/**/*.ts',
      'src/services/**/*.ts',
      'src/utils/**/*.ts',
    ];

    patterns.forEach(pattern => {
      const files = globSync(pattern);
      files.forEach((file: string) => {
        try {
          const content = fs.readFileSync(file, 'utf-8');

          // 檢查基本語法錯誤
          if (
            content.includes('import') &&
            !content.includes('from') &&
            !content.includes('require')
          ) {
            this.addResult(
              'Source Files',
              'error',
              `${file}: 不完整的 import 語句`,
              content.substring(0, 200),
              ['檢查 import 語法', '確認模組路徑正確']
            );
          }

          // 檢查未捕獲的 async/await
          const asyncMatches = content.match(/async\s+\w+/g);
          const tryMatches = content.match(/try\s*{/g);
          if (
            asyncMatches &&
            asyncMatches.length > 0 &&
            (!tryMatches || tryMatches.length === 0)
          ) {
            this.addResult(
              'Source Files',
              'warning',
              `${file}: async 函數缺少錯誤處理`,
              undefined,
              ['添加 try-catch 區塊', '使用 .catch() 處理 Promise 錯誤']
            );
          }

          // 檢查型別錯誤（簡單檢查）
          if (content.includes('any') && content.includes('interface')) {
            this.addResult(
              'Source Files',
              'warning',
              `${file}: 使用 any 型別可能導致型別安全問題`,
              undefined,
              ['明確定義型別', '使用具體的介面']
            );
          }

          // 檢查未使用的 import
          const importMatches = content.match(/import\s+{([^}]+)}\s+from/g);
          if (importMatches) {
            importMatches.forEach(importMatch => {
              const importedItems = importMatch
                .match(/{([^}]+)}/)?.[1]
                ?.split(',')
                .map(s => s.trim());
              importedItems?.forEach(item => {
                if (
                  !content.includes(item.replace(/\s+as\s+\w+/, '').trim()) ||
                  content.split(item).length <= 2
                ) {
                  this.addResult(
                    'Source Files',
                    'warning',
                    `${file}: 可能有未使用的 import: ${item}`,
                    undefined,
                    ['移除未使用的 import', '檢查程式碼使用情況']
                  );
                }
              });
            });
          }

          this.addResult('Source Files', 'pass', `${file}: 語法檢查通過`);
        } catch (err: any) {
          this.addResult(
            'Source Files',
            'error',
            `${file}: 讀取錯誤`,
            err.message,
            ['檢查檔案權限', '確認檔案編碼']
          );
        }
      });
    });
  }

  // 2. 檢查環境變數
  checkEnvironmentVariables() {
    console.log(chalk.blue('🔧 2. 檢查環境變數...'));

    const envPath = path.resolve('.env');

    if (!fs.existsSync(envPath)) {
      this.addResult('Environment', 'error', '缺少 .env 檔案', undefined, [
        '建立 .env 檔案',
        '複製 .env.example 為 .env',
      ]);
      return;
    }

    try {
      const envContent = fs.readFileSync(envPath, 'utf-8');
      const envVars: Record<string, string> = {};

      envContent.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
          envVars[key.trim()] = value.trim();
        }
      });

      // 檢查程式中使用的環境變數
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

      // 檢查缺少的環境變數
      const missingVars = Array.from(usedEnvVars).filter(
        varName => !envVars[varName]
      );

      if (missingVars.length > 0) {
        this.addResult(
          'Environment',
          'error',
          `程式中使用但 .env 中缺少的變數: ${missingVars.join(', ')}`,
          undefined,
          ['在 .env 中添加缺少的變數', '檢查變數名稱拼寫']
        );
      } else {
        this.addResult('Environment', 'pass', '所有使用的環境變數都已定義');
      }

      // 檢查重要變數
      const requiredVars = [
        'LINE_CHANNEL_ACCESS_TOKEN',
        'LINE_CHANNEL_SECRET',
        'DATABASE_URL',
      ];
      const missingRequired = requiredVars.filter(varName => !envVars[varName]);

      if (missingRequired.length > 0) {
        this.addResult(
          'Environment',
          'error',
          `缺少必要環境變數: ${missingRequired.join(', ')}`,
          undefined,
          ['設定 LINE Channel 相關變數', '確認資料庫連線字串']
        );
      }
    } catch (err: any) {
      this.addResult('Environment', 'error', '.env 檔案解析錯誤', err.message, [
        '檢查 .env 檔案格式',
        '確認無特殊字元',
      ]);
    }
  }

  // 3. 檢查前端檔案
  checkFrontendFiles() {
    console.log(chalk.blue('🎨 3. 檢查前端檔案...'));

    const frontendDirs = ['public', 'client/src', 'src/frontend'];
    let frontendFound = false;

    frontendDirs.forEach(dir => {
      if (fs.existsSync(dir)) {
        frontendFound = true;
        this.addResult('Frontend', 'pass', `發現前端目錄: ${dir}`);

        // 檢查 HTML 檔案
        const htmlFiles = globSync(`${dir}/**/*.html`);
        htmlFiles.forEach(file => {
          try {
            const content = fs.readFileSync(file, 'utf-8');

            if (!content.includes('<script') && !content.includes('<link')) {
              this.addResult(
                'Frontend',
                'warning',
                `${file}: 未包含 JS 或 CSS 資源`,
                undefined,
                ['添加必要的 script 標籤', '引入 CSS 檔案']
              );
            } else {
              this.addResult('Frontend', 'pass', `${file}: 包含必要資源`);
            }

            // 檢查 LIFF 相關
            if (file.includes('liff') && !content.includes('liff.init')) {
              this.addResult(
                'Frontend',
                'warning',
                `${file}: LIFF 檔案未包含初始化程式碼`,
                undefined,
                ['添加 liff.init() 調用', '確認 LIFF ID 設定']
              );
            }
          } catch (err: any) {
            this.addResult(
              'Frontend',
              'error',
              `${file}: 讀取錯誤`,
              err.message,
              ['檢查檔案權限']
            );
          }
        });

        // 檢查 JS/TS 檔案
        const jsFiles = globSync(`${dir}/**/*.{js,ts,tsx,jsx}`);
        jsFiles.forEach(file => {
          try {
            const content = fs.readFileSync(file, 'utf-8');

            // 簡單語法檢查
            if (
              content.includes('console.log') &&
              content.includes('production')
            ) {
              this.addResult(
                'Frontend',
                'warning',
                `${file}: 生產環境中包含 console.log`,
                undefined,
                ['移除 debug 程式碼', '使用條件式 logging']
              );
            }

            this.addResult('Frontend', 'pass', `${file}: 語法檢查通過`);
          } catch (err: any) {
            this.addResult(
              'Frontend',
              'error',
              `${file}: 語法錯誤`,
              err.message,
              ['檢查 JavaScript 語法', '確認模組引入正確']
            );
          }
        });
      }
    });

    if (!frontendFound) {
      this.addResult('Frontend', 'warning', '未發現前端檔案目錄', undefined, [
        '確認前端檔案位置',
        '檢查目錄結構',
      ]);
    }
  }

  // 4. 執行 Health Check
  async runHealthCheck(): Promise<void> {
    console.log(chalk.blue('🏥 4. 執行 Health Check...'));

    return new Promise(resolve => {
      const req = http.get(`http://localhost:${this.PORT}/health`, res => {
        let data = '';

        res.on('data', chunk => {
          data += chunk;
        });

        res.on('end', () => {
          if (res.statusCode === 200) {
            try {
              const healthData = JSON.parse(data);
              this.addResult(
                'Health Check',
                'pass',
                `Health check 成功 (狀態: ${res.statusCode})`,
                JSON.stringify(healthData, null, 2)
              );

              // 檢查 health check 回應內容
              if (healthData.database === false) {
                this.addResult(
                  'Health Check',
                  'error',
                  '資料庫連線失敗',
                  undefined,
                  ['檢查 DATABASE_URL', '確認 PostgreSQL 服務運行']
                );
              }
              if (healthData.models === false) {
                this.addResult(
                  'Health Check',
                  'error',
                  '模型初始化失敗',
                  undefined,
                  ['執行 init-schema', '檢查模型定義']
                );
              }
            } catch (parseErr) {
              this.addResult(
                'Health Check',
                'warning',
                'Health check 回應格式異常',
                data,
                ['檢查 health 端點實作']
              );
            }
          } else {
            this.addResult(
              'Health Check',
              'error',
              `Health check 失敗 (狀態: ${res.statusCode})`,
              data,
              ['檢查伺服器狀態', '確認路由設定正確']
            );
          }
          resolve();
        });
      });

      req.on('error', err => {
        this.addResult(
          'Health Check',
          'error',
          'Health check 連線失敗',
          err.message,
          ['確認伺服器已啟動', '檢查埠號設定', '確認防火牆設定']
        );
        resolve();
      });

      req.setTimeout(5000, () => {
        req.destroy();
        this.addResult(
          'Health Check',
          'error',
          'Health check 逾時',
          undefined,
          ['檢查伺服器回應時間', '確認網路連線']
        );
        resolve();
      });
    });
  }

  // 5. 產生報告
  generateReport() {
    console.log(chalk.cyan('\n' + '='.repeat(80)));
    console.log(chalk.cyan('🦁 北大獅子會系統問題排查報告'));
    console.log(chalk.cyan('='.repeat(80)));

    const errorResults = this.results.filter(r => r.status === 'error');
    const warningResults = this.results.filter(r => r.status === 'warning');
    const passResults = this.results.filter(r => r.status === 'pass');

    console.log(chalk.green(`✅ 通過項目: ${passResults.length}個`));
    console.log(chalk.yellow(`⚠️ 警告項目: ${warningResults.length}個`));
    console.log(chalk.red(`❌ 錯誤項目: ${errorResults.length}個`));

    // 顯示錯誤
    if (errorResults.length > 0) {
      console.log(chalk.red(`\n❌ 錯誤項目 (${errorResults.length}個):`));
      errorResults.forEach((result, index) => {
        console.log(
          chalk.red(`${index + 1}. [${result.category}] ${result.message}`)
        );
        if (result.details) {
          console.log(chalk.gray(`   詳細: ${result.details}`));
        }
        if (result.suggestions) {
          console.log(chalk.cyan(`   建議: ${result.suggestions.join(', ')}`));
        }
        console.log('');
      });
    }

    // 顯示警告
    if (warningResults.length > 0) {
      console.log(chalk.yellow(`\n⚠️ 警告項目 (${warningResults.length}個):`));
      warningResults.forEach((result, index) => {
        console.log(
          chalk.yellow(`${index + 1}. [${result.category}] ${result.message}`)
        );
        if (result.details) {
          console.log(chalk.gray(`   詳細: ${result.details}`));
        }
        if (result.suggestions) {
          console.log(chalk.cyan(`   建議: ${result.suggestions.join(', ')}`));
        }
        console.log('');
      });
    }

    // 總結建議
    console.log(chalk.cyan('\n💡 總結建議:'));
    if (errorResults.length > 0) {
      console.log(
        chalk.red('1. 優先修正所有錯誤項目，這些可能導致系統無法正常運作')
      );
    }
    if (warningResults.length > 0) {
      console.log(chalk.yellow('2. 檢視警告項目，提升程式碼品質和穩定性'));
    }
    console.log(chalk.green('3. 定期執行此診斷工具，確保系統健康'));
    console.log(chalk.green('4. 建議設定 CI/CD 流程，自動化品質檢查'));

    // 儲存報告到檔案
    const reportData = {
      timestamp: new Date().toISOString(),
      summary: {
        total: this.results.length,
        pass: passResults.length,
        warning: warningResults.length,
        error: errorResults.length,
      },
      results: this.results,
    };

    fs.writeFileSync(
      'troubleshoot_report.json',
      JSON.stringify(reportData, null, 2)
    );
    console.log(chalk.cyan('\n📄 詳細報告已儲存至: troubleshoot_report.json'));
  }

  // 執行完整檢查
  async runFullCheck() {
    console.log(chalk.cyan('🔍 開始系統問題排查...\n'));

    this.scanSourceFiles();
    this.checkEnvironmentVariables();
    this.checkFrontendFiles();
    await this.runHealthCheck();
    this.generateReport();
  }
}

// 執行檢查
const reporter = new TroubleshootReporter();
reporter.runFullCheck().catch(console.error);
