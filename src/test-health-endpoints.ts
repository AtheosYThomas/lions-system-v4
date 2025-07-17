
import axios from 'axios';

const testHealthEndpoints = async () => {
  console.log('🏥 開始測試健康檢查端點...\n');
  
  const endpoints = [
    'http://localhost:5000/health',
    'http://localhost:5000/healthz',
    'http://localhost:5000/api/health'
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`📍 測試 ${endpoint}...`);
      const response = await axios.get(endpoint, { timeout: 5000 });
      console.log(`✅ ${endpoint} 正常回應:`, response.status);
      console.log(`📄 回應內容:`, response.data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNREFUSED') {
          console.log(`❌ ${endpoint} 連線被拒絕 - 伺服器未啟動`);
        } else if (error.response) {
          console.log(`⚠️ ${endpoint} 回應錯誤:`, error.response.status);
        } else {
          console.log(`❌ ${endpoint} 網路錯誤:`, error.message);
        }
      } else {
        console.log(`❌ ${endpoint} 未知錯誤:`, error);
      }
    }
    console.log('');
  }
  
  console.log('🎯 健康檢查端點測試完成');
};

testHealthEndpoints().catch(console.error);
