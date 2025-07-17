
import fs from 'fs';
import path from 'path';

const checkFrontendStatus = () => {
  console.log('🎨 檢查前端狀態...\n');
  
  const clientDir = path.join(__dirname, '../client');
  const distDir = path.join(clientDir, 'dist');
  const publicDir = path.join(__dirname, '../public');
  
  // 檢查 client 目錄
  if (fs.existsSync(clientDir)) {
    console.log('✅ client 目錄存在');
    
    // 檢查 package.json
    const packageJsonPath = path.join(clientDir, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      console.log('✅ client/package.json 存在');
      try {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
        console.log(`📦 前端專案名稱: ${packageJson.name}`);
        console.log(`🔧 建置腳本: ${packageJson.scripts?.build || '未定義'}`);
      } catch (error) {
        console.log('❌ package.json 格式錯誤');
      }
    } else {
      console.log('❌ client/package.json 不存在');
    }
    
    // 檢查 dist 目錄
    if (fs.existsSync(distDir)) {
      console.log('✅ client/dist 目錄存在');
      const files = fs.readdirSync(distDir);
      console.log(`📁 建置檔案數量: ${files.length}`);
      
      if (files.includes('index.html')) {
        console.log('✅ index.html 存在');
      } else {
        console.log('❌ index.html 不存在');
      }
    } else {
      console.log('❌ client/dist 目錄不存在');
      console.log('💡 建議執行: cd client && npm install && npm run build');
    }
  } else {
    console.log('❌ client 目錄不存在');
  }
  
  // 檢查 public 目錄
  if (fs.existsSync(publicDir)) {
    console.log('✅ public 目錄存在');
    const files = fs.readdirSync(publicDir);
    console.log(`📁 靜態檔案數量: ${files.length}`);
  } else {
    console.log('❌ public 目錄不存在');
  }
  
  console.log('\n🎯 前端狀態檢查完成');
};

checkFrontendStatus();
