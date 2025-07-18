
import express from 'express';
import crypto from 'crypto';

const router = express.Router();

// GitHub webhook 端點
router.post('/webhook', (req, res) => {
  try {
    const secret = req.body.secret;
    const deploySecret = process.env.DEPLOY_SECRET;
    
    if (!deploySecret) {
      console.error('❌ DEPLOY_SECRET 環境變數未設定');
      return res.status(500).send('Server configuration error');
    }
    
    if (secret !== deploySecret) {
      console.error('❌ Webhook secret 不匹配');
      return res.status(403).send('Forbidden');
    }

    console.log('✅ Webhook 收到，開始同步最新代碼...');
    console.log('📅 同步時間:', new Date().toISOString());
    
    // 記錄同步事件
    const syncInfo = {
      timestamp: new Date().toISOString(),
      source: 'github-actions',
      status: 'received'
    };
    
    console.log('📊 同步資訊:', syncInfo);
    
    res.status(200).json({ 
      message: 'Webhook received successfully',
      timestamp: syncInfo.timestamp,
      status: 'ok'
    });
    
  } catch (error) {
    console.error('❌ Webhook 處理錯誤:', error);
    res.status(500).json({ 
      message: 'Webhook processing error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// 健康檢查端點
router.get('/webhook/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    webhook: 'ready',
    timestamp: new Date().toISOString()
  });
});

export default router;
