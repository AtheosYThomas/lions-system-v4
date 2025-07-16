
// Checkpoint 1 專用修復腳本 - 避免環境重載問題
console.log('🔧 開始 Checkpoint 1 專用修復...');

// 0. 立即設置安全環境，避免後續重載
process.env.NODE_ENV = 'development';
process.env.PORT = '5000';

// 1. 記錄修復前狀態
const beforeCleanup = Object.keys(process.env).length;
console.log(`📊 修復前環境變數數量: ${beforeCleanup}`);

// 2. 定義問題模式
const problematicPatterns = [
  /\$\{[^}]*\}/,           // ${...} 模板字串
  /Missing parameter/,      // 錯誤訊息
  /:[\w]*\(\*\)/,          // 非法路由參數
  /undefined/i,            // undefined 值
  /null/i,                 // null 值
];

// 3. 定義需要強制清理的變數
const forceCleanVars = [
  'DEBUG_URL', 'WEBPACK_DEV_SERVER_URL', 'WEBPACK_DEV_SERVER', 
  'HMR_HOST', 'HMR_PORT', 'VITE_DEV_SERVER_URL', 'BASE_URL'
];

// 4. 清理問題變數
const cleanedVars: string[] = [];
Object.entries(process.env).forEach(([key, value]) => {
  if (value && typeof value === 'string') {
    const hasPatternProblem = problematicPatterns.some(pattern => pattern.test(value));
    const isForceClean = forceCleanVars.includes(key);
    
    if (hasPatternProblem || isForceClean || value.trim() === '') {
      delete process.env[key];
      cleanedVars.push(key);
    }
  }
});

if (cleanedVars.length > 0) {
  console.log(`🧹 已清理問題變數: ${cleanedVars.join(', ')}`);
} else {
  console.log('✅ 未發現問題變數');
}

// 5. 設置安全的預設值
const safeDefaults = {
  NODE_ENV: 'development',
  PORT: '5000'
};

Object.entries(safeDefaults).forEach(([key, value]) => {
  if (!process.env[key]) {
    process.env[key] = value;
    console.log(`🔧 設置預設值: ${key}=${value}`);
  }
});

// 6. 清理模組快取
console.log('🔄 清理模組快取...');
const moduleKeys = Object.keys(require.cache).filter(key => 
  key.includes('path-to-regexp') || key.includes('express')
);
moduleKeys.forEach(key => delete require.cache[key]);

// 7. 額外清理特定問題變數模式
const extraProblematicPatterns = [
  'REPL_SLUG', 'REPL_OWNER', 'REPLIT_DB_URL'
];

extraProblematicPatterns.forEach(pattern => {
  Object.keys(process.env).forEach(key => {
    if (key.includes(pattern)) {
      const value = process.env[key];
      if (value && (value.includes('${') || value.includes('Missing'))) {
        delete process.env[key];
        console.log(`🗑️ 額外清理: ${key}`);
      }
    }
  });
});

// 8. 最終驗證
const afterCleanup = Object.keys(process.env).length;
const remainingIssues = Object.entries(process.env).filter(([key, value]) => {
  return value && typeof value === 'string' && (
    value.includes('${') || value.includes('Missing parameter') || 
    value.includes(':') && value.includes('(*)')
  );
});

// 9. 強制清理所有殘留問題
if (remainingIssues.length > 0) {
  console.log(`⚠️ 發現 ${remainingIssues.length} 個殘留問題，強制清理：`);
  remainingIssues.forEach(([key, value]) => {
    console.log(`  - ${key}: ${value}`);
    delete process.env[key];
  });
}

// 10. 最終狀態報告
const finalCleanup = Object.keys(process.env).length;
console.log('\n📋 Checkpoint 1 修復完成狀態：');
console.log(`- 修復前變數數量: ${beforeCleanup}`);
console.log(`- 修復後變數數量: ${finalCleanup}`);
console.log(`- 清理變數總數: ${beforeCleanup - finalCleanup}`);
console.log(`- NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`- PORT: ${process.env.PORT}`);

if (remainingIssues.length === 0) {
  console.log('🎉 Checkpoint 1 修復完成！');
  console.log('✅ 環境已完全清理，可以進行 Checkpoint 1 檢查');
} else {
  console.log('🧹 已強制清理所有殘留問題');
}

console.log('\n🏁 Checkpoint 1 修復程序完成');
