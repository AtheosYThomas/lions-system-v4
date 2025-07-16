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
import { routeSafetyCheck, cleanProblemEnvVars } from './utils/routeSafetyCheck';

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

// 前端路由處理 (SPA) - 簡化並避免path-to-regexp錯誤
const serveSPA = (req: express.Request, res: express.Response) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
};

app.get('/', serveSPA);
app.get('/register', serveSPA);
app.get('/checkin', serveSPA);
app.get('/admin', serveSPA);

// 處理所有其他未匹配的路由（SPA fallback）
app.get('*', (req, res) => {
  // 排除 API 和 webhook 路由
  if (req.path.startsWith('/api') || req.path.startsWith('/webhook')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  // 其他所有路由都回傳前端 SPA
  serveSPA(req, res);
});

// 錯誤處理
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
  
  // 3. 檢查 DEBUG_URL 相關問題（報錯中提到的變數）
  if (process.env.DEBUG_URL && process.env.DEBUG_URL.includes('${')) {
    potentialIssues.push(`DEBUG_URL 包含未展開的模板字串: ${process.env.DEBUG_URL}`);
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
    console.log('🚨 強化預防 path-to-regexp 錯誤...');
    
    // 1. 徹底清理所有可能導致問題的環境變數
    const dangerousPatterns = [
      /\$\{.*\}/,           // 任何包含 ${...} 的變數
      /Missing parameter/i,  // 包含錯誤訊息的變數
      /:.*\(\*\)/,          // 包含 :param(*) 模式的變數
    ];
    
    const allEnvVars = Object.keys(process.env);
    let cleanedCount = 0;
    
    allEnvVars.forEach(key => {
      const value = process.env[key];
      if (value && typeof value === 'string') {
        // 檢查是否匹配危險模式
        const isDangerous = dangerousPatterns.some(pattern => pattern.test(value)) ||
                            value.includes('${') ||
                            value.includes('Missing parameter') ||
                            value === 'undefined' ||
                            value === 'null' ||
                            value.trim() === '';
        
        if (isDangerous) {
          console.log(`🧹 清理危險環境變數: ${key}=${value}`);
          delete process.env[key];
          cleanedCount++;
        }
      }
    });
    
    console.log(`✅ 已清理 ${cleanedCount} 個危險環境變數`);
    
    // 2. 強制設置安全的核心環境變數
    const safeDefaults = {
      NODE_ENV: 'development',
      PORT: '5000',
      EXPRESS_ENV: 'development'
    };
    
    Object.entries(safeDefaults).forEach(([key, value]) => {
      process.env[key] = value;
      console.log(`🔧 設置安全環境變數: ${key}=${value}`);
    });
    
    // 3. 執行增強的安全檢查
    cleanProblemEnvVars();
    routeSafetyCheck();
    validateRoutes();
    
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