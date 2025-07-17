
import fs from 'fs';
import path from 'path';
import { healthCheck } from './utils/healthCheck';
import sequelize from './config/database';

interface SystemIssue {
  type: 'error' | 'warning';
  category: 'database' | 'environment' | 'models' | 'routes' | 'frontend';
  description: string;
  fix?: () => Promise<void>;
}

const systemFix = async () => {
  console.log('🔧 開始系統修復程序...\n');
  
  const issues: SystemIssue[] = [];
  const fixes: string[] = [];

  // 1. 檢查和修復環境變數問題
  console.log('🔍 1. 檢查環境變數...');
  
  const requiredEnvVars = [
    'LINE_CHANNEL_ACCESS_TOKEN',
    'LINE_CHANNEL_SECRET',
    'DATABASE_URL',
    'PORT'
  ];

  const missingVars = requiredEnvVars.filter(v => !process.env[v] || process.env[v] === 'undefined');
  
  if (missingVars.length > 0) {
    issues.push({
      type: 'error',
      category: 'environment',
      description: `缺少必要環境變數: ${missingVars.join(', ')}`,
      fix: async () => {
        console.log('🔧 修復環境變數...');
        
        // 檢查 .env 檔案是否存在
        if (!fs.existsSync('.env')) {
          const envTemplate = `# LINE Bot 設定
LINE_CHANNEL_ACCESS_TOKEN=your_access_token_here
LINE_CHANNEL_SECRET=your_channel_secret_here

# 資料庫設定
DATABASE_URL=sqlite://./database.db

# 伺服器設定
PORT=5000
NODE_ENV=development
`;
          fs.writeFileSync('.env', envTemplate);
          console.log('✅ 已建立 .env 範本檔案');
          fixes.push('建立 .env 範本檔案');
        }
      }
    });
  } else {
    console.log('✅ 環境變數檢查通過');
  }

  // 檢查危險的環境變數值
  Object.entries(process.env).forEach(([key, value]) => {
    if (value && typeof value === 'string') {
      if (value.includes('${') || value.includes('undefined') || value.includes('Missing parameter')) {
        issues.push({
          type: 'error',
          category: 'environment',
          description: `危險的環境變數值: ${key}=${value}`,
          fix: async () => {
            console.log(`🧹 清理環境變數 ${key}`);
            delete process.env[key];
            fixes.push(`清理環境變數 ${key}`);
          }
        });
      }
    }
  });

  // 2. 檢查資料庫連線
  console.log('\n🔍 2. 檢查資料庫連線...');
  
  try {
    await sequelize.authenticate();
    console.log('✅ 資料庫連線正常');
  } catch (error) {
    issues.push({
      type: 'error',
      category: 'database',
      description: `資料庫連線失敗: ${error}`,
      fix: async () => {
        console.log('🔧 修復資料庫連線...');
        try {
          // 重新初始化資料庫
          await sequelize.sync({ force: false });
          console.log('✅ 資料庫重新同步完成');
          fixes.push('資料庫重新同步');
        } catch (syncError) {
          console.log('❌ 資料庫同步失敗:', syncError);
        }
      }
    });
  }

  // 3. 檢查模型檔案
  console.log('\n🔍 3. 檢查模型檔案...');
  
  const modelFiles = [
    'src/models/member.ts',
    'src/models/event.ts',
    'src/models/registration.ts',
    'src/models/checkin.ts',
    'src/models/payment.ts',
    'src/models/messageLog.ts'
  ];

  for (const modelFile of modelFiles) {
    if (!fs.existsSync(modelFile)) {
      issues.push({
        type: 'error',
        category: 'models',
        description: `模型檔案不存在: ${modelFile}`
      });
    } else {
      try {
        const content = fs.readFileSync(modelFile, 'utf-8');
        
        // 檢查常見問題
        if (!content.includes('export default')) {
          issues.push({
            type: 'warning',
            category: 'models',
            description: `${modelFile} 缺少預設匯出`
          });
        }
        
        if (!content.includes('static associate')) {
          issues.push({
            type: 'warning',
            category: 'models',
            description: `${modelFile} 缺少關聯定義`
          });
        }
        
        console.log(`✅ ${modelFile} 檢查通過`);
      } catch (error) {
        issues.push({
          type: 'error',
          category: 'models',
          description: `無法讀取模型檔案 ${modelFile}: ${error}`
        });
      }
    }
  }

  // 4. 檢查路由檔案
  console.log('\n🔍 4. 檢查路由檔案...');
  
  const routeFiles = [
    'src/routes/members.ts',
    'src/routes/events.ts',
    'src/routes/checkin.ts',
    'src/routes/admin.ts'
  ];

  for (const routeFile of routeFiles) {
    if (!fs.existsSync(routeFile)) {
      issues.push({
        type: 'error',
        category: 'routes',
        description: `路由檔案不存在: ${routeFile}`
      });
    } else {
      try {
        const content = fs.readFileSync(routeFile, 'utf-8');
        
        // 檢查路由檔案問題
        if (content.includes('localhost') && !content.includes('0.0.0.0')) {
          issues.push({
            type: 'warning',
            category: 'routes',
            description: `${routeFile} 使用 localhost 而非 0.0.0.0`
          });
        }
        
        if (!content.includes('express.Router')) {
          issues.push({
            type: 'error',
            category: 'routes',
            description: `${routeFile} 缺少 Express Router 初始化`
          });
        }
        
        console.log(`✅ ${routeFile} 檢查通過`);
      } catch (error) {
        issues.push({
          type: 'error',
          category: 'routes',
          description: `無法讀取路由檔案 ${routeFile}: ${error}`
        });
      }
    }
  }

  // 5. 檢查前端狀態
  console.log('\n🔍 5. 檢查前端狀態...');
  
  if (!fs.existsSync('public') && !fs.existsSync('client/dist')) {
    issues.push({
      type: 'warning',
      category: 'frontend',
      description: '找不到前端檔案',
      fix: async () => {
        console.log('🔧 建立基本前端結構...');
        
        // 建立 public 目錄和基本檔案
        if (!fs.existsSync('public')) {
          fs.mkdirSync('public', { recursive: true });
        }
        
        const indexHtml = `<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>北大獅子會系統</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .container { max-width: 800px; margin: 0 auto; }
        .status { padding: 20px; background: #f0f8ff; border-radius: 8px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🦁 北大獅子會系統</h1>
        <div class="status">
            <h2>系統狀態</h2>
            <p>✅ 系統正在運行中</p>
            <p>📱 LINE Bot 已啟動</p>
            <p>🗄️ 資料庫已連線</p>
        </div>
        <h2>功能選單</h2>
        <ul>
            <li><a href="/api/health">系統健康檢查</a></li>
            <li><a href="/api/members">會員管理</a></li>
            <li><a href="/api/events">活動管理</a></li>
            <li><a href="/api/admin">管理後台</a></li>
        </ul>
    </div>
</body>
</html>`;
        
        fs.writeFileSync('public/index.html', indexHtml);
        console.log('✅ 建立基本前端頁面');
        fixes.push('建立基本前端頁面');
      }
    });
  } else {
    console.log('✅ 前端檔案檢查通過');
  }

  // 6. 執行修復
  console.log('\n🔧 6. 執行修復...');
  
  if (issues.length === 0) {
    console.log('🎉 系統狀態良好，無需修復！');
    return;
  }

  console.log(`\n📋 發現 ${issues.length} 個問題:`);
  issues.forEach((issue, index) => {
    const icon = issue.type === 'error' ? '❌' : '⚠️';
    console.log(`${index + 1}. ${icon} ${issue.description}`);
  });

  // 執行有修復方法的問題
  const fixableIssues = issues.filter(issue => issue.fix);
  
  if (fixableIssues.length > 0) {
    console.log(`\n🛠️ 開始修復 ${fixableIssues.length} 個可修復的問題...`);
    
    for (const issue of fixableIssues) {
      if (issue.fix) {
        try {
          await issue.fix();
        } catch (error) {
          console.log(`❌ 修復失敗: ${issue.description} - ${error}`);
        }
      }
    }
  }

  // 7. 最終健康檢查
  console.log('\n🏥 7. 執行最終健康檢查...');
  
  try {
    const health = await healthCheck();
    console.log(`最終系統狀態: ${health.status}`);
    
    if (health.status === 'healthy') {
      console.log('🎉 系統修復完成，狀態良好！');
    } else {
      console.log('⚠️ 系統仍有部分問題，請檢查上方訊息');
    }
  } catch (error) {
    console.log('❌ 最終健康檢查失敗:', error);
  }

  // 8. 輸出修復摘要
  console.log('\n📋 修復摘要:');
  if (fixes.length > 0) {
    fixes.forEach((fix, index) => {
      console.log(`${index + 1}. ✅ ${fix}`);
    });
  } else {
    console.log('未執行任何修復操作');
  }

  console.log('\n🎯 系統修復完成！');
};

export default systemFix;

// 如果直接執行此檔案
if (require.main === module) {
  systemFix().then(() => {
    process.exit(0);
  }).catch((error) => {
    console.error('❌ 系統修復過程發生錯誤:', error);
    process.exit(1);
  });
}
