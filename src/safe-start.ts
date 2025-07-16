
#!/usr/bin/env node

// 安全啟動腳本 - 專門解決 path-to-regexp 錯誤
import * as dotenv from 'dotenv';

console.log('🛡️ 啟動安全模式...');

// 1. 在載入任何模組之前先清理環境
const originalEnv = { ...process.env };

// 清理所有可能導致 path-to-regexp 錯誤的環境變數
Object.keys(process.env).forEach(key => {
  const value = process.env[key];
  if (value && typeof value === 'string') {
    // 檢查危險模式
    if (
      value.includes('${') ||
      value.includes('Missing parameter') ||
      value.includes(':') && value.includes('(*)') ||
      value === 'undefined' ||
      value === 'null' ||
      key.includes('DEBUG_URL') ||
      key.includes('WEBPACK') ||
      key.includes('HMR') ||
      key.includes('VITE_DEV')
    ) {
      console.log(`🧹 預防性清理: ${key}`);
      delete process.env[key];
    }
  }
});

// 2. 重新載入 dotenv 但只保留安全的變數
dotenv.config();

// 3. 設置核心安全變數
process.env.NODE_ENV = 'development';
process.env.PORT = process.env.PORT || '5000';

// 4. 驗證關鍵環境變數
const requiredVars = ['LINE_CHANNEL_ACCESS_TOKEN', 'LINE_CHANNEL_SECRET'];
let hasRequiredVars = true;

requiredVars.forEach(varName => {
  if (!process.env[varName] || process.env[varName] === 'undefined') {
    console.log(`⚠️ 缺少環境變數: ${varName}`);
    hasRequiredVars = false;
  }
});

if (!hasRequiredVars) {
  console.log('❌ 關鍵環境變數缺失，但繼續啟動伺服器...');
}

console.log('✅ 環境清理完成，啟動主程式...');

// 5. 現在安全地載入並啟動主程式
try {
  require('./index');
} catch (error) {
  console.error('❌ 啟動失敗:', error);
  console.log('🔧 嘗試降級啟動...');
  
  // 降級處理：創建最小的 Express 伺服器
  const express = require('express');
  const app = express();
  const PORT = 5000;
  
  app.get('/health', (req: any, res: any) => {
    res.json({ status: 'minimal-mode', timestamp: new Date().toISOString() });
  });
  
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 最小模式伺服器啟動於埠號 ${PORT}`);
  });
}
