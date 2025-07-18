
export { validateEnvironment } from './envValidation';
export { checkEnvironment } from './envCheck';

// 統一的診斷介面
export interface DiagnosticResult {
  component: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  suggestion?: string;
}

export class SystemDiagnostics {
  static async runAll(): Promise<DiagnosticResult[]> {
    const results: DiagnosticResult[] = [];
    
    // 環境變數檢查
    const envValid = validateEnvironment();
    results.push({
      component: 'Environment',
      status: envValid ? 'pass' : 'fail',
      message: envValid ? '環境變數設定正確' : '環境變數設定不完整',
      suggestion: envValid ? undefined : '請檢查 .env 檔案設定'
    });
    
    return results;
  }
}
