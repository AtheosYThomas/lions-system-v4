import fs from 'fs';
import path from 'path';
import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

// 確保 logs 目錄存在
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const LOG_PATH = path.join(logsDir, 'diagnostic.log');

function log(message: string) {
  const timestamp = new Date().toISOString();
  const fullMessage = `[${timestamp}] ${message}`;
  console.log(fullMessage);
  fs.appendFileSync(LOG_PATH, fullMessage + '\n');
}

export async function runDiagnostics() {
  log('🔍 啟動 V4.0 系統診斷...');

  // Check startup file
  const indexExists = fs.existsSync(path.join('src', 'index.ts'));
  log(`✅ 啟動點檢查：${indexExists ? 'index.ts ✔' : '❌ index.ts 不存在'}`);

  // Check middleware
  const roleMiddlewareExists = fs.existsSync(
    path.join('src', 'middleware', 'roleMiddleware.ts')
  );
  const authMiddlewareExists = fs.existsSync(
    path.join('src', 'middleware', 'authMiddleware.ts')
  );
  log(
    `✅ Middleware：${roleMiddlewareExists ? 'roleMiddleware ✔' : '❌ roleMiddleware 缺少'} | ${authMiddlewareExists ? 'authMiddleware ✔' : '❌ authMiddleware 缺少'}`
  );

  // Check models
  const modelsPath = path.join('src', 'models');
  const requiredModels = [
    'member',
    'event',
    'registration',
    'announcement',
    'checkin',
  ];
  requiredModels.forEach(model => {
    const modelFile = fs.existsSync(path.join(modelsPath, `${model}.ts`));
    log(`✅ 模型檢查：${model} ${modelFile ? '✔' : '❌ 缺少'}`);
  });

  // Check webhook
  const routesPath = path.join('src', 'routes');
  const webhookExists = fs.existsSync(
    path.join(routesPath, 'line', 'webhook.ts')
  );
  log(
    `✅ Webhook 路由檢查：${webhookExists ? '✔ 存在' : '❌ webhook.ts 不存在'}`
  );

  // Check LIFF html
  const liffHtmlExists = fs.existsSync(path.join('public', 'liff.html'));
  log(
    `✅ LIFF 前端檢查：${liffHtmlExists ? '✔ 存在' : '❌ liff.html 不存在'}`
  );

  // Check env variables
  const envVars = [
    'LINE_CHANNEL_SECRET',
    'LIFF_ID',
    'DATABASE_URL',
    'LINE_CHANNEL_ACCESS_TOKEN',
  ];
  envVars.forEach(key => {
    const isSet = !!process.env[key];
    log(`✅ .env 設定：${key} ${isSet ? '✔' : '❌ 未設定'}`);
  });

  // DB Connection Test
  try {
    const sequelize = new Sequelize(process.env.DATABASE_URL!, {
      logging: false,
    });
    await sequelize.authenticate();
    log(`✅ 資料庫連線測試：✔ 成功`);
    await sequelize.close();
  } catch (error) {
    log(`❌ 資料庫連線測試失敗：${(error as Error).message}`);
  }

  log('✅ 診斷結束\n');
}
