
import { Request, Response, NextFunction } from 'express';
import { Member } from '../models/member';

// 擴展 Request 介面以包含 member 屬性
declare global {
  namespace Express {
    interface Request {
      member?: Member;
    }
  }
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 從多個來源取得 LINE UID
    const lineUid = req.headers['x-line-uid'] || 
                   (req as any).session?.line_uid || 
                   req.body.line_uid;

    if (!lineUid || typeof lineUid !== 'string') {
      return res.status(401).json({ 
        error: '未登入，請先註冊或登入',
        code: 'UNAUTHORIZED'
      });
    }

    // 查詢會員資料
    const member = await Member.findOne({ 
      where: { line_uid: lineUid } 
    });

    if (!member || member.status !== 'active') {
      return res.status(403).json({ 
        error: '帳號未啟用或無效',
        code: 'ACCOUNT_INACTIVE'
      });
    }

    // 將會員資料附加到 request 物件
    req.member = member;
    next();
  } catch (err) {
    console.error('authMiddleware 錯誤:', err);
    res.status(500).json({ 
      error: '驗證失敗',
      code: 'AUTH_ERROR'
    });
  }
};
