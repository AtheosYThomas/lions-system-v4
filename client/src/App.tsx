import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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

  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/register" element={<Register />} />
          <Route path="/checkin" element={<Checkin />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;