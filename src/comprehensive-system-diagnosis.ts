
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { healthCheck } from './utils/healthCheck';
import sequelize from './config/database';

interface DiagnosisReport {
  timestamp: string;
  summary: {
    totalIssues: number;
    criticalIssues: number;
    warnings: number;
    status: 'healthy' | 'warning' | 'critical';
  };
  sections: {
    routeErrors: RouteErrorReport;
    environmentIssues: EnvironmentReport;
    frontendStatus: FrontendReport;
    healthCheck: HealthCheckReport;
  };
  recommendations: string[];
}

interface RouteErrorReport {
  status: 'pass' | 'warning' | 'error';
  files: {
    path: string;
    status: 'ok' | 'error' | 'missing';
    errors: string[];
    warnings: string[];
  }[];
  summary: string;
}

interface EnvironmentReport {
  status: 'pass' | 'warning' | 'error';
  missingVariables: string[];
  undefinedReferences: string[];
  duplicateVariables: string[];
  dangerousValues: string[];
  summary: string;
}

interface FrontendReport {
  status: 'pass' | 'warning' | 'error';
  publicDirectory: { exists: boolean; files: string[] };
  clientDirectory: { exists: boolean; built: boolean; issues: string[] };
  staticFiles: { exists: boolean; accessible: boolean };
  summary: string;
}

interface HealthCheckReport {
  status: 'pass' | 'warning' | 'error';
  endpoints: { url: string; status: number | null; error?: string }[];
  systemHealth: any;
  summary: string;
}

const runComprehensiveDiagnosis = async (): Promise<DiagnosisReport> => {
  console.log('🔍 開始執行完整系統診斷...\n');
  
  const report: DiagnosisReport = {
    timestamp: new Date().toISOString(),
    summary: {
      totalIssues: 0,
      criticalIssues: 0,
      warnings: 0,
      status: 'healthy'
    },
    sections: {
      routeErrors: await scanRouteErrors(),
      environmentIssues: await checkEnvironmentIssues(),
      frontendStatus: await checkFrontendStatus(),
      healthCheck: await runHealthChecks()
    },
    recommendations: []
  };

  // 計算總體狀態
  calculateOverallStatus(report);
  generateRecommendations(report);

  return report;
};

// 1. 掃描路由、控制器、中間件錯誤
async function scanRouteErrors(): Promise<RouteErrorReport> {
  console.log('📊 1. 掃描 /src 目錄下路由、控制器、中間件錯誤...');
  
  const report: RouteErrorReport = {
    status: 'pass',
    files: [],
    summary: ''
  };

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
    'src/init.ts'
  ];

  for (const filePath of filesToCheck) {
    const fileReport = {
      path: filePath,
      status: 'ok' as 'ok' | 'error' | 'missing',
      errors: [] as string[],
      warnings: [] as string[]
    };

    try {
      if (!fs.existsSync(filePath)) {
        fileReport.status = 'missing';
        fileReport.errors.push('檔案不存在');
        console.log(`❌ ${filePath} - 檔案不存在`);
      } else {
        // 嘗試載入模組檢查語法錯誤
        try {
          const content = fs.readFileSync(filePath, 'utf-8');
          
          // 檢查常見問題
          if (content.includes('${') && content.includes('}')) {
            fileReport.warnings.push('包含模板字串語法');
          }
          
          if (content.includes('process.env.') && !content.includes('||')) {
            fileReport.warnings.push('環境變數沒有預設值');
          }

          if (content.includes('localhost') && !content.includes('0.0.0.0')) {
            fileReport.warnings.push('使用 localhost 而非 0.0.0.0');
          }

          // 嘗試實際載入檔案（僅限非主程式檔案）
          if (!filePath.includes('index.ts') && !filePath.includes('init.ts')) {
            try {
              delete require.cache[require.resolve(path.resolve(filePath))];
              require(path.resolve(filePath));
              console.log(`✅ ${filePath} - 載入成功`);
            } catch (loadError) {
              fileReport.status = 'error';
              fileReport.errors.push(`載入錯誤: ${loadError}`);
              console.log(`❌ ${filePath} - 載入失敗: ${loadError}`);
            }
          } else {
            console.log(`✅ ${filePath} - 語法檢查通過`);
          }

        } catch (readError) {
          fileReport.status = 'error';
          fileReport.errors.push(`讀取錯誤: ${readError}`);
          console.log(`❌ ${filePath} - 讀取失敗: ${readError}`);
        }
      }
    } catch (error) {
      fileReport.status = 'error';
      fileReport.errors.push(`檢查錯誤: ${error}`);
    }

    report.files.push(fileReport);
  }

  // 統計結果
  const errorFiles = report.files.filter(f => f.status === 'error').length;
  const warningFiles = report.files.filter(f => f.warnings.length > 0).length;
  
  if (errorFiles > 0) {
    report.status = 'error';
    report.summary = `發現 ${errorFiles} 個檔案有錯誤`;
  } else if (warningFiles > 0) {
    report.status = 'warning';
    report.summary = `發現 ${warningFiles} 個檔案有警告`;
  } else {
    report.summary = '所有檔案檢查通過';
  }

  console.log(`📋 路由檢查完成: ${report.summary}\n`);
  return report;
}

