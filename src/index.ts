import dotenv from 'dotenv';
import app from './app';
import sequelize from './config/database';
import { runDiagnostics } from './diagnosticTool';

// 載入環境變數
dotenv.config();

// 延遲執行診斷，確保伺服器已啟動
setTimeout(() => {
  runDiagnostics();
}, 5000);

import './server';