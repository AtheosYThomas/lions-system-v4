import React, { useEffect, useState } from 'react';

interface SystemStats {
  memberCount: number;
  activeMembers: number;
  registrationCount: number;
  eventCount: number;
  checkinCount: number;
}

export default function Home() {
  const [healthData, setHealthData] = useState<any>(null);
  const [statsData, setStatsData] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 檢查後端健康狀態
    fetch('/api/health')
      .then(res => res.json())
      .then(data => {
        console.log('🚀 後端連接測試成功:', data);
        setHealthData(data);
      })
      .catch(err => {
        console.error('❌ 後端連接失敗:', err);
      });

    // 獲取系統統計數據
    fetch('/admin/system-summary')
      .then(res => res.json())
      .then(data => {
        console.log('📊 系統統計數據:', data);
        setStatsData(data);
      })
      .catch(err => {
        console.error('❌ 系統統計數據獲取失敗:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>載入中...</h2>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '20px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh',
      color: 'white'
    }}>
      <div style={{
        textAlign: 'center',
        marginBottom: '40px'
      }}>
        <h1 style={{ 
          fontSize: '2.5rem',
          marginBottom: '10px',
          textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
        }}>
          🦁 北大獅子會系統
        </h1>
        <p style={{ 
          fontSize: '1.2rem',
          opacity: 0.9
        }}>
          歡迎使用會員服務系統 - 您的數位獅子會管理平台
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '20px',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* 會員數量 */}
        <div style={{
          background: 'rgba(255,255,255,0.1)',
          padding: '30px',
          borderRadius: '15px',
          textAlign: 'center',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.2)'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '10px' }}>👥</div>
          <h3 style={{ fontSize: '2rem', marginBottom: '5px' }}>
            {statsData?.memberCount || 0}
          </h3>
          <p style={{ opacity: 0.8 }}>會員數量</p>
        </div>

        {/* 活動數量 */}
        <div style={{
          background: 'rgba(255,255,255,0.1)',
          padding: '30px',
          borderRadius: '15px',
          textAlign: 'center',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.2)'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '10px' }}>📅</div>
          <h3 style={{ fontSize: '2rem', marginBottom: '5px' }}>
            {statsData?.eventCount || 0}
          </h3>
          <p style={{ opacity: 0.8 }}>活動總數</p>
        </div>

        {/* 報名數量 */}
        <div style={{
          background: 'rgba(255,255,255,0.1)',
          padding: '30px',
          borderRadius: '15px',
          textAlign: 'center',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.2)'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '10px' }}>📝</div>
          <h3 style={{ fontSize: '2rem', marginBottom: '5px' }}>
            {statsData?.registrationCount || 0}
          </h3>
          <p style={{ opacity: 0.8 }}>總報名數</p>
        </div>
      </div>

      {/* 快速功能區 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginTop: '40px',
        maxWidth: '1200px',
        margin: '40px auto 0'
      }}>
        {/* 會員資料 */}
        <div style={{
          background: 'rgba(76, 175, 80, 0.8)',
          padding: '30px',
          borderRadius: '15px',
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'transform 0.3s ease'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '15px' }}>👤</div>
          <h3 style={{ marginBottom: '10px' }}>會員資料</h3>
          <p style={{ opacity: 0.9 }}>查看和編輯會員資料</p>
        </div>

        {/* 活動報名 */}
        <div style={{
          background: 'rgba(33, 150, 243, 0.8)',
          padding: '30px',
          borderRadius: '15px',
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'transform 0.3s ease'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '15px' }}>📝</div>
          <h3 style={{ marginBottom: '10px' }}>活動報名</h3>
          <p style={{ opacity: 0.9 }}>報名參加獅子會活動</p>
        </div>

        {/* 會員註冊表 */}
        <div style={{
          background: 'rgba(156, 39, 176, 0.8)',
          padding: '30px',
          borderRadius: '15px',
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'transform 0.3s ease'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '15px' }}>📋</div>
          <h3 style={{ marginBottom: '10px' }}>會員註冊表</h3>
          <p style={{ opacity: 0.9 }}>填寫註冊表，自動填入 LINE ID</p>
        </div>
      </div>

      {/* 系統狀態 */}
      {healthData && (
        <div style={{
          marginTop: '40px',
          padding: '20px',
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '10px',
          maxWidth: '800px',
          margin: '40px auto 0'
        }}>
          <h3>系統狀態</h3>
          <p>版本: {healthData.version}</p>
          <p>運行時間: {Math.floor(healthData.uptime / 60)} 分鐘</p>
          <p>資料庫: {healthData.database}</p>
          <p>活躍會員: {statsData?.activeMembers || 0}</p>
          <p>簽到記錄: {statsData?.checkinCount || 0}</p>
        </div>
      )}
    </div>
  );
}