import express from 'express';
import path from 'path';
import { config } from './config/config';
import sequelize from './config/database';
import './models/index'; // 載入模型關聯
import adminRoutes from './routes/admin';
import memberRoutes from './routes/members';
import checkinRoutes from './routes/checkin';
import liffRoutes from './routes/liff';
import { validateEnvironment } from './utils/envValidation';
import announcementRoutes from './routes/announcements';
import lineWebhook from './routes/line/webhook';

const app = express();
const PORT: number = parseInt(process.env.PORT || '5000', 10);

// 中介軟體
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS 支援
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

app.use(express.static(path.join(__dirname, '../client/dist')));

// Health Check 路由
app.get('/health', async (req, res) => {
  try {
    // 測試資料庫連線
    await sequelize.authenticate();
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '4.0',
      uptime: process.uptime(),
      database: 'connected',
      services: {
        line: config.line.accessToken ? 'configured' : 'missing_token',
        routes: ['admin', 'checkin', 'members', 'webhook']
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      database: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error'
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

// LINE Webhook 路由已移至模組化結構

// 靜態檔案服務（需要在其他路由之前）
app.use('/public', express.static(path.join(__dirname, '../public')));

// API 路由
app.use('/api/admin', adminRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/checkin', checkinRoutes);
app.use('/api/liff', liffRoutes);
app.use('/api/announcements', announcementRoutes);

// LINE Webhook 路由
app.use('/webhook', lineWebhook);

// 前端路由（提供 React 應用）
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

// 其他靜態路由 - 支援 SPA 路由
app.get(['/admin', '/register', '/checkin', '/profile'], (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

// 錯誤處理
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('❌ Server Error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

// 處理未捕獲的異常
process.on('uncaughtException', (err) => {
  console.error('🔥 Uncaught Exception:', err);
  console.error('Stack trace:', err.stack);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('🔥 Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// 記憶體監控
const logMemoryUsage = () => {
  const usage = process.memoryUsage();
  console.log('📊 Memory Usage:', {
    rss: `${Math.round(usage.rss / 1024 / 1024)}MB`,
    heapTotal: `${Math.round(usage.heapTotal / 1024 / 1024)}MB`,
    heapUsed: `${Math.round(usage.heapUsed / 1024 / 1024)}MB`,
    external: `${Math.round(usage.external / 1024 / 1024)}MB`
  });
};

// 啟動伺服器
const startServer = async () => {
  try {
    // 快速環境變數檢查
    if (!validateEnvironment()) {
      console.error('❌ 環境變數驗證失敗');
      process.exit(1);
    }

    // 簡化資料庫連線檢查
    await sequelize.authenticate();
    console.log('✅ 資料庫連線成功！');

    // 延遲啟動記憶體監控（減少啟動時間）
    setTimeout(() => {
      logMemoryUsage();
      setInterval(logMemoryUsage, 300000); // 改為每5分鐘記錄一次
    }, 30000); // 啟動30秒後再開始監控

    // 移除重複定義，使用檔案開頭的 health check 路由

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 伺服器啟動成功！埠號: ${PORT}`);
      console.log(`📍 Health Check: http://0.0.0.0:${PORT}/health`);
      console.log(`📱 LINE Webhook: http://0.0.0.0:${PORT}/webhook`);
      console.log(`🌐 前端頁面: http://0.0.0.0:${PORT}`);
    });
  } catch (error) {
    console.error('❌ 伺服器啟動失敗:', error);
    await sequelize.close();
    process.exit(1);
  }
};

startServer();