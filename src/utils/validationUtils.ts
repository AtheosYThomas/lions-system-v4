
/**
 * 驗證工具函數
 * 純粹的驗證邏輯，不依賴外部服務
 */

/**
 * 驗證 Email 格式
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * 驗證台灣手機號碼格式
 */
export const isValidTaiwanPhone = (phone: string): boolean => {
  const phoneRegex = /^09\d{8}$/;
  return phoneRegex.test(phone.replace(/\D/g, ''));
};

/**
 * 驗證 LINE User ID 格式
 */
export const isValidLineUserId = (userId: string): boolean => {
  // LINE User ID 通常是 U 開頭的 33 字元字串
  const lineUserIdRegex = /^U[a-f0-9]{32}$/;
  return lineUserIdRegex.test(userId);
};

/**
 * 驗證字串長度
 */
export const isValidLength = (str: string, min: number, max: number): boolean => {
  return str.length >= min && str.length <= max;
};

/**
 * 驗證是否為正整數
 */
export const isPositiveInteger = (value: any): boolean => {
  const num = Number(value);
  return Number.isInteger(num) && num > 0;
};

/**
 * 驗證是否為有效的日期字串
 */
export const isValidDateString = (dateStr: string): boolean => {
  const date = new Date(dateStr);
  return !isNaN(date.getTime());
};

/**
 * 驗證密碼強度
 */
export const isStrongPassword = (password: string): boolean => {
  // 至少 8 個字元，包含大小寫字母和數字
  const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return strongPasswordRegex.test(password);
};

/**
 * 驗證 URL 格式
 */
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * 驗證是否只包含英數字
 */
export const isAlphanumeric = (str: string): boolean => {
  const alphanumericRegex = /^[a-zA-Z0-9]+$/;
  return alphanumericRegex.test(str);
};

/**
 * 驗證中文姓名格式
 */
export const isValidChineseName = (name: string): boolean => {
  const chineseNameRegex = /^[\u4e00-\u9fff]{2,4}$/;
  return chineseNameRegex.test(name);
};
