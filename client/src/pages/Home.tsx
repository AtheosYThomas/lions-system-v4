import React, { useState, useEffect } from 'react';

const Home: React.FC = () => {
  const [healthStatus, setHealthStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await fetch('/health');
        const data = await response.json();
        setHealthStatus(data);
        console.log('🚀 後端連接測試成功:', data);
      } catch (error) {
        console.error('❌ 後端連接失敗:', error);
      } finally {
        setLoading(false);
      }
    };

    checkHealth();
  }, []);

  return (
    <div className="home-container">
      <h1>🦁 北大獅子會管理系統</h1>
      <div className="system-status">
        <h2>系統狀態</h2>
        {loading ? (
          <p>檢查系統狀態中...</p>
        ) : healthStatus ? (
          <div className="status-info">
            <p>✅ 系統運行正常</p>
            <p>🔧 版本: {healthStatus.version}</p>
            <p>⏱️ 運行時間: {Math.floor(healthStatus.uptime / 60)} 分鐘</p>
            <p>🗄️ 資料庫: {healthStatus.database}</p>
            <p>📍 服務: {healthStatus.services?.line}</p>
          </div>
        ) : (
          <p>❌ 無法連接到後端服務</p>
        )}
      </div>
      <div className="quick-actions">
        <h2>快速操作</h2>
        <div className="action-buttons">
          <button onClick={() => (window.location.href = '/register')}>
            會員註冊
          </button>
          <button onClick={() => (window.location.href = '/checkin')}>
            活動簽到
          </button>
          <button onClick={() => (window.location.href = '/profile')}>
            個人資料
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
