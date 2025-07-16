import fs from 'fs';
import path from 'path';

interface DiagnosisResult {
  timestamp: string;
  pathToRegexpIssues: string[];
  environmentVariables: {
    dangerous: string[];
    missing: string[];
    valid: string[];
  };
  routeFiles: {
    file: string;
    status: string;
    issues: string[];
  }[];
  recommendations: string[];
  severity: 'low' | 'medium' | 'high';
}

console.log('🔍 開始執行完整系統診斷...');

const diagnosis: DiagnosisResult = {
  timestamp: new Date().toISOString(),
  pathToRegexpIssues: [],
  environmentVariables: {
    dangerous: [],
    missing: [],
    valid: []
  },
  routeFiles: [],
  recommendations: [],
  severity: 'low'
};

// 1. 檢查 path-to-regexp 相關問題
console.log('🔍 檢查 path-to-regexp 相關問題...');

Object.entries(process.env).forEach(([key, value]) => {
  if (value && typeof value === 'string') {
    if (value.includes('${') && value.includes('}')) {
      diagnosis.pathToRegexpIssues.push(`未展開的模板字串: ${key}=${value}`);
      diagnosis.environmentVariables.dangerous.push(key);
    } else if (value.includes('Missing parameter')) {
      diagnosis.pathToRegexpIssues.push(`錯誤訊息殘留: ${key}=${value}`);
      diagnosis.environmentVariables.dangerous.push(key);
    } else if (value === 'undefined' || value === 'null') {
      diagnosis.pathToRegexpIssues.push(`無效值: ${key}=${value}`);
      diagnosis.environmentVariables.dangerous.push(key);
    }
  }
});

// 2. 檢查必要環境變數
console.log('🔍 檢查必要環境變數...');

const requiredVars = ['LINE_CHANNEL_ACCESS_TOKEN', 'LINE_CHANNEL_SECRET'];
requiredVars.forEach(varName => {
  const value = process.env[varName];
  if (!value || value === 'undefined' || value.includes('${')) {
    diagnosis.environmentVariables.missing.push(varName);
  } else {
    diagnosis.environmentVariables.valid.push(varName);
  }
});

// 3. 檢查路由檔案
console.log('🔍 檢查路由檔案...');

const routeFiles = [
  'src/routes/admin.ts',
  'src/routes/members.ts',
  'src/routes/events.ts',
  'src/routes/checkin.ts'
];

routeFiles.forEach(filePath => {
  const fileInfo = {
    file: filePath,
    status: 'unknown',
    issues: [] as string[]
  };

  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      fileInfo.status = 'exists';

      // 檢查常見問題
      if (content.includes('${')) {
        fileInfo.issues.push('包含未展開的模板字串');
      }
      if (content.includes(':param(*)')) {
        fileInfo.issues.push('包含非法路由參數格式');
      }
      if (!content.includes('express.Router')) {
        fileInfo.issues.push('缺少 Express Router 初始化');
      }
      if (content.includes('localhost')) {
        fileInfo.issues.push('使用 localhost 而非 0.0.0.0');
      }

      if (fileInfo.issues.length === 0) {
        fileInfo.status = 'healthy';
      } else {
        fileInfo.status = 'has_issues';
      }
    } else {
      fileInfo.status = 'missing';
      fileInfo.issues.push('檔案不存在');
    }
  } catch (error) {
    fileInfo.status = 'error';
    fileInfo.issues.push(`讀取錯誤: ${error}`);
  }

  diagnosis.routeFiles.push(fileInfo);
});

// 4. 生成建議
console.log('🔍 生成修復建議...');

if (diagnosis.pathToRegexpIssues.length > 0) {
  diagnosis.severity = 'high';
  diagnosis.recommendations.push('立即清理包含模板字串的環境變數');
  diagnosis.recommendations.push('執行「終極安全啟動」工作流程');
}

if (diagnosis.environmentVariables.missing.length > 0) {
  if (diagnosis.severity === 'low') diagnosis.severity = 'medium';
  diagnosis.recommendations.push('在 .env 檔案中設定缺少的環境變數');
}

const problematicRoutes = diagnosis.routeFiles.filter(f => f.status === 'has_issues' || f.status === 'error');
if (problematicRoutes.length > 0) {
  if (diagnosis.severity === 'low') diagnosis.severity = 'medium';
  diagnosis.recommendations.push('修復路由檔案中的問題');
}

if (diagnosis.severity === 'low') {
  diagnosis.recommendations.push('系統狀態良好，可以正常啟動');
}

// 5. 輸出診斷結果
console.log('\n📋 系統診斷報告');
console.log('='.repeat(50));
console.log(`🕐 診斷時間: ${diagnosis.timestamp}`);
console.log(`🚨 嚴重程度: ${diagnosis.severity.toUpperCase()}`);

console.log('\n🔍 path-to-regexp 問題檢查:');
if (diagnosis.pathToRegexpIssues.length === 0) {
  console.log('✅ 沒有發現 path-to-regexp 相關問題');
} else {
  diagnosis.pathToRegexpIssues.forEach(issue => console.log(`❌ ${issue}`));
}

console.log('\n🔍 環境變數檢查:');
console.log(`✅ 正常變數: ${diagnosis.environmentVariables.valid.length} 個`);
console.log(`⚠️ 缺少變數: ${diagnosis.environmentVariables.missing.length} 個`);
console.log(`🚨 危險變數: ${diagnosis.environmentVariables.dangerous.length} 個`);

if (diagnosis.environmentVariables.missing.length > 0) {
  console.log('缺少的變數:', diagnosis.environmentVariables.missing.join(', '));
}
if (diagnosis.environmentVariables.dangerous.length > 0) {
  console.log('危險的變數:', diagnosis.environmentVariables.dangerous.join(', '));
}

console.log('\n🔍 路由檔案檢查:');
diagnosis.routeFiles.forEach(file => {
  const statusIcon = file.status === 'healthy' ? '✅' : 
                    file.status === 'has_issues' ? '⚠️' : 
                    file.status === 'missing' ? '❌' : '🚨';
  console.log(`${statusIcon} ${file.file}: ${file.status}`);
  if (file.issues.length > 0) {
    file.issues.forEach(issue => console.log(`    - ${issue}`));
  }
});

console.log('\n💡 修復建議:');
diagnosis.recommendations.forEach((rec, index) => {
  console.log(`${index + 1}. ${rec}`);
});

// 6. 保存診斷報告到檔案
const reportPath = 'system-diagnosis-report.json';
try {
  fs.writeFileSync(reportPath, JSON.stringify(diagnosis, null, 2));
  console.log(`\n📁 詳細報告已保存到: ${reportPath}`);
} catch (error) {
  console.log(`⚠️ 無法保存報告檔案: ${error}`);
}

console.log('\n' + '='.repeat(50));
console.log('📋 診斷完成！');

// 根據嚴重程度決定退出碼
process.exit(diagnosis.severity === 'high' ? 1 : 0);