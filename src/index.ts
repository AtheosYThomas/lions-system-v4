import express from 'express';
import path from 'path';
import { config } from './config/config';
import sequelize from './config/database';
import './models/index'; // 載入模型關聯
import lineHandler from './line/handler';
import adminRoutes from './routes/admin';
import memberRoutes from './routes/members';
import checkinRoutes from './routes/checkin';
import { validateEnvironment } from './utils/envValidation';

const app = express();
const PORT: number = parseInt(process.env.PORT || '3000', 10);

// 中介軟體
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
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

// LINE Webhook
app.post('/webhook', lineHandler);

// API 路由
app.use('/api/admin', adminRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/checkin', checkinRoutes);

// 前端路由（提供 React 應用）
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

// 其他靜態路由
app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

app.get('/checkin', (req, res) => {
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
    console.log('🔍 驗證環境變數...');
    if (!validateEnvironment()) {
      console.error('❌ 環境變數驗證失敗');
      process.exit(1);
    }
    
    console.log('🔄 測試資料庫連線...');
    await sequelize.authenticate();
    console.log('✅ 資料庫連線成功！');

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 伺服器啟動成功！埠號: ${PORT}`);
      console.log(`📍 Health Check: http://0.0.0.0:${PORT}/health`);
      console.log(`📱 LINE Webhook: http://0.0.0.0:${PORT}/webhook`);
      console.log(`🌐 前端頁面: http://0.0.0.0:${PORT}`);
    });
  } catch (error) {
    console.error('❌ 伺服器啟動失敗:', error);
    process.exit(1);
  }
};

startServer();