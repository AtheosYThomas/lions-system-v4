
import envFix from './env-fix';
import { healthCheck } from './utils/healthCheck';
import sequelize from './config/database';

const quickFix = async () => {
  console.log('🚀 快速系統診斷和修復...\n');

  // 1. 環境變數修復
  console.log('🔧 Step 1: 修復環境變數');
  envFix();

  // 2. 資料庫連線檢查
  console.log('\n🗄️ Step 2: 檢查資料庫連線');
  try {
    await sequelize.authenticate();
    console.log('✅ 資料庫連線正常');
  } catch (error) {
    console.log('❌ 資料庫連線失敗，嘗試重新同步...');
    try {
      await sequelize.sync();
      console.log('✅ 資料庫重新同步成功');
    } catch (syncError) {
      console.log('❌ 資料庫同步失敗:', syncError);
    }
  }

  // 3. 健康檢查
  console.log('\n🏥 Step 3: 健康檢查');
  try {
    const health = await healthCheck();
    console.log(`系統狀態: ${health.status}`);
    
    if (health.status === 'healthy') {
      console.log('🎉 系統狀態良好，可以啟動！');
    } else {
      console.log('⚠️ 系統仍有問題，請檢查詳細診斷');
    }
  } catch (error) {
    console.log('❌ 健康檢查失敗:', error);
  }

  console.log('\n🎯 快速修復完成！');
};

export default quickFix;

// 如果直接執行此檔案
if (require.main === module) {
  quickFix().then(() => {
    process.exit(0);
  }).catch((error) => {
    console.error('❌ 快速修復過程發生錯誤:', error);
    process.exit(1);
  });
}
