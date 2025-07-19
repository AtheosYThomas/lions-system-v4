
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Checkin from './pages/Checkin';
import Admin from './pages/Admin';
import NotFoundPage from './pages/NotFoundPage';
import LiffPage from './pages/LiffPage';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/liff" element={<LiffPage />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/checkin" element={<Checkin />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
