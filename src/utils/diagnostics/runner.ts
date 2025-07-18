
#!/usr/bin/env node
import chalk from 'chalk';
import fs from 'fs';
import { DiagnosticsManager, SystemReport } from './index';

class DiagnosticsRunner {
  static async runFullDiagnostics() {
    console.log(chalk.cyan('🦁 北大獅子會系統完整診斷報告'));
    console.log(chalk.cyan('=' .repeat(80)));
    
    try {
      const report = await DiagnosticsManager.runFullSystemCheck();
      this.displayReport(report);
      this.saveReport(report);
      
      return report.summary.error === 0;
    } catch (error) {
      console.error(chalk.red('❌ 診斷過程中發生錯誤:'), error);
      return false;
    }
  }
  
  private static displayReport(report: SystemReport) {
    console.log(chalk.cyan('\n📊 診斷結果摘要:'));
    console.log(chalk.green(`✅ 通過: ${report.summary.pass}個`));
    console.log(chalk.yellow(`⚠️ 警告: ${report.summary.warning}個`));
    console.log(chalk.red(`❌ 錯誤: ${report.summary.error}個`));
    console.log(chalk.cyan(`📈 系統健康度: ${report.summary.healthScore}%`));
    
    // 顯示錯誤
    const errors = report.results.filter(r => r.status === 'fail');
    if (errors.length > 0) {
      console.log(chalk.red('\n🚨 需要立即修正的問題:'));
      errors.forEach((error, index) => {
        console.log(chalk.red(`${index + 1}. [${error.component}] ${error.message}`));
        if (error.suggestion) {
          console.log(chalk.yellow(`   💡 建議: ${error.suggestion}`));
        }
      });
    }
    
    // 顯示警告
    const warnings = report.results.filter(r => r.status === 'warning');
    if (warnings.length > 0) {
      console.log(chalk.yellow('\n⚠️ 建議改善的項目:'));
      warnings.slice(0, 3).forEach((warning, index) => {
        console.log(chalk.yellow(`${index + 1}. [${warning.component}] ${warning.message}`));
      });
    }
  }
  
  private static saveReport(report: SystemReport) {
    const reportPath = 'system_diagnostics_report.json';
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(chalk.green(`\n📄 詳細報告已儲存至: ${reportPath}`));
  }
}

// 執行診斷（如果直接運行此檔案）
if (require.main === module) {
  DiagnosticsRunner.runFullDiagnostics().then((success) => {
    process.exit(success ? 0 : 1);
  });
}

export default DiagnosticsRunner;
