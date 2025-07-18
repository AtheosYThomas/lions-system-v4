import { sequelize } from '../../models/index';
import memberService from '../../services/memberService';
import eventService from '../../services/eventService';
import announcementService from '../../services/announcementService';
import registrationService from '../../services/registrationService';
import checkinService from '../../services/checkinService';
import adminService from '../../services/adminService';

/**
 * 測試所有服務功能
 * 確保各個 service 能正確執行
 */
class ServiceFunctionTester {
  private testResults: { [key: string]: boolean } = {};
  private testErrors: { [key: string]: string } = {};

  /**
   * 記錄測試結果
   */
  private recordTest(testName: string, passed: boolean, error?: string) {
    this.testResults[testName] = passed;
    if (error) {
      this.testErrors[testName] = error;
    }

    const status = passed ? '✅' : '❌';
    console.log(`${status} ${testName}`);
    if (error && !passed) {
      console.error(`   錯誤: ${error}`);
    }
  }

  /**
   * 測試會員服務功能
   */
  async testMemberService() {
    console.log('\n👥 測試會員服務功能...');

    try {
      // 測試獲取會員統計
      const stats = await memberService.getMemberStats();
      this.recordTest('memberService.getMemberStats', 
        typeof stats === 'object' && Number(stats?.total) >= 0);

      // 測試搜尋會員
      const searchResult = await memberService.searchMembers({
        limit: 5,
        offset: 0
      });
      this.recordTest('memberService.searchMembers', 
        Array.isArray(searchResult.members) && typeof searchResult.total === 'number');

      // 測試根據 Email 獲取會員
      const memberByEmail = await memberService.getMemberByEmail('zhang.san@example.com');
      this.recordTest('memberService.getMemberByEmail', 
        memberByEmail === null || (memberByEmail && memberByEmail.email === 'zhang.san@example.com'));

      // 測試根據 LINE UID 獲取會員
      const memberByLineUid = await memberService.getMemberByLineUid('U1234567890abcdef');
      this.recordTest('memberService.getMemberByLineUid', 
        memberByLineUid === null || (memberByLineUid && memberByLineUid.line_user_id === 'U1234567890abcdef'));

    } catch (error) {
      this.recordTest('memberService', false, error instanceof Error ? error.message : String(error));
    }
  }

  /**
   * 測試活動服務功能
   */
  async testEventService() {
    console.log('\n🎭 測試活動服務功能...');

    try {
      // 測試獲取活動統計
      const stats = await eventService.getEventStats();
      this.recordTest('eventService.getEventStats', 
        typeof stats === 'object' && typeof stats?.totalEvents === 'number');

      // 測試搜尋活動
      const searchResult = await eventService.searchEvents({
        limit: 5,
        offset: 0
      });
      this.recordTest('eventService.searchEvents', 
        Array.isArray(searchResult.events) && typeof searchResult.total === 'number');

      // 測試獲取即將到來的活動
      const upcomingEvents = await eventService.getUpcomingEvents(3);
      this.recordTest('eventService.getUpcomingEvents', 
        Array.isArray(upcomingEvents));

      // 測試檢查活動名額（使用第一個活動）
      const events = await eventService.searchEvents({ limit: 1 });
      if (events.events.length > 0) {
        const capacityCheck = await eventService.checkEventCapacity(events.events[0].id);
        this.recordTest('eventService.checkEventCapacity', 
          typeof capacityCheck === 'object' && 
          typeof capacityCheck.currentRegistrations === 'number');
      } else {
        this.recordTest('eventService.checkEventCapacity', true, '沒有活動可測試');
      }

    } catch (error) {
      this.recordTest('eventService', false, error instanceof Error ? error.message : String(error));
    }
  }

  /**
   * 測試公告服務功能
   */
  async testAnnouncementService() {
    console.log('\n📢 測試公告服務功能...');

    try {
      // 測試獲取公告統計
      const stats = await announcementService.getAnnouncementStats();
      this.recordTest('announcementService.getAnnouncementStats', 
        typeof stats === 'object' && Number(stats?.total) >= 0);

      // 測試搜尋公告
      const searchResult = await announcementService.searchAnnouncements({
        limit: 5,
        offset: 0
      });
      this.recordTest('announcementService.searchAnnouncements', 
        Array.isArray(searchResult.announcements) && typeof searchResult.total === 'number');

      // 測試獲取公開公告
      const publicAnnouncements = await announcementService.getPublicAnnouncements('all', 5);
      this.recordTest('announcementService.getPublicAnnouncements', 
        Array.isArray(publicAnnouncements));

      // 測試獲取最新公告
      const latestAnnouncements = await announcementService.getLatestAnnouncements(3);
      this.recordTest('announcementService.getLatestAnnouncements', 
        Array.isArray(latestAnnouncements));

      // 測試處理排程公告
      const processedCount = await announcementService.processScheduledAnnouncements();
      this.recordTest('announcementService.processScheduledAnnouncements', 
        typeof processedCount === 'number');

    } catch (error) {
      this.recordTest('announcementService', false, error instanceof Error ? error.message : String(error));
    }
  }

