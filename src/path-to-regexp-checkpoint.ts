
// path-to-regexp 錯誤 checkpoint 追蹤工具
console.log('🔍 開始 path-to-regexp 錯誤 checkpoint 檢查...');

interface CheckpointResult {
  checkpoint: string;
  timestamp: string;
  status: 'pass' | 'fail' | 'warning';
  details: string[];
  environmentSnapshot: Record<string, any>;
}

const checkpoints: CheckpointResult[] = [];

// Checkpoint 1: 初始環境狀態
const checkpoint1 = (): CheckpointResult => {
  console.log('📍 Checkpoint 1: 初始環境狀態檢查');
  
  const dangerousVars: string[] = [];
  const details: string[] = [];
  let warningCount = 0;
  
  // 擴展的危險模式檢查
  const dangerousPatterns = [
    { pattern: /\$\{[^}]*\}/, name: '模板字串' },
    { pattern: /Missing parameter/, name: '錯誤訊息殘留' },
    { pattern: /:[\w]*\(\*\)/, name: '非法路由參數' },
    { pattern: /^undefined$/i, name: '未定義值' },
    { pattern: /^null$/i, name: '空值' }
  ];
  
  Object.entries(process.env).forEach(([key, value]) => {
    if (value && typeof value === 'string') {
      // 檢查危險模式
      dangerousPatterns.forEach(({ pattern, name }) => {
        if (pattern.test(value)) {
          dangerousVars.push(`${key}=${value}`);
          details.push(`🚨 ${name}: ${key}=${value}`);
        }
      });
      
      // 檢查可疑的開發變數
      if (key.includes('DEBUG_URL') || key.includes('WEBPACK') || key.includes('HMR') || 
          key.includes('VITE_DEV') || key.includes('BASE_URL')) {
        if (value.includes('${') || value.includes('Missing') || value === 'undefined') {
          dangerousVars.push(`${key}=${value}`);
          details.push(`🚨 問題開發變數: ${key}=${value}`);
        } else {
          details.push(`📝 開發相關變數: ${key}=${value}`);
          warningCount++;
        }
      }
    }
  });
  
  // 檢查必要環境變數
  const requiredVars = ['NODE_ENV', 'PORT'];
  requiredVars.forEach(varName => {
    const value = process.env[varName];
    if (!value || value === 'undefined' || value.includes('${')) {
      details.push(`❌ 缺少或無效的必要變數: ${varName}=${value || 'undefined'}`);
      dangerousVars.push(`${varName}=${value || 'undefined'}`);
    } else {
      details.push(`✅ 必要變數正常: ${varName}=${value}`);
    }
  });
  
  const status = dangerousVars.length === 0 ? 'pass' : 
                warningCount > 0 && dangerousVars.length < 3 ? 'warning' : 'fail';
  
  return {
    checkpoint: 'initial_env',
    timestamp: new Date().toISOString(),
    status,
    details,
    environmentSnapshot: {
      totalVars: Object.keys(process.env).length,
      dangerousVars: dangerousVars.length,
      warningVars: warningCount,
      nodeEnv: process.env.NODE_ENV,
      port: process.env.PORT
    }
  };
};

// Checkpoint 2: Express 模組載入前
const checkpoint2 = (): CheckpointResult => {
  console.log('📍 Checkpoint 2: Express 模組載入前檢查');
  
  const details: string[] = [];
  let status: 'pass' | 'fail' | 'warning' = 'pass';
  
  try {
    // 檢查 path-to-regexp 是否可以正常載入
    const pathToRegexp = require('path-to-regexp');
    details.push('✅ path-to-regexp 模組載入成功');
    
    // 測試基本功能
    const regexp = pathToRegexp.pathToRegexp('/test/:id');
    details.push('✅ path-to-regexp 基本功能測試通過');
    
  } catch (error) {
    status = 'fail';
    details.push(`❌ path-to-regexp 載入失敗: ${error}`);
  }
  
  try {
    // 檢查 Express 是否可以正常載入
    const express = require('express');
    details.push('✅ Express 模組載入成功');
  } catch (error) {
    status = 'fail';
    details.push(`❌ Express 載入失敗: ${error}`);
  }
  
  return {
    checkpoint: 'module_loading',
    timestamp: new Date().toISOString(),
    status,
    details,
    environmentSnapshot: {
      nodeVersion: process.version,
      platform: process.platform
    }
  };
};

// Checkpoint 3: 路由檔案檢查
const checkpoint3 = (): CheckpointResult => {
  console.log('📍 Checkpoint 3: 路由檔案安全檢查');
  
  const details: string[] = [];
  let status: 'pass' | 'fail' | 'warning' = 'pass';
  
  const routeFiles = [
    'src/routes/admin.ts',
    'src/routes/members.ts', 
    'src/routes/events.ts',
    'src/routes/checkin.ts'
  ];
  
  routeFiles.forEach(filePath => {
    try {
      const fs = require('fs');
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        
        // 檢查危險模式
        if (content.includes('${')) {
          status = 'warning';
          details.push(`⚠️ ${filePath} 包含模板字串`);
        }
        if (content.includes(':param(*)')) {
          status = 'fail';
          details.push(`🚨 ${filePath} 包含非法路由參數格式`);
        }
        
        details.push(`✅ ${filePath} 檢查完成`);
      } else {
        status = 'warning';
        details.push(`⚠️ ${filePath} 檔案不存在`);
      }
    } catch (error) {
      status = 'fail';
      details.push(`❌ ${filePath} 檢查失敗: ${error}`);
    }
  });
  
  return {
    checkpoint: 'route_files',
    timestamp: new Date().toISOString(),
    status,
    details,
    environmentSnapshot: {}
  };
};

