
import { Role } from '../types/role';

/**
 * 認證與授權錯誤類別
 */
export class AuthError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: any;

  constructor(
    message: string,
    statusCode: number = 401,
    code: string = 'AUTH_ERROR',
    details?: any
  ) {
    super(message);
    this.name = 'AuthError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }

  static unauthorized(message: string = '未登入，請先註冊或登入'): AuthError {
    return new AuthError(message, 401, 'UNAUTHORIZED');
  }

  static forbidden(
    message: string = '權限不足',
    requiredRole?: Role,
    currentRole?: Role
  ): AuthError {
    return new AuthError(message, 403, 'INSUFFICIENT_PERMISSIONS', {
      required: requiredRole,
      current: currentRole
    });
  }

  static accountInactive(message: string = '帳號未啟用或無效'): AuthError {
    return new AuthError(message, 403, 'ACCOUNT_INACTIVE');
  }

  static invalidToken(message: string = '無效的認證令牌'): AuthError {
    return new AuthError(message, 401, 'INVALID_TOKEN');
  }

  static tokenExpired(message: string = '認證令牌已過期'): AuthError {
    return new AuthError(message, 401, 'TOKEN_EXPIRED');
  }

  toJSON() {
    return {
      error: this.message,
      code: this.code,
      statusCode: this.statusCode,
      ...(this.details && { details: this.details })
    };
  }
}