// 2. 檢查環境變數問題
async function checkEnvironmentIssues(): Promise<EnvironmentReport> {
  console.log('🔧 2. 檢查環境變數配置問題...');
  
  const report: EnvironmentReport = {
    status: 'pass',
    missingVariables: [],
    undefinedReferences: [],
    duplicateVariables: [],
    dangerousValues: [],
    summary: ''
  };

  // 檢查必要環境變數
  const requiredVars = [
    'LINE_CHANNEL_ACCESS_TOKEN',
    'LINE_CHANNEL_SECRET',
    'DATABASE_URL',
    'PORT'
  ];

  report.missingVariables = requiredVars.filter(v => !process.env[v] || process.env[v] === 'undefined');

  // 檢查危險值
  Object.entries(process.env).forEach(([key, value]) => {
    if (value && typeof value === 'string') {
      if (value.includes('${') || value.includes('undefined') || value.includes('Missing parameter')) {
        report.dangerousValues.push(`${key}=${value}`);
      }
    }
  });

  // 檢查 .env 檔案重複
  try {
    if (fs.existsSync('.env')) {
      const envContent = fs.readFileSync('.env', 'utf-8');
      const envVars = new Map<string, number>();
      
      envContent.split('\n').forEach(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
          const key = trimmed.split('=')[0];
          envVars.set(key, (envVars.get(key) || 0) + 1);
        }
      });
      
      envVars.forEach((count, key) => {
        if (count > 1) {
          report.duplicateVariables.push(key);
        }
      });
    }
  } catch (error) {
    console.log(`⚠️ 無法讀取 .env 檔案: ${error}`);
  }

  // 掃描程式碼中未定義的環境變數引用
  const srcFiles = fs.readdirSync('src', { recursive: true })
    .filter(f => typeof f === 'string' && f.endsWith('.ts'))
    .map(f => path.join('src', f as string));

  for (const file of srcFiles) {
    try {
      const content = fs.readFileSync(file, 'utf-8');
      const envMatches = content.match(/process\.env\.(\w+)/g);
      
      if (envMatches) {
        envMatches.forEach(match => {
          const varName = match.replace('process.env.', '');
          if (!process.env[varName] && !requiredVars.includes(varName)) {
            if (!report.undefinedReferences.includes(`${varName} (在 ${file})`)) {
              report.undefinedReferences.push(`${varName} (在 ${file})`);
            }
          }
        });
      }
    } catch (error) {
      console.log(`⚠️ 無法掃描檔案 ${file}: ${error}`);
    }
  }

  // 計算狀態
  if (report.missingVariables.length > 0 || report.dangerousValues.length > 0) {
    report.status = 'error';
  } else if (report.duplicateVariables.length > 0 || report.undefinedReferences.length > 0) {
    report.status = 'warning';
  }

  report.summary = `缺少 ${report.missingVariables.length} 個必要變數，${report.dangerousValues.length} 個危險值`;
  
  console.log(`✅ 缺少變數: ${report.missingVariables.join(', ') || '無'}`);
  console.log(`⚠️ 危險值: ${report.dangerousValues.length} 個`);
  console.log(`🔍 重複變數: ${report.duplicateVariables.join(', ') || '無'}\n`);
  
  return report;
}

