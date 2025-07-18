
import express from 'express';

async function fullSystemTest() {
  console.log('🧪 開始完整系統重構檢查...');
  
  // 1. 測試所有控制器匯入
  try {
    console.log('1️⃣ 測試控制器匯入...');
    const lineController = await import('../controllers/lineController');
    const memberController = await import('../controllers/memberController');
    const announcementController = await import('../controllers/announcementController');
    const checkinController = await import('../controllers/checkinController');
    const liffController = await import('../controllers/liffController');
    console.log('✅ 所有控制器匯入成功');
  } catch (error) {
    console.error('❌ 控制器匯入失敗:', error);
    return;
  }

  // 2. 測試所有路由匯入
  try {
    console.log('2️⃣ 測試路由匯入...');
    const lineWebhook = await import('../routes/line/webhook');
    const memberRoutes = await import('../routes/api/members');
    const announcementRoutes = await import('../routes/api/announcements');
    const checkinRoutes = await import('../routes/api/checkin');
    const liffRoutes = await import('../routes/api/liff');
    const adminRoutes = await import('../routes/admin');
    console.log('✅ 所有路由匯入成功');
  } catch (error) {
    console.error('❌ 路由匯入失敗:', error);
    return;
  }

  // 3. 測試服務層匯入
  try {
    console.log('3️⃣ 測試服務層匯入...');
    const lineService = await import('../services/lineService');
    console.log('✅ 服務層匯入成功');
  } catch (error) {
    console.error('❌ 服務層匯入失敗:', error);
    return;
  }

  // 4. 測試模型匯入
  try {
    console.log('4️⃣ 測試模型匯入...');
    const models = await import('../models/index');
    console.log('✅ 模型匯入成功');
  } catch (error) {
    console.error('❌ 模型匯入失敗:', error);
    return;
  }

  // 5. 檢查舊路由檔案是否需要清理
  try {
    console.log('5️⃣ 檢查是否有重複路由檔案...');
    const fs = await import('fs');
    const path = await import('path');
    
    const oldRoutes = [
      'src/routes/members.ts',
      'src/routes/announcements.ts', 
      'src/routes/checkin.ts',
      'src/routes/liff.ts'
    ];
    
    const duplicateFiles = [];
    for (const route of oldRoutes) {
      if (fs.existsSync(route)) {
        duplicateFiles.push(route);
      }
    }
    
    if (duplicateFiles.length > 0) {
      console.log('⚠️ 發現重複的舊路由檔案:', duplicateFiles);
      console.log('建議刪除這些檔案以避免混淆');
    } else {
      console.log('✅ 沒有重複的路由檔案');
    }
  } catch (error) {
    console.error('❌ 檢查重複檔案失敗:', error);
  }

  // 6. 測試主要 index.ts 匯入
  try {
    console.log('6️⃣ 測試主程式匯入...');
    // 不直接匯入 index.ts 以避免啟動伺服器
    const fs = await import('fs');
    const indexContent = fs.readFileSync('src/index.ts', 'utf8');
    
    // 檢查關鍵匯入是否存在
    const requiredImports = [
      "from './routes/api/members'",
      "from './routes/api/announcements'", 
      "from './routes/api/checkin'",
      "from './routes/api/liff'",
      "from './routes/line/webhook'"
    ];
    
    let missingImports = [];
    for (const importStatement of requiredImports) {
      if (!indexContent.includes(importStatement)) {
        missingImports.push(importStatement);
      }
    }
    
    if (missingImports.length > 0) {
      console.log('⚠️ index.ts 缺少匯入:', missingImports);
    } else {
      console.log('✅ index.ts 所有匯入正確');
    }
  } catch (error) {
    console.error('❌ 檢查 index.ts 失敗:', error);
  }

  console.log('🎉 系統重構檢查完成！');
}

fullSystemTest().catch(console.error);
