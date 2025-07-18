/**
 * Utils 統一匯出點
 * 將所有工具函數集中匯出
 */

// 環境相關
export { checkRequiredEnvVars } from './envCheck';

// 匯出診斷工具
export { checkEnvironment } from './diagnostics/envCheck';
export { validateEnvironment } from './diagnostics/envValidation';

// 格式化工具
export {
  formatDateTime,
  formatDate,
  formatTime,
  formatFileSize,
  formatPhoneNumber,
  formatCurrency,
  truncateString,
  capitalize,
  sanitizeString
} from './formatUtils';

// 驗證工具
export {
  isValidEmail,
  isValidTaiwanPhone,
  isValidLineUserId,
  isValidLength,
  isPositiveInteger,
  isValidDateString,
  isStrongPassword,
  isValidUrl,
  isAlphanumeric,
  isValidChineseName
} from './validationUtils';

// 字串工具
export {
  generateRandomString,
  generateRandomNumbers,
  slugify,
  parseQueryString,
  objectToQueryString,
  getStringSimilarity,
  maskSensitiveData,
  camelToSnake,
  snakeToCamel
} from './stringUtils';

// systemCheck 已移動到 src/tools/systemCheck.ts