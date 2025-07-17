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

        // 再調用統計 API
        const response = await axios.get('/api/admin/summary', {
          timeout: 10000, // 延長超時時間
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });

        console.log('✅ 統計資料載入成功:', response.data);
        setStats(response.data);
      } catch (error: any) {
        console.error('❌ 載入統計資料失敗:', error);
        setError(error.message || '載入失敗');

        // 如果是網路錯誤，嘗試直接訪問
        if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
          console.log('🔄 嘗試直接訪問 API...');
          try {
              const directResponse = await fetch('/api/admin/summary', {
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json',
                  'Accept': 'application/json'
                }
              });
              if (directResponse.ok) {
                const data = await directResponse.json();
                console.log('✅ 直接訪問成功:', data);
                setStats(data);
                setError(null);
              } else {
                console.error('❌ 直接訪問失敗，狀態碼:', directResponse.status);
              }
            } catch (fetchError) {
              console.error('❌ 直接訪問也失敗:', fetchError);
            }
        }
      } finally {
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