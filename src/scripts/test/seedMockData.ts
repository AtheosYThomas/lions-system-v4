import { sequelize } from '../../models/index';
import Member from '../../models/member';
import Event from '../../models/event';
import Registration from '../../models/registration';
import Announcement from '../../models/announcement';
import Checkin from '../../models/checkin';
import Payment from '../../models/payment';
import { v4 as uuidv4 } from 'uuid';

/**
 * 建立 Mock 測試資料
 * 僅用於開發環境測試，不要在 production 使用
 */
class MockDataSeeder {
  /**
   * 清空所有表格資料
   */
  async clearAllTables() {
    console.log('🗑️ 清空所有測試資料...');

    try {
      // 依照外鍵關係順序刪除
      await Payment.destroy({ where: {}, truncate: true });
      await Checkin.destroy({ where: {}, truncate: true });
      await Registration.destroy({ where: {}, truncate: true });
      await Announcement.destroy({ where: {}, truncate: true });
      await Event.destroy({ where: {}, truncate: true });
      await Member.destroy({ where: {}, truncate: true });

      console.log('✅ 所有測試資料已清空');
    } catch (error) {
      console.error('❌ 清空資料失敗:', error);
      throw error;
    }
  }

  /**
   * 建立測試會員資料
   */
  async seedMembers() {
    console.log('👥 建立測試會員資料...');

    const mockMembers = [
      {
        id: uuidv4(),
        name: '張三',
        email: 'zhang.san@example.com',
        line_uid: 'U1234567890abcdef',
        role: 'officer',
        phone: '0912345678',
        english_name: 'Zhang San',
        birthday: '1990-01-15',
        job_title: '軟體工程師',
        fax: '02-12345678',
        address: '台北市中正區重慶南路一段122號',
        mobile: '0912345678',
        status: 'active' as const,
      },
      {
        id: uuidv4(),
        name: '李四',
        email: 'li.si@example.com',
        line_uid: 'U2234567890abcdef',
        role: 'member',
        phone: '0923456789',
        english_name: 'Li Si',
        birthday: '1985-05-20',
        job_title: '行銷專員',
        fax: '02-23456789',
        address: '台北市大安區信義路三段134號',
        mobile: '0923456789',
        status: 'active' as const,
      },
      {
        id: uuidv4(),
        name: '王五',
        email: 'wang.wu@example.com',
        line_uid: 'U3234567890abcdef',
        role: 'member',
        phone: '0934567890',
        english_name: 'Wang Wu',
        birthday: '1992-08-10',
        job_title: '設計師',
        fax: '02-34567890',
        address: '台北市信義區松仁路100號',
        mobile: '0934567890',
        status: 'active' as const,
      },
      {
        id: uuidv4(),
        name: '趙六',
        email: 'zhao.liu@example.com',
        line_uid: 'U4234567890abcdef',
        role: 'officer',
        phone: '0945678901',
        english_name: 'Zhao Liu',
        birthday: '1988-12-25',
        job_title: '財務分析師',
        fax: '02-45678901',
        address: '台北市松山區南京東路四段1號',
        mobile: '0945678901',
        status: 'active' as const,
      },
      {
        id: uuidv4(),
        name: '陳七',
        email: 'chen.qi@example.com',
        line_uid: 'U5234567890abcdef',
        role: 'member',
        phone: '0956789012',
        english_name: 'Chen Qi',
        birthday: '1991-03-30',
        job_title: '教師',
        fax: '02-56789012',
        address: '台北市中山區中山北路二段48號',
        mobile: '0956789012',
        status: 'inactive' as const,
      },
    ];

    try {
      const members = await Member.bulkCreate(mockMembers);
      console.log(`✅ 已建立 ${members.length} 位測試會員`);
      return members;
    } catch (error) {
      console.error('❌ 建立會員資料失敗:', error);
      throw error;
    }
  }

  /**
   * 建立測試活動資料
   */
  async seedEvents() {
    console.log('🎭 建立測試活動資料...');

    const mockEvents = [
      {
        id: uuidv4(),
        title: '2024年度春季例會',
        description: '北大獅子會2024年度春季例會，討論年度計畫與活動安排',
        date: new Date('2024-03-15 19:00:00'),
        location: '北大校友會館',
        max_attendees: 50,
        status: 'active' as const,
        created_at: new Date('2024-03-01 10:00:00'),
      },
      {
        id: uuidv4(),
        title: '公益植樹活動',
        description: '響應地球日，舉辦公益植樹活動，為環保盡一份心力',
        date: new Date('2024-04-22 09:00:00'),
        location: '陽明山國家公園',
        max_attendees: 30,
        status: 'active' as const,
        created_at: new Date('2024-03-05 14:00:00'),
      },
      {
        id: uuidv4(),
        title: '獅子會年度聚餐',
        description: '年度聚餐活動，加強會員之間的聯誼與交流',
        date: new Date('2024-05-18 18:30:00'),
        location: '台北晶華酒店',
        max_attendees: 100,
        status: 'active' as const,
        created_at: new Date('2024-04-01 09:00:00'),
      },
      {
        id: uuidv4(),
        title: '慈善義賣活動',
        description: '籌辦慈善義賣活動，為弱勢族群募集善款',
        date: new Date('2024-06-10 14:00:00'),
        location: '台北市政府廣場',
        max_attendees: 20,
        status: 'active' as const,
        created_at: new Date('2024-05-01 11:00:00'),
      },
      {
        id: uuidv4(),
        title: '已取消的活動',
        description: '因故取消的測試活動',
        date: new Date('2024-07-15 10:00:00'),
        location: '測試地點',
        max_attendees: 25,
        status: 'cancelled' as const,
        created_at: new Date('2024-06-01 16:00:00'),
      },
    ];

    try {
      const events = await Event.bulkCreate(mockEvents);
      console.log(`✅ 已建立 ${events.length} 個測試活動`);
      return events;
    } catch (error) {
      console.error('❌ 建立活動資料失敗:', error);
      throw error;
    }
  }

