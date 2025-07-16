
import fs from 'fs';
import path from 'path';
import { healthCheck } from './utils/healthCheck';
import sequelize from './config/database';

interface DiagnosisReport {
  timestamp: string;
  summary: {
    totalErrors: number;
    totalWarnings: number;
    systemStatus: 'healthy' | 'issues' | 'critical';
  };
  sections: {
    routes: { status: string; errors: string[]; warnings: string[] };
    environment: { status: string; errors: string[]; warnings: string[]; duplicates: string[] };
    frontend: { status: string; errors: string[]; warnings: string[] };
    health: { status: string; errors: string[]; details: any };
    suggestions: string[];
  };
}

export const generateDiagnosisReport = async (): Promise<DiagnosisReport> => {
  const report: DiagnosisReport = {
    timestamp: new Date().toISOString(),
    summary: { totalErrors: 0, totalWarnings: 0, systemStatus: 'healthy' },
    sections: {
      routes: { status: 'unknown', errors: [], warnings: [] },
      environment: { status: 'unknown', errors: [], warnings: [], duplicates: [] },
      frontend: { status: 'unknown', errors: [], warnings: [] },
      health: { status: 'unknown', errors: [], details: null },
      suggestions: []
    }
  };

  console.log('🔍 === 系統問題排查報告 ===\n');
  console.log(`📅 報告時間: ${report.timestamp}\n`);

  // 1. 掃描路由、控制器、中間件錯誤
  console.log('1️⃣ 掃描 /src 目錄下所有 route、controller、middleware...');
  
  try {
    const srcDir = path.join(__dirname);
    
    // 檢查路由檔案
    const routesDir = path.join(srcDir, 'routes');
    if (fs.existsSync(routesDir)) {
      const routeFiles = fs.readdirSync(routesDir).filter(f => f.endsWith('.ts'));
      console.log(`📁 找到 ${routeFiles.length} 個路由檔案: ${routeFiles.join(', ')}`);
      
      for (const file of routeFiles) {
        try {
          require(`./routes/${file.replace('.ts', '')}`);
          console.log(`✅ ${file} - 載入正常`);
        } catch (error) {
          const errorMsg = `❌ ${file} - 載入失敗: ${error}`;
          console.log(errorMsg);
          report.sections.routes.errors.push(errorMsg);
        }
      }
    } else {
      const errorMsg = '❌ routes 目錄不存在';
      console.log(errorMsg);
      report.sections.routes.errors.push(errorMsg);
    }

    // 檢查中間件
    const middlewareDir = path.join(srcDir, 'middleware');
    if (fs.existsSync(middlewareDir)) {
      const middlewareFiles = fs.readdirSync(middlewareDir).filter(f => f.endsWith('.ts'));
      console.log(`📁 找到 ${middlewareFiles.length} 個中間件檔案: ${middlewareFiles.join(', ')}`);
      
      for (const file of middlewareFiles) {
        try {
          require(`./middleware/${file.replace('.ts', '')}`);
          console.log(`✅ middleware/${file} - 載入正常`);
        } catch (error) {
          const errorMsg = `❌ middleware/${file} - 載入失敗: ${error}`;
          console.log(errorMsg);
          report.sections.routes.errors.push(errorMsg);
        }
      }
    }

    // 檢查 LINE 處理器
    try {
      require('./line/handler');
      console.log('✅ line/handler.ts - 載入正常');
    } catch (error) {
      const errorMsg = `❌ line/handler.ts - 載入失敗: ${error}`;
      console.log(errorMsg);
      report.sections.routes.errors.push(errorMsg);
    }

    report.sections.routes.status = report.sections.routes.errors.length === 0 ? 'ok' : 'error';
    
  } catch (error) {
    const errorMsg = `❌ 路由掃描過程發生錯誤: ${error}`;
    console.log(errorMsg);
    report.sections.routes.errors.push(errorMsg);
    report.sections.routes.status = 'error';
  }

  console.log('');

  // 2. 檢查環境變數配置
  console.log('2️⃣ 比對 .env 檔與實際程式使用的變數...');
  
  const requiredVars = [
    'LINE_CHANNEL_ACCESS_TOKEN',
    'LINE_CHANNEL_SECRET', 
    'DATABASE_URL',
    'PORT'
  ];

  const optionalVars = [
    'NODE_ENV',
    'DEBUG_URL'
  ];

  // 檢查必要變數
  const missingRequired = requiredVars.filter(v => !process.env[v]);
  const missingOptional = optionalVars.filter(v => !process.env[v]);

  if (missingRequired.length > 0) {
    const errorMsg = `❌ 缺少必要環境變數: ${missingRequired.join(', ')}`;
    console.log(errorMsg);
    report.sections.environment.errors.push(errorMsg);
  } else {
    console.log('✅ 所有必要環境變數已設定');
  }

  if (missingOptional.length > 0) {
    const warningMsg = `⚠️ 缺少可選環境變數: ${missingOptional.join(', ')}`;
    console.log(warningMsg);
    report.sections.environment.warnings.push(warningMsg);
  }

  // 檢查 .env 檔案重複設定
  try {
    const envPath = path.join(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf-8');
      const duplicates = findDuplicateEnvVars(envContent);
      
      if (duplicates.length > 0) {
        const warningMsg = `⚠️ .env 檔案中有重複設定: ${duplicates.join(', ')}`;
        console.log(warningMsg);
        report.sections.environment.warnings.push(warningMsg);
        report.sections.environment.duplicates = duplicates;
      } else {
        console.log('✅ .env 檔案無重複設定');
      }
    } else {
      const errorMsg = '❌ .env 檔案不存在';
      console.log(errorMsg);
      report.sections.environment.errors.push(errorMsg);
    }
  } catch (error) {
    const errorMsg = `❌ 讀取 .env 檔案失敗: ${error}`;
    console.log(errorMsg);
    report.sections.environment.errors.push(errorMsg);
  }

  report.sections.environment.status = report.sections.environment.errors.length === 0 ? 'ok' : 'error';
  console.log('');

  // 3. 檢查前端狀態
  console.log('3️⃣ 檢查前端載入狀態...');
  
  try {
    const clientDir = path.join(process.cwd(), 'client');
    const distDir = path.join(clientDir, 'dist');
    
    if (fs.existsSync(clientDir)) {
      console.log('✅ client 目錄存在');
      
      // 檢查 package.json
      const packageJsonPath = path.join(clientDir, 'package.json');
      if (fs.existsSync(packageJsonPath)) {
        console.log('✅ 前端 package.json 存在');
        
        try {
          const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
          console.log(`📦 前端專案: ${packageJson.name} v${packageJson.version}`);
        } catch (error) {
          const warningMsg = '⚠️ package.json 格式錯誤';
          console.log(warningMsg);
          report.sections.frontend.warnings.push(warningMsg);
        }
      } else {
        const errorMsg = '❌ 前端 package.json 不存在';
        console.log(errorMsg);
        report.sections.frontend.errors.push(errorMsg);
      }

      // 檢查建置檔案
      if (fs.existsSync(distDir)) {
        const indexHtmlPath = path.join(distDir, 'index.html');
        if (fs.existsSync(indexHtmlPath)) {
          console.log('✅ 前端建置檔案存在 (dist/index.html)');
          
          // 檢查建置檔案大小
          const stats = fs.statSync(indexHtmlPath);
          console.log(`📊 index.html 大小: ${(stats.size / 1024).toFixed(2)} KB`);
          
          // 檢查 assets 目錄
          const assetsDir = path.join(distDir, 'assets');
          if (fs.existsSync(assetsDir)) {
            const assetFiles = fs.readdirSync(assetsDir);
            console.log(`📁 資源檔案: ${assetFiles.length} 個`);
          }
        } else {
          const errorMsg = '❌ 前端建置檔案不存在 (dist/index.html)';
          console.log(errorMsg);
          report.sections.frontend.errors.push(errorMsg);
        }
      } else {
        const warningMsg = '⚠️ 前端 dist 目錄不存在，需要執行建置';
        console.log(warningMsg);
        report.sections.frontend.warnings.push(warningMsg);
      }

      // 檢查 node_modules
      const nodeModulesPath = path.join(clientDir, 'node_modules');
      if (fs.existsSync(nodeModulesPath)) {
        console.log('✅ 前端依賴已安裝');
      } else {
        const warningMsg = '⚠️ 前端依賴未安裝';
        console.log(warningMsg);
        report.sections.frontend.warnings.push(warningMsg);
      }

    } else {
      const errorMsg = '❌ client 目錄不存在';
      console.log(errorMsg);
      report.sections.frontend.errors.push(errorMsg);
    }

    report.sections.frontend.status = report.sections.frontend.errors.length === 0 ? 'ok' : 'error';
    
  } catch (error) {
    const errorMsg = `❌ 前端檢查過程發生錯誤: ${error}`;
    console.log(errorMsg);
    report.sections.frontend.errors.push(errorMsg);
    report.sections.frontend.status = 'error';
  }

  console.log('');

  // 4. 執行健康檢查
  console.log('4️⃣ 執行健康檢查測試...');
  
  try {
    const health = await healthCheck();
    report.sections.health.details = health;
    
    console.log(`🏥 系統健康狀態: ${health.status}`);
    console.log(`🗄️ 資料庫: ${health.checks.database.status} - ${health.checks.database.message}`);
    console.log(`🔧 環境變數: ${health.checks.environment.status}`);
    console.log(`📋 資料模型: ${health.checks.models.status} - ${health.checks.models.message}`);
    
    if (health.status === 'unhealthy') {
      report.sections.health.status = 'error';
      
      if (health.checks.database.status === 'error') {
        report.sections.health.errors.push(`資料庫連線問題: ${health.checks.database.message}`);
      }
      
      if (health.checks.environment.status === 'error') {
        report.sections.health.errors.push(`環境變數問題: 缺少 ${health.checks.environment.missing.join(', ')}`);
      }
      
      if (health.checks.models.status === 'error') {
        report.sections.health.errors.push(`資料模型問題: ${health.checks.models.message}`);
      }
    } else {
      report.sections.health.status = 'ok';
      console.log('✅ 系統健康檢查通過');
    }
    
  } catch (error) {
    const errorMsg = `❌ 健康檢查執行失敗: ${error}`;
    console.log(errorMsg);
    report.sections.health.errors.push(errorMsg);
    report.sections.health.status = 'error';
  }

  console.log('');

  // 5. 彙整報告並提供建議
  console.log('5️⃣ 診斷結果總結與建議修正');
  console.log('='.repeat(60));

  // 計算總錯誤和警告數量
  report.summary.totalErrors = 
    report.sections.routes.errors.length +
    report.sections.environment.errors.length +
    report.sections.frontend.errors.length +
    report.sections.health.errors.length;

  report.summary.totalWarnings = 
    report.sections.routes.warnings.length +
    report.sections.environment.warnings.length +
    report.sections.frontend.warnings.length;

  // 判斷系統狀態
  if (report.summary.totalErrors === 0) {
    report.summary.systemStatus = report.summary.totalWarnings === 0 ? 'healthy' : 'issues';
  } else {
    report.summary.systemStatus = 'critical';
  }

  console.log(`\n📊 總結:`);
  console.log(`   🔴 錯誤: ${report.summary.totalErrors} 個`);
  console.log(`   🟡 警告: ${report.summary.totalWarnings} 個`);
  console.log(`   📈 系統狀態: ${report.summary.systemStatus}`);

  // 提供修正建議
  if (report.summary.totalErrors > 0 || report.summary.totalWarnings > 0) {
    console.log('\n💡 建議修正方式:');
    
    if (report.sections.environment.errors.length > 0) {
      report.sections.suggestions.push('在 .env 檔案中設定缺少的必要環境變數');
    }
    
    if (report.sections.environment.duplicates.length > 0) {
      report.sections.suggestions.push('清理 .env 檔案中的重複設定');
    }
    
    if (report.sections.frontend.warnings.includes('⚠️ 前端 dist 目錄不存在，需要執行建置')) {
      report.sections.suggestions.push('執行 cd client && npm install && npm run build 建置前端');
    }
    
    if (report.sections.frontend.warnings.includes('⚠️ 前端依賴未安裝')) {
      report.sections.suggestions.push('執行 cd client && npm install 安裝前端依賴');
    }
    
    if (report.sections.health.errors.some(e => e.includes('資料庫連線問題'))) {
      report.sections.suggestions.push('檢查 DATABASE_URL 環境變數是否正確');
    }
    
    if (report.sections.health.errors.some(e => e.includes('資料模型問題'))) {
      report.sections.suggestions.push('執行 npm run init-db 初始化資料庫');
    }
    
    if (report.sections.routes.errors.length > 0) {
      report.sections.suggestions.push('檢查路由檔案的語法錯誤和依賴問題');
    }

    report.sections.suggestions.forEach((suggestion, index) => {
      console.log(`   ${index + 1}. ${suggestion}`);
    });
  } else {
    console.log('\n🎉 系統狀態良好！');
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

// 執行診斷
if (require.main === module) {
  generateDiagnosisReport().then((report) => {
    // 將報告儲存到檔案
    const reportPath = path.join(__dirname, '..', 'system-diagnosis-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📄 詳細報告已儲存至: ${reportPath}`);
    
    process.exit(report.summary.totalErrors > 0 ? 1 : 0);
  }).catch((error) => {
    console.error('❌ 診斷過程發生錯誤:', error);
    process.exit(1);
  });
}
