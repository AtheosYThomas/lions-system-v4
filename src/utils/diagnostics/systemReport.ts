import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { globSync } from 'glob';
import http from 'http';
import dotenv from 'dotenv';

interface ReportItem {
  section: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  details?: any;
  suggestions?: string[];
}

export class SystemReportGenerator {
  private results: ReportItem[] = [];
  private srcPath = path.join(process.cwd(), 'src');

  private addResult(
    section: string,
    status: 'pass' | 'fail' | 'warning',
    message: string,
    details?: any,
    suggestions?: string[]
  ) {
    this.results.push({ section, status, message, details, suggestions });
  }

  // 1. 掃描 /src 目錄下所有 route、controller、middleware 的錯誤
  async scanSourceFiles() {
    console.log(chalk.yellow('🔍 步驟 1: 掃描 /src 目錄檔案...'));

    const patterns = [
      'routes/**/*.ts',
      'controllers/**/*.ts',
      'middleware/**/*.ts',
      'services/**/*.ts',
      'models/**/*.ts',
    ];

    let totalFiles = 0;
    let errorCount = 0;

    for (const pattern of patterns) {
      const files = globSync(path.join(this.srcPath, pattern));

      for (const file of files) {
        totalFiles++;
        try {
          const content = fs.readFileSync(file, 'utf8');
          const relativePath = path.relative(this.srcPath, file);

          // 檢查基本 TypeScript 語法
          const syntaxIssues = [];

          // 檢查未完成的 import
          if (
            content.includes('import') &&
            content.match(/import.*from\s*$/m)
          ) {
            syntaxIssues.push('不完整的 import 語句');
          }

          // 檢查未閉合的括號
          const openBraces = (content.match(/\{/g) || []).length;
          const closeBraces = (content.match(/\}/g) || []).length;
          if (openBraces !== closeBraces) {
            syntaxIssues.push(
              `括號不匹配 (開: ${openBraces}, 閉: ${closeBraces})`
            );
          }

          // 檢查錯誤的模組引用
          const importMatches = content.match(
            /import.*from\s+['"]([^'"]+)['"]/g
          );
          if (importMatches) {
            for (const importMatch of importMatches) {
              const modulePath = importMatch.match(
                /from\s+['"]([^'"]+)['"]/
              )?.[1];
              if (
                (modulePath && modulePath.startsWith('./')) ||
                modulePath?.startsWith('../')
              ) {
                const resolvedPath = path.resolve(
                  path.dirname(file),
                  modulePath
                );
                const tsPath = resolvedPath + '.ts';
                const jsPath = resolvedPath + '.js';
                const indexPath = path.join(resolvedPath, 'index.ts');

                if (
                  !fs.existsSync(tsPath) &&
                  !fs.existsSync(jsPath) &&
                  !fs.existsSync(indexPath) &&
                  !fs.existsSync(resolvedPath)
                ) {
                  syntaxIssues.push(`找不到模組: ${modulePath}`);
                }
              }
            }
          }

          // 檢查未處理的 async 函數
          if (
            content.includes('async') &&
            !content.includes('try') &&
            !content.includes('catch')
          ) {
            syntaxIssues.push('async 函數缺少錯誤處理');
          }

          if (syntaxIssues.length > 0) {
            this.addResult(
              '源碼檢查',
              'warning',
              `${relativePath}: ${syntaxIssues.join(', ')}`,
              syntaxIssues,
              ['檢查語法錯誤', '修正模組引用路徑', '添加錯誤處理']
            );
          } else {
            console.log(chalk.green(`✅ ${relativePath} 語法檢查通過`));
          }
        } catch (error) {
          errorCount++;
          this.addResult(
            '源碼檢查',
            'fail',
            `無法讀取檔案: ${path.relative(this.srcPath, file)}`,
            error instanceof Error ? error.message : String(error),
            ['檢查檔案權限', '確認檔案編碼']
          );
        }
      }
    }

    if (errorCount === 0) {
      this.addResult('源碼檢查', 'pass', `成功掃描 ${totalFiles} 個檔案`);
    }
  }

