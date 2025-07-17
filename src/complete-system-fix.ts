
import { runSystemDiagnostic } from './utils/systemDiagnostic';
import { healthCheck } from './utils/healthCheck';

const completeSystemFix = async () => {
  console.log('🔧 開始完整系統修復...\n');
  
  const report = {
    issues: [] as string[],
    fixes: [] as string[],
    recommendations: [] as string[]
  };
  
  try {
    // 1. 執行完整診斷
    console.log('📊 Step 1: 執行系統診斷');
    const diagnosticResult = await runSystemDiagnostic();
    
    // 2. 執行健康檢查
    console.log('\n🏥 Step 2: 執行健康檢查');
    const healthResult = await healthCheck();
    
    if (healthResult.status === 'unhealthy') {
      report.issues.push('系統健康檢查失敗');
      
      if (healthResult.checks.database.status === 'error') {
        report.issues.push(`資料庫問題: ${healthResult.checks.database.message}`);
        report.fixes.push('檢查 DATABASE_URL 環境變數');
        report.fixes.push('執行 npm run init-db');
      }
      
      if (healthResult.checks.environment.status === 'error') {
        report.issues.push(`環境變數問題: ${healthResult.checks.environment.missing.join(', ')}`);
        report.fixes.push('在 .env 檔案中設定缺少的環境變數');
      }
    }
    
    // 3. 檢查模型關聯
    console.log('\n📋 Step 3: 檢查模型關聯');
    try {
      const models = require('./models');
      console.log('✅ 模型載入成功');
      report.fixes.push('模型關聯正常');
    } catch (error) {
      report.issues.push(`模型關聯錯誤: ${error}`);
      report.fixes.push('修復模型關聯定義');
    }
    
    // 4. 生成修復建議
    if (report.issues.length === 0) {
      console.log('\n🎉 系統狀態良好，無需修復！');
    } else {
      console.log('\n📋 發現的問題:');
      report.issues.forEach((issue, index) => {
        console.log(`${index + 1}. ❌ ${issue}`);
      });
      
      console.log('\n🔧 建議的修復步驟:');
      report.fixes.forEach((fix, index) => {
        console.log(`${index + 1}. 🛠️ ${fix}`);
      });
    }
    
    // 5. 系統啟動建議
    console.log('\n🚀 系統啟動建議:');
    if (report.issues.length === 0) {
      console.log('✅ 可以安全啟動系統');
      console.log('💡 建議使用: 點擊 Run 按鈕或執行工作流程');
    } else {
      console.log('⚠️ 建議先修復問題再啟動系統');
      console.log('💡 修復後可執行: "安全啟動" 工作流程');
    }
    
  } catch (error) {
    console.error('❌ 系統修復過程發生錯誤:', error);
  }
  
  console.log('\n🎯 完整系統修復檢查完成');
};

completeSystemFix().catch(console.error);
