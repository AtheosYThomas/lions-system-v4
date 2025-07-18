
import chalk from 'chalk';

interface LiffDiagnosticResult {
  component: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  suggestion?: string;
}

export class LiffDiagnostics {
  private results: LiffDiagnosticResult[] = [];

  private addResult(component: string, status: 'pass' | 'fail' | 'warning', message: string, suggestion?: string) {
    this.results.push({ component, status, message, suggestion });
  }

  async runDiagnostics() {
    console.log(chalk.cyan('🔍 LIFF 系統診斷開始...'));
    
    await this.checkLiffConfig();
    await this.checkLiffHtml();
    await this.checkLineConfig();
    
    this.generateReport();
  }

  private async checkLiffConfig() {
    console.log(chalk.yellow('📱 檢查 LIFF 配置...'));
    
    // 檢查環境變數
    const liffId = process.env.LIFF_APP_ID;
    
    if (!liffId) {
      this.addResult('LIFF Config', 'fail', 
        'LIFF App ID 未設定',
        '請在 .env 檔案中設定 LIFF_APP_ID'
      );
      return;
    }
    
    this.addResult('LIFF Config', 'pass', 
      `LIFF App ID 已設定: ${liffId}`
    );
    
    // 測試 LIFF 端點可用性
    try {
      const testResponse = await fetch(`https://liff.line.me/${liffId}`);
      
      if (testResponse.status === 404) {
        this.addResult('LIFF Config', 'fail', 
          'LIFF App ID 無效 (404)',
          '請檢查 LINE Developers Console 中的 LIFF 設定'
        );
      } else if (testResponse.status === 403) {
        this.addResult('LIFF Config', 'fail', 
          'LIFF App 權限不足 (403)',
          '請檢查 LIFF 應用程式是否已啟用'
        );
      } else if (testResponse.ok || testResponse.status === 400) {
        // 400 是正常的，因為我們沒有提供有效的請求參數
        this.addResult('LIFF Config', 'pass', 'LIFF 端點可訪問');
      } else {
        this.addResult('LIFF Config', 'warning', 
          `LIFF 端點回應異常 (${testResponse.status})`,
          '請檢查 LIFF 設定或網路連接'
        );
      }
    } catch (error) {
      this.addResult('LIFF Config', 'warning', 
        'LIFF 端點測試失敗',
        '請檢查網路連接或 LIFF 設定'
      );
    }
  }

  private async checkLiffHtml() {
    console.log(chalk.yellow('🌐 檢查 LIFF HTML 檔案...'));
    
    const fs = require('fs');
    const path = require('path');
    
    try {
      const liffHtmlPath = path.join(__dirname, '../../public/liff.html');
      const content = fs.readFileSync(liffHtmlPath, 'utf8');
      
      if (content.includes('liff.init')) {
        this.addResult('LIFF HTML', 'pass', 'LIFF 初始化程式碼存在');
      } else {
        this.addResult('LIFF HTML', 'fail', 'LIFF 初始化程式碼缺失');
      }
      
      if (content.includes('2007739371-aKePV20l')) {
        this.addResult('LIFF HTML', 'warning', 
          'LIFF App ID 硬編碼在 HTML 中',
          '建議使用環境變數管理 LIFF App ID'
        );
      }
      
    } catch (error) {
      this.addResult('LIFF HTML', 'fail', 
        'LIFF HTML 檔案讀取失敗',
        '檢查 public/liff.html 是否存在'
      );
    }
  }

  private async checkLineConfig() {
    console.log(chalk.yellow('🔧 檢查 LINE 設定...'));
    
    const accessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;
    const channelSecret = process.env.LINE_CHANNEL_SECRET;
    
    if (accessToken && channelSecret) {
      this.addResult('LINE Config', 'pass', 'LINE 頻道設定完整');
    } else {
      this.addResult('LINE Config', 'fail', 
        'LINE 頻道設定不完整',
        '檢查環境變數 LINE_CHANNEL_ACCESS_TOKEN 和 LINE_CHANNEL_SECRET'
      );
    }
  }

  private generateReport() {
    console.log(chalk.cyan('\n📊 LIFF 診斷報告'));
    console.log(chalk.cyan('=' .repeat(50)));
    
    const passCount = this.results.filter(r => r.status === 'pass').length;
    const warningCount = this.results.filter(r => r.status === 'warning').length;
    const failCount = this.results.filter(r => r.status === 'fail').length;
    
    this.results.forEach(result => {
      const icon = result.status === 'pass' ? '✅' : 
                   result.status === 'warning' ? '⚠️' : '❌';
      const color = result.status === 'pass' ? chalk.green : 
                    result.status === 'warning' ? chalk.yellow : chalk.red;
      
      console.log(color(`${icon} [${result.component}] ${result.message}`));
      if (result.suggestion) {
        console.log(chalk.gray(`   💡 建議: ${result.suggestion}`));
      }
    });
    
    console.log(chalk.cyan('\n📈 統計:'));
    console.log(chalk.green(`✅ 通過: ${passCount}`));
    console.log(chalk.yellow(`⚠️ 警告: ${warningCount}`));
    console.log(chalk.red(`❌ 失敗: ${failCount}`));
    
    if (failCount > 0) {
      console.log(chalk.red('\n🚨 發現嚴重問題，請優先處理失敗項目'));
    } else if (warningCount > 0) {
      console.log(chalk.yellow('\n⚠️ 有警告項目，建議檢查'));
    } else {
      console.log(chalk.green('\n🎉 所有檢查都通過！'));
    }
  }
}

async function main() {
  const diagnostics = new LiffDiagnostics();
  await diagnostics.runDiagnostics();
}

if (require.main === module) {
  main().catch(console.error);
}

export default LiffDiagnostics;
