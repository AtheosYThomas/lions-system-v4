
// 終極安全啟動腳本 - 徹底解決 path-to-regexp 錯誤
console.log('🛡️ 啟動終極安全模式...');

// 1. 預防性清理所有危險環境變數
console.log('🧹 預防性清理危險環境變數...');

// 定義所有可能導致 path-to-regexp 錯誤的危險模式
const dangerousPatterns = [
  'DEBUG_URL',
  'WEBPACK_DEV_SERVER',
  'HMR_',
  'VITE_DEV',
  'HOT_RELOAD',
  'DEV_SERVER'
];

// 清理包含危險模式的環境變數
let cleanedCount = 0;
Object.keys(process.env).forEach(key => {
  const value = process.env[key];
  
  // 檢查是否包含危險模式
  const isDangerous = dangerousPatterns.some(pattern => key.includes(pattern)) ||
    (value && typeof value === 'string' && (
      value.includes('${') ||           // 未展開的模板字串
      value.includes('Missing parameter') || // path-to-regexp 錯誤訊息
      value.includes('undefined') ||    // 無效值
      value === 'null'                 // null 字串
    ));

  if (isDangerous) {
    console.log(`🧹 清理危險變數: ${key}=${value}`);
    delete process.env[key];
    cleanedCount++;
  }
});

console.log(`✅ 已清理 ${cleanedCount} 個危險環境變數`);

// 2. 設置安全的環境變數
console.log('⚙️ 設置安全環境變數...');
process.env.NODE_ENV = 'development';
process.env.PORT = '5000';
process.env.TERM = 'xterm-256color';

// 3. 安全載入 dotenv
console.log('📋 安全載入 .env 配置...');
try {
  const dotenv = require('dotenv');
  const envResult = dotenv.config();
  
  if (envResult.parsed) {
    // 再次過濾 .env 中可能的危險變數
    Object.entries(envResult.parsed).forEach(([key, value]) => {
      if (value && typeof value === 'string' && value.includes('${')) {
        console.log(`🚨 過濾 .env 中的模板字串: ${key}=${value}`);
        delete process.env[key];
      }
    });
  }
  
  console.log('✅ .env 檔案載入成功');
} catch (error) {
  console.log('⚠️ .env 檔案載入失敗，使用預設值:', error);
}

// 4. 驗證 LINE Bot 配置
console.log('🔍 驗證 LINE Bot 配置...');
const lineVars = ['LINE_CHANNEL_ACCESS_TOKEN', 'LINE_CHANNEL_SECRET'];
let hasValidLineConfig = true;

lineVars.forEach(varName => {
  const value = process.env[varName];
  if (!value || value === 'undefined' || value.includes('${')) {
    console.log(`⚠️ LINE 變數需要設定: ${varName}`);
    hasValidLineConfig = false;
  } else {
    console.log(`✅ LINE 變數正常: ${varName}`);
  }
});

// 5. 最終環境驗證
console.log('🔍 最終環境變數驗證...');
const finalEnvCount = Object.keys(process.env).length;
console.log(`📊 當前環境變數數量: ${finalEnvCount}`);

// 檢查是否還有殘留的問題變數
const remainingProblems = Object.entries(process.env).filter(([key, value]) => {
  return value && typeof value === 'string' && (
    value.includes('${') ||
    value.includes('Missing parameter')
  );
});

if (remainingProblems.length > 0) {
  console.log('🚨 發現殘留問題變數：');
  remainingProblems.forEach(([key, value]) => {
    console.log(`  - ${key}=${value}`);
    delete process.env[key];
  });
}

// 6. 啟動主程式
console.log('🚀 嘗試安全啟動主程式...');

async function startMainApp(): Promise<boolean> {
  try {
    // 動態載入主程式模組
    await import('./index');
    console.log('✅ 主程式啟動成功！');
    return true;
  } catch (error) {
    console.log('❌ 主程式啟動失敗:', error);
    return false;
  }
}

async function startEmergencyMode(): Promise<void> {
  console.log('🆘 啟動緊急降級模式...');
  
  const express = require('express');
  const app = express();
  const port = process.env.PORT || 5000;

  app.use(express.json());

  app.get('/', (req: any, res: any) => {
    res.send(`
      <html>
        <head>
          <title>🆘 緊急模式</title>
          <meta charset="utf-8">
        </head>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px;">
          <h1>🆘 緊急模式 - 系統正在修復中</h1>
          <p>📅 時間: ${new Date().toLocaleString()}</p>
          <p>📊 狀態: path-to-regexp 錯誤修復模式</p>
          <p>🔧 LINE Bot 配置: ${hasValidLineConfig ? '✅ 正常' : '⚠️ 需要設定'}</p>
          <p>🔍 清理了 ${cleanedCount} 個危險環境變數</p>
          <hr>
          <h3>可用端點：</h3>
          <ul>
            <li><a href="/health">🩺 健康檢查</a></li>
            <li><a href="/env-status">📋 環境變數狀態</a></li>
          </ul>
          <hr>
          <p><strong>修復建議：</strong></p>
          <ol>
            <li>檢查 LINE Bot 環境變數設定</li>
            <li>確認所有路由檔案語法正確</li>
            <li>執行系統診斷報告工作流程</li>
          </ol>
        </body>
      </html>
    `);
  });

  app.get('/health', (req: any, res: any) => {
    res.json({
      status: 'emergency_mode',
      timestamp: new Date().toISOString(),
      message: '緊急模式運行中',
      line_config_valid: hasValidLineConfig,
      cleaned_variables: cleanedCount,
      port: port,
      env_count: finalEnvCount
    });
  });

  app.get('/env-status', (req: any, res: any) => {
    const safeEnvVars = Object.keys(process.env).filter(key => 
      !key.includes('TOKEN') && !key.includes('SECRET')
    );
    
    res.json({
      safe_env_vars: safeEnvVars,
      total_count: Object.keys(process.env).length,
      has_line_config: hasValidLineConfig,
      cleaned_count: cleanedCount
    });
  });

  app.listen(port, '0.0.0.0', () => {
    console.log(`🆘 緊急模式伺服器運行在 http://0.0.0.0:${port}`);
    console.log(`🩺 健康檢查: http://0.0.0.0:${port}/health`);
  });
}

// 執行啟動邏輯
(async () => {
  const mainAppStarted = await startMainApp();
  
  if (!mainAppStarted) {
    await startEmergencyMode();
  }
})();
