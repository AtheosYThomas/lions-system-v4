
// 載入所有 Sequelize 模型
import Member from './models/member';
import Event from './models/event';
import Registration from './models/registration';
import Payment from './models/payment';
import Checkin from './models/checkin';

import express from 'express';
import bodyParser from 'body-parser';
import memberRoutes from './routes/members';
import webhookRoutes from './line/webhook';
import pushRoutes from './line/push';
import { sequelize } from './config/database';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

const app = express();
app.use(bodyParser.json());
// Health check 端點
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    database: 'connected',
    services: {
      sequelize: 'active',
      express: 'running'
    }
  });
});

app.use('/api', memberRoutes);
app.use('/line', pushRoutes);
app.use('/line', webhookRoutes);

// 錯誤處理 middleware（必須放在所有路由之後）
app.use(notFoundHandler);
app.use(errorHandler);

sequelize.sync().then(() => {
  console.log('Database synced');
  app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
  });
});
