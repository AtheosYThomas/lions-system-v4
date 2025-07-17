
import memberController from '../controllers/memberController';
import announcementController from '../controllers/announcementController';
import checkinController from '../controllers/checkinController';
import liffController from '../controllers/liffController';

async function testControllersRefactor() {
  console.log('🧪 開始測試 Routes 重構...');
  
  // 1. 測試控制器匯入
  try {
    console.log('1️⃣ 測試控制器匯入...');
    console.log('✅ MemberController methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(memberController)));
    console.log('✅ AnnouncementController methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(announcementController)));
    console.log('✅ CheckinController methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(checkinController)));
    console.log('✅ LiffController methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(liffController)));
  } catch (error) {
    console.error('❌ 控制器匯入測試失敗:', error);
  }

  // 2. 測試路由匯入
  try {
    console.log('2️⃣ 測試新路由匯入...');
    const memberRoutes = await import('../routes/api/members');
    const announcementRoutes = await import('../routes/api/announcements');
    const checkinRoutes = await import('../routes/api/checkin');
    const liffRoutes = await import('../routes/api/liff');
    console.log('✅ 所有新路由匯入成功');
  } catch (error) {
    console.error('❌ 路由匯入測試失敗:', error);
  }

  console.log('🎉 Routes 重構測試完成！');
}

testControllersRefactor().catch(console.error);
