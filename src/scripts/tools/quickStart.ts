
import express from 'express';
import path from 'path';
import { config } from '../config/config';
import sequelize from '../config/database';
import '../models/index';
import adminRoutes from '../routes/admin';
import memberRoutes from '../routes/api/members';
import checkinRoutes from '../routes/api/checkin';
import liffRoutes from '../routes/api/liff';
import announcementRoutes from '../routes/api/announcements';
import lineWebhook from '../routes/line/webhook';

const app = express();
const PORT: number = parseInt(process.env.PORT || '5000', 10);

// 基本中介軟體
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 簡化的 CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// 快速健康檢查
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 路由設定
app.use('/api/admin', adminRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/checkin', checkinRoutes);
app.use('/api/liff', liffRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/webhook', lineWebhook);

// 靜態檔案
app.use(express.static(path.join(__dirname, '../../client/dist')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../client/dist/index.html'));
});

// 快速啟動
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 快速啟動成功！埠號: ${PORT}`);
  console.log(`📍 Health Check: http://0.0.0.0:${PORT}/health`);
});
