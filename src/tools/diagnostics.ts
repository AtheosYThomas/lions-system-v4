
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';
import chalk from 'chalk';
import { execSync } from 'child_process';

const PORT = process.env.PORT || 5000;
const DB_URL = process.env.DATABASE_URL || 'postgres://localhost:5432/postgres';

// ------------------ ENV CHECK ------------------
function checkEnvVariables() {
  console.log('🔍 檢查環境變數...');
  const envPath = path.resolve('.env');

  try {
    if (fs.existsSync(envPath)) {
      const envVars = dotenv.parse(fs.readFileSync(envPath, 'utf8'));
      console.log(chalk.green('✅ .env 檔案存在'));
      console.log(chalk.blue(`📋 發現 ${Object.keys(envVars).length} 個環境變數`));
      
      // 檢查關鍵變數
      const requiredVars = ['DATABASE_URL', 'LINE_CHANNEL_SECRET', 'LINE_CHANNEL_ACCESS_TOKEN'];
      const missingVars = requiredVars.filter(key => !envVars[key]);
      
      if (missingVars.length > 0) {
        console.log(chalk.red(`❌ 缺少關鍵變數: ${missingVars.join(', ')}`));
      } else {
        console.log(chalk.green('✅ 關鍵環境變數完整'));
      }
    } else {
      console.log(chalk.red('❌ .env 檔案不存在'));
    }
  } catch (error) {
    console.log(chalk.red(`❌ 環境變數檢查失敗: ${error instanceof Error ? error.message : '未知錯誤'}`));
  }
}

// ------------------ TYPESCRIPT CHECK ------------------
function checkTypeScriptCompilation() {
  console.log('🔍 檢查 TypeScript 編譯...');
  try {
    execSync('npx tsc --noEmit --skipLibCheck', { stdio: 'pipe', encoding: 'utf8' });
    console.log(chalk.green('✅ TypeScript 編譯檢查通過'));
  } catch (error: any) {
    console.log(chalk.red('❌ TypeScript 編譯錯誤'));
    if (error.stdout) {
      console.log(error.stdout.toString().substring(0, 500));
    }
  }
}

// ------------------ MODEL CHECK ------------------
function checkModels() {
  console.log('🔍 檢查模型檔案...');
  try {
    const modelFiles = [
      'src/models/member.ts',
      'src/models/event.ts', 
      'src/models/registration.ts',
      'src/models/checkin.ts',
      'src/models/payment.ts',
      'src/models/messageLog.ts'
    ];
    
    let validModels = 0;
    for (const modelFile of modelFiles) {
      if (fs.existsSync(modelFile)) {
        validModels++;
        console.log(chalk.green(`✅ ${path.basename(modelFile)} 存在`));
      } else {
        console.log(chalk.red(`❌ ${path.basename(modelFile)} 不存在`));
      }
    }
    
    if (validModels === modelFiles.length) {
      console.log(chalk.green('✅ 所有模型檔案檢查通過'));
    } else {
      console.log(chalk.yellow(`⚠️ ${validModels}/${modelFiles.length} 個模型檔案存在`));
    }
  } catch (error) {
    console.log(chalk.red(`❌ 模型檢查失敗: ${error instanceof Error ? error.message : '未知錯誤'}`));
  }
}

// ------------------ ROUTE SCAN ------------------
function scanRoutesForErrors() {
  console.log('🔍 掃描路由檔案...');
  const routeFiles = [
    'src/routes/admin.ts',
    'src/routes/members.ts',
    'src/routes/events.ts',
    'src/routes/checkin.ts',
    'src/controllers/*.ts',
    'src/middleware/*.ts'
  ];

  for (const pattern of routeFiles) {
    if (pattern.includes('*')) {
      // 處理通配符
      const dir = path.dirname(pattern);
      if (fs.existsSync(dir)) {
        const files = fs.readdirSync(dir).filter(f => f.endsWith('.ts'));
        files.forEach(file => {
          const fullPath = path.join(dir, file);
          checkSingleFile(fullPath);
        });
      }
    } else {
      checkSingleFile(pattern);
    }
  }
}

function checkSingleFile(filePath: string) {
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // 檢查常見問題
      const issues = [];
      if (content.includes('${') && content.includes('}')) {
        issues.push('包含未展開的模板字串');
      }
      if (content.includes('Missing parameter')) {
        issues.push('包含錯誤訊息');
      }
      
      if (issues.length === 0) {
        console.log(chalk.green(`✅ ${filePath} OK`));
      } else {
        console.log(chalk.yellow(`⚠️ ${filePath}: ${issues.join(', ')}`));
      }
    } else {
      console.log(chalk.red(`❌ ${filePath} 檔案不存在`));
    }
  } catch (err) {
    console.log(chalk.red(`❌ ${filePath} 檢查失敗: ${err instanceof Error ? err.message : '未知錯誤'}`));
  }
}

