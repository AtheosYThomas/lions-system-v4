import * as dotenv from 'dotenv';

// 載入環境變數
dotenv.config();

// 驗證關鍵環境變數是否正確載入，避免未展開的模板字串
const validateEnvVars = () => {
  // 預防性清理可能導致 path-to-regexp 錯誤的變數
  const dangerousVars = ['DEBUG_URL', 'WEBPACK_DEV_SERVER_URL', 'VITE_DEV_SERVER_URL'];
  dangerousVars.forEach(varName => {
    if (process.env[varName] && (
      process.env[varName]!.includes('${') || 
      process.env[varName]!.includes('Missing parameter')
    )) {
      console.log(`🚨 清理危險環境變數: ${varName}=${process.env[varName]}`);
      delete process.env[varName];
    }
  });

  const requiredVars = ['LINE_CHANNEL_SECRET', 'LINE_CHANNEL_ACCESS_TOKEN'];
  const warnings: string[] = [];
  const errors: string[] = [];

  // 檢查必要變數
  for (const varName of requiredVars) {
    const value = process.env[varName];
    if (!value) {
      errors.push(`❌ 缺少必要環境變數: ${varName}`);
    } else if (value.includes('${') && value.includes('}')) {
      errors.push(`❌ 環境變數 ${varName} 包含未展開的模板字串: ${value}`);
      // 自動清理問題變數
      delete process.env[varName];
      errors.push(`🧹 已自動清理問題變數: ${varName}`);
    } else if (value === 'undefined' || value === 'null' || value.trim() === '') {
      errors.push(`❌ 環境變數 ${varName} 值無效: ${value}`);
    }
  }

  // 檢查可選變數
  const optionalVars = ['DEBUG_URL', 'NODE_ENV'];
  for (const varName of optionalVars) {
    const value = process.env[varName];
    if (value && (value.includes('${') && value.includes('}'))) {
      warnings.push(`⚠️ 環境變數 ${varName} 包含未展開的模板字串: ${value}`);
      // 清理有問題的可選變數
      delete process.env[varName];
      console.log(`🧹 已清理有問題的環境變數: ${varName}`);
    }
  }

  // 特別檢查 DEBUG_URL（報錯中提到的變數）
  if (process.env.DEBUG_URL) {
    const debugUrl = process.env.DEBUG_URL;
    if (debugUrl.includes('${') || debugUrl.includes('Missing parameter name')) {
      console.log(`🚨 發現問題 DEBUG_URL: ${debugUrl}`);
      delete process.env.DEBUG_URL;
      console.log('🧹 已清理問題 DEBUG_URL');
    }
  }

  if (errors.length > 0) {
    console.log('環境變數錯誤:');
    errors.forEach(error => console.log(error));
  }

  if (warnings.length > 0) {
    console.log('環境變數警告:');
    warnings.forEach(warning => console.log(warning));
  }

  if (errors.length === 0 && warnings.length === 0) {
    console.log('✅ 環境變數驗證通過');
  }
};

validateEnvVars();

export const config = {
  line: {
    accessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN || '',
    channelSecret: process.env.LINE_CHANNEL_SECRET || '',
  },
  database: {
    url: process.env.DATABASE_URL || ''
  }
};