
/**
 * 字串處理工具函數
 * 純粹的字串操作，無外部依賴
 */

/**
 * 生成隨機字串
 */
export const generateRandomString = (length: number): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * 生成隨機數字字串
 */
export const generateRandomNumbers = (length: number): string => {
  const numbers = '0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += numbers.charAt(Math.floor(Math.random() * numbers.length));
  }
  return result;
};

/**
 * 將字串轉換為 slug（用於 URL）
 */
export const slugify = (str: string): string => {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // 移除特殊字符
    .replace(/[\s_-]+/g, '-') // 將空格和底線轉為連字號
    .replace(/^-+|-+$/g, ''); // 移除開頭和結尾的連字號
};

/**
 * 解析查詢字串為物件
 */
export const parseQueryString = (queryString: string): Record<string, string> => {
  const params: Record<string, string> = {};
  const searchParams = new URLSearchParams(queryString);
  
  for (const [key, value] of searchParams) {
    params[key] = value;
  }
  
  return params;
};

/**
 * 將物件轉換為查詢字串
 */
export const objectToQueryString = (obj: Record<string, any>): string => {
  const params = new URLSearchParams();
  
  Object.entries(obj).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      params.append(key, String(value));
    }
  });
  
  return params.toString();
};

/**
 * 比較兩個字串的相似度（Levenshtein distance）
 */
export const getStringSimilarity = (str1: string, str2: string): number => {
  const matrix: number[][] = [];
  const len1 = str1.length;
  const len2 = str2.length;
  
  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,    // deletion
          matrix[i][j - 1] + 1,    // insertion
          matrix[i - 1][j - 1] + 1 // substitution
        );
      }
    }
  }
  
  const maxLen = Math.max(len1, len2);
  return maxLen === 0 ? 1 : (maxLen - matrix[len1][len2]) / maxLen;
};

/**
 * 遮罩敏感資訊
 */
export const maskSensitiveData = (str: string, visibleStart = 2, visibleEnd = 2): string => {
  if (str.length <= visibleStart + visibleEnd) {
    return '*'.repeat(str.length);
  }
  
  const start = str.slice(0, visibleStart);
  const end = str.slice(-visibleEnd);
  const masked = '*'.repeat(str.length - visibleStart - visibleEnd);
  
  return start + masked + end;
};

/**
 * 將 camelCase 轉換為 snake_case
 */
export const camelToSnake = (str: string): string => {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
};

/**
 * 將 snake_case 轉換為 camelCase
 */
export const snakeToCamel = (str: string): string => {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
};
