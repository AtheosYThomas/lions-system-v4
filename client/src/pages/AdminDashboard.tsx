
import React, { useState, useEffect } from 'react';
import axios from '../api/axios';

interface SystemStats {
  totalMembers: number;
  totalEvents: number;
  totalCheckins: number;
  recentActivity: any[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await axios.get('/admin/summary');
        setStats(response.data);
      } catch (error) {
        setError('無法載入統計資料');
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <p>載入中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <p>❌ {error}</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <h1>📊 管理後台總覽</h1>
      
      {stats && (
        <>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '20px',
            marginBottom: '30px'
          }}>
            <div style={{ 
              padding: '20px', 
              backgroundColor: '#f8f9fa', 
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <h3>👥 總會員數</h3>
              <p style={{ fontSize: '2em', color: '#007bff' }}>{stats.totalMembers}</p>
            </div>
            
            <div style={{ 
              padding: '20px', 
              backgroundColor: '#f8f9fa', 
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <h3>📅 總活動數</h3>
              <p style={{ fontSize: '2em', color: '#28a745' }}>{stats.totalEvents}</p>
            </div>
            
            <div style={{ 
              padding: '20px', 
              backgroundColor: '#f8f9fa', 
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <h3>✅ 總簽到數</h3>
              <p style={{ fontSize: '2em', color: '#ffc107' }}>{stats.totalCheckins}</p>
            </div>
          </div>

          <div style={{ 
            padding: '20px', 
            backgroundColor: '#ffffff', 
            borderRadius: '8px',
            border: '1px solid #dee2e6'
          }}>
            <h3>📈 最近活動</h3>
            {stats.recentActivity && stats.recentActivity.length > 0 ? (
              <ul>
                {stats.recentActivity.map((activity, index) => (
                  <li key={index} style={{ marginBottom: '10px' }}>
                    {activity.description} - {new Date(activity.timestamp).toLocaleString()}
                  </li>
                ))}
              </ul>
            ) : (
              <p>暫無最近活動記錄</p>
            )}
          </div>
        </>
      )}

      <div style={{ marginTop: '30px' }}>
        <h3>🔧 管理功能</h3>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button style={{ 
            padding: '10px 20px', 
            backgroundColor: '#007bff', 
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}>
            會員管理
          </button>
          <button style={{ 
            padding: '10px 20px', 
            backgroundColor: '#28a745', 
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}>
            活動管理
          </button>
          <button style={{ 
            padding: '10px 20px', 
            backgroundColor: '#ffc107', 
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}>
            簽到記錄
          </button>
        </div>
      </div>
    </div>
  );
}
