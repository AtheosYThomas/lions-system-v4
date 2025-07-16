import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MemberForm from './pages/MemberForm';
import CheckinPage from './pages/CheckinPage';
import AdminDashboard from './pages/AdminDashboard';
import Register from './pages/Register';
import Checkin from './pages/Checkin';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/form/register" element={<MemberForm />} />
          <Route path="/form/checkin/:eventId" element={<CheckinPage />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/register" element={<Register />} />
          <Route path="/checkin" element={<Checkin />} />
        </Routes>
      </div>
    </Router>
  );
}

function HomePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-blue-600 mb-8">🦁 北大獅子會系統</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">會員註冊</h2>
            <p className="text-gray-600 mb-4">註冊成為獅子會會員</p>
            <a href="/form/register" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
              立即註冊
            </a>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">活動簽到</h2>
            <p className="text-gray-600 mb-4">參加活動並簽到</p>
            <a href="/form/checkin/1" className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
              活動簽到
            </a>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">管理後台</h2>
            <p className="text-gray-600 mb-4">系統管理與統計</p>
            <a href="/admin" className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600">
              進入後台
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;