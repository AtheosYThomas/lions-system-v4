// src/utils/diagnostics/index.ts - 診斷工具統一入口
export { validateEnvironment } from './envValidation';
export { checkEnvironment } from './envCheck';

// 匯入所有診斷模組
export { SystemDiagnostics } from './systemDiagnostics';
export { LiffDiagnostics } from './liffDiagnostics';
export { runSystemHealthCheck } from './systemHealth';

// 匯入移動過來的診斷工具
export { runDiagnostics } from './diagnostics';
export { default as runFullSystemDiagnostics } from './fullSystemDiagnostics';
export { LiffDiagnostics } from '../tools/liffDiagnostics';
export { performSystemCheck } from './systemCheck';
export { runSystemHealthCheck } from './systemHealth';
export { generateTroubleshootReport } from './troubleshoot';
export { createTroubleshootReport } from './troubleshootReport';
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
    const systemDiag = new SystemDiagnostics();
    const liffDiag = new LiffDiagnostics();
    const healthChecker = new SystemHealthChecker();

    const results = await Promise.all([
      systemDiag.runDiagnostics(),
      liffDiag.runDiagnostics(),
      healthChecker.runHealthCheck()
    ]);

    return this.generateSystemReport(results.flat());
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