import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import dotenv from 'dotenv';
import sequelize from '../../config/database';

dotenv.config();

interface DiagnosticLog {
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS';
  component: string;
  message: string;
  details?: any;
}

class AutoBootDiagnostics {
  private logs: DiagnosticLog[] = [];
  private logDir = path.join(process.cwd(), 'logs');
  private logFile = path.join(this.logDir, 'boot-diagnostic.log');

  constructor() {
    this.ensureLogDirectory();
  }

  private ensureLogDirectory() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  private log(level: DiagnosticLog['level'], component: string, message: string, details?: any) {
    const logEntry: DiagnosticLog = {
      timestamp: new Date().toISOString(),
      level,
      component,
      message,
      details
    };

    this.logs.push(logEntry);

    // 控制台輸出
    const icon = {
      INFO: '🔍',
      WARN: '⚠️',
      ERROR: '❌',
      SUCCESS: '✅'
    }[level];

    const colorFn = {
      INFO: chalk.cyan,
      WARN: chalk.yellow,
      ERROR: chalk.red,
      SUCCESS: chalk.green
    }[level];

    console.log(colorFn(`${icon} [${component}] ${message}`));

    // 寫入檔案
    const logLine = `[${logEntry.timestamp}] ${level} [${component}] ${message}${details ? ` | Details: ${JSON.stringify(details)}` : ''}\n`;
    fs.appendFileSync(this.logFile, logLine);
  }

  async runBootDiagnostics(): Promise<boolean> {
    console.log(chalk.cyan('🦁 北大獅子會系統 V4.0 - 啟動診斷開始'));
    console.log(chalk.cyan('=' .repeat(60)));

    let hasErrors = false;

    try {
      // 1. 檢查核心檔案
      await this.checkCoreFiles();

      // 2. 檢查環境變數
      await this.checkEnvironmentVariables();

      // 3. 檢查資料庫連線
      await this.checkDatabaseConnection();

      // 4. 檢查模型檔案
      await this.checkModels();

      // 5. 檢查路由結構
      await this.checkRoutes();

      // 6. 檢查前端檔案
      await this.checkFrontendFiles();

      // 7. 檢查中介軟體
      await this.checkMiddleware();

      // 8. 生成診斷摘要
      this.generateSummary();

    } catch (error) {
      this.log('ERROR', 'Boot Diagnostics', '診斷過程中發生錯誤', error);
      hasErrors = true;
    }

    return !hasErrors;
  }

  private async checkCoreFiles() {
    this.log('INFO', 'Core Files', '檢查核心檔案...');

    const coreFiles = [
      { path: 'src/index.ts', name: '啟動點' },
      { path: 'src/server.ts', name: '伺服器' },
      { path: 'src/app.ts', name: '應用程式' },
      { path: 'src/config/database.ts', name: '資料庫配置' },
      { path: 'src/config/config.ts', name: '系統配置' }
    ];

    for (const file of coreFiles) {
      if (fs.existsSync(file.path)) {
        this.log('SUCCESS', 'Core Files', `${file.name} 檔案存在`);
      } else {
        this.log('ERROR', 'Core Files', `${file.name} 檔案缺失: ${file.path}`);
      }
    }
  }

  private async checkEnvironmentVariables() {
    this.log('INFO', 'Environment', '檢查環境變數...');

    const requiredVars = [
      'DATABASE_URL',
      'LINE_CHANNEL_ACCESS_TOKEN',
      'LINE_CHANNEL_SECRET',
      'LIFF_ID',
      'PORT'
    ];

    const missingVars: string[] = [];
    const configuredVars: string[] = [];

    for (const varName of requiredVars) {
      if (process.env[varName]) {
        configuredVars.push(varName);
        this.log('SUCCESS', 'Environment', `${varName} 已設定`);
      } else {
        missingVars.push(varName);
        this.log('ERROR', 'Environment', `${varName} 未設定`);
      }
    }

    if (missingVars.length === 0) {
      this.log('SUCCESS', 'Environment', `所有 ${configuredVars.length} 個環境變數都已正確設定`);
    } else {
      this.log('WARN', 'Environment', `缺少 ${missingVars.length} 個關鍵環境變數`, missingVars);
    }
  }

  private async checkDatabaseConnection() {
    this.log('INFO', 'Database', '測試資料庫連線...');

    try {
      await sequelize.authenticate();
      this.log('SUCCESS', 'Database', '資料庫連線成功');

      // 檢查資料表
      const tables = await sequelize.getQueryInterface().showAllTables();
      this.log('SUCCESS', 'Database', `發現 ${tables.length} 個資料表`, tables);

    } catch (error) {
      this.log('ERROR', 'Database', '資料庫連線失敗', error instanceof Error ? error.message : error);
    }
  }

