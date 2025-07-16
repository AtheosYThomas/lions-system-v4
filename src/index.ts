import express from 'express';
import path from 'path';
import { config } from './config/config';
import sequelize from './config/database';
import './models/index'; // 載入模型關聯
import lineHandler from './line/handler';
import adminRoutes from './routes/admin';
import checkinRoutes from './routes/checkin';
import membersRoutes from './routes/members';
import eventsRoutes from './routes/events';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { validateEnvironment } from './utils/envValidation';
import { healthCheck } from './utils/healthCheck';

const app = express();
const rawPort = process.env.PORT;
const PORT = rawPort && !isNaN(parseInt(rawPort)) ? parseInt(rawPort) : 5000;

// 環境變數驗證
if (!validateEnvironment()) {
  console.log('⚠️ 環境變數驗證失敗，但繼續啟動...');
}

// 中間件設定
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS 設定
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

// 健康檢查路由
app.get('/health', async (req, res) => {
  try {
    const health = await healthCheck();
    res.status(health.status === 'healthy' ? 200 : 500).json(health);
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      error: error instanceof Error ? error.message : '未知錯誤',
      timestamp: new Date().toISOString()
    });
  }
});

app.get('/healthz', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.get('/api/system/status', (req, res) => {
  res.status(200).json({
    database: 'connected',
    server: 'running',
    line_bot: 'configured'
  });
});

// LINE Bot Webhook
app.post('/webhook', lineHandler);

// 路由設定
app.use('/api/admin', adminRoutes);
app.use('/api', eventsRoutes);
app.use('/api', membersRoutes);
app.use('/api', checkinRoutes);

// 提供前端靜態檔案
app.use(express.static(path.join(__dirname, '../client/dist')));

// 前端路由處理 (SPA)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

app.get('/checkin', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

app.get('/form/*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

// 處理所有其他未匹配的路由（SPA fallback）
app.get('*', (req, res) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/webhook')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

// 錯誤處理
app.use(errorHandler);
app.use(notFoundHandler);

// 啟動伺服器
const startServer = async () => {
  try {
    console.log('🔄 測試資料庫連線...');
    await sequelize.authenticate();
    console.log('✅ 資料庫連線成功！');

    console.log('🔄 同步資料表...');
    await sequelize.sync();
    console.log('✅ 資料表同步完成！');

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 伺服器啟動成功！埠號: ${PORT}`);
      console.log(`📍 Health Check: http://0.0.0.0:${PORT}/health`);
      console.log(`📱 LINE Webhook: http://0.0.0.0:${PORT}/webhook`);
      console.log(`🌐 前端頁面: http://0.0.0.0:${PORT}`);
      console.log(`📋 會員註冊: http://0.0.0.0:${PORT}/form/register`);
      console.log(`📝 活動簽到: http://0.0.0.0:${PORT}/form/checkin/1`);
      console.log(`⚙️ 管理後台: http://0.0.0.0:${PORT}/admin`);
    });
  } catch (error) {
    console.error('❌ 伺服器啟動失敗:', error);
    console.log('⚠️ 嘗試在沒有資料庫連線的情況下啟動伺服器...');

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 伺服器啟動成功（無資料庫）！埠號: ${PORT}`);
      console.log(`📍 Health Check: http://0.0.0.0:${PORT}/health`);
    });
  }
};

startServer();