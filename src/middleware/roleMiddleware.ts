import { Request, Response, NextFunction } from 'express';
import { AuthError } from './AuthError';
import {
  Role,
  roleRank,
  roleDisplayNames,
  hasMinimumRole,
  isInRoleGroup,
  RoleGroup,
} from '../types/role';

/**
 * 基礎角色權限中間件
 * @param allowedRole - 允許的角色
 * @returns Express 中間件函數
 */
export const roleMiddleware = (allowedRole: Role) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const member = req.member;

    if (!member) {
      const error = AuthError.unauthorized();
      return res.status(error.statusCode).json(error.toJSON());
    }

    const userRole = member.role as Role;

    // Admin 擁有最高權限，可進入所有路由
    if (userRole !== allowedRole && userRole !== Role.Admin) {
      const error = AuthError.forbidden(
        `需要 ${roleDisplayNames[allowedRole]} 權限`,
        allowedRole,
        userRole
      );
      return res.status(error.statusCode).json(error.toJSON());
    }

    next();
  };
};

/**
 * 最低角色等級權限中間件
 * @param minRole - 最低要求角色
 * @returns Express 中間件函數
 */
export const requireMinRole = (minRole: Role) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const member = req.member;

    if (!member) {
      const error = AuthError.unauthorized();
      return res.status(error.statusCode).json(error.toJSON());
    }

    const userRole = member.role as Role;

    if (!hasMinimumRole(userRole, minRole)) {
      const error = AuthError.forbidden(
        `需要 ${roleDisplayNames[minRole]} 或以上權限`,
        minRole,
        userRole
      );
      return res.status(error.statusCode).json(error.toJSON());
    }

    next();
  };
};

/**
 * 角色組權限中間件
 * @param group - 允許的角色組
 * @returns Express 中間件函數
 */
export const requireRoleGroup = (group: RoleGroup) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const member = req.member;

    if (!member) {
      const error = AuthError.unauthorized();
      return res.status(error.statusCode).json(error.toJSON());
    }

    const userRole = member.role as Role;

    if (!isInRoleGroup(userRole, group)) {
      const error = AuthError.forbidden(
        `需要 ${group} 群組權限`,
        undefined,
        userRole
      );
      return res.status(error.statusCode).json(error.toJSON());
    }

    next();
  };
};

/**
 * 多角色權限中間件
 * @param allowedRoles - 允許的角色陣列
 * @returns Express 中間件函數
 */
export const requireAnyRole = (allowedRoles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const member = req.member;

    if (!member) {
      const error = AuthError.unauthorized();
      return res.status(error.statusCode).json(error.toJSON());
    }

    const userRole = member.role as Role;

    if (!allowedRoles.includes(userRole)) {
      const roleNames = allowedRoles
        .map(role => roleDisplayNames[role])
        .join(' 或 ');
      const error = AuthError.forbidden(
        `需要 ${roleNames} 權限`,
        undefined,
        userRole
      );
      return res.status(error.statusCode).json(error.toJSON());
    }

    next();
  };
};

// 常用角色權限中間件
export const adminOnly = roleMiddleware(Role.Admin);
export const presidentOrAdmin = requireAnyRole([Role.President, Role.Admin]);
export const leadershipOnly = requireRoleGroup('leadership');
export const officersOnly = requireRoleGroup('officers');
export const membersOrAbove = requireMinRole(Role.Member);
export const officersOrAbove = requireMinRole(Role.Officer);
export const financialAccess = requireRoleGroup('financial');

/**
 * 檢查是否為幹部或以上權限（向後相容）
 */
export const officerOrAbove = officersOrAbove;
