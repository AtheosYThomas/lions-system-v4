
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Register from './pages/Register';
import Checkin from './pages/Checkin';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import NotFoundPage from './pages/NotFoundPage';

// 錯誤邊界組件
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('前端錯誤:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h2>🚨 應用程式發生錯誤</h2>
          <p>請重新載入頁面或聯絡系統管理員</p>
          <button onClick={() => window.location.reload()}>
            重新載入
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/profile" element={<Profile />} />
          <Route path="/register" element={<Register />} />
          <Route path="/checkin" element={<Checkin />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/" element={
            <div style={{ padding: '20px', textAlign: 'center' }}>
              <h1>🦁 北大獅子會系統</h1>
              <p>歡迎使用會員服務系統</p>
              <div style={{ marginTop: '2rem' }}>
                <a href="/profile" style={{ 
                  display: 'inline-block',
                  margin: '0.5rem',
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '0.5rem'
                }}>
                  會員資料
                </a>
                <a href="/register" style={{ 
                  display: 'inline-block',
                  margin: '0.5rem',
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#10b981',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '0.5rem'
                }}>
                  活動報名
                </a>
                <a href="/admin" style={{ 
                  display: 'inline-block',
                  margin: '0.5rem',
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#8b5cf6',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '0.5rem'
                }}>
                  管理後台
                </a>
              </div>
            </div>
          } />
          {/* 兜底路由 - 處理所有未匹配的路徑 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
