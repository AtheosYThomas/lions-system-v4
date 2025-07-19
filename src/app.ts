import express from 'express';
import path from 'path';
import sequelize from './config/database';
import './models/index'; // 載入模型關聯
import adminRoutes from './routes/admin';
import memberRoutes from './routes/api/members';
import checkinRoutes from './routes/api/checkin';
import liffRoutes from './routes/api/liff';
import announcementRoutes from './routes/api/announcements';
import lineWebhook from './routes/line/webhook';
import uploadRouter from './routes/upload';

const app = express();

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

// React 前端靜態文件服務
app.use(express.static(path.join(__dirname, '../client/dist')));

// Health Check 路由
app.get('/health', async (req, res) => {
  try {
    await sequelize.authenticate();
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '4.0',
      uptime: process.uptime(),
      database: 'connected',
      services: {
        line: process.env.LINE_CHANNEL_ACCESS_TOKEN ? 'configured' : 'missing_token',
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

// LINE Webhook 路由（優先處理）
app.use('/webhook', lineWebhook);

// API 路由
app.use('/api/admin', adminRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/checkin', checkinRoutes);
app.use('/api/liff', liffRoutes);
app.use('/api/upload', uploadRouter);

// 前端路由（提供 React 應用）
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

// 其他靜態路由 - 支援 SPA 路由
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

app.get('/checkin', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

app.get('/profile', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

app.get('/liff', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

app.get('/home', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

// SPA 路由支援 - 所有非 API 路由都返回 React 應用
app.get('*', (req, res) => {
  // 排除 API 路由
  if (req.path.startsWith('/api/') || req.path.startsWith('/webhook')) {
    return res.status(404).json({ error: 'API route not found' });
  }

  // 返回 React 應用的 index.html
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

// API 404 處理
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API route not found' });
});

// 錯誤處理
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('❌ Server Error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

export default app;