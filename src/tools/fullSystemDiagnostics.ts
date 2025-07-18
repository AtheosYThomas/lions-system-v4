import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { globSync } from 'glob';
import http from 'http';

interface DiagnosticResult {
  section: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  details?: any;
  suggestions?: string[];
}

class SystemDiagnostics {
  private results: DiagnosticResult[] = [];
  private srcPath = path.join(__dirname, '..');

  private addResult(section: string, status: 'pass' | 'fail' | 'warning', message: string, details?: any, suggestions?: string[]) {
    this.results.push({ section, status, message, details, suggestions });
  }

  async scanSourceCodeErrors() {
    console.log(chalk.yellow('🔍 步驟 1: 掃描 /src 目錄錯誤...'));

    const patterns = [
      'routes/**/*.ts',
      'controllers/**/*.ts',
      'middleware/**/*.ts'
    ];

    let totalFiles = 0;
    let errorCount = 0;

    for (const pattern of patterns) {
      const files = globSync(path.join(this.srcPath, pattern)).filter(file =>
        !file.includes('node_modules') &&
        !file.includes('.git') &&
        !file.includes('dist') &&
        !file.includes('build')
      );

      files.forEach((file: string) => {
        totalFiles++;
        try {
          const content = fs.readFileSync(file, 'utf8');
          // Basic syntax check
          if (content.includes('import') && !content.includes('export')) {
            this.addResult('源碼檢查', 'warning', `檔案可能缺少 export: ${file}`);
          }
        } catch (error) {
          errorCount++;
          this.addResult('源碼檢查', 'fail', `無法讀取檔案: ${file}`, error);
        }
      });
    }

    if (errorCount === 0) {
      this.addResult('源碼檢查', 'pass', `成功掃描 ${totalFiles} 個檔案`);
    }
  }

