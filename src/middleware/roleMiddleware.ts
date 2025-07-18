
import { Request, Response, NextFunction } from 'express';

/**
 * 角色權限中間件
 * @param allowedRole - 允許的角色
 * @returns Express 中間件函數
 */
export const roleMiddleware = (allowedRole: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const member = req.member;
    
    if (!member) {
      return res.status(401).json({ 
        error: '未驗證身份',
        code: 'UNAUTHENTICATED'
      });
    }

    // admin 擁有最高權限，可進入所有路由
    if (member.role !== allowedRole && member.role !== 'admin') {
      return res.status(403).json({ 
        error: '權限不足',
        code: 'INSUFFICIENT_PERMISSIONS',
        required: allowedRole,
        current: member.role
      });
    }

    next();
  };
};

/**
 * 檢查是否為管理員
 */
export const adminOnly = roleMiddleware('admin');

/**
 * 檢查是否為會長或管理員
 */
export const presidentOrAdmin = roleMiddleware('president');

/**
 * 檢查是否為幹部或以上權限
 */
export const officerOrAbove = (req: Request, res: Response, next: NextFunction) => {
  const member = req.member;
  
  if (!member) {
    return res.status(401).json({ 
      error: '未驗證身份',
      code: 'UNAUTHENTICATED'
    });
  }

  const allowedRoles = ['admin', 'president', 'vice_president', 'secretary', 'treasurer'];
  
  if (!allowedRoles.includes(member.role || '')) {
    return res.status(403).json({ 
      error: '需要幹部或以上權限',
      code: 'INSUFFICIENT_PERMISSIONS',
      required: 'officer_or_above',
      current: member.role
    });
  }

  next();
};