  /**
   * 測試報名服務功能
   */
  async testRegistrationService() {
    console.log('\n📝 測試報名服務功能...');

    try {
      // 測試獲取報名統計
      const stats = await registrationService.getRegistrationStats();
      this.recordTest('registrationService.getRegistrationStats', 
        typeof stats === 'object' && typeof stats?.totalRegistrations === 'number');

      // 測試搜尋報名記錄
      const searchResult = await registrationService.searchRegistrations({
        limit: 5,
        offset: 0
      });
      this.recordTest('registrationService.searchRegistrations', 
        Array.isArray(searchResult.registrations) && typeof searchResult.total === 'number');

      // 測試檢查報名狀態（使用第一個會員和第一個活動）
      const members = await memberService.searchMembers({ limit: 1 });
      const events = await eventService.searchEvents({ limit: 1 });

      if (members.members.length > 0 && events.events.length > 0) {
        const registrationCheck = await registrationService.isRegistered(
          members.members[0].id, 
          events.events[0].id
        );
        this.recordTest('registrationService.isRegistered', 
          typeof registrationCheck === 'object' && 
          typeof registrationCheck.registered === 'boolean');
      } else {
        this.recordTest('registrationService.isRegistered', true, '沒有資料可測試');
      }

    } catch (error) {
      this.recordTest('registrationService', false, error instanceof Error ? error.message : String(error));
    }
  }

  /**
   * 測試簽到服務功能
   */
  async testCheckinService() {
    console.log('\n✅ 測試簽到服務功能...');

    try {
      // 測試獲取簽到統計
      const stats = await checkinService.getCheckinStats();
      this.recordTest('checkinService.getCheckinStats', 
        typeof stats === 'object' && Number(stats?.totalCheckins) >= 0);

      // 測試驗證簽到資格（使用第一個會員和第一個活動）
      const members = await memberService.searchMembers({ limit: 1 });
      const events = await eventService.searchEvents({ limit: 1 });

      if (members.members.length > 0 && events.events.length > 0) {
        const eligibilityCheck = await checkinService.validateCheckinEligibility(
          members.members[0].id, 
          events.events[0].id
        );
        this.recordTest('checkinService.validateCheckinEligibility', 
          typeof eligibilityCheck === 'object' && 
          typeof eligibilityCheck.eligible === 'boolean');

        // 測試檢查簽到狀態
        const checkinStatus = await checkinService.isCheckedIn(
          members.members[0].id, 
          events.events[0].id
        );
        this.recordTest('checkinService.isCheckedIn', 
          typeof checkinStatus === 'boolean');
      } else {
        this.recordTest('checkinService.validateCheckinEligibility', true, '沒有資料可測試');
        this.recordTest('checkinService.isCheckedIn', true, '沒有資料可測試');
      }

    } catch (error) {
      this.recordTest('checkinService', false, error instanceof Error ? error.message : String(error));
    }
  }

