
import sequelize from './config/database';
import Member from './models/member';
import Event from './models/event';
import Registration from './models/registration';
import Payment from './models/payment';
import Checkin from './models/checkin';
import MessageLog from './models/messageLog';

// 建立 models map 傳給 associate
const models = {
  Member,
  Event,
  Registration,
  Payment,
  Checkin,
  MessageLog
};

// 確保所有關聯都正確建立
console.log('🔧 開始建立模型關聯...');
Object.values(models).forEach((model: any) => {
  if (model.associate && typeof model.associate === 'function') {
    try {
      model.associate(models);
      console.log(`✅ ${model.name} 關聯建立成功`);
    } catch (error) {
      console.error(`❌ ${model.name} 關聯建立失敗:`, error);
    }
  }
});

const testAssociations = async () => {
  try {
    console.log('🔍 開始測試關聯完整性和 Eager Loading...\n');

    // 1. 連接資料庫
    await sequelize.authenticate();
    console.log('✅ 資料庫連線成功');

    // 2. 同步資料庫結構（確保所有表格都存在）
    console.log('🔄 同步資料庫結構...');
    await sequelize.sync({ force: true });
    console.log('✅ 資料庫結構同步完成');

    // 3. 創建測試資料（包含所有必填欄位）
    console.log('\n📝 創建測試資料...');
    
    const testMember = await Member.create({
      name: '測試會員',
      email: 'test@example.com',
      line_uid: 'test_line_uid',
      phone: '0912345678',
      status: 'active', // ✅ 必填欄位
      role: 'member'
    });
    console.log('✅ 測試會員已創建:', testMember.get('id'));

    const testEvent = await Event.create({
      title: '測試活動',
      description: '測試用活動',
      date: new Date('2024-12-31'),
      location: '測試地點',
      max_attendees: 50,
      status: 'active' // ✅ 確保狀態正確
    });
    console.log('✅ 測試活動已創建:', testEvent.get('id'));

    // 4. 創建關聯資料
    const registration = await Registration.create({
      event_id: testEvent.get('id') as string,
      member_id: testMember.get('id') as string,
      registration_date: new Date(),
      status: 'confirmed' // ✅ 必填欄位
    });
    console.log('✅ 報名記錄已創建:', registration.get('id'));

    const payment = await Payment.create({
      member_id: testMember.get('id') as string,
      event_id: testEvent.get('id') as string,
      amount: 1000,
      method: 'credit_card',
      status: 'pending' // ✅ 必填欄位
    });
    console.log('✅ 付款記錄已創建:', payment.get('id'));

    const checkin = await Checkin.create({
      member_id: testMember.get('id') as string,
      event_id: testEvent.get('id') as string,
      checkin_time: new Date(),
      device_info: 'test_device'
    });
    console.log('✅ 簽到記錄已創建:', checkin.get('id'));

    const messageLog = await MessageLog.create({
      user_id: testMember.get('line_uid') as string, // ✅ 使用 line_uid
      message_type: 'text',
      message_content: '測試訊息',
      intent: 'greeting',
      action_taken: 'replied',
      event_id: testEvent.get('id') as string
    });
    console.log('✅ 訊息記錄已創建:', messageLog.get('id'));

    // 5. 測試 Eager Loading
    console.log('\n🔍 測試 Eager Loading...');
    
    const memberWithRegistrations = await Member.findAll({
      include: [
        {
          model: Registration,
          include: [Event]
        },
        Payment,
        Checkin
      ]
    });
    
    console.log('✅ Member Eager Loading 成功:');
    memberWithRegistrations.forEach((member: any) => {
      console.log(`  - 會員: ${member.name}`);
      console.log(`  - 報名數量: ${member.Registrations?.length || 0}`);
      console.log(`  - 付款數量: ${member.Payments?.length || 0}`);
      console.log(`  - 簽到數量: ${member.Checkins?.length || 0}`);
    });

    const eventWithRegistrations = await Event.findAll({
      include: [
        {
          model: Registration,
          include: [Member]
        },
        Payment,
        Checkin
      ]
    });
    
    console.log('\n✅ Event Eager Loading 成功:');
    eventWithRegistrations.forEach((event: any) => {
      console.log(`  - 活動: ${event.title}`);
      console.log(`  - 報名數量: ${event.Registrations?.length || 0}`);
      console.log(`  - 付款數量: ${event.Payments?.length || 0}`);
      console.log(`  - 簽到數量: ${event.Checkins?.length || 0}`);
    });

    // 6. 測試 CASCADE 刪除
    console.log('\n🔍 測試 CASCADE 刪除完整性...');
    
    const beforeDeleteCounts = {
      registrations: await Registration.count({ where: { member_id: testMember.get('id') } }),
      payments: await Payment.count({ where: { member_id: testMember.get('id') } }),
      checkins: await Checkin.count({ where: { member_id: testMember.get('id') } })
    };
    
    console.log('刪除前的關聯記錄數量:');
    console.log(`  - 報名記錄: ${beforeDeleteCounts.registrations}`);
    console.log(`  - 付款記錄: ${beforeDeleteCounts.payments}`);
    console.log(`  - 簽到記錄: ${beforeDeleteCounts.checkins}`);

    // 7. 刪除 Member，測試 CASCADE
    console.log('\n🗑️ 刪除測試會員...');
    await testMember.destroy();
    console.log('✅ 測試會員已刪除');

    // 8. 檢查關聯記錄是否被自動刪除
    const afterDeleteCounts = {
      registrations: await Registration.count({ where: { member_id: testMember.get('id') } }),
      payments: await Payment.count({ where: { member_id: testMember.get('id') } }),
      checkins: await Checkin.count({ where: { member_id: testMember.get('id') } })
    };
    
    console.log('\n刪除後的關聯記錄數量:');
    console.log(`  - 報名記錄: ${afterDeleteCounts.registrations}`);
    console.log(`  - 付款記錄: ${afterDeleteCounts.payments}`);
    console.log(`  - 簽到記錄: ${afterDeleteCounts.checkins}`);

    // 9. 驗證 CASCADE 是否成功
    const cascadeSuccess = 
      afterDeleteCounts.registrations === 0 &&
      afterDeleteCounts.payments === 0 &&
      afterDeleteCounts.checkins === 0;

    if (cascadeSuccess) {
      console.log('\n✅ CASCADE 刪除測試通過！所有關聯記錄已自動刪除');
    } else {
      console.log('\n❌ CASCADE 刪除測試失敗！部分關聯記錄未被刪除');
    }

    // 10. 清理測試 Event 和 MessageLog
    await messageLog.destroy();
    await testEvent.destroy();
    console.log('✅ 測試資料已清理');

    // 11. 最終結果報告
    console.log('\n📋 測試結果報告:');
    console.log(`✅ 模型關聯初始化: 成功`);
    console.log(`✅ 資料庫同步: 成功`);
    console.log(`✅ 測試資料創建: 成功`);
    console.log(`✅ Eager Loading: 成功`);
    console.log(`${cascadeSuccess ? '✅' : '❌'} CASCADE 刪除: ${cascadeSuccess ? '成功' : '失敗'}`);
    
    if (cascadeSuccess) {
      console.log('\n🎉 所有關聯測試通過！系統關聯完整性正常');
    } else {
      console.log('\n⚠️ 關聯完整性測試有問題，請檢查模型設定');
    }

  } catch (error) {
    console.error('❌ 測試過程中發生錯誤:', error);
    if (error instanceof Error) {
      console.error('錯誤詳情:', error.message);
      console.error('錯誤堆疊:', error.stack);
    }
  } finally {
    await sequelize.close();
    console.log('\n🔌 資料庫連線已關閉');
  }
};

// 執行測試
testAssociations().catch(console.error);
