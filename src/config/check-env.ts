
import { validatePath } from '../utils/safePath';

// 必要的環境變數列表
const requiredEnv = [
  'NODE_ENV',
  'PORT'
];

// 路徑相關的環境變數列表（需要特別驗證）
const pathEnvVars = [
  'DEBUG_URL',
  'BASE_URL',
  'WEBHOOK_URL'
];

// 檢查必要環境變數
export function checkRequiredEnv() {
  console.log('🔍 檢查必要環境變數...');
  
  const missingVars: string[] = [];
  
  requiredEnv.forEach((key) => {
    if (!process.env[key]) {
      missingVars.push(key);
      console.warn(`⚠️ 環境變數 ${key} 尚未設定`);
    } else {
      console.log(`✅ ${key}=${process.env[key]}`);
    }
  });

  // 設置預設值
  if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = 'development';
    console.log('🔧 設置預設值: NODE_ENV=development');
  }

  if (!process.env.PORT) {
    process.env.PORT = '5000';
    console.log('🔧 設置預設值: PORT=5000');
  }

  return { missingVars, hasIssues: missingVars.length > 0 };
}

// 檢查路徑相關環境變數
export function checkPathEnv() {
  console.log('🔍 檢查路徑相關環境變數...');
  
  const issues: string[] = [];
  
  pathEnvVars.forEach((key) => {
    const value = process.env[key];
    
    if (value) {
      if (validatePath(value)) {
        console.log(`✅ ${key}=${value} (格式正確)`);
      } else {
        issues.push(`${key}=${value}`);
        console.warn(`⚠️ ${key}=${value} (格式無效，已清理)`);
        delete process.env[key]; // 清理無效的路徑變數
      }
    } else {
      console.log(`ℹ️ ${key} 未設定 (可選)`);
    }
  });

  return { issues, hasIssues: issues.length > 0 };
}

// 清理危險的環境變數
export function cleanDangerousEnv() {
  console.log('🧹 清理危險環境變數...');
  
  const dangerousPatterns = [
    /\$\{[^}]*\}/,           // ${...} 模板字串
    /Missing parameter/,      // 錯誤訊息
    /:[\w]*\(\*\)/,          // 非法路由參數
  ];

  const cleanedVars: string[] = [];

  Object.entries(process.env).forEach(([key, value]) => {
    if (value && typeof value === 'string') {
      const hasDangerousPattern = dangerousPatterns.some(pattern => pattern.test(value));
      
      if (hasDangerousPattern || value === 'undefined' || value === 'null') {
        delete process.env[key];
        cleanedVars.push(key);
        console.log(`🗑️ 清理危險變數: ${key}`);
      }
    }
  });

  return { cleanedVars, cleanedCount: cleanedVars.length };
}

// 完整環境檢查
export function performFullEnvCheck() {
  console.log('🔍 執行完整環境變數檢查...');
  
  const results = {
    required: checkRequiredEnv(),
    paths: checkPathEnv(),
    dangerous: cleanDangerousEnv()
  };

  const totalIssues = results.required.missingVars.length + 
                     results.paths.issues.length + 
                     results.dangerous.cleanedCount;

  if (totalIssues === 0) {
    console.log('✅ 環境變數檢查通過');
  } else {
    console.log(`⚠️ 發現 ${totalIssues} 個環境變數問題，已自動修復`);
  }

  return results;
}

// 在模組載入時自動執行檢查
performFullEnvCheck();
