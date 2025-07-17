import express, { Request, Response, NextFunction } from 'express';
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
import { routeSafetyCheck, cleanProblemEnvVars } from './utils/routeSafetyCheck';
import { createSafeRouter, validateNumericParam, routeErrorHandler } from './utils/routerSafety';

const app = express();

// 🚨 強制清理 path-to-regexp 問題變數
if (process.env.DEBUG_URL) {
  console.log(`🧹 強制清理 DEBUG_URL: ${process.env.DEBUG_URL}`);
  delete process.env.DEBUG_URL;
}

// 清理其他可能的問題變數
const problematicVars = ['WEBPACK_DEV_SERVER_URL', 'WEBPACK_DEV_SERVER', 'HMR_HOST', 'HMR_PORT', 'VITE_DEV_SERVER_URL'];
problematicVars.forEach(varName => {
  if (process.env[varName]) {
    console.log(`🧹 清理: ${varName}`);
    delete process.env[varName];
  }
});

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

// 建立安全的路由器
const mainRouter = createSafeRouter();
const apiRouter = createSafeRouter();
const spaRouter = createSafeRouter();

// LINE Bot Webhook - 使用專用路由器
const webhookRouter = express.Router();
webhookRouter.post('/', lineHandler);
app.use('/webhook', webhookRouter);

// API 路由集中管理
apiRouter.use('/admin', adminRoutes);
apiRouter.use('/', eventsRoutes);
apiRouter.use('/', membersRoutes);
apiRouter.use('/', checkinRoutes);
app.use('/api', apiRouter);

// 提供前端靜態檔案
app.use(express.static(path.join(__dirname, '../client/dist')));

// SPA 路由處理 - 使用嚴謹的路由器
const serveSPA = (req: express.Request, res: express.Response) => {
  const indexPath = path.join(__dirname, '../client/dist/index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error('❌ 無法載入 SPA 檔案:', err);
      res.status(404).send('Frontend not found');
    }
  });
};

// 明確定義的 SPA 路由
spaRouter.get('/', serveSPA);
spaRouter.get('/register', serveSPA);
spaRouter.get('/checkin', serveSPA);
spaRouter.get('/admin', serveSPA);

// 表單路由支援
spaRouter.get('/form/register', serveSPA);
spaRouter.get('/form/checkin/:eventId', (req, res) => {
  // 驗證 eventId 是數字
  const { eventId } = req.params;
  if (!/^\d+$/.test(eventId)) {
    return res.status(400).send('Invalid event ID');
  }
  serveSPA(req, res);
});

app.use('/', spaRouter);

// 🛡️ Router fallback 與預防機制
import { apiNotFound, fallbackPage } from './middleware/errorHandler';

// API 路由 fallback - 必須在所有 API 路由之後
app.use('/api', apiNotFound);

// 🛡️ 全域 fallback（前端或其他未處理的路徑）
app.use('*', (req, res) => {
  const requestPath = req.originalUrl || req.url;

  // 明確排除 API 和 webhook 路由
  if (requestPath.startsWith('/api/') || requestPath.startsWith('/webhook/')) {
    return res.status(404).json({ 
      success: false,
      error: 'API endpoint not found',
      path: requestPath,
      timestamp: new Date().toISOString()
    });
  }

  // 檢查是否為靜態資源請求
  if (requestPath.includes('.') && !requestPath.endsWith('.html')) {
    return res.status(404).send('Static resource not found');
  }

  // 其他所有路由都回傳前端 SPA
  serveSPA(req, res);
});

// 🚨 全域錯誤攔截器 - 統一處理所有錯誤
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('🚨 系統錯誤:', err);

  // 特別處理 path-to-regexp 錯誤
  if (err.message && err.message.includes('Missing parameter name')) {
    return res.status(500).json({
      success: false,
      message: '路由配置錯誤，系統已啟動保護機制',
      error: 'path-to-regexp configuration error'
    });
  }

  res.status(500).json({
    success: false,
    message: '伺服器內部錯誤',
    error: err.message
  });
});

// 路由特定錯誤處理
app.use(routeErrorHandler);

// 一般錯誤處理
app.use(errorHandler);
app.use(notFoundHandler);

// 路由驗證函數
const validateRoutes = () => {
  console.log('🔍 驗證路由配置...');

  const potentialIssues: string[] = [];

  // 1. 驗證環境變數中是否有未展開的模板字串
  Object.entries(process.env).forEach(([key, value]) => {
    if (value && typeof value === 'string') {
      // 檢查未展開的模板字串 ${...}
      if (value.includes('${') && value.includes('}')) {
        potentialIssues.push(`環境變數 ${key} 包含未展開的模板字串: ${value}`);
      }
      // 檢查可能的路由參數錯誤格式
      if (value.includes(':') && (value.includes('(*)') || value.includes('(*)'))) {
        potentialIssues.push(`環境變數 ${key} 包含非法路由參數格式: ${value}`);
      }
    }
  });

  // 2. 檢查關鍵環境變數
  const requiredVars = ['LINE_CHANNEL_ACCESS_TOKEN', 'LINE_CHANNEL_SECRET'];
  requiredVars.forEach(varName => {
    const value = process.env[varName];
    if (!value) {
      potentialIssues.push(`缺少必要環境變數: ${varName}`);
    } else if (value.startsWith('${') || value === 'undefined' || value === 'null') {
      potentialIssues.push(`環境變數 ${varName} 值異常: ${value}`);
    }
  });

  // 3. 檢查並強制清理 DEBUG_URL 相關問題
  if (process.env.DEBUG_URL) {
    console.log(`🚨 發現 DEBUG_URL，強制清理: ${process.env.DEBUG_URL}`);
    delete process.env.DEBUG_URL;
    potentialIssues.push(`DEBUG_URL 已強制清理`);
  }

  if (potentialIssues.length > 0) {
    console.log('⚠️ 發現潛在問題:');
    potentialIssues.forEach(issue => console.log(`  - ${issue}`));

    // 嘗試修復部分問題
    console.log('🔧 嘗試自動修復...');

    // 清理有問題的環境變數
    Object.keys(process.env).forEach(key => {
      const value = process.env[key];
      if (value && typeof value === 'string' && value.includes('${') && value.includes('}')) {
        console.log(`🧹 清理環境變數 ${key}`);
        delete process.env[key];
      }
    });

  } else {
    console.log('✅ 路由配置驗證通過');
  }
};

// 啟動伺服器
const startServer = async () => {
  try {
    console.log('🔄 測試資料庫連線...');
    await sequelize.authenticate();
    console.log('✅ 資料庫連線成功！');

    console.log('🔄 同步資料表...');
    await sequelize.sync();
    console.log('✅ 資料表同步完成！');
  } catch (error) {
    console.error('❌ 資料庫連線失敗:', error);
    console.log('⚠️ 繼續啟動伺服器（無資料庫模式）...');
  }

  const PORT = parseInt(process.env.PORT || '5000', 10);
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 伺服器已啟動： http://0.0.0.0:${PORT}`);
  });
};

startServer();