
import sequelize from './config/database';
import Member from './models/member';
import Event from './models/event';
import Registration from './models/registration';
import Payment from './models/payment';
import Checkin from './models/checkin';
import './models/index'; // 載入關聯設定

const testAssociations = async () => {
  try {
    console.log('🔍 開始測試關聯完整性和 Eager Loading...\n');

    // 1. 連接資料庫
    await sequelize.authenticate();
    console.log('✅ 資料庫連線成功');

    // 2. 創建測試資料
    console.log('\n📝 創建測試資料...');
    
    const testMember = await Member.create({
      name: '測試會員',
      email: 'test@example.com',
      line_uid: 'test_line_uid',
      phone: '0912345678'
    });
    console.log('✅ 測試會員已創建:', testMember.id);

    const testEvent = await Event.create({
      title: '測試活動',
      description: '測試用活動',
      date: new Date('2024-12-31'),
      location: '測試地點',
      max_attendees: 50
    });
    console.log('✅ 測試活動已創建:', testEvent.id);

    // 3. 創建關聯資料
    const registration = await Registration.create({
      event_id: testEvent.id,
      member_id: testMember.id,
      status: 'confirmed'
    });
    console.log('✅ 報名記錄已創建:', registration.id);

    const payment = await Payment.create({
      member_id: testMember.id,
      event_id: testEvent.id,
      amount: 1000,
      method: 'credit_card',
      status: 'completed'
    });
    console.log('✅ 付款記錄已創建:', payment.id);

    const checkin = await Checkin.create({
      member_id: testMember.id,
      event_id: testEvent.id,
      checkin_time: new Date(),
      device_info: 'test_device'
    });
    console.log('✅ 簽到記錄已創建:', checkin.id);

    // 4. 測試 Eager Loading
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

    // 5. 測試 CASCADE 刪除 - 先查詢關聯記錄數量
    console.log('\n🔍 測試 CASCADE 刪除完整性...');
    
    const beforeDeleteCounts = {
      registrations: await Registration.count({ where: { member_id: testMember.id } }),
      payments: await Payment.count({ where: { member_id: testMember.id } }),
      checkins: await Checkin.count({ where: { member_id: testMember.id } })
    };
    
    console.log('刪除前的關聯記錄數量:');
    console.log(`  - 報名記錄: ${beforeDeleteCounts.registrations}`);
    console.log(`  - 付款記錄: ${beforeDeleteCounts.payments}`);
    console.log(`  - 簽到記錄: ${beforeDeleteCounts.checkins}`);

    // 6. 刪除 Member，測試 CASCADE
    console.log('\n🗑️ 刪除測試會員...');
    await testMember.destroy();
    console.log('✅ 測試會員已刪除');

    // 7. 檢查關聯記錄是否被自動刪除
    const afterDeleteCounts = {
      registrations: await Registration.count({ where: { member_id: testMember.id } }),
      payments: await Payment.count({ where: { member_id: testMember.id } }),
      checkins: await Checkin.count({ where: { member_id: testMember.id } })
    };
    
    console.log('\n刪除後的關聯記錄數量:');
    console.log(`  - 報名記錄: ${afterDeleteCounts.registrations}`);
    console.log(`  - 付款記錄: ${afterDeleteCounts.payments}`);
    console.log(`  - 簽到記錄: ${afterDeleteCounts.checkins}`);

    // 8. 驗證 CASCADE 是否成功
    const cascadeSuccess = 
      afterDeleteCounts.registrations === 0 &&
      afterDeleteCounts.payments === 0 &&
      afterDeleteCounts.checkins === 0;

    if (cascadeSuccess) {
      console.log('\n✅ CASCADE 刪除測試通過！所有關聯記錄已自動刪除');
    } else {
      console.log('\n❌ CASCADE 刪除測試失敗！部分關聯記錄未被刪除');
    }

    // 9. 清理測試 Event
    await testEvent.destroy();
    console.log('✅ 測試活動已清理');

    // 10. 最終結果報告
    console.log('\n📋 測試結果報告:');
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
    }
  } finally {
    await sequelize.close();
    console.log('\n🔌 資料庫連線已關閉');
  }
};

// 執行測試
testAssociations().catch(console.error);
