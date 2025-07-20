import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Admin: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 暫停統計功能載入
    console.log('⏸️ 管理統計功能已暫停');
    setLoading(false);
    setStats({
      memberCount: '---',
      activeMembers: '---',
      registrationCount: '---',
      eventCount: '---',
      timestamp: new Date().toISOString(),
    });
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
        <button onClick={() => window.location.reload()}>🔄 重新載入</button>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>管理員面板</h1>

      <div
        style={{
          padding: '15px',
          backgroundColor: '#fff3cd',
          border: '1px solid #ffeaa7',
          borderRadius: '5px',
          marginBottom: '20px',
        }}
      >
        <p style={{ margin: 0, color: '#856404' }}>
          ⏸️ <strong>統計功能已暫停</strong> -
          為了確保系統穩定運行，統計資料載入功能已暫時停用
        </p>
      </div>

      {stats ? (
        <div>
          <h2>📊 系統統計 (已暫停)</h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '15px',
            }}
          >
            <div
              style={{
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '5px',
                backgroundColor: '#f8f9fa',
              }}
            >
              <strong>👥 會員總數:</strong> {stats.memberCount}
            </div>
            <div
              style={{
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '5px',
                backgroundColor: '#f8f9fa',
              }}
            >
              <strong>✅ 活躍會員:</strong> {stats.activeMembers}
            </div>
            <div
              style={{
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '5px',
                backgroundColor: '#f8f9fa',
              }}
            >
              <strong>📝 報名總數:</strong> {stats.registrationCount}
            </div>
            <div
              style={{
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '5px',
                backgroundColor: '#f8f9fa',
              }}
            >
              <strong>🎉 活動總數:</strong> {stats.eventCount}
            </div>
          </div>
          <div style={{ marginTop: '15px', fontSize: '0.9em', color: '#666' }}>
            統計功能暫停時間:{' '}
            {new Date(stats.timestamp).toLocaleString('zh-TW')}
          </div>
        </div>
      ) : (
        <div>❌ 無統計資料可顯示</div>
      )}

      <div
        style={{
          marginTop: '20px',
          padding: '15px',
          backgroundColor: '#d4edda',
          border: '1px solid #c3e6cb',
          borderRadius: '5px',
        }}
      >
        <h3 style={{ marginTop: 0, color: '#155724' }}>📋 可用功能</h3>
        <ul style={{ color: '#155724', marginBottom: 0 }}>
          <li>✅ 系統健康檢查 - 正常運行</li>
          <li>✅ 會員管理功能 - 正常運行</li>
          <li>✅ 活動管理功能 - 正常運行</li>
          <li>✅ 活動報到統計 - 正常運行</li>
          <li>✅ LINE Bot 整合 - 正常運行</li>
          <li>⏸️ 統計資料載入 - 已暫停</li>
        </ul>
      </div>

      <div
        style={{
          marginTop: '20px',
          padding: '15px',
          backgroundColor: '#e3f2fd',
          border: '1px solid #bbdefb',
          borderRadius: '5px',
        }}
      >
        <h3 style={{ marginTop: 0, color: '#1565c0' }}>🚀 快速操作</h3>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '10px',
          }}
        >
          <a
            href="/events"
            style={{
              display: 'block',
              padding: '10px',
              backgroundColor: '#fff',
              border: '1px solid #ddd',
              borderRadius: '5px',
              textDecoration: 'none',
              color: '#333',
              textAlign: 'center',
              transition: 'background-color 0.3s',
            }}
            onMouseOver={e =>
              (e.currentTarget.style.backgroundColor = '#f5f5f5')
            }
            onMouseOut={e => (e.currentTarget.style.backgroundColor = '#fff')}
          >
            🎪 活動管理
          </a>
          <a
            href="/admin/events"
            style={{
              display: 'block',
              padding: '10px',
              backgroundColor: '#fff',
              border: '1px solid #ddd',
              borderRadius: '5px',
              textDecoration: 'none',
              color: '#333',
              textAlign: 'center',
              transition: 'background-color 0.3s',
            }}
            onMouseOver={e =>
              (e.currentTarget.style.backgroundColor = '#f5f5f5')
            }
            onMouseOut={e => (e.currentTarget.style.backgroundColor = '#fff')}
          >
            📋 活動總覽
          </a>
          <button
            onClick={() => {
              const eventId = prompt('請輸入活動 ID 查看報到統計:');
              if (eventId) {
                window.open(`/admin/event/${eventId}/checkin`, '_blank');
              }
            }}
            style={{
              padding: '10px',
              backgroundColor: '#fff',
              border: '1px solid #ddd',
              borderRadius: '5px',
              cursor: 'pointer',
              transition: 'background-color 0.3s',
            }}
            onMouseOver={e =>
              (e.currentTarget.style.backgroundColor = '#f5f5f5')
            }
            onMouseOut={e => (e.currentTarget.style.backgroundColor = '#fff')}
          >
            📊 報到統計
          </button>
        </div>
      </div>
    </div>
  );
};

export default Admin;
