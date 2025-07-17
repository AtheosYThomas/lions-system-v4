
import { healthCheck } from './healthCheck';
import sequelize from '../config/database';

export const runSystemDiagnostic = async () => {
  console.log('🔍 開始系統診斷...\n');
  
  // 1. 健康檢查
  console.log('📊 執行健康檢查...');
  const health = await healthCheck();
  console.log('健康狀態:', health.status);
  console.log('資料庫:', health.checks.database.status, health.checks.database.message);
  console.log('環境變數:', health.checks.environment.status);
  if (health.checks.environment.missing.length > 0) {
    console.log('缺少變數:', health.checks.environment.missing);
  }
  console.log('資料模型:', health.checks.models.status, health.checks.models.message);
  console.log('');

  // 2. 檢查路由是否正常載入
  console.log('🛣️  檢查路由模組...');
  try {
    require('../routes/members');
    console.log('✅ 會員路由載入正常');
  } catch (error) {
    console.log('❌ 會員路由載入失敗:', error);
  }

  try {
    require('../routes/checkin');
    console.log('✅ 簽到路由載入正常');
  } catch (error) {
    console.log('❌ 簽到路由載入失敗:', error);
  }

  try {
    require('../routes/admin');
    console.log('✅ 管理路由載入正常');
  } catch (error) {
    console.log('❌ 管理路由載入失敗:', error);
  }
  console.log('');

  // 3. 檢查資料表結構
  console.log('🗄️  檢查資料表結構...');
  try {
    const tables = await sequelize.getQueryInterface().showAllTables();
    console.log('現有資料表:', tables);
    
    for (const table of tables) {
      const columns = await sequelize.getQueryInterface().describeTable(table);
      console.log(`📋 ${table} 欄位:`, Object.keys(columns).join(', '));
    }
  } catch (error) {
    console.log('❌ 資料表檢查失敗:', error);
  }

  console.log('\n🎯 診斷完成！');
};
import { healthCheck } from './healthCheck';
import sequelize from '../config/database';
import fs from 'fs';
import path from 'path';

