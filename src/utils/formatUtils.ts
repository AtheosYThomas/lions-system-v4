/**
 * 格式化工具函數
 * 純粹的格式化邏輯，無業務邏輯依賴
 */

/**
 * 格式化日期為 YYYY-MM-DD HH:mm:ss
 */
export const formatDateTime = (date: Date): string => {
  return date.toISOString().replace('T', ' ').slice(0, 19);
};

/**
 * 格式化日期為 YYYY-MM-DD
 */
export const formatDate = (date: Date): string => {
  return date.toISOString().slice(0, 10);
};

/**
 * 格式化時間為 HH:mm
 */
export const formatTime = (date: Date): string => {
  return date.toTimeString().slice(0, 5);
};

/**
 * 格式化檔案大小
 */
export const formatFileSize = (bytes: number): string => {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`;
};

/**
 * 格式化手機號碼（台灣格式）
 */
export const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');

  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }

  return phone; // 如果格式不符合，返回原始值
};

/**
 * 格式化金額（台幣）
 */
export const formatCurrency = (amount: number): string => {
  return `NT$ ${amount.toLocaleString('zh-TW')}`;
};

/**
 * 截斷字串並加上省略號
 */
export const truncateString = (str: string, maxLength: number): string => {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + '...';
};

/**
 * 首字母大寫
 */
export const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * 移除字串中的特殊字符，只保留英數字和中文
 */
export const sanitizeString = (str: string): string => {
  return str.replace(/[^\w\u4e00-\u9fff]/gi, '');
};
