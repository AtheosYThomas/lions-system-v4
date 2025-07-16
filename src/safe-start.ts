// 終極安全啟動腳本 - 徹底解決 path-to-regexp 錯誤
console.log('🛡️ 啟動終極安全模式...');

// 1. 預防性清理所有危險環境變數
console.log('🧹 預防性清理危險環境變數...');

const dangerousPatterns = [
  /\$\{[^}]*\}/,           // ${...} 模板字串
  /Missing parameter/,      // 錯誤訊息
  /:[\w]*\(\*\)/,          // 非法路由參數
  /undefined/i,            // undefined 值
  /null/i,                 // null 值
];

const problematicKeys = [
  'DEBUG_URL',
  'WEBPACK_DEV_SERVER_URL', 
  'WEBPACK_DEV_SERVER',
  'HMR_HOST',
  'HMR_PORT',
  'VITE_DEV_SERVER_URL'
];

// 清理所有問題變數
const beforeCount = Object.keys(process.env).length;
let cleanedCount = 0;

Object.entries(process.env).forEach(([key, value]) => {
  if (value && typeof value === 'string') {
    const hasPatternProblem = dangerousPatterns.some(pattern => pattern.test(value));
    const isProblematicKey = problematicKeys.includes(key);

    if (hasPatternProblem || isProblematicKey || value.trim() === '') {
      delete process.env[key];
      cleanedCount++;
      console.log(`🗑️ 清理: ${key}`);
    }
  }
});

console.log(`✅ 清理完成，移除了 ${cleanedCount} 個問題變數`);

// 2. 設置安全的預設環境
console.log('⚙️ 設置安全環境變數...');

const safeDefaults = {
  NODE_ENV: 'development',
  PORT: '5000',
  TERM: 'xterm-256color'
};

Object.entries(safeDefaults).forEach(([key, value]) => {
  if (!process.env[key]) {
    process.env[key] = value;
    console.log(`🔧 設置: ${key}=${value}`);
  }
});

// 3. 最終安全檢查
console.log('🔍 執行最終安全檢查...');

const remainingIssues = Object.entries(process.env).filter(([key, value]) => {
  return value && typeof value === 'string' && (
    value.includes('${') || 
    value.includes('Missing parameter') ||
    value.includes(':param(*)')
  );
});

if (remainingIssues.length === 0) {
  console.log('✅ 環境安全檢查通過');
} else {
  console.log(`⚠️ 發現 ${remainingIssues.length} 個殘留問題`);
  remainingIssues.forEach(([key, value]) => {
    console.log(`  - ${key}: ${value}`);
    delete process.env[key]; // 強制清理
  });
}

// 4. 安全載入 Express 和啟動伺服器
const startSafeServer = async () => {
  try {
    console.log('🚀 安全啟動伺服器...');

    // 動態載入主程式
    const mainModule = await import('./index');
    console.log('✅ 伺服器啟動成功');

  } catch (error) {
    console.error('❌ 伺服器啟動失敗:', error);

    // 如果仍有 path-to-regexp 錯誤，執行緊急修復
    if (error.message && error.message.includes('Missing parameter')) {
      console.log('🚨 檢測到 path-to-regexp 錯誤，執行緊急修復...');

      // 清理所有可能的問題模組快取
      Object.keys(require.cache).forEach(key => {
        if (key.includes('path-to-regexp') || key.includes('express')) {
          delete require.cache[key];
        }
      });

      // 重新設置環境
      process.env.NODE_ENV = 'development';
      process.env.PORT = '5000';

      console.log('🔄 重新嘗試啟動...');
      setTimeout(() => {
        process.exit(1); // 讓工作流程重新啟動
      }, 1000);
    }
  }
};

// 5. 延遲啟動以確保環境穩定
setTimeout(startSafeServer, 500);

console.log('🛡️ 安全啟動程序已初始化');