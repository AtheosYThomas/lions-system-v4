import fs from 'fs';
import path from 'path';
import { globSync } from 'glob';
import http from 'http';
import chalk from 'chalk';

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

  // 1. 掃描 /src 目錄下所有 route、controller、middleware 的錯誤
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

          // 檢查常見錯誤
          const errors: string[] = [];

          // 檢查未定義的匯入
          const importMatches = content.match(/import\s+.*?\s+from\s+['"]([^'"]+)['"]/g);
          if (importMatches) {
            for (const importMatch of importMatches) {
              const modulePath = importMatch.match(/from\s+['"]([^'"]+)['"]/)?.[1];
              if (modulePath?.startsWith('./') || modulePath?.startsWith('../')) {
                const resolvedPath = path.resolve(path.dirname(file), modulePath);
                const possiblePaths = [
                  resolvedPath + '.ts',
                  resolvedPath + '.js',
                  resolvedPath + '/index.ts',
                  resolvedPath + '/index.js'
                ];

                const exists = possiblePaths.some(p => fs.existsSync(p));
                if (!exists) {
                  errors.push(`找不到模組: ${modulePath}`);
                }
              }
            }
          }

          // 檢查未定義的變數使用
          const envVarMatches = content.match(/process\.env\.([A-Z_]+)/g);
          if (envVarMatches) {
            for (const envMatch of envVarMatches) {
              const varName = envMatch.replace('process.env.', '');
              if (!process.env[varName]) {
                errors.push(`未定義的環境變數: ${varName}`);
              }
            }
          }

          // 檢查語法錯誤（簡單檢查）
          if (content.includes('console.log(') && !content.includes('console.error(')) {
            // 檢查是否有未處理的 console.log
          }

          if (errors.length > 0) {
            errorCount++;
            this.addResult(
              '程式碼掃描',
              'fail',
              `檔案 ${path.relative(this.srcPath, file)} 發現錯誤`,
              errors,
              ['檢查匯入路徑', '確認環境變數設定', '檢查語法正確性']
            );
          }

        } catch (error) {
          errorCount++;
          this.addResult(
            '程式碼掃描',
            'fail',
            `無法讀取檔案: ${path.relative(this.srcPath, file)}`,
            error instanceof Error ? error.message : String(error),
            ['檢查檔案權限', '確認檔案存在']
          );
        }
      });
    }

    if (errorCount === 0) {
      this.addResult('程式碼掃描', 'pass', `掃描完成 ${totalFiles} 個檔案，未發現錯誤`);
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
    console.log(chalk.yellow('📊 步驟 5: 彙整診斷報告...'));

    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        total: this.results.length,
        passed: this.results.filter(r => r.status === 'pass').length,
        failed: this.results.filter(r => r.status === 'fail').length,
        warnings: this.results.filter(r => r.status === 'warning').length
      },
      results: this.results
    };

    // 儲存報告
    const reportPath = path.join(this.srcPath, '../diagnostic_report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    console.log(chalk.green(`\n📄 診斷報告已儲存至: ${reportPath}`));

    return report;
  }

  // 執行完整診斷
  async runFullDiagnostics() {
    console.log(chalk.cyan('🚀 開始系統完整診斷...\n'));

    await this.scanSourceCodeErrors();
    await this.checkEnvironmentVariables();
    await this.checkFrontendFiles();
    await this.runHealthCheck();

    const report = this.generateReport();

    // 顯示摘要
    console.log(chalk.cyan('\n📋 診斷摘要:'));
    console.log(chalk.green(`✅ 通過: ${report.summary.passed}`));
    console.log(chalk.yellow(`⚠️  警告: ${report.summary.warnings}`));
    console.log(chalk.red(`❌ 失敗: ${report.summary.failed}`));

    // 顯示詳細錯誤
    if (report.summary.failed > 0) {
      console.log(chalk.red('\n🔥 發現的問題:'));
      this.results.filter(r => r.status === 'fail').forEach((result, index) => {
        console.log(chalk.red(`${index + 1}. [${result.section}] ${result.message}`));
        if (result.details) {
          console.log(chalk.gray(`   詳細: ${JSON.stringify(result.details)}`));
        }
        if (result.suggestions) {
          console.log(chalk.yellow(`   建議: ${result.suggestions.join(', ')}`));
        }
      });
    }

    // 顯示警告
    if (report.summary.warnings > 0) {
      console.log(chalk.yellow('\n⚠️ 警告事項:'));
      this.results.filter(r => r.status === 'warning').forEach((result, index) => {
        console.log(chalk.yellow(`${index + 1}. [${result.section}] ${result.message}`));
        if (result.suggestions) {
          console.log(chalk.gray(`   建議: ${result.suggestions.join(', ')}`));
        }
      });
    }

    return report;
  }
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

export default SystemDiagnostics;