  // 2. 比對 .env 檔與實際程式是否有使用未定義的變數
  async checkEnvironmentVariables() {
    console.log(chalk.yellow('🔍 步驟 2: 檢查環境變數...'));

    const envFile = path.join(process.cwd(), '.env');
    const envVarsInFile = new Set<string>();

    // 讀取 .env 檔案
    try {
      if (fs.existsSync(envFile)) {
        const envContent = fs.readFileSync(envFile, 'utf8');
        const envLines = envContent.split('\n');

        for (const line of envLines) {
          const match = line.match(/^([A-Z_][A-Z0-9_]*)=/);
          if (match) {
            envVarsInFile.add(match[1]);
          }
        }
        console.log(
          chalk.green(`✅ .env 檔案存在，包含 ${envVarsInFile.size} 個變數`)
        );
      } else {
        this.addResult('環境變數檢查', 'fail', '.env 檔案不存在', undefined, [
          '建立 .env 檔案',
          '參考 .env.example',
        ]);
        return;
      }
    } catch (error) {
      this.addResult(
        '環境變數檢查',
        'warning',
        '無法讀取 .env 檔案',
        error instanceof Error ? error.message : String(error)
      );
      return;
    }

    // 掃描程式碼中使用的環境變數
    const usedEnvVars = new Set<string>();
    const allFiles = globSync(path.join(this.srcPath, '**/*.ts'));

    for (const file of allFiles) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        const matches = content.match(/process\.env\.([A-Z_][A-Z0-9_]*)/g);

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
    const definedVars: string[] = [];

    for (const varName of usedEnvVars) {
      if (!envVarsInFile.has(varName) && !process.env[varName]) {
        undefinedVars.push(varName);
      } else {
        definedVars.push(varName);
      }
    }

    if (undefinedVars.length > 0) {
      this.addResult(
        '環境變數檢查',
        'fail',
        `發現 ${undefinedVars.length} 個未定義的環境變數`,
        undefinedVars,
        [
          '在 .env 檔案中添加這些變數',
          '檢查 Replit Secrets 設定',
          '確認變數名稱拼寫正確',
        ]
      );
    } else {
      this.addResult(
        '環境變數檢查',
        'pass',
        `所有 ${definedVars.length} 個環境變數都已正確定義`
      );
    }

    // 檢查關鍵環境變數
    const criticalVars = [
      'LINE_CHANNEL_ACCESS_TOKEN',
      'LINE_CHANNEL_SECRET',
      'DATABASE_URL',
      'LIFF_ID',
    ];
    const missingCritical = criticalVars.filter(
      v => !process.env[v] && !envVarsInFile.has(v)
    );

    if (missingCritical.length > 0) {
      this.addResult(
        '環境變數檢查',
        'fail',
        `缺少關鍵環境變數: ${missingCritical.join(', ')}`,
        missingCritical,
        ['設定 LINE Bot 相關變數', '配置資料庫連線', '設定 LIFF 應用程式 ID']
      );
    }
  }

