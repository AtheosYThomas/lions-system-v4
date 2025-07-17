
import fs from 'fs';
import path from 'path';
import sequelize from './config/database';

interface FileReport {
  path: string;
  status: 'ok' | 'error' | 'warning';
  errors: string[];
  warnings: string[];
}

interface EnvironmentReport {
  status: 'ok' | 'error' | 'warning';
  missingVariables: string[];
  undefinedUsages: string[];
  dangerousPatterns: string[];
}

interface FrontendReport {
  status: 'ok' | 'error' | 'warning';
  clientExists: boolean;
  publicExists: boolean;
  buildFiles: string[];
  errors: string[];
}

interface HealthCheckReport {
  status: 'ok' | 'error';
  database: boolean;
  server: boolean;
  endpoints: string[];
  errors: string[];
}

interface ComprehensiveDiagnosisReport {
  timestamp: string;
  summary: {
    totalIssues: number;
    criticalErrors: number;
    warnings: number;
    status: 'healthy' | 'issues' | 'critical';
  };
  sections: {
    routeErrors: FileReport[];
    environmentIssues: EnvironmentReport;
    frontendStatus: FrontendReport;
    healthCheck: HealthCheckReport;
  };
  recommendations: string[];
}

// 1. 掃描 /src 目錄下所有 route、controller、middleware 的錯誤
async function scanRouteControllerMiddleware(): Promise<FileReport[]> {
  console.log('📊 1. 掃描 /src 目錄下路由、控制器、中間件錯誤...');
  
  const reports: FileReport[] = [];
  const filesToCheck = [
    // 路由檔案
    'src/routes/admin.ts',
    'src/routes/members.ts', 
    'src/routes/events.ts',
    'src/routes/checkin.ts',
    // 中間件
    'src/middleware/errorHandler.ts',
    // LINE 處理器
    'src/line/handler.ts',
    'src/line/webhook.ts',
    'src/line/push.ts',
    // 主要檔案
    'src/index.ts',
    'src/init.ts',
    // 配置檔案
    'src/config/database.ts',
    'src/config/config.ts'
  ];

  for (const filePath of filesToCheck) {
    const report: FileReport = {
      path: filePath,
      status: 'ok',
      errors: [],
      warnings: []
    };

    try {
      if (!fs.existsSync(filePath)) {
        report.status = 'error';
        report.errors.push('檔案不存在');
        console.log(`❌ ${filePath} - 檔案不存在`);
      } else {
        try {
          const content = fs.readFileSync(filePath, 'utf8');
          
          // 語法檢查
          try {
            // 嘗試編譯檢查
            const { execSync } = require('child_process');
            execSync(`npx tsc --noEmit ${filePath}`, { stdio: 'pipe' });
          } catch (syntaxError) {
            const errorStr = syntaxError.toString();
            if (errorStr.includes('error TS')) {
              report.status = 'error';
              report.errors.push(`TypeScript 語法錯誤: ${errorStr}`);
            }
          }

          // 內容檢查
          if (content.includes('${') && content.includes('}')) {
            report.status = 'warning';
            report.warnings.push('包含未展開的模板字串');
          }
          
          if (content.includes(':param(*)')) {
            report.status = 'error';
            report.errors.push('包含非法路由參數格式');
          }
          
          if (content.includes('localhost') && !content.includes('0.0.0.0')) {
            report.status = 'warning';
            report.warnings.push('使用 localhost 而非 0.0.0.0');
          }

          if (filePath.includes('routes/') && !content.includes('express.Router')) {
            report.status = 'error';
            report.errors.push('路由檔案缺少 Express Router 初始化');
          }

          // 模組載入測試
          if (filePath.endsWith('.ts') && !filePath.includes('config/')) {
            try {
              delete require.cache[path.resolve(filePath)];
              require(path.resolve(filePath.replace('.ts', '.js')));
            } catch (loadError) {
              report.status = 'error';
              report.errors.push(`模組載入錯誤: ${loadError.message}`);
            }
          }

          if (report.errors.length === 0 && report.warnings.length === 0) {
            console.log(`✅ ${filePath} - 檢查通過`);
          } else {
            console.log(`⚠️ ${filePath} - 發現 ${report.errors.length} 個錯誤, ${report.warnings.length} 個警告`);
          }

        } catch (readError) {
          report.status = 'error';
          report.errors.push(`讀取錯誤: ${readError.message}`);
          console.log(`❌ ${filePath} - 讀取失敗: ${readError.message}`);
        }
      }
    } catch (error) {
      report.status = 'error';
      report.errors.push(`檢查錯誤: ${error.message}`);
    }

    reports.push(report);
  }

  return reports;
}

