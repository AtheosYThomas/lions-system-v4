import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { globSync } from 'glob';
import chalk from 'chalk';
import { execSync } from 'child_process';
import http from 'http';
import { runSystemHealthCheck } from './systemHealth';

interface IssueReport {
  category: string;
  severity: 'high' | 'medium' | 'low';
  issue: string;
  details: string;
  suggestion: string;
  status: 'error' | 'warning' | 'info';
}

class DetailedTroubleshootReport {
  private issues: IssueReport[] = [];
  
  private addIssue(category: string, severity: 'high' | 'medium' | 'low', issue: string, details: string, suggestion: string, status: 'error' | 'warning' | 'info' = 'error') {
    this.issues.push({ category, severity, issue, details, suggestion, status });
  }

  async generateCompleteReport() {
    console.log(chalk.cyan('🔍 北大獅子會系統完整問題排查報告'));
    console.log(chalk.cyan('=' .repeat(80)));

    await this.step1_ScanSourceCode();
    await this.step2_CheckEnvironmentVariables();
    await this.step3_CheckFrontendFiles();
    await this.step4_RunHealthCheck();
    await this.step5_GenerateReport();
  }

  // 步驟 1: 掃描源碼
  private async step1_ScanSourceCode() {
    console.log(chalk.yellow('\n📁 步驟 1: 掃描 /src 目錄錯誤...'));
    
    const patterns = [
      { pattern: 'src/routes/**/*.ts', type: 'Routes' },
      { pattern: 'src/controllers/**/*.ts', type: 'Controllers' },
      { pattern: 'src/middleware/**/*.ts', type: 'Middleware' }
    ];

    // TypeScript 編譯檢查
    try {
      execSync('npx tsc --noEmit --skipLibCheck', { stdio: 'pipe' });
      console.log(chalk.green('✅ TypeScript 編譯成功'));
    } catch (error: any) {
      const errorOutput = error.stdout?.toString() || error.stderr?.toString();
      this.addIssue('TypeScript編譯', 'high', 'TypeScript 編譯錯誤', errorOutput, '修正 TypeScript 語法錯誤', 'error');
      console.log(chalk.red('❌ TypeScript 編譯錯誤'));
    }

    // 掃描各類檔案
    patterns.forEach(({ pattern, type }) => {
      const files = globSync(pattern);
      console.log(chalk.cyan(`📋 掃描 ${type}: ${files.length} 個檔案`));
      
      files.forEach(file => {
        try {
          const content = fs.readFileSync(file, 'utf-8');
          
          // 檢查常見問題
          if (content.includes('async') && !content.includes('try') && !content.includes('catch')) {
            this.addIssue(type, 'medium', `${file} 缺少錯誤處理`, 'async 函數未包含 try-catch', '加入適當的錯誤處理', 'warning');
          }
          
          if (content.includes('process.env.') && !content.includes('dotenv')) {
            this.addIssue(type, 'low', `${file} 使用環境變數但未載入 dotenv`, '可能導致環境變數未正確載入', '確認 dotenv 已在主程式載入', 'info');
          }
          
        } catch (error: any) {
          this.addIssue(type, 'high', `${file} 檔案讀取錯誤`, error.message, '檢查檔案權限和完整性', 'error');
        }
      });
    });
  }

  // 步驟 2: 檢查環境變數
  private async step2_CheckEnvironmentVariables() {
    console.log(chalk.yellow('\n🔧 步驟 2: 檢查環境變數...'));
    
    const envPath = path.resolve('.env');
    if (!fs.existsSync(envPath)) {
      this.addIssue('環境變數', 'high', '缺少 .env 檔案', '系統無法載入環境變數', '建立 .env 檔案並設定必要變數', 'error');
      return;
    }

    const envVars = dotenv.parse(fs.readFileSync(envPath));
    const requiredVars = ['LINE_CHANNEL_ACCESS_TOKEN', 'LINE_CHANNEL_SECRET', 'DATABASE_URL', 'PORT'];
    
    const missingVars = requiredVars.filter(varName => !envVars[varName]);
    if (missingVars.length > 0) {
      this.addIssue('環境變數', 'high', '缺少必要環境變數', missingVars.join(', '), '在 .env 檔案中設定這些變數', 'error');
    } else {
      console.log(chalk.green('✅ 所有必要環境變數已設定'));
    }
  }

