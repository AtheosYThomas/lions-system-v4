
import { pathToRegexp } from 'path-to-regexp';
import fs from 'fs';
import path from 'path';

// 確保日誌目錄存在
const logDir = 'logs';
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// 記錄無效路徑的函數
function logInvalidPath(invalidPath: string, reason: string) {
  const logEntry = `[${new Date().toISOString()}] ${reason}: ${invalidPath}\n`;
  try {
    fs.appendFileSync(path.join(logDir, 'invalid-path.log'), logEntry);
  } catch (error) {
    console.error('❌ 無法寫入路徑日誌:', error);
  }
}

// 安全的 pathToRegexp 包裝函數
export function safePathToRegexp(inputPath: string) {
  // 檢查是否為有效路徑格式
  if (!inputPath || typeof inputPath !== 'string') {
    console.warn(`⚠️ 無效路徑模板: ${inputPath} (不是字串)`);
    logInvalidPath(String(inputPath), '不是字串');
    return null;
  }

  // 僅允許以 `/` 開頭且不包含 http 等 URL 格式
  if (!inputPath.startsWith('/')) {
    console.warn(`⚠️ 無效路徑模板: ${inputPath} (未以 / 開頭)`);
    logInvalidPath(inputPath, '未以 / 開頭');
    return null;
  }

  if (inputPath.startsWith('http')) {
    console.warn(`⚠️ 無效路徑模板: ${inputPath} (包含 http URL)`);
    logInvalidPath(inputPath, '包含 http URL');
    return null;
  }

  // 檢查是否包含模板字串殘留
  if (inputPath.includes('${') || inputPath.includes('Missing parameter')) {
    console.warn(`⚠️ 無效路徑模板: ${inputPath} (包含模板字串或錯誤訊息)`);
    logInvalidPath(inputPath, '包含模板字串或錯誤訊息');
    return null;
  }

  try {
    return pathToRegexp(inputPath);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : '未知錯誤';
    console.error(`❌ path-to-regexp 解析失敗:`, errorMessage);
    logInvalidPath(inputPath, `解析失敗: ${errorMessage}`);
    return null;
  }
}

// 安全路徑驗證函數（不創建 regexp，只驗證）
export function validatePath(inputPath: string): boolean {
  if (!inputPath || typeof inputPath !== 'string') {
    return false;
  }

  if (!inputPath.startsWith('/') || inputPath.startsWith('http')) {
    return false;
  }

  if (inputPath.includes('${') || inputPath.includes('Missing parameter')) {
    return false;
  }

  try {
    pathToRegexp(inputPath);
    return true;
  } catch {
    return false;
  }
}

// 安全路徑獲取函數（帶 fallback）
export function getSafePath(envKey: string, fallback: string = '/api/fallback'): string {
  const envPath = process.env[envKey];
  
  if (!envPath) {
    console.warn(`⚠️ 環境變數 ${envKey} 尚未設定，將使用預設值: ${fallback}`);
    return fallback;
  }

  if (validatePath(envPath)) {
    return envPath;
  } else {
    console.warn(`⚠️ 環境變數 ${envKey} 格式無效: ${envPath}，將使用預設值: ${fallback}`);
    logInvalidPath(envPath, `環境變數 ${envKey} 格式無效`);
    return fallback;
  }
}

export default {
  safePathToRegexp,
  validatePath,
  getSafePath,
  logInvalidPath
};
