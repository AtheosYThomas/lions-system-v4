
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { globSync } from 'glob';

interface TroubleshootResult {
  section: string;
  status: 'pass' | 'warning' | 'error';
  message: string;
  details?: any;
  suggestions?: string[];
}

class SystemTroubleshooter {
  private results: TroubleshootResult[] = [];

  async runFullDiagnostics() {
    console.log('🔍 開始系統問題排查...\n');

    await this.checkRouteErrors();
    await this.checkEnvironmentVariables();
    await this.checkFrontendAssets();
    await this.checkHealthEndpoint();
    await this.checkDatabaseConnections();
    await this.checkMissingDependencies();
    
    this.generateReport();
  }

  private async checkRouteErrors() {
    console.log('1️⃣ 檢查路由、控制器、中介軟體錯誤...');
    
    try {
      // 檢查 TypeScript 編譯錯誤
      try {
        execSync('npx tsc --noEmit --skipLibCheck', { stdio: 'pipe' });
        this.addResult('Routes/TypeScript', 'pass', 'TypeScript 編譯成功');
      } catch (error: any) {
        this.addResult('Routes/TypeScript', 'error', 'TypeScript 編譯錯誤', 
          error.stdout?.toString() || error.message, 
          ['檢查 TypeScript 語法錯誤', '確認所有 import 路徑正確']);
      }

      // 檢查路由檔案
      const routeFiles = globSync('src/routes/*.ts');
      const middlewareFiles = globSync('src/middleware/*.ts');
      
      for (const file of [...routeFiles, ...middlewareFiles]) {
        const content = fs.readFileSync(file, 'utf8');
        
        // 檢查常見問題
        if (content.includes('require(') && content.includes('import ')) {
          this.addResult(`File: ${file}`, 'warning', 'ES6 模組和 CommonJS 混用');
        }
        
        if (content.includes('// import Checkin') || content.includes('// 需要確保')) {
          this.addResult(`File: ${file}`, 'error', '缺少必要的模型導入', content, 
            ['取消註解並導入所需模型', '確認模型檔案存在']);
        }
      }

    } catch (error: any) {
      this.addResult('Routes', 'error', '路由檢查失敗', error.message);
    }
  }

  private async checkEnvironmentVariables() {
    console.log('2️⃣ 檢查環境變數配置...');
    
    try {
      // 檢查 .env 檔案
      if (!fs.existsSync('.env')) {
        this.addResult('Environment', 'warning', '.env 檔案不存在', null, 
          ['建立 .env 檔案', '設定必要的環境變數']);
      }

      // 檢查程式中使用的環境變數
      const sourceFiles = globSync('src/**/*.ts');
      const usedEnvVars = new Set<string>();
      
      for (const file of sourceFiles) {
        const content = fs.readFileSync(file, 'utf8');
        const matches = content.match(/process\.env\.([A-Z_]+)/g);
        if (matches) {
          matches.forEach(match => usedEnvVars.add(match.replace('process.env.', '')));
        }
      }

      // 檢查哪些變數未定義
      const missingVars = Array.from(usedEnvVars).filter(varName => !process.env[varName]);
      
      if (missingVars.length > 0) {
        this.addResult('Environment', 'error', '缺少必要的環境變數', 
          { missing: missingVars, used: Array.from(usedEnvVars) },
          [`設定以下環境變數: ${missingVars.join(', ')}`]);
      } else {
        this.addResult('Environment', 'pass', '所有環境變數已設定');
      }

    } catch (error: any) {
      this.addResult('Environment', 'error', '環境變數檢查失敗', error.message);
    }
  }

  private async checkFrontendAssets() {
    console.log('3️⃣ 檢查前端資源...');
    
    try {
      // 檢查 client 目錄
      if (fs.existsSync('client')) {
        const packageJsonPath = 'client/package.json';
        if (fs.existsSync(packageJsonPath)) {
          this.addResult('Frontend', 'pass', 'Client 目錄和 package.json 存在');
          
          // 檢查是否有 build 檔案
          if (fs.existsSync('client/dist') || fs.existsSync('client/build')) {
            this.addResult('Frontend/Build', 'pass', '前端建置檔案存在');
          } else {
            this.addResult('Frontend/Build', 'warning', '前端未建置', null,
              ['執行 cd client && npm run build']);
          }
        } else {
          this.addResult('Frontend', 'error', 'Client 目錄存在但缺少 package.json');
        }
      } else if (fs.existsSync('public')) {
        this.addResult('Frontend', 'pass', 'Public 目錄存在');
      } else {
        this.addResult('Frontend', 'warning', '未找到前端資源目錄 (client/ 或 public/)');
      }

    } catch (error: any) {
      this.addResult('Frontend', 'error', '前端檢查失敗', error.message);
    }
  }

