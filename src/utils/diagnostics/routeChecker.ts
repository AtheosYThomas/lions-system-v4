
import fs from 'fs';
import path from 'path';
import { globSync } from 'glob';

class RouteChecker {
  /**
   * 檢查所有路由文件中的不完整路由定義
   */
  checkIncompleteRoutes(): void {
    console.log('🔍 檢查不完整的路由定義...\n');

    const routeFiles = globSync('src/routes/**/*.ts');
    let hasErrors = false;

    for (const file of routeFiles) {
      try {
        const content = fs.readFileSync(file, 'utf-8');
        const issues = this.analyzeRouteFile(file, content);
        
        if (issues.length > 0) {
          hasErrors = true;
          console.log(`❌ ${file}:`);
          issues.forEach(issue => console.log(`   ${issue}`));
          console.log();
        }
      } catch (error) {
        console.error(`❌ 無法讀取文件 ${file}:`, error);
      }
    }

    if (!hasErrors) {
      console.log('✅ 所有路由文件檢查完成，未發現明顯問題');
    }
  }

  /**
   * 分析單個路由文件
   */
  private analyzeRouteFile(filename: string, content: string): string[] {
    const issues: string[] = [];
    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      const lineNum = i + 1;

      // 檢查不完整的路由定義模式
      const routePatterns = [
        /router\.(get|post|put|delete|patch)\s*\(\s*['"`][^'"`]*['"`]\s*,?\s*$/,
        /router\.(use)\s*\(\s*['"`][^'"`]*['"`]\s*,?\s*$/,
        /router\.(get|post|put|delete|patch)\s*\(\s*['"`][^'"`]*[^'"`]*$/,
        /router\.(get|post|put|delete|patch)\s*\(\s*['"`]:[^'"`]*['"`]/
      ];

      for (const pattern of routePatterns) {
        if (pattern.test(line)) {
          // 檢查是否有參數錯誤，如 ':' 沒有參數名
          if (line.includes("':") || line.includes('":')) {
            issues.push(`第 ${lineNum} 行: 路由參數缺少名稱 - ${line}`);
          }
          
          // 檢查下一行是否有回調函數
          if (i + 1 < lines.length) {
            const nextLine = lines[i + 1].trim();
            if (!nextLine.startsWith('(') && !nextLine.startsWith('async') && 
                !nextLine.includes('=>') && !nextLine.includes('function')) {
              // 可能是不完整的路由定義
              if (line.endsWith(',')) {
                issues.push(`第 ${lineNum} 行: 可能的不完整路由定義 - ${line}`);
              }
            }
          }
        }
      }

      // 檢查空的路由路徑
      if (line.includes("router.") && (line.includes("''") || line.includes('""'))) {
        issues.push(`第 ${lineNum} 行: 發現空的路由路徑 - ${line}`);
      }

      // 檢查不正確的參數語法
      if (line.includes('/:') && !line.match(/:[a-zA-Z_][a-zA-Z0-9_]*/)) {
        issues.push(`第 ${lineNum} 行: 路由參數語法錯誤 - ${line}`);
      }
    }

    return issues;
  }
}

const routeChecker = new RouteChecker();
routeChecker.checkIncompleteRoutes();
