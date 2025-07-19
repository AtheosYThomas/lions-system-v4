
/**
 * LINE User ID 格式驗證工具
 */
export function isValidLineUserId(id: string): boolean {
  return /^U[a-f0-9]{32}$/.test(id);
}

/**
 * 驗證 LINE User ID 並回傳驗證結果
 */
export function validateLineUserId(id: string | undefined): { valid: boolean; error?: string } {
  if (!id) {
    return { valid: false, error: 'LINE User ID is required' };
  }
  
  if (!isValidLineUserId(id)) {
    return { valid: false, error: 'Invalid line_user_id format' };
  }
  
  return { valid: true };
}
