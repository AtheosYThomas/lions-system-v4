import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';
import http from 'http';
import { globSync } from 'glob';
import chalk from 'chalk';

// 載入環境變數
dotenv.config();

const PORT = process.env.PORT || 3000;
const DB_URL = process.env.DATABASE_URL || 'postgres://localhost:5432/postgres';

console.log(chalk.cyan('\n🔍 北大獅子會系統完整診斷報告\n'));

// 1. 掃描 /src 目錄下所有檔案的錯誤
function scanSourceFiles() {
  console.log(chalk.blue('📁 1. 掃描 /src 目錄檔案錯誤...'));

  const patterns = [
    'src/routes/**/*.ts',
    'src/controllers/**/*.ts', 
    'src/middleware/**/*.ts',
    'src/models/**/*.ts',
    'src/utils/**/*.ts',
    'src/line/**/*.ts',
    'src/config/**/*.ts'
  ];

  let hasErrors = false;
  let errorReport: string[] = [];

  patterns.forEach(pattern => {
    const files = globSync(pattern);
    console.log(chalk.cyan(`檢查模式: ${pattern} (${files.length} 個檔案)`));

    files.forEach((file: string) => {
      try {
        const content = fs.readFileSync(file, 'utf-8');

        // 檢查 TypeScript 語法問題
        const issues = [];

        // 檢查 import 語句
        const importMatches = content.match(/import.*from.*;/g);
        if (content.includes('import') && !importMatches) {
          issues.push('可能有不完整的 import 語句');
        }

        // 檢查 async/await 錯誤處理
        if (content.includes('async') && content.includes('await') && 
            !content.includes('try') && !content.includes('catch')) {
          issues.push('async 函數缺少錯誤處理');
        }

        // 檢查未處理的 Promise
        const promiseMatches = content.match(/\.then\(/g);
        const catchMatches = content.match(/\.catch\(/g);
        if (promiseMatches && !catchMatches) {
          issues.push('Promise 缺少錯誤處理');
        }

        // 檢查未定義的變數 (簡單檢查)
        const undefinedVars = content.match(/undefined\s*\?/g);
        if (undefinedVars) {
          issues.push('可能有未定義變數的使用');
        }

        if (issues.length > 0) {
          console.log(chalk.yellow(`⚠️ ${file}:`));
          issues.forEach(issue => console.log(chalk.yellow(`   - ${issue}`)));
          errorReport.push({ file, issues });
          hasErrors = true;
        } else {
          console.log(chalk.green(`✅ ${file}`));
        }

      } catch (err: any) {
        console.log(chalk.red(`❌ ${file} 讀取錯誤: ${err.message}`));
        errorReport.push({ file, issues: [`讀取錯誤: ${err.message}`] });
        hasErrors = true;
      }
    });
  });

  if (!hasErrors) {
    console.log(chalk.green('✅ 所有源碼檔案檢查通過'));
  }

  return errorReport;
}

// 2. 檢查環境變數
function checkEnvVariables() {
  console.log(chalk.blue('\n🔧 2. 檢查環境變數配置...'));

  const envReport = {
    envFileExists: false,
    missingVars: [],
    configuredVars: [],
    usedButNotDefined: []
  };

  const envPath = path.resolve('.env');

  if (!fs.existsSync(envPath)) {
    console.log(chalk.red('❌ 缺少 .env 檔案'));
    envReport.envFileExists = false;
    return envReport;
  }

  try {
    envReport.envFileExists = true;
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
    const missingVars = Array.from(usedEnvVars).filter(varName => !envVars[varName as string]);
    const configuredVars = Object.keys(envVars);

    envReport.missingVars = missingVars;
    envReport.configuredVars = configuredVars;
    envReport.usedButNotDefined = missingVars;

    if (missingVars.length > 0) {
      console.log(chalk.red(`❌ 程式中使用但 .env 中缺少的變數: ${missingVars.join(', ')}`));
    } else {
      console.log(chalk.green('✅ 所有使用的環境變數都已定義'));
    }

    console.log(chalk.cyan(`📋 已設定的環境變數: ${configuredVars.join(', ')}`));
    console.log(chalk.cyan(`📋 程式中使用的環境變數: ${Array.from(usedEnvVars).join(', ')}`));

  } catch (err: any) {
    console.log(chalk.red(`❌ .env 檔案解析錯誤: ${err.message}`));
  }

  return envReport;
}

// 3. 檢查前端檔案
function checkFrontendFiles() {
  console.log(chalk.blue('\n🎨 3. 檢查前端檔案...'));

  const frontendReport = {
    frontendFound: false,
    directories: [],
    jsFiles: [],
    htmlFiles: [],
    errors: []
  };

  const frontendDirs = ['public', 'client/src', 'src/frontend'];

  frontendDirs.forEach(dir => {
    if (fs.existsSync(dir)) {
      frontendReport.frontendFound = true;
      frontendReport.directories.push(dir);
      console.log(chalk.green(`✅ 發現前端目錄: ${dir}`));

      // 檢查 JS/TS 檔案
      const jsFiles = globSync(`${dir}/**/*.{js,ts,tsx,jsx}`);
      frontendReport.jsFiles.push(...jsFiles);

      jsFiles.forEach(file => {
        try {
          const content = fs.readFileSync(file, 'utf-8');

          // 檢查基本語法問題
          if (content.includes('import') && !content.includes('from')) {
            frontendReport.errors.push(`${file}: 可能有不完整的 import`);
          }

          // 檢查未處理的錯誤
          if (content.includes('fetch(') && !content.includes('catch')) {
            frontendReport.errors.push(`${file}: fetch 請求缺少錯誤處理`);
          }

          console.log(chalk.green(`✅ ${file}`));
        } catch (err: any) {
          const error = `${file} 讀取錯誤: ${err.message}`;
          frontendReport.errors.push(error);
          console.log(chalk.red(`❌ ${error}`));
        }
      });

      // 檢查 HTML 檔案
      const htmlFiles = globSync(`${dir}/**/*.html`);
      frontendReport.htmlFiles.push(...htmlFiles);

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

  if (!frontendReport.frontendFound) {
    console.log(chalk.yellow('⚠️ 未發現前端檔案目錄'));
  }

  return frontendReport;
}

// 4. 執行 health check 測試
function runHealthCheck(): Promise<any> {
  console.log(chalk.blue('\n🏥 4. 執行 Health Check 測試...'));

  return new Promise((resolve) => {
    // 測試多個可能的端點
    const endpoints = [
      { url: `http://localhost:${PORT}/health`, name: 'Backend Health' },
      { url: `http://localhost:${PORT}/api/health`, name: 'API Health' },
      { url: `http://localhost:5000/`, name: 'Frontend' }
    ];

    let results: any[] = [];

    const testEndpoint = (endpoint: any, callback: any) => {
      const req = http.get(endpoint.url, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          const result = {
            endpoint: endpoint.name,
            url: endpoint.url,
            status: res.statusCode,
            success: res.statusCode === 200,
            response: data
          };

          if (res.statusCode === 200) {
            console.log(chalk.green(`✅ ${endpoint.name} 正常 (${res.statusCode})`));
          } else {
            console.log(chalk.red(`❌ ${endpoint.name} 異常 (${res.statusCode})`));
          }

          results.push(result);
          callback();
        });
      });

      req.on('error', (err) => {
        const result = {
          endpoint: endpoint.name,
          url: endpoint.url,
          status: 0,
          success: false,
          error: err.message
        };

        console.log(chalk.red(`❌ ${endpoint.name} 連線失敗: ${err.message}`));
        results.push(result);
        callback();
      });

      req.setTimeout(5000, () => {
        const result = {
          endpoint: endpoint.name,
          url: endpoint.url,
          status: 0,
          success: false,
          error: 'Timeout'
        };

        console.log(chalk.red(`❌ ${endpoint.name} 逾時`));
        results.push(result);
        req.destroy();
        callback();
      });
    };

    let completed = 0;
    endpoints.forEach(endpoint => {
      testEndpoint(endpoint, () => {
        completed++;
        if (completed === endpoints.length) {
          resolve(results);
        }
      });
    });
  });
}

// 5. 測試資料庫連線
async function testDatabaseConnection() {
  console.log(chalk.blue('\n🗄️ 5. 測試資料庫連線...'));

  const dbReport = {
    connectionSuccess: false,
    querySuccess: false,
    error: null
  };

  try {
    const sequelize = new Sequelize(DB_URL, { logging: false });
    await sequelize.authenticate();
    dbReport.connectionSuccess = true;
    console.log(chalk.green('✅ 資料庫連線成功'));

    // 測試基本操作
    await sequelize.query("SELECT 1 as test");
    dbReport.querySuccess = true;
    console.log(chalk.green('✅ 資料庫查詢測試成功'));

    await sequelize.close();
  } catch (err: any) {
    dbReport.error = err.message;
    console.log(chalk.red(`❌ 資料庫連線失敗: ${err.message}`));
  }

  return dbReport;
}

// 6. 檢查套件依賴
function checkDependencies() {
  console.log(chalk.blue('\n📦 6. 檢查套件依賴...'));

  const depReport = {
    packageJsonExists: false,
    totalPackages: 0,
    missingImportantPackages: [],
    availablePackages: []
  };

  try {
    if (!fs.existsSync('package.json')) {
      console.log(chalk.red('❌ package.json 不存在'));
      return depReport;
    }

    depReport.packageJsonExists = true;
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
    const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };

    depReport.totalPackages = Object.keys(dependencies).length;
    console.log(chalk.green(`✅ 共 ${depReport.totalPackages} 個套件`));

    // 檢查重要套件
    const importantPackages = ['express', 'sequelize', '@line/bot-sdk', 'dotenv', 'typescript', 'ts-node'];
    importantPackages.forEach(pkg => {
      if (dependencies[pkg]) {
        console.log(chalk.green(`✅ ${pkg}: ${dependencies[pkg]}`));
        depReport.availablePackages.push(pkg);
      } else {
        console.log(chalk.red(`❌ 缺少重要套件: ${pkg}`));
        depReport.missingImportantPackages.push(pkg);
      }
    });

  } catch (err: any) {
    console.log(chalk.red(`❌ package.json 讀取錯誤: ${err.message}`));
  }

  return depReport;
}

// 主要診斷函數
async function runFullDiagnostics() {
  console.log(chalk.cyan('=' .repeat(60)));
  console.log(chalk.cyan('🦁 北大獅子會系統完整診斷報告'));
  console.log(chalk.cyan('=' .repeat(60)));

  const report = {
    timestamp: new Date().toISOString(),
    sourceFiles: scanSourceFiles(),
    envVariables: checkEnvVariables(),
    frontendFiles: checkFrontendFiles(),
    healthCheck: await runHealthCheck(),
    database: await testDatabaseConnection(),
    dependencies: checkDependencies()
  };

  console.log(chalk.cyan('\n=' .repeat(60)));
  console.log(chalk.cyan('📋 診斷結果總結'));
  console.log(chalk.cyan('=' .repeat(60)));

  // 彙總所有問題
  const allIssues = [];

  // 源碼問題
  if (report.sourceFiles.length > 0) {
    allIssues.push({
      category: '源碼檔案',
      issues: report.sourceFiles.map(item => `${item.file}: ${item.issues.join(', ')}`)
    });
  }

  // 環境變數問題
  if (report.envVariables.missingVars.length > 0) {
    allIssues.push({
      category: '環境變數',
      issues: [`缺少變數: ${report.envVariables.missingVars.join(', ')}`]
    });
  }

  // 前端問題
  if (report.frontendFiles.errors.length > 0) {
    allIssues.push({
      category: '前端檔案',
      issues: report.frontendFiles.errors
    });
  }

  // Health check 問題
  const failedHealthChecks = report.healthCheck.filter((check: any) => !check.success);
  if (failedHealthChecks.length > 0) {
    allIssues.push({
      category: 'Health Check',
      issues: failedHealthChecks.map((check: any) => `${check.endpoint}: ${check.error || 'HTTP ' + check.status}`)
    });
  }

  // 資料庫問題
  if (!report.database.connectionSuccess) {
    allIssues.push({
      category: '資料庫',
      issues: [report.database.error || '連線失敗']
    });
  }

  // 套件問題
  if (report.dependencies.missingImportantPackages.length > 0) {
    allIssues.push({
      category: '套件依賴',
      issues: [`缺少重要套件: ${report.dependencies.missingImportantPackages.join(', ')}`]
        });
  }

  // 輸出問題報告
  if (allIssues.length === 0) {
    console.log(chalk.green('🎉 恭喜！系統檢查全部通過，沒有發現問題。'));
  } else {
    console.log(chalk.red('🚨 發現以下問題需要修正：\n'));
    allIssues.forEach((category, index) => {
      console.log(chalk.red(`${index + 1}. ${category.category}:`));
      category.issues.forEach(issue => {
        console.log(chalk.red(`   ❌ ${issue}`));
      });
      console.log('');
    });
  }

  // 修正建議
  console.log(chalk.yellow('💡 修正建議:'));
  console.log(chalk.yellow('1. 確保後端服務器在 port 3000 運行'));
  console.log(chalk.yellow('2. 確保前端開發服務器在 port 5000 運行'));
  console.log(chalk.yellow('3. 檢查 .env 檔案中的環境變數設定'));
  console.log(chalk.yellow('4. 執行 npm install 確保所有依賴已安裝'));
  console.log(chalk.yellow('5. 檢查資料庫連線字串是否正確'));

  // 保存報告到檔案
  try {
    fs.writeFileSync('diagnostic_report.json', JSON.stringify(report, null, 2));
    console.log(chalk.cyan('\n📄 詳細報告已保存至 diagnostic_report.json'));
  } catch (err) {
    console.log(chalk.red('❌ 無法保存報告檔案'));
  }

  return report;
}

// 執行診斷
runFullDiagnostics().catch(console.error);