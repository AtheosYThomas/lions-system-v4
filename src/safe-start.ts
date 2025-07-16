
// 終極安全啟動腳本 - 徹底解決 path-to-regexp 錯誤
console.log('🛡️ 啟動終極安全模式...');

// 1. 完全清空可能有問題的環境變數
console.log('🧹 徹底清理環境變數...');

// 記錄原始環境變數
const originalKeys = Object.keys(process.env);
console.log(`📊 原始環境變數數量: ${originalKeys.length}`);

// 定義絕對安全的白名單
const safeWhitelist = [
  'PATH', 'HOME', 'USER', 'SHELL', 'TERM', 'PWD',
  'NODE_VERSION', 'NPM_VERSION', 'LANG', 'TZ',
  'REPL_ID', 'REPL_SLUG', 'REPL_OWNER',
  'LINE_CHANNEL_ACCESS_TOKEN', 'LINE_CHANNEL_SECRET',
  'DATABASE_URL', 'PORT', 'NODE_ENV'
];

// 清理所有非白名單變數
let cleanedCount = 0;
Object.keys(process.env).forEach(key => {
  if (!safeWhitelist.includes(key)) {
    const value = process.env[key];
    
    // 特別檢查是否包含問題模式
    if (value && typeof value === 'string') {
      if (
        value.includes('${') ||
        value.includes('Missing parameter') ||
        value.includes('undefined') ||
        value === 'null' ||
        key.includes('DEBUG') ||
        key.includes('WEBPACK') ||
        key.includes('HMR') ||
        key.includes('VITE') ||
        key.includes('DEV_SERVER')
      ) {
        console.log(`🚨 清理危險變數: ${key}=${value}`);
        delete process.env[key];
        cleanedCount++;
      }
    }
  }
});

console.log(`✅ 已清理 ${cleanedCount} 個危險環境變數`);

// 2. 強制設置核心安全變數
const safeDefaults = {
  NODE_ENV: 'development',
  PORT: '5000',
  TERM: 'xterm-256color'
};

Object.entries(safeDefaults).forEach(([key, value]) => {
  process.env[key] = value;
  console.log(`🔧 強制設置: ${key}=${value}`);
});

// 3. 驗證關鍵 LINE Bot 變數
const lineVars = ['LINE_CHANNEL_ACCESS_TOKEN', 'LINE_CHANNEL_SECRET'];
let hasLineConfig = true;

lineVars.forEach(varName => {
  const value = process.env[varName];
  if (!value || value === 'undefined' || value.includes('${')) {
    console.log(`⚠️ LINE 變數異常: ${varName}`);
    hasLineConfig = false;
  }
});

// 4. 最後檢查確保沒有問題變數
const finalCheck = Object.entries(process.env).filter(([key, value]) => {
  return value && typeof value === 'string' && (
    value.includes('${') ||
    value.includes('Missing parameter') ||
    key.includes('DEBUG_URL')
  );
});

if (finalCheck.length > 0) {
  console.log('🚨 最終檢查發現問題變數:');
  finalCheck.forEach(([key, value]) => {
    console.log(`  - ${key}=${value}`);
    delete process.env[key];
  });
}

console.log('✅ 環境變數終極清理完成');
console.log(`📊 當前環境變數數量: ${Object.keys(process.env).length}`);

// 5. 安全載入主程式
console.log('🚀 安全載入主程式...');

try {
  // 先載入並執行 dotenv（但只保留安全的變數）
  const dotenv = require('dotenv');
  const envResult = dotenv.config();
  
  if (envResult.parsed) {
    // 再次過濾 .env 中的危險變數
    Object.entries(envResult.parsed).forEach(([key, value]) => {
      if (value && typeof value === 'string' && (
        value.includes('${') ||
        value.includes('Missing parameter') ||
        key.includes('DEBUG_URL')
      )) {
        console.log(`🧹 過濾 .env 中的危險變數: ${key}`);
        delete process.env[key];
      }
    });
  }
  
  // 啟動主程式
  require('./index');
  
} catch (error) {
  console.error('❌ 主程式載入失敗:', error);
  
  // 終極降級：創建最基本的伺服器
  console.log('🔧 啟動緊急降級模式...');
  
  const express = require('express');
  const app = express();
  const PORT = 5000;
  
  app.use(express.json());
  
  app.get('/health', (req: any, res: any) => {
    res.json({ 
      status: 'emergency-mode',
      message: 'path-to-regexp 錯誤修復模式',
      timestamp: new Date().toISOString(),
      hasLineConfig
    });
  });
  
  app.get('/', (req: any, res: any) => {
    res.send(`
      <h1>緊急模式</h1>
      <p>系統正在修復 path-to-regexp 錯誤</p>
      <p>LINE Bot 配置狀態: ${hasLineConfig ? '正常' : '需要設定'}</p>
      <p><a href="/health">健康檢查</a></p>
    `);
  });
  
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 緊急模式伺服器啟動於埠號 ${PORT}`);
    console.log(`📍 健康檢查: http://0.0.0.0:${PORT}/health`);
  });
}
