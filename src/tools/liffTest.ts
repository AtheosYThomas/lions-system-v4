
import chalk from 'chalk';

interface LiffTestResult {
  component: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  suggestion?: string;
}

class LiffTester {
  private results: LiffTestResult[] = [];

  private addResult(component: string, status: 'pass' | 'fail' | 'warning', message: string, suggestion?: string) {
    this.results.push({ component, status, message, suggestion });
  }

  async runTests() {
    console.log(chalk.cyan('🧪 LIFF 功能測試開始...'));
    
    await this.testLiffApi();
    await this.testLiffRoutes();
    await this.testLiffPages();
    
    this.generateReport();
  }

  private async testLiffApi() {
    console.log(chalk.yellow('🔧 測試 LIFF API 端點...'));
    
    try {
      // 測試 check-member API
      const testData = {
        line_user_id: 'test_user_123',
        display_name: 'Test User',
        picture_url: 'https://example.com/avatar.jpg'
      };

      const response = await fetch('http://localhost:5000/api/liff/check-member', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testData)
      });

      if (response.ok) {
        const result = await response.json();
        this.addResult('LIFF API', 'pass', 'check-member API 回應正常');
      } else {
        this.addResult('LIFF API', 'fail', 
          `check-member API 回應錯誤: ${response.status}`,
          '檢查 LIFF Controller 實作'
        );
      }
    } catch (error) {
      this.addResult('LIFF API', 'fail', 
        'LIFF API 連接失敗',
        '確認後端服務是否正常運行'
      );
    }
  }

  private async testLiffRoutes() {
    console.log(chalk.yellow('🛣️ 測試 LIFF 路由...'));
    
    const routes = ['/api/liff/check-member', '/api/liff/register'];
    
    for (const route of routes) {
      try {
        const response = await fetch(`http://localhost:5000${route}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({})
        });
        
        if (response.status !== 404) {
          this.addResult('LIFF Routes', 'pass', `路由 ${route} 存在`);
        } else {
          this.addResult('LIFF Routes', 'fail', 
            `路由 ${route} 不存在`,
            '檢查路由配置'
          );
        }
      } catch (error) {
        this.addResult('LIFF Routes', 'fail', 
          `路由 ${route} 測試失敗`,
          '檢查網路連接或服務狀態'
        );
      }
    }
  }

  private async testLiffPages() {
    console.log(chalk.yellow('📄 測試 LIFF 頁面...'));
    
    const pages = ['/liff.html', '/register.html'];
    
    for (const page of pages) {
      try {
        const response = await fetch(`http://localhost:5000${page}`);
        
        if (response.ok) {
          const content = await response.text();
          if (content.includes('liff.init')) {
            this.addResult('LIFF Pages', 'pass', `頁面 ${page} 包含 LIFF 初始化`);
          } else {
            this.addResult('LIFF Pages', 'warning', 
              `頁面 ${page} 缺少 LIFF 初始化`,
              '檢查 LIFF SDK 載入'
            );
          }
        } else {
          this.addResult('LIFF Pages', 'fail', 
            `頁面 ${page} 無法訪問`,
            '檢查靜態檔案服務'
          );
        }
      } catch (error) {
        this.addResult('LIFF Pages', 'fail', 
          `頁面 ${page} 測試失敗`,
          '檢查服務連接'
        );
      }
    }
  }

  private generateReport() {
    console.log(chalk.cyan('\n📊 LIFF 測試報告'));
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
    
    const totalScore = Math.round((passCount / this.results.length) * 100);
    console.log(chalk.cyan(`\n🎯 LIFF 功能完整度: ${totalScore}%`));
    
    if (failCount > 0) {
      console.log(chalk.red('\n🚨 需要修復的問題請優先處理'));
    } else if (warningCount > 0) {
      console.log(chalk.yellow('\n⚠️ 有警告項目建議優化'));
    } else {
      console.log(chalk.green('\n🎉 LIFF 功能測試全部通過！'));
    }
  }
}

async function main() {
  const tester = new LiffTester();
  await tester.runTests();
}

if (require.main === module) {
  main().catch(console.error);
}

export default LiffTester;
