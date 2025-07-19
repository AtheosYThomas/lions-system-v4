
import { Request, Response, NextFunction } from 'express';
import Member from '../models/member';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string;
    line_user_id?: string;
  };
}

/**
 * 驗證推播權限 - 僅限幹部
 */
export const requirePushPermission = async (
  req: AuthenticatedRequest, 
  res: Response, 
  next: NextFunction
): Promise<void> => {
  try {
    // 從 header 或 session 中獲取用戶信息
    const userId = req.headers['x-user-id'] as string;
    const userRole = req.headers['x-user-role'] as string;

    if (!userId) {
      res.status(401).json({
        error: '未登入',
        code: 'UNAUTHORIZED'
      });
      return;
    }

    // 檢查角色權限
    const allowedRoles = ['會長', 'President', '秘書', 'Secretary', '幹部', 'Officer'];
    
    if (!userRole || !allowedRoles.includes(userRole)) {
      res.status(403).json({
        error: '權限不足，僅限幹部推播',
        code: 'INSUFFICIENT_PERMISSION',
        requiredRoles: allowedRoles
      });
      return;
    }

    // 驗證會員是否存在
    const member = await Member.findByPk(userId);
    if (!member) {
      res.status(404).json({
        error: '會員不存在',
        code: 'MEMBER_NOT_FOUND'
      });
      return;
    }

    // 將用戶信息附加到請求對象
    req.user = {
      id: userId,
      role: userRole,
      line_user_id: member.line_user_id
    };

    next();
  } catch (error) {
    console.error('❌ 推播權限驗證失敗:', error);
    res.status(500).json({
      error: '權限驗證失敗',
      details: error instanceof Error ? error.message : '未知錯誤'
    });
  }
};

/**
 * 簡化版權限檢查（用於測試）
 */
export const requireBasicAuth = (
  req: AuthenticatedRequest, 
  res: Response, 
  next: NextFunction
): void => {
  const authToken = req.headers['authorization'];
  
  if (!authToken || authToken !== 'Bearer admin-token') {
    res.status(401).json({
      error: '需要管理員權限',
      code: 'ADMIN_REQUIRED'
    });
    return;
  }

  req.user = {
    id: 'admin',
    role: '會長'
  };

  next();
};
