
export const routeSafetyCheck = () => {
  console.log('🛡️ 執行路由安全檢查...');
  
  const issues: string[] = [];
  const fixes: string[] = [];

  // 1. 檢查環境變數中的路由相關問題
  Object.entries(process.env).forEach(([key, value]) => {
    if (value && typeof value === 'string') {
      // 檢查 path-to-regexp 常見錯誤模式
      const problematicPatterns = [
        /\$\{[^}]*\}/g,           // ${...} 未展開的模板字串
        /:[\w]*\(\*\)/g,         // :param(*) 非法參數
        /Missing parameter name/g, // 錯誤訊息本身
        /^\$\{.*\}$/g            // 完全是模板字串的值
      ];

      problematicPatterns.forEach((pattern, index) => {
        if (pattern.test(value)) {
          const patternNames = [
            '未展開的模板字串',
            '非法路由參數',
            '錯誤訊息殘留',
            '完整模板字串'
          ];
          
          issues.push(`環境變數 ${key} 包含 ${patternNames[index]}: ${value}`);
          
          // 自動修復
          if (key.includes('DEBUG') || key.includes('URL')) {
            delete process.env[key];
            fixes.push(`已清理環境變數: ${key}`);
          }
        }
      });
    }
  });

  // 2. 檢查特定的問題變數（從錯誤訊息推斷）
  const problematicVars = ['DEBUG_URL', 'WEBHOOK_URL', 'BASE_URL'];
  problematicVars.forEach(varName => {
    const value = process.env[varName];
    if (value && (value.includes('${') || value.includes('Missing parameter'))) {
      issues.push(`發現問題變數 ${varName}: ${value}`);
      delete process.env[varName];
      fixes.push(`已清理問題變數: ${varName}`);
    }
  });

  // 3. 預防性設置安全的預設值
  if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = 'development';
    fixes.push('設置預設 NODE_ENV=development');
  }

  // 4. 報告結果
  if (issues.length > 0) {
    console.log('⚠️ 發現路由安全問題:');
    issues.forEach(issue => console.log(`  - ${issue}`));
  }

  if (fixes.length > 0) {
    console.log('🔧 自動修復:');
    fixes.forEach(fix => console.log(`  - ${fix}`));
  }

  if (issues.length === 0) {
    console.log('✅ 路由安全檢查通過');
  }

  return { issues, fixes };
};

// 清理所有可能的問題環境變數
export const cleanProblemEnvVars = () => {
  const cleanedVars: string[] = [];
  
  Object.keys(process.env).forEach(key => {
    const value = process.env[key];
    if (value && typeof value === 'string') {
      // 清理包含問題模式的變數
      if (
        value.includes('${') ||
        value.includes('Missing parameter name') ||
        value.includes(':param(*)') ||
        (key.includes('DEBUG') && value.includes('${'))
      ) {
        delete process.env[key];
        cleanedVars.push(key);
      }
    }
  });

  if (cleanedVars.length > 0) {
    console.log(`🧹 清理了 ${cleanedVars.length} 個問題環境變數:`, cleanedVars.join(', '));
  }

  return cleanedVars;
};
