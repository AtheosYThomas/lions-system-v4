
import { runSystemDiagnostic } from './utils/systemDiagnostic';
import { healthCheck } from './utils/healthCheck';

const testSystem = async () => {
  console.log('🧪 開始快速系統測試...\n');
  
  try {
    // 執行完整診斷
    await runSystemDiagnostic();
    
    console.log('\n🔗 測試系統端點...');
    
    // 如果有伺服器在運行，可以測試端點
    const axios = require('axios');
    
    try {
      const response = await axios.get('http://localhost:5000/health');
      console.log('✅ /health 端點正常:', response.data);
    } catch (error) {
      console.log('❌ /health 端點無法連接，伺服器可能未啟動');
    }
    
    try {
      const response = await axios.get('http://localhost:5000/healthz');
      console.log('✅ /healthz 端點正常:', response.data);
    } catch (error) {
      console.log('❌ /healthz 端點無法連接');
    }
    
  } catch (error) {
    console.error('測試過程發生錯誤:', error);
  }
  
  console.log('\n🎯 測試完成！');
};

testSystem();
