/**
 * 角色相關的型別定義
 */
export type UserRole = 'admin' | 'member' | 'guest';

export interface RolePermission {
  role: UserRole;
  permissions: string[];
}

export interface RoleCheckResult {
  hasRole: boolean;
  userRole: UserRole;
  requiredRole: UserRole;
}

/**
 * 系統角色定義
 */
export enum Role {
  Guest = 'guest',
  Member = 'member',
  Officer = 'officer',
  VicePresident = 'vice_president',
  Secretary = 'secretary',
  Treasurer = 'treasurer',
  President = 'president',
  Admin = 'admin'
}

/**
 * 角色等級系統 - 數字越高權限越大
 */
export const roleRank: Record<Role, number> = {
  [Role.Guest]: 0,
  [Role.Member]: 1,
  [Role.Officer]: 2,
  [Role.Secretary]: 3,
  [Role.Treasurer]: 4,
  [Role.VicePresident]: 5,
  [Role.President]: 6,
  [Role.Admin]: 7
};

/**
 * 角色顯示名稱
 */
export const roleDisplayNames: Record<Role, string> = {
  [Role.Guest]: '訪客',
  [Role.Member]: '會員',
  [Role.Officer]: '幹部',
  [Role.Secretary]: '秘書',
  [Role.Treasurer]: '財務',
  [Role.VicePresident]: '副會長',
  [Role.President]: '會長',
  [Role.Admin]: '系統管理員'
};

/**
 * 角色組定義
 */
export const roleGroups = {
  officers: [Role.Officer, Role.Secretary, Role.Treasurer, Role.VicePresident, Role.President, Role.Admin],
  leadership: [Role.VicePresident, Role.President, Role.Admin],
  financial: [Role.Treasurer, Role.President, Role.Admin],
  all: Object.values(Role)
} as const;

/**
 * 檢查角色是否滿足最低權限需求
 */
export function hasMinimumRole(userRole: Role | string, requiredRole: Role): boolean {
  const userRank = roleRank[userRole as Role] || 0;
  const requiredRank = roleRank[requiredRole];
  return userRank >= requiredRank;
}

/**
 * 檢查角色是否在指定角色組中
 */
export function isInRoleGroup(userRole: Role | string, group: keyof typeof roleGroups): boolean {
  return roleGroups[group].includes(userRole as Role);
}

/**
 * 取得角色的所有下級角色
 */
export function getSubordinateRoles(role: Role): Role[] {
  const currentRank = roleRank[role];
  return Object.values(Role).filter(r => roleRank[r] < currentRank);
}

/**
 * 取得角色的所有上級角色
 */
export function getSuperiorRoles(role: Role): Role[] {
  const currentRank = roleRank[role];
  return Object.values(Role).filter(r => roleRank[r] > currentRank);
}

export type RoleGroup = keyof typeof roleGroups;

/**
 * 檢查角色是否有足夠權限
 */
export function hasRolePermission(userRole: Role | string, requiredRole: Role): boolean {
  const userRank = roleRank[userRole as Role] || 0;
  const requiredRank = roleRank[requiredRole];

  // Admin 總是有權限
  if (userRole === Role.Admin) return true;

  // 完全匹配或更高等級
  return userRank >= requiredRank;
}

export function canAccessRoute(userRole: Role, requiredRole: Role.President | Role.Admin): boolean {
  return roleRank[userRole] >= roleRank[requiredRole as Role];
}

export function isAdminRole(role: Role): boolean {
  return role === Role.President || role === Role.Admin;
}

export function isHighRankRole(role: Role): boolean {
  return isAdminRole(role);
}