  private async checkModels() {
    this.log('INFO', 'Models', '檢查資料模型...');

    const modelsDir = path.join(process.cwd(), 'src/models');
    const requiredModels = [
      'member.ts',
      'event.ts',
      'registration.ts',
      'announcement.ts',
      'checkin.ts',
      'file.ts',
      'liffSession.ts',
      'messageLog.ts',
      'payment.ts'
    ];

    if (!fs.existsSync(modelsDir)) {
      this.log('ERROR', 'Models', 'models 目錄不存在');
      return;
    }

    const existingFiles = fs.readdirSync(modelsDir);

    for (const model of requiredModels) {
      if (existingFiles.includes(model)) {
        this.log('SUCCESS', 'Models', `模型檔案存在: ${model}`);
      } else {
        this.log('WARN', 'Models', `模型檔案缺失: ${model}`);
      }
    }
  }

  private async checkRoutes() {
    this.log('INFO', 'Routes', '檢查路由結構...');

    const routesDir = path.join(process.cwd(), 'src/routes');
    const requiredRoutes = [
      'admin.ts',
      'upload.ts',
      'api/members.ts',
      'api/checkin.ts',
      'api/liff.ts',
      'api/announcements.ts',
      'line/webhook.ts'
    ];

    for (const route of requiredRoutes) {
      const routePath = path.join(routesDir, route);
      if (fs.existsSync(routePath)) {
        this.log('SUCCESS', 'Routes', `路由檔案存在: ${route}`);
      } else {
        this.log('WARN', 'Routes', `路由檔案缺失: ${route}`);
      }
    }
  }

  private async checkFrontendFiles() {
    this.log('INFO', 'Frontend', '檢查前端檔案...');

    const frontendChecks = [
      { path: 'public/liff.html', name: 'LIFF 註冊頁面' },
      { path: 'public/register.html', name: '註冊頁面' },
      { path: 'client/src/App.tsx', name: 'React 主應用' },
      { path: 'client/index.html', name: 'React 入口頁面' }
    ];

    for (const check of frontendChecks) {
      if (fs.existsSync(check.path)) {
        this.log('SUCCESS', 'Frontend', `${check.name} 存在`);
      } else {
        this.log('WARN', 'Frontend', `${check.name} 缺失: ${check.path}`);
      }
    }
  }

  private async checkMiddleware() {
    this.log('INFO', 'Middleware', '檢查中介軟體...');

    const middlewareDir = path.join(process.cwd(), 'src/middleware');
    const requiredMiddleware = [
      'authMiddleware.ts',
      'roleMiddleware.ts',
      'errorHandler.ts'
    ];

    for (const middleware of requiredMiddleware) {
      const middlewarePath = path.join(middlewareDir, middleware);
      if (fs.existsSync(middlewarePath)) {
        this.log('SUCCESS', 'Middleware', `中介軟體存在: ${middleware}`);
      } else {
        this.log('WARN', 'Middleware', `中介軟體缺失: ${middleware}`);
      }
    }
  }

  private generateSummary() {
    const summary = {
      total: this.logs.length,
      success: this.logs.filter(l => l.level === 'SUCCESS').length,
      warnings: this.logs.filter(l => l.level === 'WARN').length,
      errors: this.logs.filter(l => l.level === 'ERROR').length,
      info: this.logs.filter(l => l.level === 'INFO').length
    };

    console.log(chalk.cyan('\n📊 診斷摘要:'));
    console.log(chalk.green(`✅ 成功: ${summary.success}`));
    console.log(chalk.yellow(`⚠️  警告: ${summary.warnings}`));
    console.log(chalk.red(`❌ 錯誤: ${summary.errors}`));
    console.log(chalk.cyan(`🔍 資訊: ${summary.info}`));

    const healthScore = Math.round((summary.success / (summary.success + summary.warnings + summary.errors)) * 100);
    console.log(chalk.cyan(`🏥 系統健康度: ${healthScore}%`));

    // 儲存 JSON 報告
    const reportPath = path.join(this.logDir, 'boot-diagnostic-report.json');
    const report = {
      timestamp: new Date().toISOString(),
      summary,
      healthScore,
      logs: this.logs
    };

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    this.log('SUCCESS', 'Report', `診斷報告已儲存: ${reportPath}`);

    console.log(chalk.cyan('=' .repeat(60)));
    console.log(chalk.cyan('🦁 啟動診斷完成\n'));
  }
}

export { AutoBootDiagnostics };
export default AutoBootDiagnostics;
// 延遲診斷執行，讓伺服器先完全啟動
    setTimeout(async () => {
      const diagnostics = new AutoBootDiagnostics();
      await diagnostics.runBootDiagnostics();
    }, 5000);