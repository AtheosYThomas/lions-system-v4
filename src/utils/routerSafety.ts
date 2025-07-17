
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
  try {
    // 使用新的安全路徑驗證模組
    const { validatePath } = require('./safePath');
    
    // 額外檢查路徑遍歷
    if (path.includes('..')) {
      return false;
    }
    
    return validatePath(path);
  } catch (error) {
    console.error('路徑驗證失敗:', error);
    return false;
  }
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
