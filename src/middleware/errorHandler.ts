import { Request, Response, NextFunction } from 'express';

// 🛡️ Router fallback 與預防機制
export const apiNotFound = (req: Request, res: Response, next: NextFunction) => {
  if (req.originalUrl.startsWith('/api')) {
    return res.status(404).json({
      success: false,
      message: `🔍 API 路由未找到: ${req.originalUrl}`,
      timestamp: new Date().toISOString()
    });
  }
  next();
};

export const fallbackPage = (req: Request, res: Response, next: NextFunction) => {
  // 檢查是否為靜態資源請求
  if (req.originalUrl.includes('.') && !req.originalUrl.endsWith('.html')) {
    return res.status(404).send('🚫 靜態資源不存在');
  }

  // 其他未處理路徑的友善回應
  res.status(404).send(`
    <div style="text-align: center; margin-top: 50px; font-family: Arial;">
      <h2>🚫 找不到此頁面</h2>
      <p>請確認網址是否正確</p>
      <a href="/">返回首頁</a>
    </div>
  `);
};

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('🔥 系統錯誤:', err);

  // 🚨 預防 path-to-regexp 錯誤的統一處理
  if (err.message && err.message.includes('Missing parameter name')) {
    console.error('🚨 path-to-regexp 錯誤:', err.message);
    return res.status(500).json({
      success: false,
      error: 'Route configuration error',
      message: '路由配置錯誤，系統已記錄此問題',
      timestamp: new Date().toISOString()
    });
  }

  // 🛡️ 統一 API 錯誤格式
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: '伺服器內部錯誤',
    timestamp: new Date().toISOString()
  });
};

export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Not found',
    message: '找不到請求的資源',
    path: req.originalUrl,
    timestamp: new Date().toISOString()
  });
};