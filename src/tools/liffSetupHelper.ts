
import chalk from 'chalk';

interface LiffValidationResult {
  isValid: boolean;
  message: string;
  suggestions: string[];
}

class LiffSetupHelper {
  async validateLiffId(liffId: string): Promise<LiffValidationResult> {
    console.log(chalk.cyan(`🔍 檢查 LIFF App ID: ${liffId}`));
    
    try {
      // 嘗試訪問 LIFF 端點
      const response = await fetch(`https://liff.line.me/${liffId}`);
      
      if (response.status === 404) {
        return {
          isValid: false,
          message: 'LIFF App ID 不存在 (404)',
          suggestions: [
            '到 LINE Developers Console 檢查 LIFF 應用程式',
            '確認 LIFF App ID 是否正確',
            '建立新的 LIFF 應用程式'
          ]
        };
      } else if (response.status === 403) {
        return {
          isValid: false,
          message: 'LIFF 應用程式權限不足 (403)',
          suggestions: [
            '檢查 LIFF 應用程式是否已啟用',
            '確認 Channel 權限設定'
          ]
        };
      } else if (response.ok || response.status === 400) {
        return {
          isValid: true,
          message: 'LIFF App ID 有效',
          suggestions: []
        };
      } else {
        return {
          isValid: false,
          message: `LIFF 回應異常 (${response.status})`,
          suggestions: [
            '檢查網路連接',
            '稍後再試'
          ]
        };
      }
    } catch (error) {
      return {
        isValid: false,
        message: `LIFF 檢查失敗: ${error}`,
        suggestions: [
          '檢查網路連接',
          '確認 LIFF App ID 格式'
        ]
      };
    }
  }

  generateSetupInstructions() {
    console.log(chalk.cyan('\n📋 LIFF 設定指南'));
    console.log(chalk.cyan('=' .repeat(50)));
    
    console.log(chalk.yellow('\n1. 前往 LINE Developers Console'));
    console.log('   https://developers.line.biz/');
    
    console.log(chalk.yellow('\n2. 選擇您的 Provider 和 Channel'));
    
    console.log(chalk.yellow('\n3. 建立 LIFF 應用程式'));
    console.log('   - 點擊 "LIFF" 分頁');
    console.log('   - 點擊 "Add" 建立新應用程式');
    console.log('   - LIFF app name: 北大獅子會會員系統');
    console.log('   - Size: Full');
    console.log('   - Endpoint URL: https://your-repl-url.replit.dev/liff.html');
    console.log('   - Scope: profile, openid');
    console.log('   - Bot link feature: On (Aggressive)');
    
    console.log(chalk.yellow('\n4. 更新環境變數'));
    console.log('   在 .env 檔案中設定：');
    console.log('   LIFF_ID=your_new_liff_app_id');
    
    console.log(chalk.yellow('\n5. 重新啟動服務並測試'));
    console.log('   npx tsx src/tools/liffTest.ts');
  }

  async runSetupCheck() {
    console.log(chalk.cyan('🚀 LIFF 設定檢查開始...\n'));
    
    const currentLiffId = process.env.LIFF_ID || '2007739371-aKePV20l';
    
    if (currentLiffId === '2007739371-aKePV20l') {
      console.log(chalk.red('❌ 使用預設的失效 LIFF App ID'));
      this.generateSetupInstructions();
      return;
    }
    
    const result = await this.validateLiffId(currentLiffId);
    
    if (result.isValid) {
      console.log(chalk.green(`✅ ${result.message}`));
      console.log(chalk.green('🎉 LIFF 設定看起來正常！'));
    } else {
      console.log(chalk.red(`❌ ${result.message}`));
      console.log(chalk.yellow('\n💡 建議:'));
      result.suggestions.forEach(suggestion => {
        console.log(`   - ${suggestion}`);
      });
      this.generateSetupInstructions();
    }
  }
}

async function main() {
  const helper = new LiffSetupHelper();
  await helper.runSetupCheck();
}

if (require.main === module) {
  main().catch(console.error);
}

export default LiffSetupHelper;
