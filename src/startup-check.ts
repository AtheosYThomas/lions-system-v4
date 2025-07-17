
import sequelize from './config/database';
import { getEnvironmentStatus } from './utils/envValidation';

const startupCheck = async () => {
  console.log('🔍 系統啟動檢查...\n');
  
  // 檢查環境變數
  console.log('📋 環境變數狀態:');
  const envStatus = getEnvironmentStatus();
  Object.entries(envStatus).forEach(([key, value]) => {
    console.log(`  ${key}: ${value ? '✅' : '❌'}`);
  });
  console.log('');

  // 測試資料庫連線（可選）
  if (process.env.DATABASE_URL) {
    try {
      console.log('🔄 測試資料庫連線...');
      await sequelize.authenticate();
      console.log('✅ 資料庫連線成功');
    } catch (error) {
      console.log('❌ 資料庫連線失敗:', error instanceof Error ? error.message : '未知錯誤');
    }
    await sequelize.close();
  } else {
    console.log('⚠️ 未設定 DATABASE_URL，跳過資料庫檢查');
  }

  console.log('\n🚀 準備啟動伺服器...');
};

if (require.main === module) {
  startupCheck();
}

export default startupCheck;
import sequelize from './config/database';

const checkDatabaseConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ 資料庫連線成功');
  } catch (error: any) {
    console.error('❌ 資料庫連線失敗:', error.message);
    process.exit(1);
  }
};

checkDatabaseConnection();
