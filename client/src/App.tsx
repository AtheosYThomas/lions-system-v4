import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import Checkin from './pages/Checkin';
import CheckinConfirm from './pages/CheckinConfirm';
import Register from './pages/Register';
import NotFoundPage from './pages/NotFoundPage';
import CheckinEvent from './pages/CheckinEvent'; //Import the new Component

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/register" element={<Register />} />
          <Route path="/checkin" element={<Checkin />} />
          <Route path="/checkin/confirm" element={<CheckinConfirm />} />
          <Route path="/checkin/:eventId" element={<CheckinEvent />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;