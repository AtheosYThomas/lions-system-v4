
import sequelize from '../config/database';
import { config } from '../config/config';

export const healthCheck = async () => {
  const report = {
    timestamp: new Date().toISOString(),
    status: 'healthy' as 'healthy' | 'unhealthy',
    checks: {
      database: { status: 'unknown', message: '' },
      environment: { status: 'unknown', missing: [] as string[] },
      models: { status: 'unknown', message: '' }
    }
  };

  try {
    // 檢查資料庫連線
    await sequelize.authenticate();
    report.checks.database.status = 'ok';
    report.checks.database.message = '資料庫連線正常';
  } catch (error) {
    report.checks.database.status = 'error';
    report.checks.database.message = `資料庫連線失敗: ${error}`;
    report.status = 'unhealthy';
  }

  // 檢查環境變數
  const requiredVars = ['LINE_CHANNEL_ACCESS_TOKEN', 'LINE_CHANNEL_SECRET', 'DATABASE_URL'];
  const missing = requiredVars.filter(v => !process.env[v]);
  
  if (missing.length > 0) {
    report.checks.environment.status = 'error';
    report.checks.environment.missing = missing;
    report.status = 'unhealthy';
  } else {
    report.checks.environment.status = 'ok';
  }

  // 檢查模型
  try {
    const tables = await sequelize.getQueryInterface().showAllTables();
    report.checks.models.status = 'ok';
    report.checks.models.message = `找到 ${tables.length} 個資料表`;
  } catch (error) {
    report.checks.models.status = 'error';
    report.checks.models.message = `模型檢查失敗: ${error}`;
    report.status = 'unhealthy';
  }

  return report;
};