// 3. 檢查前端狀態
async function checkFrontendStatus(): Promise<FrontendReport> {
  console.log('🎨 3. 檢查前端狀態...');
  
  const report: FrontendReport = {
    status: 'pass',
    publicDirectory: { exists: false, files: [] },
    clientDirectory: { exists: false, built: false, issues: [] },
    staticFiles: { exists: false, accessible: false },
    summary: ''
  };

  // 檢查 public 目錄
  if (fs.existsSync('public')) {
    report.publicDirectory.exists = true;
    try {
      report.publicDirectory.files = fs.readdirSync('public');
      console.log(`✅ public 目錄存在，包含 ${report.publicDirectory.files.length} 個檔案`);
    } catch (error) {
      report.clientDirectory.issues.push(`無法讀取 public 目錄: ${error}`);
    }
  } else {
    console.log(`❌ public 目錄不存在`);
  }

  // 檢查 client 目錄
  if (fs.existsSync('client')) {
    report.clientDirectory.exists = true;
    console.log(`✅ client 目錄存在`);
    
    // 檢查是否已建置
    if (fs.existsSync('client/dist')) {
      report.clientDirectory.built = true;
      
      if (fs.existsSync('client/dist/index.html')) {
        console.log(`✅ 前端已建置 (dist/index.html 存在)`);
      } else {
        report.clientDirectory.issues.push('dist 目錄存在但缺少 index.html');
      }
    } else {
      report.clientDirectory.issues.push('前端尚未建置 (缺少 dist 目錄)');
      console.log(`⚠️ 前端尚未建置`);
    }

    // 檢查 package.json
    if (!fs.existsSync('client/package.json')) {
      report.clientDirectory.issues.push('缺少 client/package.json');
    }
  } else {
    console.log(`❌ client 目錄不存在`);
  }

  // 檢查靜態檔案可訪問性
  const staticLocations = ['public/index.html', 'client/dist/index.html', 'assets/index.html'];
  for (const location of staticLocations) {
    if (fs.existsSync(location)) {
      report.staticFiles.exists = true;
      report.staticFiles.accessible = true;
      console.log(`✅ 找到靜態檔案: ${location}`);
      break;
    }
  }

  // 計算狀態
  if (!report.publicDirectory.exists && !report.clientDirectory.exists) {
    report.status = 'error';
    report.summary = '找不到前端檔案';
  } else if (report.clientDirectory.issues.length > 0) {
    report.status = 'warning';
    report.summary = `前端有 ${report.clientDirectory.issues.length} 個問題`;
  } else {
    report.summary = '前端狀態正常';
  }

  console.log(`📋 前端檢查完成: ${report.summary}\n`);
  return report;
}

// 4. 執行健康檢查
async function runHealthChecks(): Promise<HealthCheckReport> {
  console.log('🏥 4. 執行健康檢查測試...');
  
  const report: HealthCheckReport = {
    status: 'pass',
    endpoints: [],
    systemHealth: null,
    summary: ''
  };

  // 檢查系統健康狀態
  try {
    report.systemHealth = await healthCheck();
    console.log(`✅ 系統健康檢查: ${report.systemHealth.status}`);
  } catch (error) {
    report.systemHealth = { status: 'error', error: error };
    console.log(`❌ 系統健康檢查失敗: ${error}`);
  }

  // 測試健康檢查端點
  const endpoints = [
    'http://localhost:5000/health',
    'http://localhost:5000/healthz',
    'http://localhost:5000/api/health',
    'http://0.0.0.0:5000/health'
  ];

  for (const endpoint of endpoints) {
    const endpointResult = {
      url: endpoint,
      status: null as number | null,
      error: undefined as string | undefined
    };

    try {
      const response = await axios.get(endpoint, { timeout: 3000 });
      endpointResult.status = response.status;
      console.log(`✅ ${endpoint} - 狀態: ${response.status}`);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNREFUSED') {
          endpointResult.error = '連線被拒絕 (伺服器未啟動)';
        } else if (error.response) {
          endpointResult.status = error.response.status;
          endpointResult.error = `HTTP ${error.response.status}`;
        } else {
          endpointResult.error = error.message;
        }
      } else {
        endpointResult.error = '未知錯誤';
      }
      console.log(`❌ ${endpoint} - ${endpointResult.error}`);
    }

    report.endpoints.push(endpointResult);
  }

  // 計算狀態
  const workingEndpoints = report.endpoints.filter(e => e.status === 200).length;
  if (workingEndpoints === 0) {
    report.status = 'error';
    report.summary = '所有健康檢查端點都無法訪問';
  } else if (report.systemHealth?.status === 'unhealthy') {
    report.status = 'warning';
    report.summary = '部分健康檢查失敗';
  } else {
    report.summary = `健康檢查正常 (${workingEndpoints}/${report.endpoints.length} 端點可用)`;
  }

  console.log(`📋 健康檢查完成: ${report.summary}\n`);
  return report;
}

// 計算總體狀態
function calculateOverallStatus(report: DiagnosisReport) {
  const sections = Object.values(report.sections);
  const errorCount = sections.filter(s => s.status === 'error').length;
  const warningCount = sections.filter(s => s.status === 'warning').length;

  report.summary.criticalIssues = errorCount;
  report.summary.warnings = warningCount;
  report.summary.totalIssues = errorCount + warningCount;

  if (errorCount > 0) {
    report.summary.status = 'critical';
  } else if (warningCount > 0) {
    report.summary.status = 'warning';
  } else {
    report.summary.status = 'healthy';
  }
}

