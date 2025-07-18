
// src/tools/index.ts - 診斷工具模組統一導出 (向後相容)
// 這些函數已移動到 /src/utils/diagnostics/，這裡保持向後相容

export { 
  performSystemCheck,
  runSystemHealthCheck,
  runDiagnostics,
  runFullSystemDiagnostics,
  generateTroubleshootReport,
  generateTroubleshootReport,
  generateDetailedReport
} from '../utils/diagnostics';

// 重新匯出診斷管理器
export { DiagnosticsManager } from '../utils/diagnostics';
