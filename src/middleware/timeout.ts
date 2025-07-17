
import { Request, Response, NextFunction } from 'express';

export const timeoutMiddleware = (timeoutMs: number = 10000) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // 設定請求超時
    res.setTimeout(timeoutMs, () => {
      if (!res.headersSent) {
        res.status(408).json({
          error: '請求超時',
          message: '伺服器處理時間過長，請稍後重試',
          timeout: timeoutMs
        });
      }
    });
    
    next();
  };
};
