
import express from 'express';
import sequelize from '../config/database';

const router = express.Router();

// 系統健康檢查
router.get('/health', async (req, res) => {
  const startTime = Date.now();
  
  try {
    // 檢查資料庫連線
    await sequelize.authenticate();
    
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      database: 'connected',
      responseTime: `${responseTime}ms`,
      version: process.env.npm_package_version || '1.0.0'
    });
  } catch (error) {
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      responseTime: `${responseTime}ms`,
      error: error instanceof Error ? error.message : '未知錯誤'
    });
  }
});

export default router;
