
// 載入所有 Sequelize 模型
import Member from './models/member';
import Event from './models/event';
import Registration from './models/registration';
import Payment from './models/payment';
import Checkin from './models/checkin';
import MessageLog from './models/messageLog';

import express from 'express';
import bodyParser from 'body-parser';
import memberRoutes from './routes/members';
import webhookRoutes from './line/webhook';
import pushRoutes from './line/push';
import { sequelize } from './config/database';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

// 檢查必要的環境變數
const requiredEnvVars = ['DATABASE_URL', 'LINE_CHANNEL_ACCESS_TOKEN', 'LINE_CHANNEL_SECRET'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.warn('⚠️  Missing environment variables:', missingEnvVars.join(', '));
}

const app = express();
app.use(bodyParser.json());
// Health check 端點
app.get('/health', async (req, res) => {
  try {
    // 測試資料庫連線
    await sequelize.authenticate();
    
    res.json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      database: 'connected',
      services: {
        sequelize: 'active',
        express: 'running'
      },
      models: {
        member: 'synced',
        event: 'synced',
        registration: 'synced',
        payment: 'synced',
        checkin: 'synced',
        messageLog: 'synced'
      }
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: errorMessage
    });
  }
});

app.use('/api', memberRoutes);
app.use('/line', pushRoutes);
app.use('/line', webhookRoutes);

// 錯誤處理 middleware（必須放在所有路由之後）
app.use(notFoundHandler);
app.use(errorHandler);

sequelize.sync().then(() => {
  console.log('Database synced');
  app.listen(3000, '0.0.0.0', () => {
    console.log('Server running on http://0.0.0.0:3000');
  });
});
