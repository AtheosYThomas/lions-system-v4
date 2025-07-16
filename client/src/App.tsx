
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import MemberForm from './pages/MemberForm';
import CheckinPage from './pages/CheckinPage';
import AdminDashboard from './pages/AdminDashboard';
import Register from './pages/Register';
import Checkin from './pages/Checkin';

function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🦁 北大獅子會系統
          </h1>
          <p className="text-lg text-gray-600">
            會員管理、活動簽到、系統管理一站式服務
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link
            to="/form/register"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="text-3xl mb-4">📝</div>
            <h3 className="text-xl font-semibold mb-2">會員註冊</h3>
            <p className="text-gray-600">新會員報名表單</p>
          </Link>

          <Link
            to="/form/checkin/1"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="text-3xl mb-4">✅</div>
            <h3 className="text-xl font-semibold mb-2">活動簽到</h3>
            <p className="text-gray-600">活動出席簽到</p>
          </Link>

          <Link
            to="/admin"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="text-3xl mb-4">⚙️</div>
            <h3 className="text-xl font-semibold mb-2">管理後台</h3>
            <p className="text-gray-600">系統統計與管理</p>
          </Link>

          <Link
            to="/register"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="text-3xl mb-4">📱</div>
            <h3 className="text-xl font-semibold mb-2">LINE 註冊</h3>
            <p className="text-gray-600">透過 LINE 快速註冊</p>
          </Link>

          <Link
            to="/checkin"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="text-3xl mb-4">📲</div>
            <h3 className="text-xl font-semibold mb-2">LINE 簽到</h3>
            <p className="text-gray-600">透過 LINE 快速簽到</p>
          </Link>

          <a
            href="/health"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="text-3xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold mb-2">系統狀態</h3>
            <p className="text-gray-600">檢查系統健康狀態</p>
          </a>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/form/register" element={<MemberForm />} />
        <Route path="/form/checkin/:eventId" element={<CheckinPage />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/register" element={<Register />} />
        <Route path="/checkin" element={<Checkin />} />
      </Routes>
    </Router>
  );
}

export default App;
