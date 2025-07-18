import MockDataSeeder from './seedMockData';
import ServiceFunctionTester from './testServiceFunctions';

/**
 * 測試模組統一入口
 * 提供便捷的測試功能存取
 */
export class TestSuite {
  private seeder: MockDataSeeder;
  private tester: ServiceFunctionTester;

  constructor() {
    this.seeder = new MockDataSeeder();
    this.tester = new ServiceFunctionTester();
  }

  /**
   * 執行完整測試流程
   * 1. 建立測試資料
   * 2. 執行服務功能測試
   */
  async runFullTestSuite() {
    console.log('🚀 開始執行完整測試套件...');

    try {
      // 步驟 1: 建立測試資料
      console.log('\n📝 步驟 1: 建立測試資料');
      await this.seeder.runFullSeed();

      // 步驟 2: 執行服務功能測試
      console.log('\n🧪 步驟 2: 執行服務功能測試');
      const testReport = await this.tester.runAllTests();

      // 產生綜合報告
      console.log('\n📊 綜合測試報告');
      console.log('='.repeat(60));
      console.log('✅ 測試資料建立：成功');
      console.log(`✅ 服務功能測試：${testReport.passed}/${testReport.total} 通過 (${testReport.passRate.toFixed(1)}%)`);

      if (testReport.failed === 0) {
        console.log('\n🎉 完整測試套件執行成功！');
        return { success: true, report: testReport };
      } else {
        console.log('\n⚠️ 部分測試失敗，請檢查詳細報告');
        return { success: false, report: testReport };
      }

    } catch (error) {
      console.error('\n❌ 測試套件執行失敗:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      return { success: false, error: errorMessage };
    }
  }

  /**
   * 僅執行資料匯入
   */
  async seedOnly() {
    return await this.seeder.runFullSeed();
  }

  /**
   * 僅執行功能測試
   */
  async testOnly() {
    return await this.tester.runAllTests();
  }

  /**
   * 清空測試資料
   */
  async clearTestData() {
    return await this.seeder.clearAllTables();
  }
}

// 匯出便捷函數
export const seedMockData = () => new MockDataSeeder().runFullSeed();
export const testServiceFunctions = () => new ServiceFunctionTester().runAllTests();
export const runFullTestSuite = () => new TestSuite().runFullTestSuite();

// 當直接執行此腳本時提供選項
if (require.main === module) {
  const args = process.argv.slice(2);
  const testSuite = new TestSuite();

  async function main() {
    try {
      switch (args[0]) {
        case 'seed':
          console.log('🌱 僅執行資料匯入...');
          await testSuite.seedOnly();
          break;
        case 'test':
          console.log('🧪 僅執行功能測試...');
          await testSuite.testOnly();
          break;
        case 'clear':
          console.log('🗑️ 清空測試資料...');
          await testSuite.clearTestData();
          break;
        case 'full':
        default:
          console.log('🚀 執行完整測試套件...');
          await testSuite.runFullTestSuite();
          break;
      }
      process.exit(0);
    } catch (error) {
      console.error('❌ 執行失敗:', error);
      process.exit(1);
    }
  }

  main();
}

export default TestSuite;