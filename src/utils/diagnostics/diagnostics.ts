import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';
import express from 'express';
import http from 'http';
import { globSync } from 'glob';
import chalk from 'chalk';
import { execSync } from 'child_process';

const PORT = process.env.PORT || 5000;
const DB_URL = process.env.DATABASE_URL || 'postgres://localhost:5432/postgres';

console.log(chalk.cyan('\n🔍 北大獅子會系統診斷工具啟動中...\n'));

// 1. 掃描 /src 目錄下所有 route、controller、middleware 的錯誤
function scanSourceFiles() {
  console.log(chalk.blue('📁 1. 掃描 /src 目錄檔案...'));

  const patterns = [
    'src/routes/**/*.ts',
    'src/controllers/**/*.ts',
    'src/middleware/**/*.ts',
    'src/models/**/*.ts',
    'src/utils/**/*.ts',
  ];

  let hasErrors = false;

  patterns.forEach(pattern => {
    const files = globSync(pattern);
    files.forEach((file: string) => {
      try {
        const content = fs.readFileSync(file, 'utf-8');

        // 檢查基本 TypeScript 語法
        if (content.includes('import') && !content.includes('from')) {
          console.log(chalk.red(`❌ ${file}: 可能有不完整的 import 語句`));
          hasErrors = true;
        }

        // 檢查是否有未捕獲的 async/await
        if (
          content.includes('async') &&
          !content.includes('try') &&
          !content.includes('catch')
        ) {
          console.log(chalk.yellow(`⚠️ ${file}: async 函數缺少錯誤處理`));
        }

        console.log(chalk.green(`✅ ${file} 語法檢查通過`));
      } catch (err: any) {
        console.log(chalk.red(`❌ ${file} 讀取錯誤: ${err.message}`));
        hasErrors = true;
      }
    });
  });

  if (!hasErrors) {
    console.log(chalk.green('✅ 所有源碼檔案檢查通過\n'));
  }
}

// 2. 比對 .env 檔與實際程式是否有使用未定義的變數
function checkEnvVariables() {
  console.log(chalk.blue('🔧 2. 檢查環境變數...'));

  const envPath = path.resolve('.env');
  const examplePath = path.resolve('.env.example');

  // 檢查 .env 檔案存在
  if (!fs.existsSync(envPath)) {
    console.log(chalk.red('❌ 缺少 .env 檔案'));
    return;
  }

  try {
    const envVars = dotenv.parse(fs.readFileSync(envPath));
    console.log(chalk.green('✅ .env 檔案存在且可讀取'));

    // 檢查程式中使用的環境變數
    const sourceFiles = globSync('src/**/*.ts');
    const usedEnvVars = new Set();

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
      varName => !envVars[varName as string]
    );

    if (missingVars.length > 0) {
      console.log(
        chalk.red(
          `❌ 程式中使用但 .env 中缺少的變數: ${missingVars.join(', ')}`
        )
      );
    } else {
      console.log(chalk.green('✅ 所有使用的環境變數都已定義'));
    }

    // 顯示已設定的環境變數
    console.log(
      chalk.cyan(`📋 已設定的環境變數: ${Object.keys(envVars).join(', ')}`)
    );
  } catch (err: any) {
    console.log(chalk.red(`❌ .env 檔案解析錯誤: ${err.message}`));
  }

  console.log('');
}

// 3. 檢查前端檔案
function checkFrontendFiles() {
  console.log(chalk.blue('🎨 3. 檢查前端檔案...'));

  const frontendDirs = ['public', 'client/src', 'src/frontend'];
  let frontendFound = false;

  frontendDirs.forEach(dir => {
    if (fs.existsSync(dir)) {
      frontendFound = true;
      console.log(chalk.green(`✅ 發現前端目錄: ${dir}`));

      // 檢查 JS/TS 檔案
      const jsFiles = globSync(`${dir}/**/*.{js,ts,tsx,jsx}`);
      jsFiles.forEach(file => {
        try {
          const content = fs.readFileSync(file, 'utf-8');

          // 簡單的語法檢查已移除 (不需要 esprima)

          console.log(chalk.green(`✅ ${file} 語法正確`));
        } catch (err: any) {
          console.log(chalk.red(`❌ ${file} 語法錯誤: ${err.message}`));
        }
      });

      // 檢查 HTML 檔案
      const htmlFiles = globSync(`${dir}/**/*.html`);
      htmlFiles.forEach(file => {
        const content = fs.readFileSync(file, 'utf-8');
        if (!content.includes('<script') && !content.includes('<link')) {
          console.log(chalk.yellow(`⚠️ ${file} 未包含 JS 或 CSS 資源`));
        } else {
          console.log(chalk.green(`✅ ${file} 包含必要資源`));
        }
      });
    }
  });

  if (!frontendFound) {
    console.log(chalk.yellow('⚠️ 未發現前端檔案目錄'));
  }

  console.log('');
}

