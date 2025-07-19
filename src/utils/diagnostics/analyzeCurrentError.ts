
import aiErrorAnalysis from './aiErrorAnalysis';

async function analyzeCurrentError() {
  console.log('🤖 開始 AI 錯誤分析...\n');

  const errorMessage = `
TypeError: Missing parameter name at 1: https://git.new/pathToRegexpError
    at name (/home/runner/workspace/node_modules/path-to-regexp/src/index.ts:153:13)
    at lexer (/home/runner/workspace/node_modules/path-to-regexp/src/index.ts:171:21)
    at lexer.next (<anonymous>)
    at Iter.peek (/home/runner/workspace/node_modules/path-to-regexp/src/index.ts:188:32)
    at Iter.tryConsume (/home/runner/workspace/node_modules/path-to-regexp/src/index.ts:195:24)
    at Iter.text (/home/runner/workspace/node_modules/path-to-regexp/src/index.ts:213:26)
    at consume (/home/runner/workspace/node_modules/path-to-regexp/src/index.ts:285:23)
    at parse (/home/runner/workspace/node_modules/path-to-regexp/src/index.ts:320:18)
    at <anonymous> (/home/runner/workspace/node_modules/path-to-regexp/src/index.ts:503:40)
    at Array.map (<anonymous>)
  `;

  const codeContext = `
這是一個 Express.js 應用程式，使用 TypeScript。
錯誤發生在啟動時，似乎與路由定義有關。
最近修復了 src/routes/line/webhook.ts 中的不完整路由定義。
  `;

  try {
    // AI 分析錯誤
    console.log('📝 AI 錯誤分析結果：');
    console.log('=' * 50);
    const errorAnalysis = await aiErrorAnalysis.analyzeError(errorMessage, codeContext);
    console.log(errorAnalysis);
    
    console.log('\n' + '=' * 50);
    console.log('📁 AI 路由文件分析結果：');
    console.log('=' * 50);
    const routeAnalysis = await aiErrorAnalysis.analyzeRouteFiles();
    console.log(routeAnalysis);

  } catch (error) {
    console.error('❌ AI 分析過程中發生錯誤:', error);
  }
}

// 執行分析
analyzeCurrentError().catch(console.error);
