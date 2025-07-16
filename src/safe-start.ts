// 終極安全啟動腳本 - 徹底解決 path-to-regexp 錯誤
console.log('🛡️ 啟動終極安全模式...');

import dotenv from 'dotenv';
import express from 'express';
import path from 'path';

// 1. 預防性清理所有危險環境變數
console.log('🧹 預防性清理危險環境變數...');
const dangerousPatterns = [
  'DEBUG_URL',
  'WEBPACK_DEV_SERVER',
  'HMR_',
  'VITE_DEV',
  'HOT_RELOAD'
];

Object.keys(process.env).forEach(key => {
  const value = process.env[key];
  const isDangerous = dangerousPatterns.some(pattern => key.includes(pattern)) ||
    (value && typeof value === 'string' && (
      value.includes('${') ||
      value.includes('undefined') ||
      value.includes('null')
    ));

  if (isDangerous) {
    console.log(`🧹 清理危險變數: ${key}`);
    delete process.env[key];
  }
});

// 2. 設置安全的環境變數
console.log('⚙️ 設置安全環境變數...');
process.env.NODE_ENV = 'development';
process.env.PORT = '5000';

// 3. 安全載入 .env 檔案
console.log('📋 安全載入 .env 配置...');
try {
  dotenv.config();
  console.log('✅ .env 檔案載入成功');
} catch (error) {
  console.log('⚠️ .env 檔案載入失敗，使用預設值');
}

// 4. 二次清理 - 檢查 .env 載入後是否有新的危險變數
console.log('🔍 二次安全檢查...');
Object.keys(process.env).forEach(key => {
  const value = process.env[key];
  if (value && typeof value === 'string' && value.includes('${')) {
    console.log(`🚨 發現並清理模板字串變數: ${key}=${value}`);
    delete process.env[key];
  }
});

// 5. 啟動主程式或緊急模式
console.log('🚀 嘗試啟動主程式...');
try {
  // 嘗試載入主程式
  require('./index');
  console.log('✅ 主程式啟動成功');
} catch (error) {
  console.log('❌ 主程式啟動失敗，啟動緊急模式:', error);

  // 緊急降級 - 啟動基本 Express 伺服器
  console.log('🆘 啟動緊急降級模式...');
  const app = express();
  const port = process.env.PORT || 5000;

  app.get('/', (req, res) => {
    res.send(`
      <h1>🆘 緊急模式 - 系統正在修復中</h1>
      <p>時間: ${new Date().toLocaleString()}</p>
      <p>狀態: 主程式暫時無法啟動，請檢查系統診斷報告</p>
      <a href="/health">健康檢查</a>
    `);
  });

  app.get('/health', (req, res) => {
    res.json({
      status: 'emergency_mode',
      timestamp: new Date().toISOString(),
      message: '緊急模式運行中',
      port: port
    });
  });

  app.listen(port, '0.0.0.0', () => {
    console.log(`🆘 緊急模式伺服器運行在 http://0.0.0.0:${port}`);
  });
}