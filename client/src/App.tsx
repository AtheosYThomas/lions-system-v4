
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Register from './pages/Register';
import Checkin from './pages/Checkin';
import MemberForm from './pages/MemberForm';
import CheckinPage from './pages/CheckinPage';
import AdminDashboard from './pages/AdminDashboard';

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
          <Route path="/register" element={<Register />} />
          <Route path="/checkin" element={<Checkin />} />
          <Route path="/form/register" element={<MemberForm />} />
          <Route path="/form/checkin/:eventId" element={<CheckinPage />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/" element={
            <div style={{ padding: '20px', textAlign: 'center' }}>
              <h1>🦁 北大獅子會系統</h1>
              <p>歡迎使用會員服務系統</p>
              <nav style={{ marginTop: '20px' }}>
                <a href="/register" style={{ margin: '0 10px' }}>會員註冊</a>
                <a href="/checkin" style={{ margin: '0 10px' }}>活動簽到</a>
                <a href="/admin" style={{ margin: '0 10px' }}>管理後台</a>
              </nav>
            </div>
          } />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
