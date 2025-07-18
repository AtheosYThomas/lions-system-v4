
import chalk from 'chalk';
import http from 'http';
import { DiagnosticResult } from './index';

export class SystemHealthChecker {
  private results: DiagnosticResult[] = [];

  private addResult(component: string, status: 'pass' | 'fail' | 'warning', message: string, suggestion?: string) {
    this.results.push({ component, status, message, suggestion });
  }

  async runHealthCheck(): Promise<DiagnosticResult[]> {
    console.log(chalk.cyan('🏥 系統健康檢查開始...'));
    
    await this.checkServerHealth();
    await this.checkDatabaseConnection();
    
    return this.results;
  }

  private async checkServerHealth(): Promise<void> {
    console.log(chalk.yellow('🌐 檢查伺服器健康狀態...'));
    
    const PORT = process.env.PORT || 5000;
    
    return new Promise((resolve) => {
      const req = http.get(`http://0.0.0.0:${PORT}/health`, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          if (res.statusCode === 200) {
            try {
              const healthData = JSON.parse(data);
              this.addResult('Server Health', 'pass', 'Health check 成功');
              
              if (healthData.database === false) {
                this.addResult('Database', 'fail', '資料庫連線失敗', '檢查 DATABASE_URL 設定');
              }
            } catch (parseErr) {
              this.addResult('Server Health', 'warning', 'Health check 回應格式異常', '檢查 health 端點實作');
            }
          } else {
            this.addResult('Server Health', 'fail', `Health check 失敗 (狀態: ${res.statusCode})`, '檢查伺服器狀態');
          }
          resolve();
        });
      });
      
      req.on('error', (error) => {
        this.addResult('Server Health', 'fail', 'Health check 連線失敗', '確認伺服器已啟動');
        resolve();
      });
      
      req.setTimeout(5000, () => {
        req.destroy();
        this.addResult('Server Health', 'fail', 'Health check 逾時', '檢查伺服器回應時間');
        resolve();
      });
    });
  }

  private async checkDatabaseConnection() {
    console.log(chalk.yellow('🗄️ 檢查資料庫連線...'));
    
    try {
      const { runSystemHealthCheck } = await import('../../tools/systemHealth');
      const healthResults = await runSystemHealthCheck();
      
      if (healthResults.database) {
        this.addResult('Database', 'pass', '資料庫連線正常');
      } else {
        this.addResult('Database', 'fail', '資料庫連線失敗', '檢查 DATABASE_URL 設定');
      }
      
      if (healthResults.models) {
        this.addResult('Models', 'pass', '資料模型查詢正常');
      } else {
        this.addResult('Models', 'fail', '資料模型查詢失敗', '檢查模型定義');
      }
      
    } catch (error: any) {
      this.addResult('Database', 'fail', '資料庫檢查失敗', '確認資料庫配置正確');
    }
  }
}
