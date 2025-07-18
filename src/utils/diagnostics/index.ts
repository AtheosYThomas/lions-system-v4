
// src/utils/diagnostics/index.ts - 診斷工具統一入口
export { validateEnvironment } from './envValidation';
export { checkEnvironment } from './envCheck';

// 匯入主要診斷模組
export { SystemDiagnostics } from './systemDiagnostics';
export { LiffDiagnostics } from './liffDiagnostics';
export { runSystemHealthCheck } from './systemHealth';
export { AutoBootDiagnostics } from './autoBootDiagnostics';

// 匯入診斷功能
export { runDiagnostics } from './diagnostics';
export { default as runFullSystemDiagnostics } from './fullSystemDiagnostics';
export { performSystemCheck } from './systemCheck';
export { generateTroubleshootReport } from './troubleshoot';
// export { createTroubleshootReport } from './troubleshootReport'; // 暫時註解，等待實作
export { generateDetailedReport } from './detailedTroubleshootReport';
export * from './troubleshootReport';

// 統一的診斷介面
export interface DiagnosticResult {
  component: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  details?: string;
  suggestion?: string;
}

export interface SystemReport {
  timestamp: string;
  summary: {
    total: number;
    pass: number;
    warning: number;
    error: number;
    healthScore: number;
  };
  results: DiagnosticResult[];
}

// 主要診斷工具類別
export class DiagnosticsManager {
  static async runFullSystemCheck(): Promise<SystemReport> {
    try {
      const { SystemDiagnostics } = await import('./systemDiagnostics');
      const { LiffDiagnostics } = await import('./liffDiagnostics');
      const { runSystemHealthCheck } = await import('./systemHealth');

      const systemDiag = new SystemDiagnostics();
      const liffDiag = new LiffDiagnostics();

      const results = await Promise.all([
        systemDiag.runDiagnostics(),
        liffDiag.runDiagnostics(),
        runSystemHealthCheck()
      ]);

      // 確保所有結果都是 DiagnosticResult 類型
      const flatResults = results.flat().filter((result): result is DiagnosticResult => 
        result && typeof result === 'object' && 'component' in result && 'status' in result && 'message' in result
      );

      return this.generateSystemReport(flatResults);
    } catch (error) {
      console.error('系統檢查失敗:', error);
      return this.generateSystemReport([{
        component: 'System Check',
        status: 'fail',
        message: '系統檢查執行失敗',
        details: error instanceof Error ? error.message : '未知錯誤'
      }]);
    }
  }

  private static generateSystemReport(results: DiagnosticResult[]): SystemReport {
    const pass = results.filter(r => r.status === 'pass').length;
    const warning = results.filter(r => r.status === 'warning').length;
    const error = results.filter(r => r.status === 'fail').length;
    const healthScore = Math.round((pass / results.length) * 100);

    return {
      timestamp: new Date().toISOString(),
      summary: {
        total: results.length,
        pass,
        warning,
        error,
        healthScore
      },
      results
    };
  }
}
