import express from 'express';
import path from 'path';
import { config } from './config/config';
import sequelize from './config/database';
import './models/index'; // 載入模型關聯
import lineHandler from './line/handler';
import adminRoutes from './routes/admin';
import memberRoutes from './routes/members';
import checkinRoutes from './routes/checkin';
import liffRoutes from './routes/liff';
import { validateEnvironment } from './utils/envValidation';
import announcementRoutes from './routes/announcements';
import cors from 'cors'; // 引入 cors
import { timeoutMiddleware } from './middleware/timeout';

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

// LINE Webhook - 加強錯誤處理
app.post('/webhook', async (req, res) => {
  try {
    console.log('📨 收到 LINE webhook 請求');
    console.log('📦 Request headers:', req.headers);
    console.log('📦 Request body:', JSON.stringify(req.body, null, 2));

    await lineHandler(req, res);
  } catch (error) {
    console.error('🔥 Webhook 處理錯誤:', error);
    // 確保回傳 200 狀態碼給 LINE
    if (!res.headersSent) {
      res.status(200).json({ status: 'ok' });
    }
  }
});

// 靜態檔案服務（需要在其他路由之前）
app.use('/public', express.static(path.join(__dirname, '../public')));

// 添加 API 路由調試（必須在路由註冊之前）
app.use('/api*', (req, res, next) => {
  console.log(`🔍 API 請求: ${req.method} ${req.originalUrl}`);
  next();
});

// API 路由 - 確保正確處理 /api 前綴
app.use('/api/admin', timeoutMiddleware(8000), adminRoutes);
app.use('/api/members', timeoutMiddleware(8000), memberRoutes);
app.use('/api/checkin', timeoutMiddleware(8000), checkinRoutes);
app.use('/api/liff', timeoutMiddleware(8000), liffRoutes);
app.use('/api/announcements', timeoutMiddleware(8000), announcementRoutes);

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
    console.log('🔍 驗證環境變數...');
    if (!validateEnvironment()) {
      console.error('❌ 環境變數驗證失敗');
      process.exit(1);
    }

    console.log('🔄 測試資料庫連線...');
    await sequelize.authenticate();
    console.log('✅ 資料庫連線成功！');

    // 記憶體監控
    logMemoryUsage();
    setInterval(logMemoryUsage, 60000); // 每分鐘記錄一次

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