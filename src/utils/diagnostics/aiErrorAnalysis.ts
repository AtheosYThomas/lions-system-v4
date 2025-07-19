
import openaiService from '../../integrations/openai/openaiService';
import fs from 'fs';
import path from 'path';

class AIErrorAnalysis {
  /**
   * 分析錯誤並提供修復建議
   */
  async analyzeError(errorMessage: string, codeContext?: string): Promise<string> {
    try {
      const systemMessage = `你是一個 Node.js/Express.js 專家，專門分析和修復路由錯誤。請分析以下錯誤並提供詳細的修復建議。`;
      
      const prompt = `
錯誤訊息：
${errorMessage}

代碼上下文：
${codeContext || '無額外上下文'}

請提供：
1. 錯誤原因分析
2. 具體修復建議
3. 預防措施
4. 相關最佳實踐

請用繁體中文回答。
      `;

      return await openaiService.generateResponse(prompt, systemMessage);
    } catch (error) {
      console.error('AI 錯誤分析失敗:', error);
      return '無法執行 AI 分析，請檢查 OpenAI API 設定。';
    }
  }

  /**
   * 分析路由文件並檢測潛在問題
   */
  async analyzeRouteFiles(): Promise<string> {
    try {
      const routeFiles = this.getRouteFiles();
      let allRouteContent = '';

      for (const file of routeFiles) {
        try {
          const content = fs.readFileSync(file, 'utf-8');
          allRouteContent += `\n=== ${file} ===\n${content}\n`;
        } catch (err) {
          console.error(`無法讀取文件 ${file}:`, err);
        }
      }

      const systemMessage = `你是 Express.js 路由專家，請檢查以下路由文件是否有語法錯誤、不完整的路由定義或其他問題。`;
      
      const prompt = `
請檢查以下路由文件：

${allRouteContent}

請特別注意：
1. 不完整的路由定義（如 router.post('/', 沒有回調函數）
2. 路由參數語法錯誤（如 /:）
3. 重複的路由定義
4. 語法錯誤

請用繁體中文提供詳細分析和修復建議。
      `;

      return await openaiService.generateResponse(prompt, systemMessage);
    } catch (error) {
      console.error('路由文件分析失敗:', error);
      return '無法分析路由文件。';
    }
  }

  /**
   * 獲取所有路由文件路徑
   */
  private getRouteFiles(): string[] {
    const routeDir = path.join(process.cwd(), 'src/routes');
    const files: string[] = [];

    const scanDirectory = (dir: string) => {
      try {
        const items = fs.readdirSync(dir);
        for (const item of items) {
          const fullPath = path.join(dir, item);
          const stat = fs.statSync(fullPath);
          
          if (stat.isDirectory()) {
            scanDirectory(fullPath);
          } else if (item.endsWith('.ts') || item.endsWith('.js')) {
            files.push(fullPath);
          }
        }
      } catch (err) {
        console.error(`無法掃描目錄 ${dir}:`, err);
      }
    };

    scanDirectory(routeDir);
    return files;
  }
}

export default new AIErrorAnalysis();