// ------------------ STATIC RESOURCE CHECK ------------------
function checkStaticAssets() {
  console.log('🔍 檢查靜態資源...');
  const staticDirs = ['public', 'client/dist', 'client/src'];
  for (const dir of staticDirs) {
    if (fs.existsSync(dir)) {
      console.log(chalk.green(`✅ ${dir} 存在`));
    } else {
      console.log(chalk.yellow(`⚠️ ${dir} 不存在`));
    }
  }
}

// ------------------ HEALTH CHECK ------------------
function runHealthCheck() {
  console.log('🔍 檢查健康檢查端點...');
  try {
    const indexFile = 'src/index.ts';
    if (fs.existsSync(indexFile)) {
      const content = fs.readFileSync(indexFile, 'utf8');
      if (content.includes('/health')) {
        console.log(chalk.green('✅ Health check 路由已定義'));
      } else {
        console.log(chalk.yellow('⚠️ Health check 路由未找到'));
      }
    } else {
      console.log(chalk.red('❌ 主要檔案 src/index.ts 不存在'));
    }
  } catch (error) {
    console.log(chalk.red(`❌ Health check 檢查失敗: ${error instanceof Error ? error.message : '未知錯誤'}`));
  }
}

// ------------------ DATABASE TEST ------------------
async function runDatabaseTest() {
  console.log('🔍 測試資料庫連線...');
  try {
    const sequelize = new Sequelize(DB_URL, {
      logging: false,
      dialectOptions: {
        ssl: process.env.NODE_ENV === 'production' ? { require: true, rejectUnauthorized: false } : false
      }
    });
    
    await sequelize.authenticate();
    console.log(chalk.green('✅ 資料庫連線成功'));

    // 檢查資料表
    try {
      const tables = await sequelize.getQueryInterface().showAllTables();
      console.log(chalk.blue(`📋 發現 ${tables.length} 個資料表: ${tables.join(', ')}`));
    } catch (e) {
      console.log(chalk.yellow('⚠️ 無法取得資料表清單'));
    }

    await sequelize.close();
  } catch (e) {
    const error = e instanceof Error ? e : new Error('未知錯誤');
    console.log(chalk.red(`❌ 資料庫錯誤: ${error.message}`));
  }
}

// ------------------ PACKAGE CHECK ------------------
function checkPackages() {
  console.log('🔍 檢查套件...');
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    console.log(chalk.green('✅ package.json 格式正確'));
    
    const nodeModules = fs.existsSync('node_modules');
    if (nodeModules) {
      console.log(chalk.green('✅ node_modules 存在'));
    } else {
      console.log(chalk.red('❌ node_modules 不存在，請執行 npm install'));
    }
  } catch (error) {
    console.log(chalk.red(`❌ 套件檢查失敗: ${error instanceof Error ? error.message : '未知錯誤'}`));
  }
}

// ------------------ MAIN DIAGNOSTIC FUNCTION ------------------
async function runFullDiagnostic() {
  console.log(chalk.cyan('\n🔍 系統診斷啟動中...\n'));
  
  console.log(chalk.yellow('📋 1. 環境變數檢查'));
  checkEnvVariables();
  
  console.log(chalk.yellow('\n📋 2. 套件檢查'));
  checkPackages();
  
  console.log(chalk.yellow('\n📋 3. TypeScript 編譯檢查'));
  checkTypeScriptCompilation();
  
  console.log(chalk.yellow('\n📋 4. 模型檢查'));
  checkModels();
  
  console.log(chalk.yellow('\n📋 5. 路由掃描'));
  scanRoutesForErrors();
  
  console.log(chalk.yellow('\n📋 6. 靜態資源檢查'));
  checkStaticAssets();
  
  console.log(chalk.yellow('\n📋 7. 健康檢查'));
  runHealthCheck();
  
  console.log(chalk.yellow('\n📋 8. 資料庫測試'));
  await runDatabaseTest();
  
  console.log(chalk.cyan('\n✅ 系統診斷完成！\n'));
}

// 執行診斷
runFullDiagnostic().catch(error => {
  console.error(chalk.red('診斷過程發生錯誤:'), error);
  process.exit(1);
});
