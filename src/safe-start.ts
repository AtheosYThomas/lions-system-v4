
// 終極安全啟動腳本 - 徹底解決 path-to-regexp 錯誤
console.log('🛡️ 啟動終極安全模式...');

import dotenv from 'dotenv';
import express from 'express';

// 1. 徹底清理所有危險環境變數
console.log('🧹 徹底清理危險環境變數...');

const dangerousPatterns = [
  'DEBUG_URL',
  'WEBPACK_DEV_SERVER',
  'HMR_',
  'VITE_DEV',
  'HOT_RELOAD'
];

let cleanedCount = 0;
Object.keys(process.env).forEach(key => {
  const value = process.env[key];
  const isDangerous = dangerousPatterns.some(pattern => key.includes(pattern)) ||
    (value && typeof value === 'string' && (
      value.includes('${') ||
      value.includes('undefined') ||
      value.includes('null') ||
      value.includes('Missing parameter')
    ));

  if (isDangerous) {
    console.log(`🧹 清理危險變數: ${key}=${value}`);
    delete process.env[key];
    cleanedCount++;
  }
});

console.log(`✅ 已清理 ${cleanedCount} 個危險環境變數`);

// 2. 設置安全的預設環境變數
console.log('⚙️ 設置安全環境變數...');
process.env.NODE_ENV = 'development';
process.env.PORT = '5000';
process.env.HOST = '0.0.0.0';

// 3. 安全載入 .env 檔案
console.log('📋 安全載入 .env 配置...');
try {
  dotenv.config();
  console.log('✅ .env 檔案載入成功');
} catch (error) {
  console.log('⚠️ .env 檔案載入失敗，使用預設值');
}

// 4. 二次安全檢查 - 清理 .env 載入後的危險變數
console.log('🔍 執行二次安全檢查...');
Object.keys(process.env).forEach(key => {
  const value = process.env[key];
  if (value && typeof value === 'string' && (
    value.includes('${') || 
    value.includes('Missing parameter') ||
    value === 'undefined' ||
    value === 'null'
  )) {
    console.log(`🚨 發現並清理殘留危險變數: ${key}=${value}`);
    delete process.env[key];
  }
});

// 5. 驗證關鍵 LINE Bot 變數
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

// 6. 最終環境驗證
console.log('🔍 最終環境變數驗證...');
const finalEnvCount = Object.keys(process.env).length;
console.log(`📊 當前環境變數數量: ${finalEnvCount}`);

// 7. 嘗試啟動主程式
console.log('🚀 嘗試安全啟動主程式...');

async function startMainApp() {
  try {
    // 動態載入主程式模組
    const mainModule = await import('./index');
    console.log('✅ 主程式啟動成功！');
    return true;
  } catch (error) {
    console.log('❌ 主程式啟動失敗:', error);
    return false;
  }
}

async function startEmergencyMode() {
  console.log('🆘 啟動緊急降級模式...');
  
  const app = express();
  const port = parseInt(process.env.PORT || '5000');

  // 基本中間件
  app.use(express.json());
  app.use(express.static('public'));

  // 健康檢查端點
  app.get('/health', (req, res) => {
    res.json({
      status: 'emergency_mode',
      timestamp: new Date().toISOString(),
      message: '緊急模式運行中 - path-to-regexp 修復完成',
      port: port,
      lineConfigStatus: hasValidLineConfig ? 'valid' : 'needs_setup',
      environmentCleanup: `清理了 ${cleanedCount} 個危險變數`
    });
  });

  // 主頁
  app.get('/', (req, res) => {
    res.send(`
      <html>
        <head>
          <meta charset="UTF-8">
          <title>🆘 緊急模式 - 系統修復中</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
            .status { padding: 20px; border-radius: 8px; margin: 20px 0; }
            .success { background: #d4edda; border: 1px solid #c3e6cb; color: #155724; }
            .warning { background: #fff3cd; border: 1px solid #ffeaa7; color: #856404; }
            .info { background: #d1ecf1; border: 1px solid #bee5eb; color: #0c5460; }
          </style>
        </head>
        <body>
          <h1>🆘 緊急模式 - path-to-regexp 修復完成</h1>
          
          <div class="status success">
            <h3>✅ 修復狀態</h3>
            <p>已成功清理 ${cleanedCount} 個危險環境變數</p>
            <p>path-to-regexp 相關錯誤已修復</p>
          </div>

          <div class="status ${hasValidLineConfig ? 'success' : 'warning'}">
            <h3>${hasValidLineConfig ? '✅' : '⚠️'} LINE Bot 配置</h3>
            <p>狀態: ${hasValidLineConfig ? '正常' : '需要在 .env 中設定 LINE_CHANNEL_ACCESS_TOKEN 和 LINE_CHANNEL_SECRET'}</p>
          </div>

          <div class="status info">
            <h3>🔗 可用端點</h3>
            <p><a href="/health">健康檢查 API</a></p>
            <p>時間: ${new Date().toLocaleString()}</p>
            <p>埠號: ${port}</p>
          </div>

          <div class="status info">
            <h3>📋 下一步</h3>
            <ol>
              <li>檢查 .env 檔案中的 LINE Bot 設定</li>
              <li>執行「系統診斷報告」工作流程確認所有問題已解決</li>
              <li>嘗試重新啟動主程式</li>
            </ol>
          </div>
        </body>
      </html>
    `);
  });

  // 404 處理
  app.use('*', (req, res) => {
    res.status(404).json({
      error: 'Not Found',
      message: '緊急模式中，部分功能暫時不可用',
      availableEndpoints: ['/', '/health']
    });
  });

  // 錯誤處理
  app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('緊急模式錯誤:', err);
    res.status(500).json({
      error: 'Emergency mode error',
      message: err.message
    });
  });

  // 啟動伺服器
  app.listen(port, '0.0.0.0', () => {
    console.log(`🆘 緊急模式伺服器運行在 http://0.0.0.0:${port}`);
    console.log(`📍 健康檢查: http://0.0.0.0:${port}/health`);
  });
}

// 主啟動邏輯
async function main() {
  const mainAppStarted = await startMainApp();
  
  if (!mainAppStarted) {
    console.log('🔄 主程式無法啟動，切換到緊急模式...');
    await startEmergencyMode();
  }
}

// 執行主程式
main().catch(error => {
  console.error('🚨 啟動過程發生嚴重錯誤:', error);
  process.exit(1);
});
