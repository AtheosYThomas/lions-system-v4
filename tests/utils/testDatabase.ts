
import { sequelize } from '../../src/models/index';
import Member from '../../src/models/member';
import Event from '../../src/models/event';
import Registration from '../../src/models/registration';
import Announcement from '../../src/models/announcement';
import Checkin from '../../src/models/checkin';
import Payment from '../../src/models/payment';
import MockDataSeeder from '../../src/scripts/test/seedMockData';

/**
 * 測試資料庫工具類別
 */
export class TestDatabase {
  private static seeder = new MockDataSeeder();

  /**
   * 清理所有測試資料
   */
  static async clean(): Promise<void> {
    try {
      console.log('🧽 清理測試資料...');
      
      // 依照外鍵關係順序刪除
      await Payment.destroy({ where: {}, truncate: true });
      await Checkin.destroy({ where: {}, truncate: true });
      await Registration.destroy({ where: {}, truncate: true });
      await Announcement.destroy({ where: {}, truncate: true });
      await Event.destroy({ where: {}, truncate: true });
      await Member.destroy({ where: {}, truncate: true });
      
      console.log('✅ 測試資料清理完成');
    } catch (error) {
      console.error('❌ 清理測試資料失敗:', error);
      throw error;
    }
  }

  /**
   * 建立測試資料
   */
  static async seed(): Promise<{
    members: Member[];
    events: Event[];
    announcements: Announcement[];
    registrations: Registration[];
    checkins: Checkin[];
    payments: Payment[];
  }> {
    try {
      console.log('🌱 建立測試資料...');
      
      const members = await this.seeder.seedMembers();
      const events = await this.seeder.seedEvents();
      const announcements = await this.seeder.seedAnnouncements(members, events);
      const registrations = await this.seeder.seedRegistrations(members, events);
      const checkins = await this.seeder.seedCheckins(members, events);
      const payments = await this.seeder.seedPayments(members, events);
      
      console.log('✅ 測試資料建立完成');
      
      return {
        members,
        events,
        announcements,
        registrations,
        checkins,
        payments,
      };
    } catch (error) {
      console.error('❌ 建立測試資料失敗:', error);
      throw error;
    }
  }

  /**
   * 重置資料庫（清理 + 建立新資料）
   */
  static async reset(): Promise<{
    members: Member[];
    events: Event[];
    announcements: Announcement[];
    registrations: Registration[];
    checkins: Checkin[];
    payments: Payment[];
  }> {
    await this.clean();
    return await this.seed();
  }

  /**
   * 建立單一測試會員
   */
  static async createTestMember(data: Partial<any> = {}): Promise<Member> {
    const defaultData = {
      name: '測試會員',
      email: 'test@example.com',
      line_uid: 'test_uid_' + Date.now(),
      role: 'member',
      status: 'active',
      ...data,
    };

    return await Member.create(defaultData);
  }

  /**
   * 建立單一測試活動
   */
  static async createTestEvent(data: Partial<any> = {}): Promise<Event> {
    const defaultData = {
      title: '測試活動',
      description: '這是一個測試活動',
      date: new Date(),
      location: '測試地點',
      max_attendees: 10,
      status: 'active',
      ...data,
    };

    return await Event.create(defaultData);
  }
}

// 導出 db 物件以符合你的需求
export const db = {
  clean: () => TestDatabase.clean(),
  seed: () => TestDatabase.seed(),
  reset: () => TestDatabase.reset(),
  createTestMember: (data?: Partial<any>) => TestDatabase.createTestMember(data),
  createTestEvent: (data?: Partial<any>) => TestDatabase.createTestEvent(data),
};
