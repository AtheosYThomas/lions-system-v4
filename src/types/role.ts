/**
 * 角色相關的型別定義 - 重構版本
 * 提供型別安全的角色權限控制系統
 */

// 定義角色列舉
export enum Role {
  Guest = 'guest',
  Member = 'member',
  Officer = 'officer',
  Secretary = 'secretary',
  Treasurer = 'treasurer',
  VicePresident = 'vice_president',
  President = 'president',
  Admin = 'admin'
}

// 定義角色等級（權限排序，數字越高權限越大）
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

// 角色顯示名稱
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

// 定義角色群組 - 使用 as const 確保型別安全
export const roleGroups = {
  members: [Role.Member, Role.Officer, Role.Secretary, Role.Treasurer, Role.VicePresident, Role.President, Role.Admin],
  officers: [Role.Officer, Role.Secretary, Role.Treasurer, Role.VicePresident, Role.President, Role.Admin],
  leadership: [Role.VicePresident, Role.President, Role.Admin],
  financial: [Role.Treasurer, Role.President, Role.Admin],
  admin: [Role.Admin, Role.President],
  all: [Role.Guest, Role.Member, Role.Officer, Role.Secretary, Role.Treasurer, Role.VicePresident, Role.President, Role.Admin]
} as const;

// 取得合法群組名稱型別
export type RoleGroup = keyof typeof roleGroups;

/**
 * 判斷角色是否屬於某群組（型別安全）
 * ✅ 修正重點：使用展開運算符轉為可變陣列，避免 TypeScript 只讀型別錯誤
 */
export function isRoleInGroup(role: Role, group: RoleGroup): boolean {
  const groupRoles = [...roleGroups[group]]; // 轉為可變陣列
  return groupRoles.includes(role);
}

/**
 * 判斷是否有足夠權限（使用等級比較）
 */
export function hasPermission(userRole: Role, requiredRole: Role): boolean {
  return roleRank[userRole] >= roleRank[requiredRole];
}

/**
 * 檢查角色是否滿足最低權限需求（向後相容）
 */
export function hasMinimumRole(userRole: Role | string, requiredRole: Role): boolean {
  const role = typeof userRole === 'string' ? userRole as Role : userRole;
  return hasPermission(role, requiredRole);
}

/**
 * 檢查角色是否在指定角色組中（向後相容）
 */
export function isInRoleGroup(userRole: Role | string, group: RoleGroup): boolean {
  const role = typeof userRole === 'string' ? userRole as Role : userRole;
  return isRoleInGroup(role, group);
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

/**
 * 檢查是否為管理級角色
 */
export function isAdminRole(role: Role): boolean {
  return role === Role.President || role === Role.Admin;
}

/**
 * 檢查是否為高級角色（向後相容）
 */
export function isHighRankRole(role: Role): boolean {
  return isAdminRole(role);
}

/**
 * 檢查角色是否有足夠權限（向後相容）
 */
export function hasRolePermission(userRole: Role | string, requiredRole: Role): boolean {
  const role = typeof userRole === 'string' ? userRole as Role : userRole;

  // Admin 總是有權限
  if (role === Role.Admin) return true;

  // 使用等級比較
  return hasPermission(role, requiredRole);
}

/**
 * 檢查用戶是否可以訪問路由
 */
export function canUserAccessRoute(userRole: Role, requiredRole: Role): boolean {
  return hasPermission(userRole, requiredRole);
}

/**
 * 檢查管理員是否可以訪問路由
 * ✅ 修正：使用 Role 聯合型別而非限定特定值
 */
export function canAccessRoute(userRole: Role, requiredRole: Role): boolean {
  return isAdminRole(userRole) && hasPermission(userRole, requiredRole);
}

// 向後相容的型別定義
export type UserRole = 'admin' | 'member' | 'guest';
export type RoleGroupKey = RoleGroup;

export interface RolePermission {
  role: UserRole;
  permissions: string[];
}

export interface RoleCheckResult {
  hasRole: boolean;
  userRole: UserRole;
  requiredRole: UserRole;
}