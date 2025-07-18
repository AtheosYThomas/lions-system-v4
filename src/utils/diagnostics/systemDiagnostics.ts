
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { globSync } from 'glob';
import { execSync } from 'child_process';
import { DiagnosticResult } from './index';

export class SystemDiagnostics {
  private results: DiagnosticResult[] = [];

  private addResult(component: string, status: 'pass' | 'fail' | 'warning', message: string, suggestion?: string) {
    this.results.push({ component, status, message, suggestion });
  }

  async runDiagnostics(): Promise<DiagnosticResult[]> {
    console.log(chalk.cyan('🔍 系統診斷開始...'));
    
    await this.checkTypeScriptCompilation();
    await this.checkSourceFiles();
    await this.checkEnvironmentVariables();
    await this.checkFrontendFiles();
    
    return this.results;
  }

  private async checkTypeScriptCompilation() {
    console.log(chalk.yellow('📝 檢查 TypeScript 編譯...'));
    
    try {
      execSync('npx tsc --noEmit --skipLibCheck', { stdio: 'pipe' });
      this.addResult('TypeScript', 'pass', 'TypeScript 編譯成功');
    } catch (error: any) {
      const errorOutput = error.stdout?.toString() || error.stderr?.toString() || '';
      this.addResult('TypeScript', 'fail', 'TypeScript 編譯錯誤', '修正 TypeScript 語法錯誤');
    }
  }

  private async checkSourceFiles() {
    console.log(chalk.yellow('📁 檢查源碼檔案...'));
    
    const patterns = [
      { pattern: 'src/routes/**/*.ts', type: 'Routes' },
      { pattern: 'src/controllers/**/*.ts', type: 'Controllers' },
      { pattern: 'src/middleware/**/*.ts', type: 'Middleware' },
      { pattern: 'src/models/**/*.ts', type: 'Models' },
      { pattern: 'src/services/**/*.ts', type: 'Services' }
    ];

    patterns.forEach(({ pattern, type }) => {
      const files = globSync(pattern);
      if (files.length === 0) {
        this.addResult(type, 'warning', `未找到 ${type} 檔案`, `確認 ${type} 目錄結構`);
      } else {
        files.forEach(file => {
          try {
            const content = fs.readFileSync(file, 'utf-8');
            
            if (content.includes('async') && !content.includes('try') && !content.includes('catch')) {
              this.addResult(type, 'warning', `${file} 缺少錯誤處理`, '添加 try-catch 區塊');
            }
            
          } catch (err: any) {
            this.addResult(type, 'fail', `${file} 讀取錯誤`, '檢查檔案權限和語法');
          }
        });
        this.addResult(type, 'pass', `${type} 檔案檢查完成 (${files.length} 個檔案)`);
      }
    });
  }

  private async checkEnvironmentVariables() {
    console.log(chalk.yellow('🔧 檢查環境變數...'));

    const envPath = path.resolve('.env');
    if (!fs.existsSync(envPath)) {
      this.addResult('Environment', 'fail', '缺少 .env 檔案', '建立 .env 檔案並設定必要變數');
      return;
    }

    const requiredVars = ['LINE_CHANNEL_ACCESS_TOKEN', 'LINE_CHANNEL_SECRET', 'DATABASE_URL', 'PORT'];
    const missingVars = requiredVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      this.addResult('Environment', 'fail', `缺少必要環境變數: ${missingVars.join(', ')}`, '在 .env 檔案中設定這些變數');
    } else {
      this.addResult('Environment', 'pass', '所有環境變數都已正確設定');
    }
  }

  private async checkFrontendFiles() {
    console.log(chalk.yellow('🎨 檢查前端檔案...'));

    const frontendDirs = ['public', 'client/src', 'src/frontend'];
    let frontendFound = false;

    for (const dir of frontendDirs) {
      if (fs.existsSync(dir)) {
        frontendFound = true;
        this.addResult('Frontend', 'pass', `發現前端目錄: ${dir}`);

        const htmlFiles = globSync(`${dir}/**/*.html`);
        htmlFiles.forEach(file => {
          try {
            const content = fs.readFileSync(file, 'utf-8');
            
            if (!content.includes('<script') && !content.includes('<link')) {
              this.addResult('Frontend', 'warning', `${file} 未包含 JS 或 CSS 資源`, '添加必要的資源引用');
            }
          } catch (error: any) {
            this.addResult('Frontend', 'fail', `${file} 讀取錯誤`, '檢查檔案權限');
          }
        });
      }
    }

    if (!frontendFound) {
      this.addResult('Frontend', 'warning', '未發現前端檔案目錄', '確認前端檔案位置');
    }
  }
}
