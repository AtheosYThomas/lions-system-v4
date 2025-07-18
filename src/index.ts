import dotenv from 'dotenv';
import app from './app';
import sequelize from './config/database';
import { runDiagnostics } from './diagnosticTool';

// 載入環境變數
dotenv.config();

// 啟動時自動執行診斷
runDiagnostics();
import './server';