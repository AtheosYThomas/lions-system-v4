import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import Admin from './pages/Admin';
import Register from './pages/Register';
import Checkin from './pages/Checkin';
import Profile from './pages/Profile';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  useEffect(() => {
    // 測試後端連接
    fetch('/health')
      .then(response => response.json())
      .then(data => console.log('🚀 後端連接測試成功:', data))
      .catch(error => console.error('❌ 後端連接測試失敗:', error));
  }, []);

import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
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
          <Route path="/" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/register" element={<Register />} />
          <Route path="/member-register" element={<div style={{ padding: '2rem', textAlign: 'center' }}>
            <h2>會員註冊</h2>
            <p>請使用 LINE 登入進行會員註冊</p>
            <a href="/register.html" style={{ 
              display: 'inline-block',
              padding: '1rem 2rem',
              backgroundColor: '#00C300',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '0.5rem',
              fontWeight: 'bold'
            }}>
              透過 LINE 註冊
            </a>
          </div>} />
          <Route path="/checkin" element={<Checkin />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;