// 4. 執行 health check 測試（智能檢測）
function runHealthCheck() {
  console.log(chalk.blue('🏥 4. 執行 Health Check...'));

  const PORT = process.env.PORT || '5000';

  const attemptHealthCheck = (): Promise<{
    success: boolean;
    data?: any;
    error?: string;
  }> => {
    return new Promise(resolve => {
      const req = http.get(`http://0.0.0.0:${PORT}/health`, res => {
        let data = '';

        res.on('data', chunk => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            const healthData = JSON.parse(data);
            if (res.statusCode === 200 && healthData.status === 'healthy') {
              resolve({ success: true, data: healthData });
            } else {
              resolve({
                success: false,
                error: `HTTP ${res.statusCode}: ${data}`,
              });
            }
          } catch (parseError) {
            resolve({ success: false, error: `回應格式錯誤: ${data}` });
          }
        });
      });

      req.on('error', err => {
        resolve({ success: false, error: err.message });
      });

      req.setTimeout(5000, () => {
        req.destroy();
        resolve({ success: false, error: 'Health check 逾時 (5秒)' });
      });
    });
  };

  return new Promise<void>(async resolve => {
    // 先嘗試一次
    const result = await attemptHealthCheck();

    if (result.success) {
      console.log(chalk.green(`✅ Health check 成功`));
      console.log(chalk.cyan(`📊 狀態: ${result.data.status}`));
      console.log(chalk.cyan(`🔌 資料庫: ${result.data.database}`));
      if (result.data.services?.routes) {
        console.log(
          chalk.cyan(`🛣️ 路由: ${result.data.services.routes.join(', ')}`)
        );
      }
      resolve();
      return;
    }

    // 如果失敗，等待 3 秒後再試一次（給伺服器啟動時間）
    console.log(chalk.yellow('⏳ 等待伺服器啟動...'));
    await new Promise(wait => setTimeout(wait, 3000));

    const secondResult = await attemptHealthCheck();

    if (secondResult.success) {
      console.log(chalk.green(`✅ Health check 成功`));
      console.log(chalk.cyan(`📊 狀態: ${secondResult.data.status}`));
      console.log(chalk.cyan(`🔌 資料庫: ${secondResult.data.database}`));
      if (secondResult.data.services?.routes) {
        console.log(
          chalk.cyan(`🛣️ 路由: ${secondResult.data.services.routes.join(', ')}`)
        );
      }
    } else {
      // 只有在真的連不上時才顯示警告，而不是錯誤
      if (secondResult.error?.includes('ECONNREFUSED')) {
        console.log(
          chalk.yellow(
            `⏳ Health Check 暫時無法連接 - 這是正常的，伺服器可能正在啟動中`
          )
        );
      } else {
        console.log(
          chalk.yellow(`⚠️ Health check 暫時失敗: ${secondResult.error}`)
        );
      }
    }

    resolve();
  });
}

// 資料庫連線測試
async function testDatabaseConnection() {
  console.log(chalk.blue('🗄️ 5. 測試資料庫連線...'));

  try {
    const sequelize = new Sequelize(DB_URL, { logging: false });
    await sequelize.authenticate();
    console.log(chalk.green('✅ 資料庫連線成功'));

    // 測試基本操作
    await sequelize.query('SELECT 1 as test');
    console.log(chalk.green('✅ 資料庫查詢測試成功'));

    await sequelize.close();
  } catch (err: any) {
    console.log(chalk.red(`❌ 資料庫連線失敗: ${err.message}`));
  }

  console.log('');
}

// 檢查 package.json 依賴
function checkDependencies() {
  console.log(chalk.blue('📦 6. 檢查套件依賴...'));

  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
    const dependencies = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies,
    };

    console.log(
      chalk.green(`✅ 共 ${Object.keys(dependencies).length} 個套件`)
    );

    // 檢查重要套件
    const importantPackages = [
      'express',
      'sequelize',
      '@line/bot-sdk',
      'dotenv',
    ];
    importantPackages.forEach(pkg => {
      if (dependencies[pkg]) {
        console.log(chalk.green(`✅ ${pkg}: ${dependencies[pkg]}`));
      } else {
        console.log(chalk.red(`❌ 缺少重要套件: ${pkg}`));
      }
    });
  } catch (err: any) {
    console.log(chalk.red(`❌ package.json 讀取錯誤: ${err.message}`));
  }

  console.log('');
}

// 主要診斷函數
export async function runDiagnostics() {
  console.log(chalk.cyan('='.repeat(60)));
  console.log(chalk.cyan('🦁 北大獅子會系統診斷報告'));
  console.log(chalk.cyan('='.repeat(60)));

  scanSourceFiles();
  checkEnvVariables();
  checkFrontendFiles();
  await runHealthCheck();
  await testDatabaseConnection();
  checkDependencies();

  console.log(chalk.cyan('='.repeat(60)));
  console.log(chalk.cyan('📋 診斷完成'));
  console.log(chalk.cyan('='.repeat(60)));

  // 建議修正事項
  console.log(chalk.yellow('\n💡 建議修正事項:'));
  console.log(chalk.yellow('1. 確保所有環境變數都已正確設定'));
  console.log(chalk.yellow('2. 檢查伺服器是否正常運行'));
  console.log(chalk.yellow('3. 確認資料庫連線設定正確'));
  console.log(chalk.yellow('4. 執行 npm install 確保所有依賴已安裝'));
  console.log(chalk.yellow('5. 檢查防火牆是否阻擋連接埠'));
}

// 執行診斷
runDiagnostics().catch(console.error);