  // 步驟 3: 檢查前端檔案
  private async step3_CheckFrontendFiles() {
    console.log(chalk.yellow('\n🎨 步驟 3: 檢查前端檔案...'));
    
    // 檢查 public 目錄
    const publicDir = 'public';
    if (fs.existsSync(publicDir)) {
      const htmlFiles = globSync(`${publicDir}/**/*.html`);
      console.log(chalk.cyan(`📋 找到 ${htmlFiles.length} 個 HTML 檔案`));
      
      htmlFiles.forEach(file => {
        try {
          const content = fs.readFileSync(file, 'utf-8');
          
          // 檢查 LIFF 相關檔案
          if (file.includes('liff.html')) {
            if (!content.includes('liff.init')) {
              this.addIssue('前端LIFF', 'high', 'LIFF 初始化程式碼缺失', `${file} 缺少 liff.init()`, '加入正確的 LIFF 初始化程式碼', 'error');
            }
            
            // 檢查 LIFF App ID
            const liffIdMatch = content.match(/liff\.init\(\s*{\s*liffId:\s*['"]([^'"]+)['"]/);
            if (!liffIdMatch) {
              this.addIssue('前端LIFF', 'high', 'LIFF App ID 未設定', `${file} 缺少 LIFF App ID`, '設定正確的 LIFF App ID', 'error');
            }
          }
          
        } catch (error: any) {
          this.addIssue('前端檔案', 'medium', `${file} 讀取錯誤`, error.message, '檢查檔案權限', 'error');
        }
      });
    }

    // 檢查 client 目錄
    const clientDir = 'client';
    if (fs.existsSync(clientDir)) {
      console.log(chalk.cyan('📋 檢查 React 前端...'));
      
      try {
        const packageJsonPath = path.join(clientDir, 'package.json');
        if (fs.existsSync(packageJsonPath)) {
          const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
          console.log(chalk.green(`✅ 前端專案: ${packageJson.name}`));
        }
      } catch (error: any) {
        this.addIssue('前端專案', 'medium', '前端 package.json 讀取錯誤', error.message, '檢查前端專案配置', 'warning');
      }
    }
  }

  // 步驟 4: 執行 Health Check
  private async step4_RunHealthCheck() {
    console.log(chalk.yellow('\n🏥 步驟 4: 執行 Health Check...'));
    
    const PORT = process.env.PORT || 5000;
    
    return new Promise<void>((resolve) => {
      const req = http.get(`http://0.0.0.0:${PORT}/health`, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          try {
            const healthData = JSON.parse(data);
            
            if (res.statusCode === 200) {
              console.log(chalk.green('✅ Health Check 成功'));
              console.log(chalk.cyan(`📊 狀態: ${healthData.status}`));
              console.log(chalk.cyan(`🔌 資料庫: ${healthData.database}`));
              console.log(chalk.cyan(`🛣️ 路由: ${healthData.services?.routes?.join(', ')}`));
              
              // 檢查 LIFF 相關錯誤
              if (healthData.services?.liff !== 'configured') {
                this.addIssue('LIFF服務', 'high', 'LIFF 服務未正確配置', 'Health Check 顯示 LIFF 服務狀態異常', '檢查 LIFF 應用程式設定', 'error');
              }
              
            } else {
              this.addIssue('Health Check', 'high', 'Health Check 回應異常', `狀態碼: ${res.statusCode}`, '檢查伺服器狀態', 'error');
            }
          } catch (error: any) {
            this.addIssue('Health Check', 'medium', 'Health Check 回應格式錯誤', data, '檢查 health 端點實作', 'warning');
          }
          resolve();
        });
      });
      
      req.on('error', (error) => {
        this.addIssue('Health Check', 'high', 'Health Check 連線失敗', error.message, '確認伺服器是否運行', 'error');
        resolve();
      });
      
      req.setTimeout(5000, () => {
        this.addIssue('Health Check', 'high', 'Health Check 逾時', '5秒逾時', '檢查伺服器回應時間', 'error');
        req.destroy();
        resolve();
      });
    });
  }

  // 步驟 5: 生成報告
  private async step5_GenerateReport() {
    console.log(chalk.cyan('\n📋 步驟 5: 生成完整報告...'));
    console.log(chalk.cyan('=' .repeat(80)));

    const errorIssues = this.issues.filter(issue => issue.status === 'error');
    const warningIssues = this.issues.filter(issue => issue.status === 'warning');
    const infoIssues = this.issues.filter(issue => issue.status === 'info');

    console.log(chalk.red(`\n🚨 嚴重錯誤 (${errorIssues.length}個):`));
    errorIssues.forEach((issue, index) => {
      console.log(chalk.red(`${index + 1}. [${issue.category}] ${issue.issue}`));
      console.log(chalk.gray(`   詳細: ${issue.details}`));
      console.log(chalk.yellow(`   建議: ${issue.suggestion}`));
      console.log('');
    });

    console.log(chalk.yellow(`\n⚠️ 警告事項 (${warningIssues.length}個):`));
    warningIssues.forEach((issue, index) => {
      console.log(chalk.yellow(`${index + 1}. [${issue.category}] ${issue.issue}`));
      console.log(chalk.gray(`   詳細: ${issue.details}`));
      console.log(chalk.yellow(`   建議: ${issue.suggestion}`));
      console.log('');
    });

    console.log(chalk.cyan(`\n💡 資訊提示 (${infoIssues.length}個):`));
    infoIssues.forEach((issue, index) => {
      console.log(chalk.cyan(`${index + 1}. [${issue.category}] ${issue.issue}`));
      console.log(chalk.gray(`   詳細: ${issue.details}`));
      console.log(chalk.yellow(`   建議: ${issue.suggestion}`));
      console.log('');
    });

    // 系統健康度評分
    const totalIssues = this.issues.length;
    const criticalIssues = errorIssues.length;
    const healthScore = Math.max(0, 100 - (criticalIssues * 20) - (warningIssues.length * 10) - (infoIssues.length * 5));
    
    console.log(chalk.cyan('\n📊 系統健康度評分:'));
    let scoreColor = chalk.red;
    if (healthScore >= 80) scoreColor = chalk.green;
    else if (healthScore >= 60) scoreColor = chalk.yellow;
    
    console.log(scoreColor(`${healthScore}% (${criticalIssues} 個嚴重問題)`));

    // 優先修正建議
    console.log(chalk.cyan('\n🔧 優先修正建議:'));
    if (errorIssues.length > 0) {
      console.log(chalk.red('1. 立即修正所有嚴重錯誤'));
      errorIssues.slice(0, 3).forEach(issue => {
        console.log(chalk.red(`   • ${issue.suggestion}`));
      });
    }
    
    if (warningIssues.length > 0) {
      console.log(chalk.yellow('2. 處理重要警告'));
      warningIssues.slice(0, 2).forEach(issue => {
        console.log(chalk.yellow(`   • ${issue.suggestion}`));
      });
    }

    // 儲存報告到檔案
    const reportData = {
      timestamp: new Date().toISOString(),
      summary: {
        totalIssues,
        errors: errorIssues.length,
        warnings: warningIssues.length,
        info: infoIssues.length,
        healthScore
      },
      issues: this.issues
    };

    fs.writeFileSync('detailed_troubleshoot_report.json', JSON.stringify(reportData, null, 2));
    console.log(chalk.green('\n✅ 報告已儲存至 detailed_troubleshoot_report.json'));
    
    console.log(chalk.cyan('=' .repeat(80)));
  }
}