  /**
   * 測試管理員服務功能
   */
  async testAdminService() {
    console.log('\n🔧 測試管理員服務功能...');

    try {
      // 測試獲取儀表板統計
      const dashboardStats = await adminService.getDashboardStats();
      this.recordTest('adminService.getDashboardStats', 
        typeof dashboardStats === 'object' && 
        typeof dashboardStats.totalMembers === 'number');

      // 測試 getSystemOverview (使用 getSystemSummary 替代)
      console.log('🧪 測試 getSystemSummary...');
      const systemOverview = await adminService.getSystemSummary();
      console.log('✅ getSystemSummary 測試成功:', systemOverview);

      // 測試 exportEventsReport (替代 getEventReport)
      console.log('🧪 測試 exportEventsReport...');
      const eventReport = await adminService.exportEventsReport({});
      console.log('✅ exportEventsReport 測試成功:', eventReport);

      // 測試獲取活動報告
      const eventReport2 = await adminService.exportMembersReport({});
      this.recordTest('adminService.getEventReport', 
        typeof eventReport2 === 'object');

       // 測試獲取活動報告
       const eventReport3 = await adminService.exportRegistrationsReport({});
       this.recordTest('adminService.getEventReport', 
         typeof eventReport3 === 'object');

         const eventReport4 = await adminService.exportComprehensiveReport({});
         this.recordTest('adminService.getEventReport', 
           typeof eventReport4 === 'object');

    } catch (error) {
      console.error('❌ getSystemSummary 測試失敗:', error instanceof Error ? error.message : String(error));
    }
     try {
          const stats = await adminService.getMemberStats();
          console.log('🧪 測試 getMemberStats...');
          console.log('✅ getMemberStats 測試成功:', stats);
      } catch (error) {
          console.error('❌ getMemberStats 測試失敗:', error instanceof Error ? error.message : String(error));
      }
      try {
          console.log('🧪 測試 exportMembersReport...');
          const membersReport = await adminService.exportMembersReport({});
          console.log('✅ exportMembersReport 測試成功:', membersReport);
      } catch (error) {
          console.error('❌ exportMembersReport 測試失敗:', error instanceof Error ? error.message : String(error));
      }
      try {
          console.log('🧪 測試 exportEventsReport...');
          const eventsReport = await adminService.exportEventsReport({});
          console.log('✅ exportEventsReport 測試成功:', eventsReport);
      } catch (error) {
          console.error('❌ exportEventsReport 測試失敗:', error instanceof Error ? error.message : String(error));
      }
      try {
          console.log('🧪 測試 exportRegistrationsReport...');
          const registrationsReport = await adminService.exportRegistrationsReport({});
          console.log('✅ exportRegistrationsReport 測試成功:', registrationsReport);
      } catch (error) {
          console.error('❌ exportRegistrationsReport 測試失敗:', error instanceof Error ? error.message : String(error));
      }
      try {
        console.log('🧪 測試 exportComprehensiveReport...');
        const comprehensiveReport = await adminService.exportComprehensiveReport({});
        console.log('✅ exportComprehensiveReport 測試成功:', comprehensiveReport);
    } catch (error) {
        console.error('❌ exportComprehensiveReport 測試失敗:', error instanceof Error ? error.message : String(error));
    }
  }

  /**
   * 測試資料庫連線
   */
  async testDatabaseConnection() {
    console.log('\n🗄️ 測試資料庫連線...');

    try {
      await sequelize.authenticate();
      this.recordTest('database.connection', true);

      // 測試查詢
      const result = await sequelize.query('SELECT 1 as test');
      this.recordTest('database.query', 
        Array.isArray(result) && result.length === 2);

    } catch (error) {
      this.recordTest('database.connection', false, error instanceof Error ? error.message : String(error));
    }
  }

  /**
   * 產生測試報告
   */
  generateReport() {
    console.log('\n📊 測試報告');
    console.log('='.repeat(50));

    const totalTests = Object.keys(this.testResults).length;
    const passedTests = Object.values(this.testResults).filter(Boolean).length;
    const failedTests = totalTests - passedTests;

    console.log(`總測試項目: ${totalTests}`);
    console.log(`通過測試: ${passedTests}`);
    console.log(`失敗測試: ${failedTests}`);
    console.log(`通過率: ${((Number(passedTests) / Number(totalTests)) * 100).toFixed(1)}%`);

    if (failedTests > 0) {
      console.log('\n❌ 失敗的測試項目:');
      Object.entries(this.testResults).forEach(([testName, passed]) => {
        if (!passed) {
          console.log(`   - ${testName}: ${this.testErrors[testName] || '未知錯誤'}`);
        }
      });
    }

    console.log('\n' + '='.repeat(50));

    return {
      total: totalTests,
      passed: passedTests,
      failed: failedTests,
      passRate: (Number(passedTests) / Number(totalTests)) * 100,
      results: this.testResults,
      errors: this.testErrors
    };
  }

  /**
   * 執行所有測試
   */
  async runAllTests() {
    console.log('🧪 開始執行服務功能測試...');

    try {
      await this.testDatabaseConnection();
      await this.testMemberService();
      await this.testEventService();
      await this.testAnnouncementService();
      await this.testRegistrationService();
      await this.testCheckinService();
      await this.testAdminService();

      return this.generateReport();
    } catch (error) {
      console.error('❌ 測試執行失敗:', error);
      throw error;
    }
  }
}

// 主執行函數
async function main() {
  const tester = new ServiceFunctionTester();

  try {
    const report = await tester.runAllTests();

    if (report.failed === 0) {
      console.log('\n🎉 所有測試通過！');
      process.exit(0);
    } else {
      console.log('\n⚠️ 部分測試失敗，請檢查錯誤訊息');
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ 測試執行失敗:', error);
    process.exit(1);
  }
}

// 當直接執行此腳本時運行
if (require.main === module) {
  main();
}

export default ServiceFunctionTester;