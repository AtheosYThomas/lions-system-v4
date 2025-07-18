
import chalk from 'chalk';

interface LiffDiagnosticResult {
  component: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  suggestion?: string;
}

class LiffDiagnostics {
  private results: LiffDiagnosticResult[] = [];

  private addResult(component: string, status: 'pass' | 'fail' | 'warning', message: string, suggestion?: string) {
    this.results.push({ component, status, message, suggestion });
  }

  async runDiagnostics() {
    console.log(chalk.cyan('🔍 LIFF 系統診斷開始...'));
    
    // 檢查 LIFF App ID 設定
    this.checkLiffAppId();
    
    // 檢查 LIFF 路由
    this.checkLiffRoutes();
    
    // 檢查 LIFF Controller
    this.checkLiffController();
    
    // 輸出結果
    this.printResults();
  }

  private checkLiffAppId() {
    const fs = require('fs');
    const path = require('path');
    
    try {
      const liffHtmlPath = path.join(__dirname, '../../public/liff.html');
      const content = fs.readFileSync(liffHtmlPath, 'utf-8');
      
      const liffIdMatch = content.match(/liffId:\s*['"`]([^'"`]+)['"`]/);
      if (liffIdMatch) {
        const liffId = liffIdMatch[1];
        if (liffId === '2007739371-aKePV20l') {
          this.addResult('LIFF App ID', 'warning', 
            `使用測試 LIFF ID: ${liffId}`, 
            '請確認此 LIFF App ID 在 LINE Developers Console 中有效');
        } else {
          this.addResult('LIFF App ID', 'pass', `LIFF ID 已設定: ${liffId}`);
        }
      } else {
        this.addResult('LIFF App ID', 'fail', 'LIFF App ID 未找到', '請檢查 liff.html 中的 liffId 設定');
      }
    } catch (error) {
      this.addResult('LIFF App ID', 'fail', '無法讀取 LIFF 設定檔', '檢查 public/liff.html 是否存在');
    }
  }

  private checkLiffRoutes() {
    const fs = require('fs');
    const path = require('path');
    
    try {
      const routePath = path.join(__dirname, '../routes/api/liff.ts');
      const content = fs.readFileSync(routePath, 'utf-8');
      
      if (content.includes('/check-member') && content.includes('/register')) {
        this.addResult('LIFF Routes', 'pass', 'LIFF 路由設定完整');
      } else {
        this.addResult('LIFF Routes', 'warning', 'LIFF 路由可能不完整', '檢查 /check-member 和 /register 路由');
      }
      
      if (content.includes('try') && content.includes('catch')) {
        this.addResult('LIFF Routes Error Handling', 'pass', '錯誤處理已設定');
      } else {
        this.addResult('LIFF Routes Error Handling', 'warning', '缺少錯誤處理', '建議加入 try-catch 錯誤處理');
      }
    } catch (error) {
      this.addResult('LIFF Routes', 'fail', 'LIFF 路由檔案不存在');
    }
  }

  private checkLiffController() {
    const fs = require('fs');
    const path = require('path');
    
    try {
      const controllerPath = path.join(__dirname, '../controllers/liffController.ts');
      const content = fs.readFileSync(controllerPath, 'utf-8');
      
      if (content.includes('checkMember') && content.includes('registerMember')) {
        this.addResult('LIFF Controller', 'pass', 'LIFF Controller 方法完整');
      } else {
        this.addResult('LIFF Controller', 'warning', 'LIFF Controller 方法可能不完整');
      }
    } catch (error) {
      this.addResult('LIFF Controller', 'fail', 'LIFF Controller 不存在', '請檢查 liffController.ts 檔案');
    }
  }

  private printResults() {
    console.log(chalk.cyan('\n📊 LIFF 診斷結果:'));
    console.log('='.repeat(50));
    
    this.results.forEach(result => {
      const statusIcon = result.status === 'pass' ? '✅' : result.status === 'warning' ? '⚠️' : '❌';
      const statusColor = result.status === 'pass' ? chalk.green : result.status === 'warning' ? chalk.yellow : chalk.red;
      
      console.log(statusColor(`${statusIcon} ${result.component}: ${result.message}`));
      if (result.suggestion) {
        console.log(chalk.gray(`   💡 建議: ${result.suggestion}`));
      }
    });
    
    const passCount = this.results.filter(r => r.status === 'pass').length;
    const warningCount = this.results.filter(r => r.status === 'warning').length;
    const failCount = this.results.filter(r => r.status === 'fail').length;
    
    console.log(chalk.cyan('\n📈 統計:'));
    console.log(chalk.green(`✅ 通過: ${passCount}`));
    console.log(chalk.yellow(`⚠️ 警告: ${warningCount}`));
    console.log(chalk.red(`❌ 失敗: ${failCount}`));
  }
}

// 執行診斷
if (require.main === module) {
  const diagnostics = new LiffDiagnostics();
  diagnostics.runDiagnostics();
}

export default LiffDiagnostics;