// 執行詳細問題排查
const reporter = new DetailedTroubleshootReport();
reporter.generateCompleteReport().catch(console.error);

export function generateDetailedReport() {
  console.log(chalk.cyan('🔍 生成詳細診斷報告...'));

  const report = {
    timestamp: new Date().toISOString(),
    system: {
      node_version: process.version,
      platform: process.platform,
      arch: process.arch,
      memory: process.memoryUsage()
    },
    environment: {
      DATABASE_URL: process.env.DATABASE_URL ? '已設定' : '未設定',
      LINE_CHANNEL_ACCESS_TOKEN: process.env.LINE_CHANNEL_ACCESS_TOKEN ? '已設定' : '未設定',
      LINE_CHANNEL_SECRET: process.env.LINE_CHANNEL_SECRET ? '已設定' : '未設定',
      LIFF_ID: process.env.LIFF_ID ? '已設定' : '未設定'
    },
    files: {
      src_exists: fs.existsSync('src'),
      models_exists: fs.existsSync('src/models'),
      routes_exists: fs.existsSync('src/routes'),
      controllers_exists: fs.existsSync('src/controllers')
    }
  };

  const reportPath = path.join(process.cwd(), 'detailed_troubleshoot_report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  console.log(chalk.green(`✅ 詳細診斷報告已生成: ${reportPath}`));
  return report;
}