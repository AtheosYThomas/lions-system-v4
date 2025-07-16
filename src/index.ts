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
const PORT: number = parseInt(process.env.PORT || '5000', 10);

// 中介軟體
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../client/dist')));

// 健康檢查路由
app.get('/health', async (req, res) => {
  try {
    const report = await healthCheck();
    res.status(report.status === 'healthy' ? 200 : 503).json(report);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: '健康檢查失敗',
      error: error instanceof Error ? error.message : '未知錯誤'
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

// LINE Webhook
app.post('/webhook', lineHandler);

// 路由設定
app.use('/api/admin', adminRoutes);
app.use('/api', checkinRoutes);
app.use('/api', membersRoutes);
app.use('/api', eventsRoutes);

// 前端路由（提供 React 應用）
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

// 所有前端路由都導向 React 應用
app.get(['/register', '/checkin', '/admin', '/form/*'], (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

// 處理所有其他未匹配的路由（SPA fallback）
app.get('*', (req, res) => {
  // 如果請求是 API 路由，返回 404
  if (req.path.startsWith('/api/')) {
    res.status(404).json({ error: 'API endpoint not found' });
    return;
  }
  // 否則返回前端應用
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

// 錯誤處理
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('❌ Server Error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

// 啟動伺服器
const startServer = async () => {
  try {
    console.log('🔄 測試資料庫連線...');
    await sequelize.authenticate();
    console.log('✅ 資料庫連線成功！');

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 伺服器啟動成功！埠號: ${PORT}`);
      console.log(`📍 Health Check: https://27c8d8g6-5000.asse.devtunnels.ms/health`);
      console.log(`📱 LINE Webhook: https://27c8d8g6-5000.asse.devtunnels.ms/webhook`);
      console.log(`🌐 前端頁面: https://27c8d8g6-5000.asse.devtunnels.ms`);
      console.log(`📋 會員註冊: https://27c8d8g6-5000.asse.devtunnels.ms/form/register`);
      console.log(`📝 活動簽到: https://27c8d8g6-5000.asse.devtunnels.ms/form/checkin/1`);
      console.log(`⚙️  管理後台: https://27c8d8g6-5000.asse.devtunnels.ms/admin`);
    });
  } catch (error) {
    console.error('❌ 伺服器啟動失敗:', error);
    process.exit(1);
  }
};

startServer();