// Checkpoint 4: Express 應用程式建立
const checkpoint4 = (): CheckpointResult => {
  console.log('📍 Checkpoint 4: Express 應用程式建立測試');
  
  const details: string[] = [];
  let status: 'pass' | 'fail' | 'warning' = 'pass';
  
  try {
    const express = require('express');
    const app = express();
    
    // 測試基本路由建立
    app.get('/test', (req: any, res: any) => {
      res.send('test');
    });
    
    details.push('✅ Express 應用程式建立成功');
    details.push('✅ 基本路由註冊成功');
    
    // 測試路由器建立
    const router = express.Router();
    router.get('/router-test', (req: any, res: any) => {
      res.send('router test');
    });
    app.use('/api', router);
    
    details.push('✅ Express Router 建立成功');
    
  } catch (error) {
    status = 'fail';
    details.push(`❌ Express 應用程式建立失敗: ${error}`);
    
    // 檢查是否為 path-to-regexp 相關錯誤
    if (error instanceof Error && error.message && error.message.includes('Missing parameter name')) {
      details.push('🚨 確認為 path-to-regexp 錯誤！');
      details.push(`錯誤詳情: ${error.message}`);
    }
  }
  
  return {
    checkpoint: 'express_app',
    timestamp: new Date().toISOString(),
    status,
    details,
    environmentSnapshot: {}
  };
};

// 執行所有 checkpoints
const runAllCheckpoints = async () => {
  console.log('🎯 開始執行所有 checkpoints...\n');
  
  checkpoints.push(checkpoint1());
  checkpoints.push(checkpoint2());
  checkpoints.push(checkpoint3());
  checkpoints.push(checkpoint4());
  
  // 生成報告
  console.log('\n📋 Checkpoint 檢查報告:');
  console.log('='.repeat(50));
  
  checkpoints.forEach((result, index) => {
    const statusIcon = result.status === 'pass' ? '✅' : 
                      result.status === 'warning' ? '⚠️' : '❌';
    
    console.log(`\n${index + 1}. ${statusIcon} ${result.checkpoint.toUpperCase()}`);
    console.log(`   時間: ${result.timestamp}`);
    console.log(`   狀態: ${result.status}`);
    
    if (result.details.length > 0) {
      console.log('   詳情:');
      result.details.forEach(detail => {
        console.log(`     ${detail}`);
      });
    }
  });
  
  // 統計結果
  const passedCount = checkpoints.filter(cp => cp.status === 'pass').length;
  const warningCount = checkpoints.filter(cp => cp.status === 'warning').length;
  const failedCount = checkpoints.filter(cp => cp.status === 'fail').length;
  
  console.log(`\n📊 Checkpoint 結果統計:`);
  console.log(`✅ 通過: ${passedCount}`);
  console.log(`⚠️ 警告: ${warningCount}`);
  console.log(`❌ 失敗: ${failedCount}`);
  
  // 找出第一個失敗的 checkpoint
  const firstFailure = checkpoints.find(cp => cp.status === 'fail');
  if (firstFailure) {
    console.log(`\n🚨 首次錯誤發生在: ${firstFailure.checkpoint}`);
    console.log(`⏰ 錯誤時間: ${firstFailure.timestamp}`);
    console.log(`📋 建議動作: 檢查環境變數或執行修復腳本`);
  } else if (failedCount === 0 && warningCount === 0) {
    console.log('\n🎉 所有 checkpoints 完全通過！');
    console.log('✅ Checkpoint 1 狀態: PASS');
  } else if (failedCount === 0) {
    console.log('\n✅ 所有關鍵 checkpoints 通過，僅有輕微警告');
    console.log('🟡 Checkpoint 1 狀態: PASS (有警告)');
  }
  
  // 保存詳細報告
  const fs = require('fs');
  const reportPath = 'path-to-regexp-checkpoint-report.json';
  fs.writeFileSync(reportPath, JSON.stringify({
    summary: {
      totalCheckpoints: checkpoints.length,
      passed: checkpoints.filter(cp => cp.status === 'pass').length,
      warnings: checkpoints.filter(cp => cp.status === 'warning').length,
      failed: checkpoints.filter(cp => cp.status === 'fail').length,
      firstFailure: firstFailure?.checkpoint || null
    },
    checkpoints
  }, null, 2));
  
  console.log(`\n💾 詳細報告已保存至: ${reportPath}`);
};

// 立即執行
runAllCheckpoints().catch(error => {
  console.error('🚨 Checkpoint 執行失敗:', error);
});
