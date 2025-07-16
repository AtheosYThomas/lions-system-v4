
// path-to-regexp 錯誤專用修復腳本
console.log('🔧 開始 path-to-regexp 錯誤專用修復...');

// 1. 記錄修復前狀態
const beforeCleanup = Object.keys(process.env).length;
console.log(`📊 修復前環境變數數量: ${beforeCleanup}`);

// 2. 識別並記錄所有問題變數
const problemVariables: string[] = [];
const templateStringVars: string[] = [];
const pathToRegexpErrors: string[] = [];

Object.entries(process.env).forEach(([key, value]) => {
  if (value && typeof value === 'string') {
    // 檢查模板字串
    if (value.includes('${') && value.includes('}')) {
      templateStringVars.push(`${key}=${value}`);
      problemVariables.push(key);
    }
    
    // 檢查 path-to-regexp 錯誤訊息
    if (value.includes('Missing parameter') || value.includes('path-to-regexp')) {
      pathToRegexpErrors.push(`${key}=${value}`);
      problemVariables.push(key);
    }
    
    // 檢查其他問題模式
    if (value === 'undefined' || value === 'null' || 
        key.includes('DEBUG_URL') || key.includes('WEBPACK_DEV_SERVER')) {
      problemVariables.push(key);
    }
  }
});

// 3. 報告發現的問題
console.log('\n🔍 問題變數分析：');
if (templateStringVars.length > 0) {
  console.log('📝 模板字串變數：');
  templateStringVars.forEach(variable => console.log(`  - ${variable}`));
}

if (pathToRegexpErrors.length > 0) {
  console.log('🚨 path-to-regexp 錯誤變數：');
  pathToRegexpErrors.forEach(variable => console.log(`  - ${variable}`));
}

console.log(`🎯 總共發現 ${problemVariables.length} 個問題變數`);

// 4. 執行清理
console.log('\n🧹 開始清理問題變數...');
problemVariables.forEach(key => {
  console.log(`🗑️ 刪除: ${key}`);
  delete process.env[key];
});

// 5. 設置安全的預設值
const safeDefaults = {
  NODE_ENV: 'development',
  PORT: '5000',
  TERM: 'xterm-256color'
};

console.log('\n⚙️ 設置安全預設值...');
Object.entries(safeDefaults).forEach(([key, value]) => {
  process.env[key] = value;
  console.log(`✅ 設置: ${key}=${value}`);
});

// 6. 驗證修復結果
const afterCleanup = Object.keys(process.env).length;
const cleanedCount = beforeCleanup - afterCleanup + Object.keys(safeDefaults).length;

console.log('\n📊 修復結果統計：');
console.log(`  修復前變數數量: ${beforeCleanup}`);
console.log(`  修復後變數數量: ${afterCleanup}`);
console.log(`  清理的問題變數: ${problemVariables.length}`);
console.log(`  新增的安全變數: ${Object.keys(safeDefaults).length}`);

// 7. 最終驗證 - 確保沒有殘留問題
const finalCheck = Object.entries(process.env).filter(([key, value]) => {
  return value && typeof value === 'string' && (
    value.includes('${') ||
    value.includes('Missing parameter') ||
    value.includes('path-to-regexp')
  );
});

if (finalCheck.length === 0) {
  console.log('\n✅ path-to-regexp 錯誤修復完成！');
  console.log('🎉 所有問題變數已清除，環境已安全');
} else {
  console.log('\n⚠️ 發現殘留問題：');
  finalCheck.forEach(([key, value]) => {
    console.log(`  🚨 ${key}=${value}`);
  });
}

export { cleanedCount, problemVariables };
