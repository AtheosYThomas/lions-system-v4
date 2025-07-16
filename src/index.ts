
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

const app = express();
app.use(bodyParser.json());
app.use('/api', memberRoutes);
app.use('/line', pushRoutes);
app.use('/line', webhookRoutes);

sequelize.sync().then(() => {
  console.log('Database synced');
  app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
  });
});
