
import React from 'react';

export default function Home() {
  return (
    <div style={{ 
      padding: '2rem', 
      textAlign: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white'
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        paddingTop: '3rem'
      }}>
        <h1 style={{ 
          fontSize: '3rem', 
          fontWeight: 'bold', 
          marginBottom: '1rem',
          textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
        }}>
          🦁 北大獅子會系統
        </h1>
        
        <p style={{ 
          fontSize: '1.2rem', 
          marginBottom: '3rem',
          opacity: 0.9
        }}>
          歡迎使用會員服務系統 - 您的數位獅子會服務平台
        </p>
        
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1.5rem',
          marginTop: '3rem',
          maxWidth: '1200px',
          margin: '3rem auto 0'
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
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>👤</div>
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.3rem' }}>會員資料</h3>
            <p style={{ margin: 0, opacity: 0.9, fontSize: '0.9rem' }}>查看和編輯個人資料</p>
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
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📝</div>
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.3rem' }}>活動報名</h3>
            <p style={{ margin: 0, opacity: 0.9, fontSize: '0.9rem' }}>報名參加獅子會活動</p>
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
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>✍️</div>
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.3rem' }}>會員註冊</h3>
            <p style={{ margin: 0, opacity: 0.9, fontSize: '0.9rem' }}>註冊成為獅子會會員</p>
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
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>✅</div>
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.3rem' }}>活動簽到</h3>
            <p style={{ margin: 0, opacity: 0.9, fontSize: '0.9rem' }}>快速簽到參加活動</p>
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
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⚙️</div>
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.3rem' }}>管理後台</h3>
            <p style={{ margin: 0, opacity: 0.9, fontSize: '0.9rem' }}>系統管理和數據分析</p>
          </a>
        </div>
        
        <div style={{ 
          marginTop: '4rem',
          padding: '2rem',
          backgroundColor: 'rgba(255,255,255,0.1)',
          borderRadius: '1rem',
          border: '1px solid rgba(255,255,255,0.2)',
          backdropFilter: 'blur(10px)'
        }}>
          <h3 style={{ marginTop: 0, fontSize: '1.2rem' }}>系統狀態</h3>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: '2rem',
            flexWrap: 'wrap'
          }}>
            <div>
              <span style={{ color: '#4ade80' }}>●</span> 資料庫運行正常
            </div>
            <div>
              <span style={{ color: '#4ade80' }}>●</span> 伺服器運行正常
            </div>
            <div>
              <span style={{ color: '#4ade80' }}>●</span> LINE Bot 已配置
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
