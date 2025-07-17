import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Admin: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setError(null);
        console.log('🔄 開始載入管理員統計資料...');

        // 先測試 health check
        const healthResponse = await axios.get('/health', { timeout: 3000 });
        console.log('✅ Health check 成功:', healthResponse.data);

        // 先嘗試快速統計
        console.log('🚀 嘗試快速統計...');
        try {
          const quickResponse = await axios.get('/api/admin/quick-summary', {
            timeout: 2000
          });
          console.log('✅ 快速統計成功:', quickResponse.data);
        } catch (quickError) {
          console.warn('⚠️ 快速統計失敗:', quickError.message);
        }

        // 再調用統計 API (降低超時時間)
        let retryCount = 0;
        const maxRetries = 3;

        while (retryCount < maxRetries) {
          try {
            const response = await axios.get('/api/admin/summary', {
              timeout: 4000, // 降低超時時間
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              }
            });

            console.log('✅ 統計資料載入成功:', response.data);
            setStats(response.data);
            setLoading(false);
            return; // 成功後直接返回

          } catch (attemptError) {
            retryCount++;
            console.warn(`❌ 第 ${retryCount} 次嘗試失敗:`, attemptError.message);

            if (retryCount < maxRetries) {
              console.log(`⏳ 等待 ${retryCount * 2} 秒後重試...`);
              await new Promise(resolve => setTimeout(resolve, retryCount * 2000));
            } else {
              throw attemptError; // 最後一次嘗試失敗後拋出錯誤
            }
          }
        }
      } catch (error) {
        console.error('載入統計資料失敗:', error);

        // 嘗試載入快速統計作為後備
        try {
          console.log('🔄 嘗試載入快速統計...');
          const quickResponse = await axios.get('/api/admin/quick-summary', {
            timeout: 3000
          });
          console.log('✅ 快速統計載入成功:', quickResponse.data);

          // 使用快速統計的格式
          setStats({
            memberCount: 0,
            activeMembers: 0,
            registrationCount: 0,
            eventCount: 0,
            message: '使用快速統計模式',
            systemInfo: quickResponse.data
          });
        } catch (quickError) {
          console.error('快速統計也失敗:', quickError);
          setError(error instanceof Error ? error.message : '載入統計資料失敗');
        }

        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '20px' }}>
        <h1>管理員面板</h1>
        <div>🔄 載入統計資料中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px' }}>
        <h1>管理員面板</h1>
        <div style={{ color: 'red', marginBottom: '20px' }}>
          ❌ 錯誤: {error}
        </div>
        <button onClick={() => window.location.reload()}>
          🔄 重新載入
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>管理員面板</h1>
      {stats ? (
        <div>
          <h2>📊 系統統計</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
            <div style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }}>
              <strong>👥 會員總數:</strong> {stats.memberCount}
            </div>
            <div style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }}>
              <strong>✅ 活躍會員:</strong> {stats.activeMembers}
            </div>
            <div style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }}>
              <strong>📝 報名總數:</strong> {stats.registrationCount}
            </div>
            <div style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }}>
              <strong>🎉 活動總數:</strong> {stats.eventCount}
            </div>
          </div>
          <div style={{ marginTop: '15px', fontSize: '0.9em', color: '#666' }}>
            最後更新: {new Date(stats.timestamp).toLocaleString('zh-TW')}
          </div>
        </div>
      ) : (
        <div>❌ 無統計資料可顯示</div>
      )}
    </div>
  );
};

export default Admin;