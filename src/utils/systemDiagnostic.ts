
import { healthCheck } from './healthCheck';
import sequelize from '../config/database';

export const runSystemDiagnostic = async () => {
  console.log('🔍 開始系統診斷...\n');
  
  // 1. 健康檢查
  console.log('📊 執行健康檢查...');
  const health = await healthCheck();
  console.log('健康狀態:', health.status);
  console.log('資料庫:', health.checks.database.status, health.checks.database.message);
  console.log('環境變數:', health.checks.environment.status);
  if (health.checks.environment.missing.length > 0) {
    console.log('缺少變數:', health.checks.environment.missing);
  }
  console.log('資料模型:', health.checks.models.status, health.checks.models.message);
  console.log('');

  // 2. 檢查路由是否正常載入
  console.log('🛣️  檢查路由模組...');
  try {
    require('../routes/members');
    console.log('✅ 會員路由載入正常');
  } catch (error) {
    console.log('❌ 會員路由載入失敗:', error);
  }

  try {
    require('../routes/checkin');
    console.log('✅ 簽到路由載入正常');
  } catch (error) {
    console.log('❌ 簽到路由載入失敗:', error);
  }

  try {
    require('../routes/admin');
    console.log('✅ 管理路由載入正常');
  } catch (error) {
    console.log('❌ 管理路由載入失敗:', error);
  }
  console.log('');

  // 3. 檢查資料表結構
  console.log('🗄️  檢查資料表結構...');
  try {
    const tables = await sequelize.getQueryInterface().showAllTables();
    console.log('現有資料表:', tables);
    
    for (const table of tables) {
      const columns = await sequelize.getQueryInterface().describeTable(table);
      console.log(`📋 ${table} 欄位:`, Object.keys(columns).join(', '));
    }
  } catch (error) {
    console.log('❌ 資料表檢查失敗:', error);
  }

  console.log('\n🎯 診斷完成！');
};