  private async checkHealthEndpoint() {
    console.log('4️⃣ 檢查 Health Check 端點...');
    
    try {
      // 檢查是否有 health 路由定義
      const indexFile = 'src/index.ts';
      if (fs.existsSync(indexFile)) {
        const content = fs.readFileSync(indexFile, 'utf8');
        if (content.includes('/health')) {
          this.addResult('Health/Route', 'pass', 'Health 路由已定義');
        } else {
          this.addResult('Health/Route', 'warning', 'Health 路由未定義', null,
            ['在 src/index.ts 中加入 health 路由']);
        }
      }

      // 嘗試呼叫 health endpoint
      try {
        const result = execSync('curl -s http://localhost:5000/health', { timeout: 5000 });
        const response = result.toString();
        if (response.includes('healthy') || response.includes('ok')) {
          this.addResult('Health/Endpoint', 'pass', 'Health endpoint 回應正常', response);
        } else {
          this.addResult('Health/Endpoint', 'warning', 'Health endpoint 回應異常', response);
        }
      } catch (error) {
        this.addResult('Health/Endpoint', 'error', 'Health endpoint 無法連線', null,
          ['確認伺服器正在運行', '檢查 PORT 5000 是否被佔用']);
      }

    } catch (error: any) {
      this.addResult('Health', 'error', 'Health 檢查失敗', error.message);
    }
  }

  private async checkDatabaseConnections() {
    console.log('5️⃣ 檢查資料庫連線...');
    
    try {
      // 動態導入以避免編譯時錯誤
      const { runSystemHealthCheck } = await import('./systemHealth');
      const healthResult = await runSystemHealthCheck();
      
      if (healthResult.database) {
        this.addResult('Database', 'pass', '資料庫連線正常');
      } else {
        this.addResult('Database', 'error', '資料庫連線失敗', healthResult.errors,
          ['檢查 DATABASE_URL 環境變數', '確認 PostgreSQL 服務運行']);
      }

      if (healthResult.models) {
        this.addResult('Database/Models', 'pass', '模型查詢正常');
      } else {
        this.addResult('Database/Models', 'error', '模型查詢失敗', healthResult.errors,
          ['檢查模型定義', '執行資料庫初始化']);
      }

    } catch (error: any) {
      this.addResult('Database', 'error', '資料庫檢查失敗', error.message);
    }
  }

  private async checkMissingDependencies() {
    console.log('6️⃣ 檢查相依性問題...');
    
    try {
      // 檢查 package.json
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
      
      // 檢查關鍵依賴
      const criticalDeps = ['express', 'sequelize', 'pg', '@line/bot-sdk'];
      const missingCritical = criticalDeps.filter(dep => !dependencies[dep]);
      
      if (missingCritical.length > 0) {
        this.addResult('Dependencies', 'error', '缺少關鍵依賴', missingCritical,
          [`安裝: npm install ${missingCritical.join(' ')}`]);
      } else {
        this.addResult('Dependencies', 'pass', '關鍵依賴已安裝');
      }

      // 檢查 node_modules
      if (!fs.existsSync('node_modules')) {
        this.addResult('Dependencies/Install', 'error', 'node_modules 不存在', null,
          ['執行 npm install']);
      }

    } catch (error: any) {
      this.addResult('Dependencies', 'error', '依賴檢查失敗', error.message);
    }
  }

  private addResult(section: string, status: 'pass' | 'warning' | 'error', 
                   message: string, details?: any, suggestions?: string[]) {
    this.results.push({ section, status, message, details, suggestions });
  }

  private generateReport() {
    console.log('\n📊 系統問題排查報告\n');
    console.log('='.repeat(50));

    const errors = this.results.filter(r => r.status === 'error');
    const warnings = this.results.filter(r => r.status === 'warning');
    const passes = this.results.filter(r => r.status === 'pass');

    // 總結
    console.log(`\n📈 總結: ${errors.length} 錯誤, ${warnings.length} 警告, ${passes.length} 正常\n`);

    // 錯誤
    if (errors.length > 0) {
      console.log('🔴 錯誤:');
      errors.forEach(result => {
        console.log(`❌ [${result.section}] ${result.message}`);
        if (result.details) {
          console.log(`   詳情: ${typeof result.details === 'object' ? JSON.stringify(result.details, null, 2) : result.details}`);
        }
        if (result.suggestions) {
          console.log(`   建議: ${result.suggestions.join(', ')}`);
        }
        console.log('');
      });
    }

    // 警告
    if (warnings.length > 0) {
      console.log('🟡 警告:');
      warnings.forEach(result => {
        console.log(`⚠️  [${result.section}] ${result.message}`);
        if (result.suggestions) {
          console.log(`   建議: ${result.suggestions.join(', ')}`);
        }
        console.log('');
      });
    }

    // 正常項目
    console.log('🟢 正常:');
    passes.forEach(result => {
      console.log(`✅ [${result.section}] ${result.message}`);
    });

    // 修正建議
    console.log('\n🔧 修正建議:');
    const allSuggestions = this.results
      .filter(r => r.suggestions)
      .flatMap(r => r.suggestions!)
      .filter((s, i, arr) => arr.indexOf(s) === i);

    if (allSuggestions.length > 0) {
      allSuggestions.forEach((suggestion, i) => {
        console.log(`${i + 1}. ${suggestion}`);
      });
    } else {
      console.log('✅ 無需要修正的項目');
    }

    console.log('\n='.repeat(50));
  }
}

// 執行排查（如果直接運行此檔案）
if (require.main === module) {
  const troubleshooter = new SystemTroubleshooter();
  troubleshooter.runFullDiagnostics().catch(console.error);
}

export default SystemTroubleshooter;
