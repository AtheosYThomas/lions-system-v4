
import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import { config } from './config/config';
import sequelize from './config/database';
import { validateEnvironment } from './utils/diagnostics';
import { AutoBootDiagnostics } from './utils/diagnostics/autoBootDiagnostics';

const PORT: number = parseInt(process.env.PORT || '5000', 10);

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
    // 🔥 新增：啟動時自動執行完整診斷
    const diagnostics = new AutoBootDiagnostics();
    const diagnosticsPassed = await diagnostics.runBootDiagnostics();
    
    if (!diagnosticsPassed) {
      console.warn('⚠️  診斷發現一些問題，但繼續啟動伺服器...');
    }

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

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 伺服器啟動成功！埠號: ${PORT}`);
      console.log(`📍 Health Check: http://0.0.0.0:${PORT}/health`);
      console.log(`📱 LINE Webhook: http://0.0.0.0:${PORT}/webhook`);
      console.log(`🌐 前端頁面: http://0.0.0.0:${PORT}`);
      
      // 伺服器完全啟動後，延遲 3 秒執行最後的健康檢查
      setTimeout(async () => {
        try {
          const http = await import('http');
          const req = http.get(`http://0.0.0.0:${PORT}/health`, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
              if (res.statusCode === 200) {
                const healthData = JSON.parse(data);
                console.log('✅ Health Check 成功');
                console.log(`📊 狀態: ${healthData.status}`);
                console.log(`🔌 資料庫: ${healthData.database}`);
                console.log(`🛣️ 路由: ${healthData.services?.routes?.join(', ')}`);
              }
            });
          });
          req.on('error', () => {
            console.log('💡 Health Check 跳過 - 這是正常的');
          });
        } catch (error) {
          // 忽略檢查錯誤
        }
      }, 3000);
    });
  } catch (error) {
    console.error('❌ 伺服器啟動失敗:', error);
    await sequelize.close();
    process.exit(1);
  }
};

// 立即執行伺服器啟動
startServer().catch((error) => {
  console.error('❌ 伺服器啟動失敗:', error);
  process.exit(1);
});
