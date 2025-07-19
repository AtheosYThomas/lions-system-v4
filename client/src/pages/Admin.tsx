
import React, { useState, useEffect } from 'react';

const Admin: React.FC = () => {
  const [stats, setStats] = useState({
    memberCount: 128,
    activeEvents: 3,
    alerts: 5
  });

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px',
      fontFamily: 'Microsoft JhengHei, sans-serif'
    }}>
      {/* 頂部標題 */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{
          color: 'white',
          fontSize: '2.5rem',
          fontWeight: 'bold',
          marginBottom: '10px',
          textShadow: '0 2px 4px rgba(0,0,0,0.3)'
        }}>
          🦁 北大獅子會系統
        </h1>
        <p style={{
          color: 'rgba(255,255,255,0.9)',
          fontSize: '1.1rem',
          margin: 0
        }}>
          歡迎使用會員服務系統 - 您的數位身分會員服務平台
        </p>
      </div>

      {/* 統計卡片區 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        marginBottom: '40px',
        maxWidth: '800px',
        margin: '0 auto 40px auto'
      }}>
        {/* 會員數統計 */}
        <div style={{
          background: 'rgba(255,255,255,0.2)',
          borderRadius: '15px',
          padding: '20px',
          textAlign: 'center',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.3)'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '5px' }}>👥</div>
          <div style={{ 
            fontSize: '2.5rem', 
            fontWeight: 'bold', 
            color: 'white',
            marginBottom: '5px'
          }}>
            {stats.memberCount}
          </div>
          <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>
            會員數量
          </div>
        </div>

        {/* 活動統計 */}
        <div style={{
          background: 'rgba(255,255,255,0.2)',
          borderRadius: '15px',
          padding: '20px',
          textAlign: 'center',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.3)'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '5px' }}>📅</div>
          <div style={{ 
            fontSize: '2.5rem', 
            fontWeight: 'bold', 
            color: 'white',
            marginBottom: '5px'
          }}>
            {stats.activeEvents}
          </div>
          <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>
            簽到次數的活動
          </div>
        </div>

        {/* 警報統計 */}
        <div style={{
          background: 'rgba(255,255,255,0.2)',
          borderRadius: '15px',
          padding: '20px',
          textAlign: 'center',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.3)'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '5px' }}>🔔</div>
          <div style={{ 
            fontSize: '2.5rem', 
            fontWeight: 'bold', 
            color: 'white',
            marginBottom: '5px'
          }}>
            {stats.alerts}
          </div>
          <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>
            警報公告
          </div>
        </div>
      </div>

      {/* 功能按鈕區 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        maxWidth: '1000px',
        margin: '0 auto'
      }}>
        {/* 會員資料 */}
        <div style={{
          background: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)',
          borderRadius: '15px',
          padding: '25px',
          color: 'white',
          cursor: 'pointer',
          transition: 'transform 0.2s, box-shadow 0.2s',
          boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = 'translateY(-5px)';
          e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.3)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
        }}
        onClick={() => window.location.href = '/members'}>
          <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>👤</div>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '1.2rem' }}>會員資料</h3>
          <p style={{ margin: 0, opacity: 0.9, fontSize: '0.9rem' }}>查看和編輯會員資料</p>
        </div>

        {/* 活動報名 */}
        <div style={{
          background: 'linear-gradient(135deg, #2ecc71 0%, #27ae60 100%)',
          borderRadius: '15px',
          padding: '25px',
          color: 'white',
          cursor: 'pointer',
          transition: 'transform 0.2s, box-shadow 0.2s',
          boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = 'translateY(-5px)';
          e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.3)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
        }}
        onClick={() => window.location.href = '/registration'}>
          <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>📝</div>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '1.2rem' }}>活動報名</h3>
          <p style={{ margin: 0, opacity: 0.9, fontSize: '0.9rem' }}>管理活動參與者名單</p>
        </div>

        {/* 會員註冊 */}
        <div style={{
          background: 'linear-gradient(135deg, #e67e22 0%, #d35400 100%)',
          borderRadius: '15px',
          padding: '25px',
          color: 'white',
          cursor: 'pointer',
          transition: 'transform 0.2s, box-shadow 0.2s',
          boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = 'translateY(-5px)';
          e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.3)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
        }}
        onClick={() => window.location.href = '/register'}>
          <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>🏠</div>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '1.2rem' }}>會員註冊</h3>
          <p style={{ margin: 0, opacity: 0.9, fontSize: '0.9rem' }}>註冊流程和身分審核</p>
        </div>

        {/* 會員註冊表 */}
        <div style={{
          background: 'linear-gradient(135deg, #8e44ad 0%, #7e57c2 100%)',
          borderRadius: '15px',
          padding: '25px',
          color: 'white',
          cursor: 'pointer',
          transition: 'transform 0.2s, box-shadow 0.2s',
          boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = 'translateY(-5px)';
          e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.3)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
        }}
        onClick={() => window.location.href = '/admin/reports/members'}>
          <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>📋</div>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '1.2rem' }}>會員註冊表</h3>
          <p style={{ margin: 0, opacity: 0.9, fontSize: '0.9rem' }}>快速註冊和自動產生 LINE ID</p>
        </div>

        {/* 活動簽到 */}
        <div style={{
          background: 'linear-gradient(135deg, #16a085 0%, #138d75 100%)',
          borderRadius: '15px',
          padding: '25px',
          color: 'white',
          cursor: 'pointer',
          transition: 'transform 0.2s, box-shadow 0.2s',
          boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = 'translateY(-5px)';
          e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.3)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
        }}
        onClick={() => window.location.href = '/checkin'}>
          <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>✅</div>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '1.2rem' }}>活動簽到</h3>
          <p style={{ margin: 0, opacity: 0.9, fontSize: '0.9rem' }}>快速簽到和查詢功能</p>
        </div>

        {/* 檔案上傳 */}
        <div style={{
          background: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
          borderRadius: '15px',
          padding: '25px',
          color: 'white',
          cursor: 'pointer',
          transition: 'transform 0.2s, box-shadow 0.2s',
          boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = 'translateY(-5px)';
          e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.3)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
        }}
        onClick={() => window.location.href = '/admin/files'}>
          <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>📁</div>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '1.2rem' }}>檔案上傳</h3>
          <p style={{ margin: 0, opacity: 0.9, fontSize: '0.9rem' }}>上傳圖片和文件</p>
        </div>
      </div>
    </div>
  );
};

export default Admin;