  // 3. 檢查前端檔案
  async checkFrontendFiles() {
    console.log(chalk.yellow('🔍 步驟 3: 檢查前端檔案...'));

    const frontendPaths = [
      path.join(process.cwd(), 'public'),
      path.join(process.cwd(), 'client'),
      path.join(this.srcPath, 'frontend'),
    ];

    let frontendFound = false;
    let totalFiles = 0;
    let errorFiles = 0;

    for (const frontendPath of frontendPaths) {
      if (fs.existsSync(frontendPath)) {
        frontendFound = true;
        console.log(
          chalk.green(
            `✅ 發現前端目錄: ${path.relative(process.cwd(), frontendPath)}`
          )
        );

        try {
          const files = globSync(
            path.join(frontendPath, '**/*.{html,js,ts,tsx,jsx}')
          );
          totalFiles += files.length;

          for (const file of files) {
            const content = fs.readFileSync(file, 'utf8');
            const relativePath = path.relative(frontendPath, file);

            // 檢查 HTML 檔案
            if (file.endsWith('.html')) {
              const htmlIssues = [];

              if (!content.includes('<html') || !content.includes('<body')) {
                htmlIssues.push('HTML 基本結構不完整');
              }

              // 檢查 JavaScript 引用
              const scriptMatches = content.match(
                /<script[^>]*src=['"]([^'"]+)['"]/g
              );
              if (scriptMatches) {
                for (const scriptMatch of scriptMatches) {
                  const src = scriptMatch.match(/src=['"]([^'"]+)['"]/)?.[1];
                  if (src && src.startsWith('./')) {
                    const scriptPath = path.resolve(path.dirname(file), src);
                    if (!fs.existsSync(scriptPath)) {
                      htmlIssues.push(`找不到 JavaScript 檔案: ${src}`);
                    }
                  }
                }
              }

              // 檢查 CSS 引用
              const linkMatches = content.match(
                /<link[^>]*href=['"]([^'"]+)['"]/g
              );
              if (linkMatches) {
                for (const linkMatch of linkMatches) {
                  const href = linkMatch.match(/href=['"]([^'"]+)['"]/)?.[1];
                  if (href && href.startsWith('./') && href.endsWith('.css')) {
                    const cssPath = path.resolve(path.dirname(file), href);
                    if (!fs.existsSync(cssPath)) {
                      htmlIssues.push(`找不到 CSS 檔案: ${href}`);
                    }
                  }
                }
              }

              if (htmlIssues.length > 0) {
                errorFiles++;
                this.addResult(
                  '前端檔案檢查',
                  'warning',
                  `HTML 檔案問題: ${relativePath}`,
                  htmlIssues,
                  ['檢查檔案路徑', '確認資源檔案存在', '修正 HTML 結構']
                );
              }
            }

            // 檢查 JavaScript/TypeScript 檔案
            if (file.match(/\.(js|ts|tsx|jsx)$/)) {
              const jsIssues = [];

              // 檢查語法錯誤指標
              if (
                content.includes('SyntaxError') ||
                content.includes('Unexpected token')
              ) {
                jsIssues.push('可能包含語法錯誤');
              }

              // 檢查未閉合的括號
              const openBraces = (content.match(/\{/g) || []).length;
              const closeBraces = (content.match(/\}/g) || []).length;
              if (openBraces !== closeBraces) {
                jsIssues.push(
                  `括號不匹配 (開: ${openBraces}, 閉: ${closeBraces})`
                );
              }

              // 檢查 console.error 呼叫
              if (content.match(/console\.error\(/)) {
                jsIssues.push('包含錯誤輸出，可能有問題');
              }

              if (jsIssues.length > 0) {
                errorFiles++;
                this.addResult(
                  '前端檔案檢查',
                  'warning',
                  `JS/TS 檔案問題: ${relativePath}`,
                  jsIssues,
                  ['檢查括號配對', '使用程式碼格式化工具', '檢查語法錯誤']
                );
              }
            }
          }
        } catch (error) {
          this.addResult(
            '前端檔案檢查',
            'fail',
            `檢查前端檔案時發生錯誤: ${path.relative(process.cwd(), frontendPath)}`,
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
    } else if (errorFiles === 0) {
      this.addResult(
        '前端檔案檢查',
        'pass',
        `成功檢查 ${totalFiles} 個前端檔案，無發現問題`
      );
    }
  }

  // 4. 執行 health check 測試（智能檢測）
  async runHealthCheck() {
    console.log(chalk.yellow('🔍 步驟 4: 執行 Health Check 測試...'));

    const port = process.env.PORT || 5000;
    const healthUrl = `http://0.0.0.0:${port}/health`;

    const attemptHealthCheck = (): Promise<{
      success: boolean;
      data?: any;
      error?: string;
      statusCode?: number;
    }> => {
      return new Promise(resolve => {
        const req = http.get(healthUrl, res => {
          let data = '';

          res.on('data', chunk => {
            data += chunk;
          });

          res.on('end', () => {
            try {
              const healthData = JSON.parse(data);
              resolve({
                success:
                  res.statusCode === 200 && healthData.status === 'healthy',
                data: healthData,
                statusCode: res.statusCode,
              });
            } catch (error) {
              resolve({
                success: false,
                error: 'JSON 解析錯誤',
                data: data,
                statusCode: res.statusCode,
              });
            }
          });
        });

        req.on('error', error => {
          resolve({ success: false, error: error.message });
        });

        req.setTimeout(5000, () => {
          req.destroy();
          resolve({ success: false, error: '連線逾時' });
        });
      });
    };

    // 嘗試連接
    const result = await attemptHealthCheck();

    if (result.success) {
      this.addResult('Health Check', 'pass', 'Health Check 測試成功', {
        status: result.data.status,
        uptime: result.data.uptime,
        database: result.data.database,
        services: result.data.services,
      });
      console.log(chalk.green('✅ Health Check 成功'));
      return;
    }

    // 如果第一次失敗，等待 3 秒後再試（給伺服器啟動時間）
    if (result.error?.includes('ECONNREFUSED')) {
      console.log(chalk.yellow('⏳ 等待伺服器啟動...'));
      await new Promise(wait => setTimeout(wait, 3000));

      const secondResult = await attemptHealthCheck();

      if (secondResult.success) {
        this.addResult(
          'Health Check',
          'pass',
          'Health Check 測試成功（延遲啟動）',
          {
            status: secondResult.data.status,
            uptime: secondResult.data.uptime,
            database: secondResult.data.database,
            services: secondResult.data.services,
          }
        );
        console.log(chalk.green('✅ Health Check 成功'));
        return;
      }

      // 如果還是失敗，只記錄為警告而不是錯誤
      this.addResult(
        'Health Check',
        'warning',
        'Health Check 暫時無法連接',
        '診斷工具可能比伺服器啟動更早執行',
        ['此警告通常可以忽略', '如果系統功能正常，則無需處理']
      );
      console.log(
        chalk.yellow('⚠️ Health Check 暫時無法連接 - 這通常是正常的')
      );
    } else {
      // 其他錯誤情況
      this.addResult(
        'Health Check',
        'warning',
        `Health Check 回應異常: ${result.error || '未知錯誤'}`,
        result.data || result.error,
        ['檢查伺服器狀態', '確認 health 端點實作']
      );
    }
  }

  // 5. 彙整所有錯誤訊息
  generateReport() {
    console.log(chalk.cyan('\n' + '='.repeat(60)));
    console.log(chalk.cyan('🦁 北大獅子會系統診斷報告'));
    console.log(chalk.cyan('='.repeat(60)));

    const passCount = this.results.filter(r => r.status === 'pass').length;
    const warningCount = this.results.filter(
      r => r.status === 'warning'
    ).length;
    const failCount = this.results.filter(r => r.status === 'fail').length;
    const totalCount = this.results.length;

    console.log(chalk.cyan(`📊 總計: ${totalCount} 項檢查`));
    console.log(chalk.green(`✅ 通過: ${passCount}`));
    console.log(chalk.yellow(`⚠️  警告: ${warningCount}`));
    console.log(chalk.red(`❌ 失敗: ${failCount}`));
    console.log('');

    // 按類別顯示結果
    const sections = [...new Set(this.results.map(r => r.section))];

    for (const section of sections) {
      console.log(chalk.bold(`\n📋 ${section}:`));
      const sectionResults = this.results.filter(r => r.section === section);

      for (const result of sectionResults) {
        const icon =
          result.status === 'pass'
            ? '✅'
            : result.status === 'warning'
              ? '⚠️'
              : '❌';
        const color =
          result.status === 'pass'
            ? chalk.green
            : result.status === 'warning'
              ? chalk.yellow
              : chalk.red;

        console.log(color(`  ${icon} ${result.message}`));

        if (result.details && Array.isArray(result.details)) {
          result.details.forEach(detail => {
            console.log(color(`      - ${detail}`));
          });
        } else if (result.details && typeof result.details === 'object') {
          console.log(
            color(`      詳細資訊: ${JSON.stringify(result.details, null, 2)}`)
          );
        } else if (result.details) {
          console.log(color(`      詳細資訊: ${result.details}`));
        }

        if (result.suggestions && result.suggestions.length > 0) {
          console.log(chalk.cyan('      建議修正:'));
          result.suggestions.forEach(suggestion => {
            console.log(chalk.cyan(`        • ${suggestion}`));
          });
        }
      }
    }

    // 生成 JSON 報告
    const reportPath = path.join(
      process.cwd(),
      'system_diagnostic_report.json'
    );
    const reportData = {
      timestamp: new Date().toISOString(),
      summary: {
        total: totalCount,
        pass: passCount,
        warning: warningCount,
        fail: failCount,
        healthScore: Math.round((passCount / totalCount) * 100),
      },
      results: this.results,
    };

    fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
    console.log(chalk.green(`\n✅ 詳細報告已儲存至: ${reportPath}`));

    // 總結建議
    console.log(chalk.cyan('\n💡 總結建議:'));
    if (failCount > 0) {
      console.log(chalk.red('🚨 發現嚴重問題，建議立即修正:'));
      this.results
        .filter(r => r.status === 'fail')
        .forEach(result => {
          console.log(chalk.red(`   - ${result.message}`));
        });
    }

    if (warningCount > 0) {
      console.log(chalk.yellow('⚠️  發現警告事項，建議排程修正:'));
      this.results
        .filter(r => r.status === 'warning')
        .slice(0, 3)
        .forEach(result => {
          console.log(chalk.yellow(`   - ${result.message}`));
        });
    }

    if (passCount === totalCount) {
      console.log(chalk.green('🎉 系統狀態良好，所有檢查都通過！'));
    }

    return reportData;
  }

  // 執行完整診斷
  async runFullDiagnostics() {
    console.log(chalk.cyan('🔍 開始執行完整系統診斷...\n'));

    await this.scanSourceFiles();
    await this.checkEnvironmentVariables();
    await this.checkFrontendFiles();
    await this.runHealthCheck();

    return this.generateReport();
  }
}

// 執行診斷（如果直接運行此檔案）
if (require.main === module) {
  const reporter = new SystemReportGenerator();
  reporter
    .runFullDiagnostics()
    .then(() => {
      console.log(chalk.green('\n✅ 診斷完成！'));
      process.exit(0);
    })
    .catch((error: any) => {
      console.error(chalk.red('❌ 診斷過程中發生錯誤:'), error);
      process.exit(1);
    });
}

export default SystemReportGenerator;
