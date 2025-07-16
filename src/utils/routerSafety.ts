
import express from 'express';

// 路由參數驗證器
export const validateNumericParam = (paramName: string) => {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const value = req.params[paramName];
    if (value && !/^\d+$/.test(value)) {
      return res.status(400).json({
        error: `Invalid ${paramName}`,
        message: `${paramName} must be a positive integer`,
        received: value
      });
    }
    next();
  };
};

// 路由路徑安全檢查
export const validateRoutePath = (path: string): boolean => {
  // 檢查是否包含危險的路由模式
  const dangerousPatterns = [
    /\$\{.*\}/,           // 模板字串
    /:.*\(\*\)/,          // 舊式萬用字元
    /Missing parameter/i,  // 錯誤訊息
    /\.\./,               // 路徑遍歷
  ];
  
  return !dangerousPatterns.some(pattern => pattern.test(path));
};

// 安全的路由建立器
export const createSafeRouter = (options?: express.RouterOptions) => {
  const defaultOptions: express.RouterOptions = {
    strict: true,        // 嚴格路由匹配
    caseSensitive: true, // 區分大小寫
    mergeParams: false   // 不合併參數
  };
  
  return express.Router({ ...defaultOptions, ...options });
};

// 路由錯誤處理器
export const routeErrorHandler = (
  err: Error,
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  console.error('🚨 路由錯誤:', err.message);
  
  // 檢查是否為 path-to-regexp 相關錯誤
  if (err.message.includes('Missing parameter name') || 
      err.message.includes('path-to-regexp')) {
    return res.status(500).json({
      error: 'Route configuration error',
      message: 'Invalid route pattern detected',
      timestamp: new Date().toISOString()
    });
  }
  
  // 其他錯誤
  res.status(500).json({
    error: 'Internal server error',
    message: err.message,
    timestamp: new Date().toISOString()
  });
};