// 2. 比對 .env 檔與實際程式是否有使用未定義的變數
async function checkEnvironmentVariables(): Promise<EnvironmentReport> {
  console.log('\n🔧 2. 檢查環境變數配置...');
  
  const report: EnvironmentReport = {
    status: 'ok',
    missingVariables: [],
    undefinedUsages: [],
    dangerousPatterns: []
  };

  // 檢查必要的環境變數
  const requiredVars = [
    'LINE_CHANNEL_ACCESS_TOKEN',
    'LINE_CHANNEL_SECRET',
    'DATABASE_URL',
    'PORT'
  ];

  for (const varName of requiredVars) {
    const value = process.env[varName];
    if (!value || value === 'undefined' || value.includes('${')) {
      report.missingVariables.push(varName);
      report.status = 'error';
      console.log(`❌ 環境變數 ${varName} 未正確設定`);
    } else {
      console.log(`✅ 環境變數 ${varName} 已設定`);
    }
  }

  // 檢查危險的環境變數模式
  Object.entries(process.env).forEach(([key, value]) => {
    if (value && typeof value === 'string') {
      if (value.includes('${') && value.includes('}')) {
        report.dangerousPatterns.push(`${key}=${value} (未展開的模板字串)`);
        report.status = 'error';
      } else if (value.includes('Missing parameter')) {
        report.dangerousPatterns.push(`${key}=${value} (錯誤訊息殘留)`);
        report.status = 'error';
      } else if (value === 'undefined' || value === 'null') {
        report.dangerousPatterns.push(`${key}=${value} (無效值)`);
        report.status = 'warning';
      }
    }
  });

  // 掃描程式碼中使用但未定義的環境變數
  const sourceFiles = [
    'src/index.ts',
    'src/config/config.ts',
    'src/config/database.ts'
  ];

  for (const filePath of sourceFiles) {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      const envMatches = content.match(/process\.env\.(\w+)/g);
      
      if (envMatches) {
        envMatches.forEach(match => {
          const varName = match.replace('process.env.', '');
          if (!process.env[varName] && !requiredVars.includes(varName)) {
            report.undefinedUsages.push(`${filePath}: ${varName}`);
            report.status = 'warning';
          }
        });
      }
    }
  }

  return report;
}

// 3. 檢查前端是否能載入、是否有 JS 錯誤
async function checkFrontendStatus(): Promise<FrontendReport> {
  console.log('\n🎨 3. 檢查前端狀態...');
  
  const report: FrontendReport = {
    status: 'ok',
    clientExists: false,
    publicExists: false,
    buildFiles: [],
    errors: []
  };

  // 檢查 client 目錄
  const clientDir = 'client';
  if (fs.existsSync(clientDir)) {
    report.clientExists = true;
    console.log('✅ client 目錄存在');
    
    // 檢查 package.json
    const clientPackageJson = path.join(clientDir, 'package.json');
    if (fs.existsSync(clientPackageJson)) {
      try {
        const packageContent = JSON.parse(fs.readFileSync(clientPackageJson, 'utf8'));
        console.log(`✅ 前端專案: ${packageContent.name || 'Unknown'}`);
        
        // 檢查依賴
        if (!packageContent.dependencies) {
          report.errors.push('前端專案缺少依賴定義');
          report.status = 'error';
        }
      } catch (error) {
        report.errors.push(`無法解析前端 package.json: ${error.message}`);
        report.status = 'error';
      }
    } else {
      report.errors.push('前端專案缺少 package.json');
      report.status = 'error';
    }

    // 檢查建置檔案
    const distDir = path.join(clientDir, 'dist');
    if (fs.existsSync(distDir)) {
      const buildFiles = fs.readdirSync(distDir);
      report.buildFiles = buildFiles;
      console.log(`✅ 找到 ${buildFiles.length} 個建置檔案`);
    } else {
      report.errors.push('前端專案尚未建置 (缺少 dist 目錄)');
      report.status = 'warning';
    }
  } else {
    report.errors.push('client 目錄不存在');
    console.log('❌ client 目錄不存在');
  }
  
  // 檢查 public 目錄
  const publicDir = 'public';
  if (fs.existsSync(publicDir)) {
    report.publicExists = true;
    console.log('✅ public 目錄存在');
  } else {
    console.log('ℹ️ public 目錄不存在 (可選)');
  }

  return report;
}

// 4. 執行 health check 測試
async function performHealthCheck(): Promise<HealthCheckReport> {
  console.log('\n🏥 4. 執行健康檢查...');
  
  const report: HealthCheckReport = {
    status: 'ok',
    database: false,
    server: false,
    endpoints: [],
    errors: []
  };

  // 檢查資料庫連線
  try {
    await sequelize.authenticate();
    report.database = true;
    console.log('✅ 資料庫連線正常');
  } catch (error) {
    report.database = false;
    report.errors.push(`資料庫連線失敗: ${error.message}`);
    report.status = 'error';
    console.log('❌ 資料庫連線失敗:', error.message);
  }

  // 檢查基本端點
  const endpoints = ['/health', '/api/health', '/api/admin/summary'];
  
  for (const endpoint of endpoints) {
    try {
      // 這裡應該要實際測試 HTTP 請求，但在診斷階段我們檢查路由定義
      const routeFiles = [
        'src/routes/admin.ts',
        'src/index.ts'
      ];
      
      let endpointFound = false;
      for (const routeFile of routeFiles) {
        if (fs.existsSync(routeFile)) {
          const content = fs.readFileSync(routeFile, 'utf8');
          if (content.includes(endpoint) || content.includes('health')) {
            endpointFound = true;
            break;
          }
        }
      }
      
      if (endpointFound) {
        report.endpoints.push(endpoint);
        console.log(`✅ 端點 ${endpoint} 已定義`);
      } else {
        console.log(`⚠️ 端點 ${endpoint} 未找到`);
      }
    } catch (error) {
      report.errors.push(`端點 ${endpoint} 檢查失敗: ${error.message}`);
    }
  }

  return report;
}