  /**
   * 建立測試公告資料
   */
  async seedAnnouncements(members: Member[], events: Event[]) {
    console.log('📢 建立測試公告資料...');

    const mockAnnouncements = [
      {
        id: uuidv4(),
        title: '重要通知：春季例會時間調整',
        content:
          '因應場地調整，春季例會時間調整為3月15日晚上7點，請各位會員準時出席。',
        related_event_id: events[0].id,
        created_by: members[0].id,
        audience: 'all' as 'all' | 'officers' | 'members',
        category: 'event' as const,
        status: 'published' as 'draft' | 'scheduled' | 'published',
        scheduled_at: null,
        published_at: new Date('2024-03-01 10:00:00'),
        is_visible: true,
      },
      {
        id: uuidv4(),
        title: '公益植樹活動報名開始',
        content: '4月22日地球日公益植樹活動開始報名，名額有限，請踴躍參加！',
        related_event_id: events[1].id,
        created_by: members[3].id,
        audience: 'all' as 'all' | 'officers' | 'members',
        category: 'event' as const,
        status: 'published' as 'draft' | 'scheduled' | 'published',
        scheduled_at: null,
        published_at: new Date('2024-03-10 14:00:00'),
        is_visible: true,
      },
      {
        id: uuidv4(),
        title: '系統維護通知',
        content:
          '系統將於本週日凌晨2點進行維護，預計維護時間2小時，造成不便敬請見諒。',
        related_event_id: null,
        created_by: members[0].id,
        audience: 'all' as 'all' | 'officers' | 'members',
        category: 'system' as 'event' | 'system' | 'personnel',
        status: 'published' as 'draft' | 'scheduled' | 'published',
        scheduled_at: null,
        published_at: new Date('2024-03-20 16:00:00'),
        is_visible: true,
      },
      {
        id: uuidv4(),
        title: '幹部會議記錄',
        content: '本月幹部會議記錄已上傳至系統，請各位幹部查閱。',
        related_event_id: null,
        created_by: members[0].id,
        audience: 'officers' as 'all' | 'officers' | 'members',
        category: 'personnel' as 'event' | 'system' | 'personnel',
        status: 'published' as 'draft' | 'scheduled' | 'published',
        scheduled_at: null,
        published_at: new Date('2024-03-25 09:00:00'),
        is_visible: true,
      },
      {
        id: uuidv4(),
        title: '草稿公告',
        content: '這是一則草稿公告，尚未發布。',
        related_event_id: null,
        created_by: members[3].id,
        audience: 'all' as 'all' | 'officers' | 'members',
        category: 'event' as const,
        status: 'draft' as 'draft' | 'scheduled' | 'published',
        scheduled_at: null,
        published_at: null,
        is_visible: true,
      },
    ];

    try {
      const announcements = await Announcement.bulkCreate(mockAnnouncements);
      console.log(`✅ 已建立 ${announcements.length} 則測試公告`);
      return announcements;
    } catch (error) {
      console.error('❌ 建立公告資料失敗:', error);
      throw error;
    }
  }

  /**
   * 建立測試報名資料
   */
  async seedRegistrations(members: Member[], events: Event[]) {
    console.log('📝 建立測試報名資料...');

    const mockRegistrations = [
      {
        id: uuidv4(),
        event_id: events[0].id,
        member_id: members[0].id,
        registration_date: new Date('2024-03-02 10:00:00'),
        status: 'confirmed' as const,
      },
      {
        id: uuidv4(),
        event_id: events[0].id,
        member_id: members[1].id,
        registration_date: new Date('2024-03-03 14:00:00'),
        status: 'confirmed' as const,
      },
      {
        id: uuidv4(),
        event_id: events[1].id,
        member_id: members[0].id,
        registration_date: new Date('2024-03-12 09:00:00'),
        status: 'confirmed' as const,
      },
      {
        id: uuidv4(),
        event_id: events[1].id,
        member_id: members[2].id,
        registration_date: new Date('2024-03-13 16:00:00'),
        status: 'confirmed' as const,
      },
      {
        id: uuidv4(),
        event_id: events[2].id,
        member_id: members[1].id,
        registration_date: new Date('2024-04-01 11:00:00'),
        status: 'pending' as const,
      },
      {
        id: uuidv4(),
        event_id: events[2].id,
        member_id: members[3].id,
        registration_date: new Date('2024-04-02 15:00:00'),
        status: 'cancelled' as const,
      },
    ];

    try {
      const registrations = await Registration.bulkCreate(mockRegistrations);
      console.log(`✅ 已建立 ${registrations.length} 筆測試報名`);
      return registrations;
    } catch (error) {
      console.error('❌ 建立報名資料失敗:', error);
      throw error;
    }
  }

