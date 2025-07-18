import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import dotenv from 'dotenv';
import { DiagnosticResult } from './index';

dotenv.config();

export class LiffDiagnostics {
  private results: DiagnosticResult[] = [];

  private addResult(component: string, status: 'pass' | 'fail' | 'warning', message: string, suggestion?: string) {
    this.results.push({ component, status, message, suggestion });
  }

  async runDiagnostics(): Promise<DiagnosticResult[]> {
    console.log(chalk.cyan('🔍 LIFF 系統診斷開始...'));

    await this.checkLiffConfig();
    await this.checkLiffHtml();
    await this.checkLineConfig();

    return this.results;
  }

  private async checkLiffConfig() {
    console.log(chalk.yellow('📱 檢查 LIFF 配置...'));

    const liffId = process.env.LIFF_ID;

    if (!liffId) {
      this.addResult('LIFF Config', 'fail', 
        'LIFF ID 未設定',
        '請在 .env 檔案中設定 LIFF_ID'
      );
      return;
    }

    this.addResult('LIFF Config', 'pass', 
      `LIFF ID 已設定: ${liffId}`
    );

    try {
      const testResponse = await fetch(`https://liff.line.me/${liffId}`);

      if (testResponse.status === 404) {
        this.addResult('LIFF Config', 'fail', 
          'LIFF ID 無效 (404)',
          '請檢查 LINE Developers Console 中的 LIFF 設定'
        );
      } else if (testResponse.status === 403) {
        this.addResult('LIFF Config', 'fail', 
          'LIFF 應用程式權限不足 (403)',
          '請檢查 LIFF 應用程式是否已啟用'
        );
      } else if (testResponse.ok || testResponse.status === 400) {
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

    try {
      const liffHtmlPath = path.join(process.cwd(), 'public/liff.html');
      const content = fs.readFileSync(liffHtmlPath, 'utf8');

      if (content.includes('liff.init')) {
        this.addResult('LIFF HTML', 'pass', 'LIFF 初始化程式碼存在');
      } else {
        this.addResult('LIFF HTML', 'fail', 'LIFF 初始化程式碼缺失');
      }

      if (content.includes('2007739371-aKePV20l')) {
        this.addResult('LIFF HTML', 'warning', 
          'LIFF ID 硬編碼在 HTML 中',
          '建議使用環境變數管理 LIFF ID'
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
}
// LiffDiagnostics 類別已在此檔案中完整實作
export default LiffDiagnostics;