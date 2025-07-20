import sequelize from '../../config/database';
import Member from '../../models/member';
import Event from '../../models/event';

export const runSystemHealthCheck = async () => {
  const results = {
    database: false,
    models: false,
    env: false,
    errors: [] as string[],
  };

  try {
    // 測試資料庫連線
    await sequelize.authenticate();
    results.database = true;
    console.log('✅ 資料庫連線正常');
  } catch (error) {
    results.errors.push(`資料庫連線失敗: ${error}`);
    console.error('❌ 資料庫連線失敗:', error);
  }

  try {
    // 測試模型查詢
    await Member.findOne();
    await Event.findOne();
    results.models = true;
    console.log('✅ 模型查詢正常');
  } catch (error) {
    results.errors.push(`模型查詢失敗: ${error}`);
    console.error('❌ 模型查詢失敗:', error);
  }

  // 檢查環境變數
  const requiredVars = [
    'LINE_CHANNEL_ACCESS_TOKEN',
    'LINE_CHANNEL_SECRET',
    'DATABASE_URL',
  ];
  const missingVars = requiredVars.filter(v => !process.env[v]);

  if (missingVars.length === 0) {
    results.env = true;
    console.log('✅ 環境變數完整');
  } else {
    results.errors.push(`缺少環境變數: ${missingVars.join(', ')}`);
    console.error('❌ 缺少環境變數:', missingVars);
  }

  return results;
};

// 執行健康檢查（如果直接運行此檔案）
if (require.main === module) {
  runSystemHealthCheck().then(results => {
    console.log('\n📊 系統健康檢查結果:');
    console.log(results);
    process.exit(results.errors.length > 0 ? 1 : 0);
  });
}
