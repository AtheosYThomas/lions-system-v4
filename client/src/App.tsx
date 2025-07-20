The code adds a new route for the PushTemplate page to the App component.
```
```replit_final_file
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import Checkin from './pages/Checkin';
import CheckinConfirm from './pages/CheckinConfirm';
import Register from './pages/Register';
import EventManagement from './pages/EventManagement';
import EventCheckinStats from './pages/EventCheckinStats';
import AdminEventsList from './pages/AdminEventsList';
import NotFoundPage from './pages/NotFoundPage';
import CheckinEvent from './pages/CheckinEvent'; //Import the new Component
import PushHistory from './pages/PushHistory';
import MemberPushHistory from './pages/MemberPushHistory';
import PushDashboard from './pages/PushDashboard';
import PushTemplate from './pages/PushTemplate';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/checkin" element={<Checkin />} />
          <Route path="/checkin/:eventId" element={<CheckinEvent />} />
          <Route path="/checkin-confirm" element={<CheckinConfirm />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/events" element={<AdminEventsList />} />
          <Route path="/admin/event/:eventId/checkin" element={<CheckinEvent />} />
          <Route path="/admin/event/:eventId/stats" element={<EventCheckinStats />} />
          <Route path="/admin/event/:eventId/push-history" element={<PushHistory />} />
        <Route path="/admin/member/:memberId/push-history" element={<MemberPushHistory />} />
          <Route path="/admin/push-dashboard" element={<PushDashboard />} />
          <Route path="/admin/push-template" element={<PushTemplate />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;