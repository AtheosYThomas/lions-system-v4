import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import MemberForm from './pages/MemberForm';
import CheckinPage from './pages/CheckinPage';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <Link to="/" className="text-xl font-bold text-gray-900">
                  北大獅子會
                </Link>
              </div>
              <div className="flex items-center space-x-4">
                <Link 
                  to="/member-form" 
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  會員資料
                </Link>
                <Link 
                  to="/checkin" 
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  活動簽到
                </Link>
                <Link 
                  to="/admin" 
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  管理後台
                </Link>
              </div>
            </div>
          </div>
        </nav>

        <main>
          <Routes>
            <Route path="/" element={
              <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                  <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-900">北大獅子會會員系統</h1>
                    <p className="mt-4 text-lg text-gray-600">歡迎使用會員管理與活動簽到系統</p>
                    <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                      <Link to="/member-form" className="bg-blue-500 hover:bg-blue-600 text-white p-6 rounded-lg transition-colors">
                        <h3 className="text-xl font-semibold">會員資料</h3>
                        <p className="mt-2">填寫或更新會員資料</p>
                      </Link>
                      <Link to="/checkin" className="bg-green-500 hover:bg-green-600 text-white p-6 rounded-lg transition-colors">
                        <h3 className="text-xl font-semibold">活動簽到</h3>
                        <p className="mt-2">參與活動並完成簽到</p>
                      </Link>
                      <Link to="/admin" className="bg-purple-500 hover:bg-purple-600 text-white p-6 rounded-lg transition-colors">
                        <h3 className="text-xl font-semibold">管理後台</h3>
                        <p className="mt-2">查看統計與管理資料</p>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            } />
            <Route path="/member-form" element={<MemberForm />} />
            <Route path="/checkin/:eventId?" element={<CheckinPage />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;