
import React from 'react';

const Home: React.FC = () => {
  return (
    <div style={{
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      padding: '20px'
    }}>
      {/* 頂部導航 */}
      <nav style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '40px'
      }}>
        <div style={{
          fontSize: '18px',
          fontWeight: 'bold',
          color: '#333'
        }}>
          北大獅子會
        </div>
        <div style={{
          display: 'flex',
          gap: '20px',
          fontSize: '14px',
          color: '#666'
        }}>
          <span>會員資料</span>
          <span>活動資訊</span>
          <span>聯絡我們</span>
        </div>
      </nav>

      {/* 主內容區 */}
      <div style={{
        textAlign: 'center',
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        {/* 主標題 */}
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: 'bold',
          color: '#333',
          marginBottom: '10px'
        }}>
          北大獅子會會員系統
        </h1>

        {/* 副標題 */}
        <p style={{
          fontSize: '1.1rem',
          color: '#666',
          marginBottom: '50px'
        }}>
          歡迎使用會員管理與活動管理系統
        </p>

        {/* 功能按鈕區 */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '20px',
          flexWrap: 'wrap',
          marginTop: '40px'
        }}>
          {/* 會員資料按鈕 */}
          <button 
            onClick={() => window.location.href = '/profile'}
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              padding: '20px 30px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              minWidth: '150px',
              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
              transition: 'transform 0.2s, box-shadow 0.2s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.6)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
            }}
          >
            會員資料
            <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '5px' }}>
              查看及更新會員資料
            </div>
          </button>

          {/* 活動簽到按鈕 */}
          <button 
            onClick={() => window.location.href = '/checkin'}
            style={{
              background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              padding: '20px 30px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              minWidth: '150px',
              boxShadow: '0 4px 15px rgba(17, 153, 142, 0.4)',
              transition: 'transform 0.2s, box-shadow 0.2s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(17, 153, 142, 0.6)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(17, 153, 142, 0.4)';
            }}
          >
            活動簽到
            <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '5px' }}>
              參與活動並完成簽到
            </div>
          </button>

          {/* 管理後台按鈕 */}
          <button 
            onClick={() => window.location.href = '/admin'}
            style={{
              background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
              color: '#333',
              border: 'none',
              borderRadius: '10px',
              padding: '20px 30px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              minWidth: '150px',
              boxShadow: '0 4px 15px rgba(168, 237, 234, 0.4)',
              transition: 'transform 0.2s, box-shadow 0.2s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(168, 237, 234, 0.6)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(168, 237, 234, 0.4)';
            }}
          >
            管理後台
            <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '5px' }}>
              系統設定與會員管理
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