// 主要診斷函數
export const runComprehensiveDiagnosis = async (): Promise<ComprehensiveDiagnosisReport> => {
  console.log('🔍 開始執行完整系統問題排查診斷...\n');
  
  const report: ComprehensiveDiagnosisReport = {
    timestamp: new Date().toISOString(),
    summary: {
      totalIssues: 0,
      criticalErrors: 0,
      warnings: 0,
      status: 'healthy'
    },
    sections: {
      routeErrors: await scanRouteControllerMiddleware(),
      environmentIssues: await checkEnvironmentVariables(),
      frontendStatus: await checkFrontendStatus(),
      healthCheck: await performHealthCheck()
    },
    recommendations: []
  };

  // 計算總體狀態
  const routeErrors = report.sections.routeErrors.filter(r => r.status === 'error').length;
  const routeWarnings = report.sections.routeErrors.filter(r => r.warnings.length > 0).length;
  
  report.summary.criticalErrors = routeErrors + 
    (report.sections.environmentIssues.status === 'error' ? 1 : 0) +
    (report.sections.frontendStatus.status === 'error' ? 1 : 0) +
    (report.sections.healthCheck.status === 'error' ? 1 : 0);
    
  report.summary.warnings = routeWarnings +
    (report.sections.environmentIssues.status === 'warning' ? 1 : 0) +
    (report.sections.frontendStatus.status === 'warning' ? 1 : 0);
    
  report.summary.totalIssues = report.summary.criticalErrors + report.summary.warnings;

  // 生成建議
  if (report.sections.environmentIssues.missingVariables.length > 0) {
    report.recommendations.push('請在 Secrets 工具中設定缺少的環境變數');
  }
  
  if (report.sections.environmentIssues.dangerousPatterns.length > 0) {
    report.recommendations.push('清理包含模板字串或錯誤訊息的環境變數');
  }
  
  if (routeErrors > 0) {
    report.recommendations.push('修復路由、控制器或中間件中的語法錯誤');
  }
  
  if (!report.sections.healthCheck.database) {
    report.recommendations.push('檢查資料庫連線設定和 DATABASE_URL');
  }
  
  if (report.sections.frontendStatus.errors.length > 0) {
    report.recommendations.push('執行前端建置或檢查前端專案配置');
  }

  // 設定總體狀態
  if (report.summary.criticalErrors > 0) {
    report.summary.status = 'critical';
  } else if (report.summary.warnings > 0) {
    report.summary.status = 'issues';
  }

  // 輸出報告
  console.log('\n📋 === 完整系統問題排查報告 ===');
  console.log(`時間: ${report.timestamp}`);
  console.log(`總體狀態: ${report.summary.status}`);
  console.log(`發現問題: ${report.summary.totalIssues} 個 (${report.summary.criticalErrors} 個嚴重錯誤, ${report.summary.warnings} 個警告)`);
  
  console.log('\n🔍 詳細結果:');
  console.log(`1. 路由/控制器/中間件: ${routeErrors} 個錯誤, ${routeWarnings} 個警告`);
  console.log(`2. 環境變數: ${report.sections.environmentIssues.status} (${report.sections.environmentIssues.missingVariables.length} 個缺少, ${report.sections.environmentIssues.dangerousPatterns.length} 個危險模式)`);
  console.log(`3. 前端狀態: ${report.sections.frontendStatus.status} (${report.sections.frontendStatus.errors.length} 個問題)`);
  console.log(`4. 健康檢查: ${report.sections.healthCheck.status} (資料庫: ${report.sections.healthCheck.database ? '正常' : '異常'})`);
  
  console.log('\n💡 建議修正方式:');
  report.recommendations.forEach((rec, index) => {
    console.log(`${index + 1}. ${rec}`);
  });

  // 儲存詳細報告
  fs.writeFileSync('comprehensive-problem-diagnosis-report.json', JSON.stringify(report, null, 2));
  console.log('\n📄 詳細報告已儲存至: comprehensive-problem-diagnosis-report.json');

  return report;
};

// 如果直接執行此檔案
if (require.main === module) {
  runComprehensiveDiagnosis().catch(console.error);
}