  /**
   * 建立測試簽到資料
   */
  async seedCheckins(members: Member[], events: Event[]) {
    console.log('✅ 建立測試簽到資料...');

    const mockCheckins = [
      {
        id: uuidv4(),
        member_id: members[0].id,
        event_id: events[0].id,
        checkin_time: new Date('2024-03-15 18:55:00'),
        device_info: 'iPhone 15 Pro, iOS 17.3',
      },
      {
        id: uuidv4(),
        member_id: members[1].id,
        event_id: events[0].id,
        checkin_time: new Date('2024-03-15 19:02:00'),
        device_info: 'Samsung Galaxy S24, Android 14',
      },
      {
        id: uuidv4(),
        member_id: members[0].id,
        event_id: events[1].id,
        checkin_time: new Date('2024-04-22 08:50:00'),
        device_info: 'iPhone 15 Pro, iOS 17.3',
      },
    ];

    try {
      const checkins = await Checkin.bulkCreate(mockCheckins);
      console.log(`✅ 已建立 ${checkins.length} 筆測試簽到`);
      return checkins;
    } catch (error) {
      console.error('❌ 建立簽到資料失敗:', error);
      throw error;
    }
  }

  /**
   * 建立測試付款資料
   */
  async seedPayments(members: Member[], events: Event[]) {
    console.log('💳 建立測試付款資料...');

    const mockPayments = [
      {
        id: uuidv4(),
        member_id: members[0].id,
        event_id: events[2].id,
        amount: 1500,
        payment_method: 'credit_card',
        payment_date: new Date('2024-04-05 10:30:00'),
        due_date: new Date('2024-05-15 23:59:59'),
        status: 'completed' as const,
        transaction_id: 'TXN001234567890',
      },
      {
        id: uuidv4(),
        member_id: members[1].id,
        event_id: events[2].id,
        amount: 1500,
        payment_method: 'bank_transfer',
        payment_date: new Date('2024-04-06 14:20:00'),
        due_date: new Date('2024-05-15 23:59:59'),
        status: 'completed' as const,
        transaction_id: 'TXN001234567891',
      },
      {
        id: uuidv4(),
        member_id: members[2].id,
        event_id: events[2].id,
        amount: 1500,
        payment_method: 'line_pay',
        payment_date: null,
        due_date: new Date('2024-05-15 23:59:59'),
        status: 'pending' as const,
        transaction_id: null,
      },
    ];

    try {
      const payments = await Payment.bulkCreate(mockPayments);
      console.log(`✅ 已建立 ${payments.length} 筆測試付款`);
      return payments;
    } catch (error) {
      console.error('❌ 建立付款資料失敗:', error);
      throw error;
    }
  }

  /**
   * 執行完整資料匯入
   */
  async runFullSeed() {
    console.log('🌱 開始建立完整測試資料...');

    try {
      // 確保資料庫連線
      await sequelize.authenticate();
      console.log('✅ 資料庫連線成功');

      // 清空現有資料
      await this.clearAllTables();

      // 建立測試資料
      const members = await this.seedMembers();
      const events = await this.seedEvents();
      const announcements = await this.seedAnnouncements(members, events);
      const registrations = await this.seedRegistrations(members, events);
      const checkins = await this.seedCheckins(members, events);
      const payments = await this.seedPayments(members, events);

      console.log('\n🎉 測試資料建立完成！');
      console.log('📊 統計資料：');
      console.log(`   👥 會員：${members.length} 位`);
      console.log(`   🎭 活動：${events.length} 個`);
      console.log(`   📢 公告：${announcements.length} 則`);
      console.log(`   📝 報名：${registrations.length} 筆`);
      console.log(`   ✅ 簽到：${checkins.length} 筆`);
      console.log(`   💳 付款：${payments.length} 筆`);
    } catch (error) {
      console.error('❌ 建立測試資料失敗:', error);
      throw error;
    }
  }
}

// 主執行函數
async function main() {
  const seeder = new MockDataSeeder();

  try {
    await seeder.runFullSeed();
    console.log('\n✅ Mock 資料匯入完成！');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Mock 資料匯入失敗:', error);
    process.exit(1);
  }
}

// 當直接執行此腳本時運行
if (require.main === module) {
  main();
}

export default MockDataSeeder;
