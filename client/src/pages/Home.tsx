
import React, { useState, useEffect } from 'react';

interface SystemStats {
  totalMembers: number;
  upcomingEvents: number;
  recentAnnouncements: number;
  systemStatus: 'healthy' | 'warning' | 'error';
}

export default function Home() {
  const [stats, setStats] = useState<SystemStats>({
    totalMembers: 0,
    upcomingEvents: 0,
    recentAnnouncements: 0,
    systemStatus: 'healthy'
  });

  useEffect(() => {
    // 模擬從 API 獲取統計數據
    const fetchStats = async () => {
      try {
        // 這裡可以調用實際的 API
        setStats({
          totalMembers: 128,
          upcomingEvents: 3,
          recentAnnouncements: 5,
          systemStatus: 'healthy'
        });
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      }
    };

    fetchStats();
  }, []);

  return (
    <div style={{ 
      padding: '2rem', 
      textAlign: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        paddingTop: '2rem'
      }}>
        <h1 style={{ 
          fontSize: '3.5rem', 
          fontWeight: 'bold', 
          marginBottom: '1rem',
          textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
        }}>
          🦁 北大獅子會系統
        </h1>
        
        <p style={{ 
          fontSize: '1.3rem', 
          marginBottom: '2rem',
          opacity: 0.95,
          fontWeight: '300'
        }}>
          歡迎使用會員服務系統 - 您的數位獅子會服務平台
        </p>

        {/* 統計數據區域 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '3rem',
          padding: '0 1rem'
        }}>
          <div style={{
            padding: '1.5rem',
            backgroundColor: 'rgba(255,255,255,0.15)',
            borderRadius: '1rem',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            <div style={{ fontSize: '2rem', color: '#4ade80' }}>👥</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0.5rem 0' }}>{stats.totalMembers}</div>
            <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>會員總數</div>
          </div>
          <div style={{
            padding: '1.5rem',
            backgroundColor: 'rgba(255,255,255,0.15)',
            borderRadius: '1rem',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            <div style={{ fontSize: '2rem', color: '#fbbf24' }}>📅</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0.5rem 0' }}>{stats.upcomingEvents}</div>
            <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>即將到來的活動</div>
          </div>
          <div style={{
            padding: '1.5rem',
            backgroundColor: 'rgba(255,255,255,0.15)',
            borderRadius: '1rem',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            <div style={{ fontSize: '2rem', color: '#f87171' }}>📢</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0.5rem 0' }}>{stats.recentAnnouncements}</div>
            <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>最新公告</div>
          </div>
        </div>
        
        {/* 主要功能區域 */}
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.5rem',
          marginBottom: '3rem',
          padding: '0 1rem'
        }}>
          <a href="/profile" style={{ 
            display: 'block',
            padding: '2rem 1.5rem',
            backgroundColor: 'rgba(59, 130, 246, 0.8)',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '1rem',
            border: '1px solid rgba(255,255,255,0.2)',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.3s ease',
            textAlign: 'center',
            boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
            transform: 'translateY(0)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-5px)';
            e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.15)';
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>👤</div>
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.4rem' }}>會員資料</h3>
            <p style={{ margin: 0, opacity: 0.9, fontSize: '1rem' }}>查看和編輯個人資料</p>
          </a>
          
          <a href="/register" style={{ 
            display: 'block',
            padding: '2rem 1.5rem',
            backgroundColor: 'rgba(34, 197, 94, 0.8)',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '1rem',
            border: '1px solid rgba(255,255,255,0.2)',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.3s ease',
            textAlign: 'center',
            boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
            transform: 'translateY(0)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-5px)';
            e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.15)';
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📝</div>
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.4rem' }}>活動報名</h3>
            <p style={{ margin: 0, opacity: 0.9, fontSize: '1rem' }}>報名參加獅子會活動</p>
          </a>
          
          <a href="/member-register" style={{ 
            display: 'block',
            padding: '2rem 1.5rem',
            backgroundColor: 'rgba(249, 115, 22, 0.8)',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '1rem',
            border: '1px solid rgba(255,255,255,0.2)',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.3s ease',
            textAlign: 'center',
            boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
            transform: 'translateY(0)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-5px)';
            e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.15)';
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>✍️</div>
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.4rem' }}>會員註冊</h3>
            <p style={{ margin: 0, opacity: 0.9, fontSize: '1rem' }}>註冊成為獅子會會員</p>
          </a>
          
          <a href="/checkin" style={{ 
            display: 'block',
            padding: '2rem 1.5rem',
            backgroundColor: 'rgba(168, 85, 247, 0.8)',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '1rem',
            border: '1px solid rgba(255,255,255,0.2)',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.3s ease',
            textAlign: 'center',
            boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
            transform: 'translateY(0)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-5px)';
            e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.15)';
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>✅</div>
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.4rem' }}>活動簽到</h3>
            <p style={{ margin: 0, opacity: 0.9, fontSize: '1rem' }}>快速簽到參加活動</p>
          </a>
          
          <a href="/upload" style={{ 
            display: 'block',
            padding: '2rem 1.5rem',
            backgroundColor: 'rgba(14, 165, 233, 0.8)',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '1rem',
            border: '1px solid rgba(255,255,255,0.2)',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.3s ease',
            textAlign: 'center',
            boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
            transform: 'translateY(0)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-5px)';
            e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.15)';
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📤</div>
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.4rem' }}>檔案上傳</h3>
            <p style={{ margin: 0, opacity: 0.9, fontSize: '1rem' }}>上傳圖片和文件</p>
          </a>
          
          <a href="/admin" style={{ 
            display: 'block',
            padding: '2rem 1.5rem',
            backgroundColor: 'rgba(236, 72, 153, 0.8)',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '1rem',
            border: '1px solid rgba(255,255,255,0.2)',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.3s ease',
            textAlign: 'center',
            boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
            transform: 'translateY(0)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-5px)';
            e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.15)';
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>⚙️</div>
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.4rem' }}>管理後台</h3>
            <p style={{ margin: 0, opacity: 0.9, fontSize: '1rem' }}>系統管理和數據分析</p>
          </a>
        </div>
        
        {/* 系統狀態和快速操作 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '2rem',
          marginBottom: '2rem',
          padding: '0 1rem'
        }}>
          <div style={{ 
            padding: '2rem',
            backgroundColor: 'rgba(255,255,255,0.1)',
            borderRadius: '1rem',
            border: '1px solid rgba(255,255,255,0.2)',
            backdropFilter: 'blur(10px)'
          }}>
            <h3 style={{ marginTop: 0, fontSize: '1.3rem', marginBottom: '1.5rem' }}>系統狀態</h3>
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column',
              gap: '1rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: '#4ade80', fontSize: '1.2rem' }}>●</span> 
                <span>資料庫運行正常</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: '#4ade80', fontSize: '1.2rem' }}>●</span> 
                <span>伺服器運行正常</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: '#4ade80', fontSize: '1.2rem' }}>●</span> 
                <span>LINE Bot 已配置</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: '#4ade80', fontSize: '1.2rem' }}>●</span> 
                <span>Cloudinary 雲端儲存</span>
              </div>
            </div>
          </div>

          <div style={{ 
            padding: '2rem',
            backgroundColor: 'rgba(255,255,255,0.1)',
            borderRadius: '1rem',
            border: '1px solid rgba(255,255,255,0.2)',
            backdropFilter: 'blur(10px)'
          }}>
            <h3 style={{ marginTop: 0, fontSize: '1.3rem', marginBottom: '1.5rem' }}>快速操作</h3>
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column',
              gap: '1rem'
            }}>
              <button style={{
                padding: '0.75rem 1rem',
                backgroundColor: 'rgba(59, 130, 246, 0.8)',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontSize: '0.9rem',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.8)';
              }}
              onClick={() => window.location.href = '/api/announcements'}>
                📢 查看最新公告
              </button>
              <button style={{
                padding: '0.75rem 1rem',
                backgroundColor: 'rgba(34, 197, 94, 0.8)',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontSize: '0.9rem',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(34, 197, 94, 1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(34, 197, 94, 0.8)';
              }}
              onClick={() => window.location.href = '/register'}>
                🎯 立即報名活動
              </button>
              <button style={{
                padding: '0.75rem 1rem',
                backgroundColor: 'rgba(168, 85, 247, 0.8)',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontSize: '0.9rem',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(168, 85, 247, 1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(168, 85, 247, 0.8)';
              }}
              onClick={() => window.location.href = '/checkin'}>
                ⚡ 快速簽到
              </button>
            </div>
          </div>
        </div>

        {/* 頁腳信息 */}
        <div style={{
          marginTop: '3rem',
          padding: '1.5rem',
          backgroundColor: 'rgba(0,0,0,0.2)',
          borderRadius: '1rem',
          fontSize: '0.9rem',
          opacity: 0.8
        }}>
          <p style={{ margin: 0 }}>
            北大獅子會數位服務平台 | 為會員提供便捷的數位化服務體驗
          </p>
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.8rem' }}>
            系統版本 v2.0 | API 端點: http://0.0.0.0:5000/api/
          </p>
        </div>
      </div>
    </div>
  );
}