export const runSystemDiagnostic = async () => {
  console.log('🔍 開始系統診斷...\n');
  
  const report = {
    timestamp: new Date().toISOString(),
    errors: [] as string[],
    warnings: [] as string[],
    suggestions: [] as string[]
  };

  // 1. 掃描 /src 目錄下所有 route、controller、middleware 的錯誤
  console.log('📊 1. 掃描路由、控制器、中間件錯誤...');
  
  try {
    // 檢查路由檔案
    const routesDir = path.join(__dirname, '../routes');
    const routeFiles = fs.readdirSync(routesDir).filter(f => f.endsWith('.ts'));
    
    for (const file of routeFiles) {
      try {
        require(`../routes/${file.replace('.ts', '')}`);
        console.log(`✅ ${file} 載入正常`);
      } catch (error) {
        const errorMsg = `❌ ${file} 載入失敗: ${error}`;
        console.log(errorMsg);
        report.errors.push(errorMsg);
      }
    }

    // 檢查中間件
    try {
      require('../middleware/errorHandler');
      console.log('✅ 錯誤處理中間件載入正常');
    } catch (error) {
      const errorMsg = `❌ 錯誤處理中間件載入失敗: ${error}`;
      console.log(errorMsg);
      report.errors.push(errorMsg);
    }

    // 檢查 LINE 處理器
    try {
      require('../line/handler');
      console.log('✅ LINE 處理器載入正常');
    } catch (error) {
      const errorMsg = `❌ LINE 處理器載入失敗: ${error}`;
      console.log(errorMsg);
      report.errors.push(errorMsg);
    }

  } catch (error) {
    const errorMsg = `❌ 掃描模組時發生錯誤: ${error}`;
    console.log(errorMsg);
    report.errors.push(errorMsg);
  }

  console.log('');

  // 2. 比對 .env 檔與實際程式是否有使用未定義的變數
  console.log('📋 2. 檢查環境變數配置...');
  
  const requiredEnvVars = [
    'LINE_CHANNEL_ACCESS_TOKEN',
    'LINE_CHANNEL_SECRET',
    'DATABASE_URL',
    'PORT'
  ];

  const optionalEnvVars = [
    'NODE_ENV',
    'DEBUG_URL'
  ];

  const missingRequired = requiredEnvVars.filter(v => !process.env[v]);
  const missingOptional = optionalEnvVars.filter(v => !process.env[v]);

  if (missingRequired.length > 0) {
    const errorMsg = `❌ 缺少必要環境變數: ${missingRequired.join(', ')}`;
    console.log(errorMsg);
    report.errors.push(errorMsg);
    report.suggestions.push('在 .env 檔案中設定缺少的必要環境變數');
  } else {
    console.log('✅ 所有必要環境變數已設定');
  }

  if (missingOptional.length > 0) {
    const warningMsg = `⚠️ 缺少可選環境變數: ${missingOptional.join(', ')}`;
    console.log(warningMsg);
    report.warnings.push(warningMsg);
  }

  // 檢查 .env 檔案中是否有重複設定
  try {
    const envContent = fs.readFileSync('.env', 'utf-8');
    const duplicates = findDuplicateEnvVars(envContent);
    if (duplicates.length > 0) {
      const warningMsg = `⚠️ .env 檔案中有重複設定: ${duplicates.join(', ')}`;
      console.log(warningMsg);
      report.warnings.push(warningMsg);
      report.suggestions.push('清理 .env 檔案中的重複設定');
    }
  } catch (error) {
    const errorMsg = `❌ 無法讀取 .env 檔案: ${error}`;
    console.log(errorMsg);
    report.errors.push(errorMsg);
  }

  console.log('');

  // 3. 檢查前端是否能載入、是否有 JS 錯誤
  console.log('🎨 3. 檢查前端狀態...');
  
  try {
    const clientDir = path.join(__dirname, '../../client');
    
    if (fs.existsSync(clientDir)) {
      const distDir = path.join(clientDir, 'dist');
      const publicDir = path.join(__dirname, '../../public');
      
      if (fs.existsSync(distDir)) {
        const indexHtml = path.join(distDir, 'index.html');
        if (fs.existsSync(indexHtml)) {
          console.log('✅ 前端 dist/index.html 存在');
        } else {
          const errorMsg = '❌ 前端 dist/index.html 不存在';
          console.log(errorMsg);
          report.errors.push(errorMsg);
          report.suggestions.push('執行 cd client && npm run build 建置前端');
        }
      } else if (fs.existsSync(publicDir)) {
        console.log('✅ 找到 public 目錄');
      } else {
        const warningMsg = '⚠️ 未找到前端建置檔案或 public 目錄';
        console.log(warningMsg);
        report.warnings.push(warningMsg);
      }

      // 檢查前端依賴
      const packageJson = path.join(clientDir, 'package.json');
      if (fs.existsSync(packageJson)) {
        console.log('✅ 前端 package.json 存在');
      } else {
        const warningMsg = '⚠️ 前端 package.json 不存在';
        console.log(warningMsg);
        report.warnings.push(warningMsg);
      }
    } else {
      const warningMsg = '⚠️ client 目錄不存在';
      console.log(warningMsg);
      report.warnings.push(warningMsg);
    }
  } catch (error) {
    const errorMsg = `❌ 檢查前端時發生錯誤: ${error}`;
    console.log(errorMsg);
    report.errors.push(errorMsg);
  }

  console.log('');

  // 4. 執行健康檢查
  console.log('🏥 4. 執行健康檢查...');
  
  try {
    const health = await healthCheck();
    console.log(`健康狀態: ${health.status}`);
    console.log(`資料庫: ${health.checks.database.status} - ${health.checks.database.message}`);
    console.log(`環境變數: ${health.checks.environment.status}`);
    console.log(`資料模型: ${health.checks.models.status} - ${health.checks.models.message}`);

    if (health.status === 'unhealthy') {
      report.errors.push('系統健康檢查失敗');
      
      if (health.checks.database.status === 'error') {
        report.errors.push(`資料庫連線問題: ${health.checks.database.message}`);
        report.suggestions.push('檢查 DATABASE_URL 環境變數是否正確');
      }
      
      if (health.checks.environment.status === 'error') {
        report.errors.push(`環境變數問題: 缺少 ${health.checks.environment.missing.join(', ')}`);
      }
      
      if (health.checks.models.status === 'error') {
        report.errors.push(`資料模型問題: ${health.checks.models.message}`);
        report.suggestions.push('執行 npm run init-db 初始化資料庫');
      }
    } else {
      console.log('✅ 系統健康檢查通過');
    }
  } catch (error) {
    const errorMsg = `❌ 健康檢查執行失敗: ${error}`;
    console.log(errorMsg);
    report.errors.push(errorMsg);
  }

  console.log('');

  // 5. 彙整所有錯誤訊息
  console.log('📋 5. 診斷報告總結');
  console.log('='.repeat(50));
  
  if (report.errors.length === 0 && report.warnings.length === 0) {
    console.log('🎉 系統狀態良好，未發現問題！');
  } else {
    if (report.errors.length > 0) {
      console.log('\n🚨 發現的錯誤:');
      report.errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error}`);
      });
    }

    if (report.warnings.length > 0) {
      console.log('\n⚠️  發現的警告:');
      report.warnings.forEach((warning, index) => {
        console.log(`${index + 1}. ${warning}`);
      });
    }

    if (report.suggestions.length > 0) {
      console.log('\n💡 建議修正方式:');
      report.suggestions.forEach((suggestion, index) => {
        console.log(`${index + 1}. ${suggestion}`);
      });
    }
  }

  console.log('\n🎯 診斷完成！');
  return report;
};

function findDuplicateEnvVars(envContent: string): string[] {
  const lines = envContent.split('\n');
  const variables = new Map<string, number>();
  const duplicates: string[] = [];

  lines.forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const key = trimmed.split('=')[0];
      const count = variables.get(key) || 0;
      variables.set(key, count + 1);
      
      if (count === 1) {
        duplicates.push(key);
      }
    }
  });

  return duplicates;
}
