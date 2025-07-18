import { Request, Response, NextFunction } from 'express';
import { Member } from '../models/member';
import { AuthError } from './AuthError';
import { Role } from '../types/role';

// 擴展 Request 介面以包含 member 屬性
declare global {
  namespace Express {
    interface Request {
      member?: Member;
    }
  }
}

/**
 * 基礎認證中間件
 * 驗證用戶身份並設置 req.member
 */
export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 從多個來源取得 LINE UID
    const lineUid = req.headers['x-line-uid'] || 
                   (req as any).session?.line_uid || 
                   req.body.line_uid;

    if (!lineUid || typeof lineUid !== 'string') {
      throw AuthError.unauthorized();
    }

    // 查詢會員資料
    const member = await Member.findOne({ 
      where: { line_user_id: lineUid } 
    });

    if (!member) {
      throw AuthError.unauthorized('找不到對應的會員帳號');
    }

    if (member.status !== 'active') {
      throw AuthError.accountInactive();
    }

    // 將會員資料附加到 request 物件
    req.member = member;
    next();
  } catch (error) {
    if (error instanceof AuthError) {
      return res.status(error.statusCode).json(error.toJSON());
    }

    console.error('authMiddleware 錯誤:', error);
    const authError = new AuthError('驗證失敗', 500, 'AUTH_ERROR');
    res.status(500).json(authError.toJSON());
  }
};

/**
 * 可選認證中間件
 * 如果有提供認證信息則驗證，但不強制要求登入
 */
export const optionalAuthMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const lineUid = req.headers['x-line-uid'] || 
                   (req as any).session?.line_uid || 
                   req.body.line_uid;

    if (lineUid && typeof lineUid === 'string') {
      const member = await Member.findOne({ 
        where: { line_user_id: lineUid, status: 'active' } 
      });

      if (member) {
        req.member = member;
      }
    }

    next();
  } catch (error) {
    console.error('optionalAuthMiddleware 錯誤:', error);
    // 不拋出錯誤，繼續執行
    next();
  }
};

/**
 * 檢查用戶是否已登入
 */
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.member) {
    const error = AuthError.unauthorized();
    return res.status(error.statusCode).json(error.toJSON());
  }
  next();
};

/**
 * 檢查用戶是否為訪客（未登入）
 * 用於註冊頁面等只允許未登入用戶訪問的頁面
 */
export const guestOnly = (req: Request, res: Response, next: NextFunction) => {
  if (req.member) {
    const error = AuthError.forbidden('已登入用戶無法訪問此頁面');
    return res.status(error.statusCode).json(error.toJSON());
  }
  next();
};