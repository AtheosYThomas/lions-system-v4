
import sequelize from '../config/database';
import { Member, Event, Registration, Checkin } from '../models';

export const performSystemCheck = async () => {
  const report = {
    timestamp: new Date().toISOString(),
    database: { status: 'unknown', error: null as string | null },
    models: { status: 'unknown', tables: [] as string[], error: null as string | null },
    environment: { 
      status: 'unknown', 
      missing: [] as string[],
      configured: [] as string[]
    }
  };

  // 1. 檢查資料庫連線
  try {
    await sequelize.authenticate();
    report.database.status = 'connected';
    console.log('✅ 資料庫連線正常');
  } catch (error) {
    report.database.status = 'failed';
    report.database.error = error instanceof Error ? error.message : '未知錯誤';
    console.error('❌ 資料庫連線失敗:', error);
  }

  // 2. 檢查資料表
  try {
    const tables = await sequelize.getQueryInterface().showAllTables();
    report.models.tables = tables;
    report.models.status = 'success';
    console.log('📋 現有資料表:', tables);
  } catch (error) {
    report.models.status = 'failed';
    report.models.error = error instanceof Error ? error.message : '未知錯誤';
  }

  // 3. 檢查環境變數
  const requiredEnvVars = [
    'LINE_CHANNEL_ACCESS_TOKEN',
    'LINE_CHANNEL_SECRET', 
    'DATABASE_URL',
    'PORT'
  ];

  requiredEnvVars.forEach(envVar => {
    if (process.env[envVar]) {
      report.environment.configured.push(envVar);
    } else {
      report.environment.missing.push(envVar);
    }
  });

  report.environment.status = report.environment.missing.length === 0 ? 'complete' : 'incomplete';

  // 4. 輸出報告
  console.log('\n📊 === 系統診斷報告 ===');
  console.log(`📅 時間: ${report.timestamp}`);
  console.log(`🗄️  資料庫: ${report.database.status}`);
  console.log(`📋 資料表: ${report.models.status} (${report.models.tables.length} 個表格)`);
  console.log(`🔧 環境變數: ${report.environment.status} (${report.environment.configured.length}/${requiredEnvVars.length})`);
  
  if (report.environment.missing.length > 0) {
    console.log(`❌ 缺少環境變數: ${report.environment.missing.join(', ')}`);
  }

  return report;
};
