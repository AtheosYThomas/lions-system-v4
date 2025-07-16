
export const routeSafetyCheck = () => {
  console.log('🛡️ 執行增強路由安全檢查...');
  
  const issues: string[] = [];
  const fixes: string[] = [];

  // 1. 更徹底的環境變數檢查
  Object.entries(process.env).forEach(([key, value]) => {
    if (value && typeof value === 'string') {
      // 擴展的問題模式檢查
      const criticalPatterns = [
        { pattern: /\$\{[^}]*\}/g, name: '未展開的模板字串', critical: true },
        { pattern: /:[\w]*\(\*\)/g, name: '非法路由參數格式', critical: true },
        { pattern: /Missing parameter name/gi, name: '錯誤訊息殘留', critical: true },
        { pattern: /^\$\{.*\}$/g, name: '完整模板字串', critical: true },
        { pattern: /^undefined$/gi, name: '未定義值', critical: false },
        { pattern: /^null$/gi, name: '空值', critical: false },
        { pattern: /^\s*$/g, name: '空白值', critical: false }
      ];

      criticalPatterns.forEach(({ pattern, name, critical }) => {
        if (pattern.test(value)) {
          const severity = critical ? '🚨' : '⚠️';
          issues.push(`${severity} 環境變數 ${key} 包含 ${name}: ${value}`);
          
          // 立即清理關鍵問題
          if (critical || key.includes('DEBUG') || key.includes('URL') || 
              key.includes('WEBPACK') || key.includes('VITE') || key.includes('HMR')) {
            delete process.env[key];
            fixes.push(`🧹 已清理問題變數: ${key}`);
          }
        }
      });
      
      // 特別檢查包含路由相關關鍵字的變數
      const routeKeywords = ['route', 'path', 'url', 'endpoint', 'api'];
      if (routeKeywords.some(keyword => key.toLowerCase().includes(keyword))) {
        if (value.includes('${') || value.includes(':') && value.includes('(')) {
          issues.push(`🚨 路由相關變數 ${key} 可能有問題: ${value}`);
          delete process.env[key];
          fixes.push(`🛡️ 已清理路由變數: ${key}`);
        }
      }
    }
  });

  // 2. 檢查特定的問題變數（從錯誤訊息推斷）
  const problematicVars = ['DEBUG_URL', 'WEBHOOK_URL', 'BASE_URL', 'WEBPACK_DEV_SERVER_URL'];
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
        value.includes('Missing parameter') ||
        value.includes(':') && value.includes('(*)') ||
        value === 'undefined' ||
        value === 'null'
      ) {
        delete process.env[key];
        cleanedVars.push(key);
      }
    }
  });

  if (cleanedVars.length > 0) {
    console.log('🧹 已清理問題環境變數:', cleanedVars.join(', '));
  }

  return cleanedVars;
};

// 設置安全的預設環境變數
export const setSafeDefaults = () => {
  const defaults = {
    NODE_ENV: 'development',
    PORT: '5000'
  };

  Object.entries(defaults).forEach(([key, value]) => {
    if (!process.env[key]) {
      process.env[key] = value;
      console.log(`🔧 設置預設環境變數 ${key}=${value}`);
    }
  });
};

// 驗證路由字串是否安全
export const validateRouteString = (route: string): boolean => {
  try {
    // 檢查是否包含問題模式
    const problemPatterns = [
      /\$\{[^}]*\}/,        // ${...} 模板字串
      /:[\w]*\(\*\)/,       // :param(*) 非法參數
      /Missing parameter/    // 錯誤訊息
    ];

    return !problemPatterns.some(pattern => pattern.test(route));
  } catch (error) {
    console.log(`❌ 路由驗證失敗: ${route}`, error);
    return false;
  }
};