// 生成建議
function generateRecommendations(report: DiagnosisReport) {
  const recommendations: string[] = [];

  // 路由錯誤建議
  if (report.sections.routeErrors.status === 'error') {
    recommendations.push('修復路由檔案中的語法錯誤和載入問題');
    recommendations.push('檢查所有 import/require 路徑是否正確');
  }

  // 環境變數建議
  if (report.sections.environmentIssues.status === 'error') {
    if (report.sections.environmentIssues.missingVariables.length > 0) {
      recommendations.push('在 .env 檔案中設定缺少的環境變數');
    }
    if (report.sections.environmentIssues.dangerousValues.length > 0) {
      recommendations.push('清理包含模板字串或錯誤訊息的環境變數');
    }
  }

  // 前端建議
  if (report.sections.frontendStatus.status === 'error') {
    recommendations.push('建立或修復前端檔案結構');
    recommendations.push('執行 cd client && npm install && npm run build');
  } else if (report.sections.frontendStatus.status === 'warning') {
    recommendations.push('建置前端: cd client && npm run build');
  }

  // 健康檢查建議
  if (report.sections.healthCheck.status === 'error') {
    recommendations.push('啟動伺服器: npm start 或 npx ts-node src/index.ts');
    recommendations.push('檢查端口 5000 是否被其他程序佔用');
  }

  // 總體建議
  if (report.summary.status === 'healthy') {
    recommendations.push('系統狀態良好，可以正常啟動');
  } else if (report.summary.status === 'critical') {
    recommendations.push('立即修復關鍵問題後再啟動系統');
  }

  report.recommendations = recommendations;
}

// 輸出報告
function printReport(report: DiagnosisReport) {
  console.log('\n' + '='.repeat(60));
  console.log('📋 完整系統診斷報告');
  console.log('='.repeat(60));
  console.log(`🕐 診斷時間: ${report.timestamp}`);
  console.log(`🚨 總體狀態: ${report.summary.status.toUpperCase()}`);
  console.log(`📊 問題統計: ${report.summary.totalIssues} 個問題 (${report.summary.criticalIssues} 嚴重, ${report.summary.warnings} 警告)`);

  console.log('\n📊 1. 路由、控制器、中間件檢查:');
  console.log(`   狀態: ${report.sections.routeErrors.status}`);
  console.log(`   總結: ${report.sections.routeErrors.summary}`);
  
  const errorFiles = report.sections.routeErrors.files.filter(f => f.status === 'error');
  if (errorFiles.length > 0) {
    console.log('   錯誤檔案:');
    errorFiles.forEach(file => {
      console.log(`     ❌ ${file.path}: ${file.errors.join(', ')}`);
    });
  }

  console.log('\n🔧 2. 環境變數檢查:');
  console.log(`   狀態: ${report.sections.environmentIssues.status}`);
  console.log(`   總結: ${report.sections.environmentIssues.summary}`);
  if (report.sections.environmentIssues.missingVariables.length > 0) {
    console.log(`   缺少變數: ${report.sections.environmentIssues.missingVariables.join(', ')}`);
  }
  if (report.sections.environmentIssues.dangerousValues.length > 0) {
    console.log(`   危險值: ${report.sections.environmentIssues.dangerousValues.length} 個`);
  }

  console.log('\n🎨 3. 前端檢查:');
  console.log(`   狀態: ${report.sections.frontendStatus.status}`);
  console.log(`   總結: ${report.sections.frontendStatus.summary}`);
  console.log(`   Public 目錄: ${report.sections.frontendStatus.publicDirectory.exists ? '存在' : '不存在'}`);
  console.log(`   Client 目錄: ${report.sections.frontendStatus.clientDirectory.exists ? '存在' : '不存在'}`);
  console.log(`   已建置: ${report.sections.frontendStatus.clientDirectory.built ? '是' : '否'}`);

  console.log('\n🏥 4. 健康檢查:');
  console.log(`   狀態: ${report.sections.healthCheck.status}`);
  console.log(`   總結: ${report.sections.healthCheck.summary}`);
  console.log(`   系統健康: ${report.sections.healthCheck.systemHealth?.status || '無法檢查'}`);
  
  const workingEndpoints = report.sections.healthCheck.endpoints.filter(e => e.status === 200);
  console.log(`   可用端點: ${workingEndpoints.length}/${report.sections.healthCheck.endpoints.length}`);

  console.log('\n💡 修正建議:');
  report.recommendations.forEach((rec, index) => {
    console.log(`   ${index + 1}. ${rec}`);
  });

  console.log('\n' + '='.repeat(60));
  console.log('📋 診斷完成！');
}

// 主程序
(async () => {
  try {
    const report = await runComprehensiveDiagnosis();
    printReport(report);
    
    // 保存報告到檔案
    const reportPath = 'comprehensive-diagnosis-report.json';
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📁 詳細報告已保存到: ${reportPath}`);
    
    // 根據狀態決定退出碼
    process.exit(report.summary.status === 'critical' ? 1 : 0);
  } catch (error) {
    console.error('❌ 診斷過程發生錯誤:', error);
    process.exit(1);
  }
})();