  // 2. 比對 .env 檔與實際程式是否有使用未定義的變數
  async checkEnvironmentVariables() {
    console.log(chalk.yellow('🔍 步驟 2: 檢查環境變數...'));

    const envFile = path.join(this.srcPath, '../.env');
    const envVarsInFile = new Set<string>();

    // 讀取 .env 檔案
    try {
      if (fs.existsSync(envFile)) {
        const envContent = fs.readFileSync(envFile, 'utf8');
        const envLines = envContent.split('\n');

        for (const line of envLines) {
          const match = line.match(/^([A-Z_]+)=/);
          if (match) {
            envVarsInFile.add(match[1]);
          }
        }
      }
    } catch (error) {
      this.addResult(
        '環境變數檢查',
        'warning',
        '無法讀取 .env 檔案',
        error instanceof Error ? error.message : String(error)
      );
    }

    // 掃描程式碼中使用的環境變數
    const usedEnvVars = new Set<string>();
    const allFiles = globSync(path.join(this.srcPath, '**/*.ts'));

    for (const file of allFiles) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        const matches = content.match(/process\.env\.([A-Z_]+)/g);

        if (matches) {
          for (const match of matches) {
            const varName = match.replace('process.env.', '');
            usedEnvVars.add(varName);
          }
        }
      } catch (error) {
        // 忽略讀取錯誤
      }
    }

    // 檢查未定義的環境變數
    const undefinedVars: string[] = [];
    for (const varName of usedEnvVars) {
      if (!process.env[varName] && !envVarsInFile.has(varName)) {
        undefinedVars.push(varName);
      }
    }

    if (undefinedVars.length > 0) {
      this.addResult(
        '環境變數檢查',
        'fail',
        '發現未定義的環境變數',
        undefinedVars,
        ['在 .env 檔案中添加這些變數', '檢查 Replit Secrets 設定']
      );
    } else {
      this.addResult('環境變數檢查', 'pass', '所有環境變數都已正確定義');
    }
  }

  // 3. 檢查前端檔案
  async checkFrontendFiles() {
    console.log(chalk.yellow('🔍 步驟 3: 檢查前端檔案...'));

    const frontendPaths = [
      path.join(this.srcPath, '../public'),
      path.join(this.srcPath, '../client'),
      path.join(this.srcPath, 'frontend')
    ];

    let frontendFound = false;

    for (const frontendPath of frontendPaths) {
      if (fs.existsSync(frontendPath)) {
        frontendFound = true;

        try {
          const files = globSync(path.join(frontendPath, '**/*.{html,js,ts,tsx,jsx}'));

          for (const file of files) {
            const content = fs.readFileSync(file, 'utf8');

            // 檢查 HTML 檔案
            if (file.endsWith('.html')) {
              // 檢查基本 HTML 結構
              if (!content.includes('<html') || !content.includes('<body')) {
                this.addResult(
                  '前端檔案檢查',
                  'warning',
                  `HTML 檔案結構不完整: ${path.relative(frontendPath, file)}`,
                  undefined,
                  ['檢查 HTML 基本結構', '確認標籤完整性']
                );
              }

              // 檢查 JavaScript 引用
              const scriptMatches = content.match(/<script[^>]*src=['"]([^'"]+)['"]/g);
              if (scriptMatches) {
                for (const scriptMatch of scriptMatches) {
                  const src = scriptMatch.match(/src=['"]([^'"]+)['"]/)?.[1];
                  if (src && src.startsWith('./') && !src.startsWith('http')) {
                    const scriptPath = path.resolve(path.dirname(file), src);
                    if (!fs.existsSync(scriptPath)) {
                      this.addResult(
                        '前端檔案檢查',
                        'fail',
                        `找不到 JavaScript 檔案: ${src}`,
                        undefined,
                        ['檢查檔案路徑', '確認檔案存在']
                      );
                    }
                  }
                }
              }
            }

            // 檢查 JavaScript/TypeScript 檔案
            if (file.match(/\.(js|ts|tsx|jsx)$/)) {
              // 檢查基本語法錯誤
              if (content.includes('console.error(') || content.includes('throw new Error(')) {
                // 這是正常的錯誤處理
              }

              // 檢查未閉合的括號（簡單檢查）
              const openBraces = (content.match(/\{/g) || []).length;
              const closeBraces = (content.match(/\}/g) || []).length;

              if (openBraces !== closeBraces) {
                this.addResult(
                  '前端檔案檢查',
                  'warning',
                  `括號不匹配: ${path.relative(frontendPath, file)}`,
                  `開括號: ${openBraces}, 閉括號: ${closeBraces}`,
                  ['檢查括號配對', '使用程式碼格式化工具']
                );
              }
            }
          }

          this.addResult(
            '前端檔案檢查',
            'pass',
            `檢查完成 ${frontendPath} 中的 ${files.length} 個檔案`
          );

        } catch (error) {
          this.addResult(
            '前端檔案檢查',
            'fail',
            `檢查前端檔案時發生錯誤: ${frontendPath}`,
            error instanceof Error ? error.message : String(error)
          );
        }
      }
    }

    if (!frontendFound) {
      this.addResult(
        '前端檔案檢查',
        'warning',
        '未找到前端檔案目錄',
        undefined,
        ['確認前端檔案位置', '檢查專案結構']
      );
    }
  }

  // 4. 執行 health check 測試
  async runHealthCheck() {
    console.log(chalk.yellow('🔍 步驟 4: 執行 Health Check 測試...'));

    const port = process.env.PORT || 5000;
    const healthUrl = `http://localhost:${port}/health`;

    return new Promise<void>((resolve) => {
      const req = http.get(healthUrl, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            const healthData = JSON.parse(data);

            if (res.statusCode === 200) {
              this.addResult(
                'Health Check',
                'pass',
                'Health Check 測試成功',
                {
                  status: healthData.status,
                  database: healthData.database,
                  services: healthData.services,
                  uptime: healthData.uptime
                }
              );
            } else {
              this.addResult(
                'Health Check',
                'fail',
                `Health Check 返回錯誤狀態: ${res.statusCode}`,
                healthData,
                ['檢查伺服器狀態', '確認服務正常運行']
              );
            }
          } catch (error) {
            this.addResult(
              'Health Check',
              'fail',
              'Health Check 回應格式錯誤',
              data,
              ['檢查 health 端點實作', '確認 JSON 格式正確']
            );
          }
          resolve();
        });
      });

      req.on('error', (error) => {
        this.addResult(
          'Health Check',
          'fail',
          'Health Check 連線失敗',
          error.message,
          ['確認伺服器已啟動', '檢查埠號設定', '確認防火牆設定']
        );
        resolve();
      });

      req.setTimeout(5000, () => {
        req.destroy();
        this.addResult(
          'Health Check',
          'fail',
          'Health Check 連線逾時',
          undefined,
          ['檢查伺服器回應時間', '確認網路連線']
        );
        resolve();
      });
    });
  }

  // 5. 彙整所有錯誤訊息
  generateReport() {
    const reportPath = path.join(process.cwd(), 'diagnostic_report.json');
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    console.log(chalk.green(`✅ 診斷報告已儲存至: ${reportPath}`));
  }

  // 執行完整診斷
  async run() {
    console.log(chalk.cyan('🔍 執行完整系統診斷...'));
    await this.scanSourceCodeErrors();
    await this.checkEnvironmentVariables();
    await this.checkFrontendFiles();
    await this.runHealthCheck();
    this.generateReport();
  }
}

export default function runFullSystemDiagnostics() {
  const diagnostics = new SystemDiagnostics();
  return diagnostics.run();
}

// 執行診斷（如果直接運行此檔案）
if (require.main === module) {
  const diagnostics = new SystemDiagnostics();
  diagnostics.runFullDiagnostics().then(() => {
    console.log(chalk.green('\n✅ 診斷完成！'));
    process.exit(0);
  }).catch((error) => {
    console.error(chalk.red('❌ 診斷過程中發生錯誤:'), error);
    process.exit(1);
  });
}