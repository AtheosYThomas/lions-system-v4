
import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', err);
  
  // 處理認證相關錯誤
  if (err.code === 'UNAUTHORIZED' || err.code === 'UNAUTHENTICATED') {
    return res.status(401).json({
      error: {
        message: err.message || '身份驗證失敗',
        code: err.code,
        status: 401,
        timestamp: new Date().toISOString()
      }
    });
  }

  if (err.code === 'INSUFFICIENT_PERMISSIONS' || err.code === 'ACCOUNT_INACTIVE') {
    return res.status(403).json({
      error: {
        message: err.message || '權限不足',
        code: err.code,
        status: 403,
        timestamp: new Date().toISOString()
      }
    });
  }
  
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
      status: err.status || 500,
      timestamp: new Date().toISOString()
    }
  });
};

export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  res.status(404).json({
    error: {
      message: 'Route not found',
      status: 404,
      path: req.path
    }
  });
};
