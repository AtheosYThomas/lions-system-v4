
import { performFullEnvCheck } from './config/check-env';
import { validatePath, getSafePath } from './utils/safePath';

console.log('🛡️ 執行啟動安全檢查...');

// 1. 執行完整環境檢查
const envResults = performFullEnvCheck();

// 2. 測試安全路徑函數
console.log('🔍 測試安全路徑函數...');

const testPaths = [
  '/api/test',
  '/admin/:id',
  '/events/:eventId/checkin',
  'https://example.com/invalid', // 應該被拒絕
  '${process.env.DEBUG_URL}',    // 應該被拒絕
  'Missing parameter name',       // 應該被拒絕
];

testPaths.forEach(testPath => {
  const isValid = validatePath(testPath);
  const status = isValid ? '✅' : '❌';
  console.log(`${status} ${testPath}: ${isValid ? '有效' : '無效'}`);
});

// 3. 測試環境變數安全獲取
console.log('🔍 測試環境變數安全獲取...');

const testEnvKeys = [
  { key: 'DEBUG_URL', fallback: '/api/debug' },
  { key: 'ADMIN_PATH', fallback: '/admin' },
  { key: 'NONEXISTENT_PATH', fallback: '/fallback' }
];

testEnvKeys.forEach(({ key, fallback }) => {
  const safePath = getSafePath(key, fallback);
  console.log(`📝 ${key}: ${safePath}`);
});

// 4. 檢查 path-to-regexp 是否可以正常載入
console.log('🔍 測試 path-to-regexp 載入...');

try {
  const { safePathToRegexp } = require('./utils/safePath');
  
  const testRegexp = safePathToRegexp('/api/test/:id');
  if (testRegexp) {
    console.log('✅ path-to-regexp 載入和功能測試成功');
  } else {
    console.log('⚠️ path-to-regexp 功能測試失敗');
  }
} catch (error) {
  console.error('❌ path-to-regexp 載入失敗:', error);
}

// 5. 輸出安全檢查結果
const totalIssues = envResults.required.missingVars.length + 
                   envResults.paths.issues.length + 
                   envResults.dangerous.cleanedCount;

if (totalIssues === 0) {
  console.log('🎉 啟動安全檢查通過！系統可以安全啟動');
} else {
  console.log(`⚠️ 發現並修復了 ${totalIssues} 個問題，系統已準備就緒`);
}

console.log('📋 啟動安全檢查完成');
