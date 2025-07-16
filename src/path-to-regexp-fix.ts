// path-to-regexp 錯誤專用修復腳本
console.log('🔧 開始 path-to-regexp 錯誤專用修復...');

// 1. 記錄修復前狀態
const beforeCleanup = Object.keys(process.env).length;
console.log(`📊 修復前環境變數數量: ${beforeCleanup}`);

// 2. 識別並清理所有問題變數
const problematicPatterns = [
  /\$\{[^}]*\}/,           // ${...} 模板字串
  /Missing parameter/,      // 錯誤訊息
  /:[\w]*\(\*\)/,          // 非法路由參數
];

const cleanedVars: string[] = [];
Object.entries(process.env).forEach(([key, value]) => {
  if (value && typeof value === 'string') {
    const hasProblems = problematicPatterns.some(pattern => pattern.test(value)) ||
                       value === 'undefined' || value === 'null' || value.trim() === '';

    if (hasProblems) {
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

// 3. 設置安全的預設值
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

// 4. 最終檢查
const afterCleanup = Object.keys(process.env).length;
console.log(`📊 修復後環境變數數量: ${afterCleanup}`);
console.log(`✅ path-to-regexp 修復完成，清理了 ${beforeCleanup - afterCleanup} 個變數`);

// 5. 驗證修復結果
const remainingIssues = Object.entries(process.env).filter(([key, value]) => {
  return value && typeof value === 'string' && (
    value.includes('${') || value.includes('Missing parameter')
  );
});

if (remainingIssues.length === 0) {
  console.log('🎉 所有 path-to-regexp 相關問題已解決');
} else {
  console.log(`⚠️ 仍有 ${remainingIssues.length} 個問題需要處理`);
  remainingIssues.forEach(([key, value]) => {
    console.log(`  - ${key}: ${value}`);
  });
}