import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import TimeTable from './pages/timeTable';
import Settings from './pages/settings';
import Lunch from './pages/lunch';
import './css/App.css';

const NavItem = ({ to, icon, label }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <li className="nav-item">
      <Link to={to} className={`nav-link ${isActive ? 'active' : ''}`}>
        <span className="nav-icon">{icon}</span>
        <span className="nav-label">{label}</span>
      </Link>
    </li>
  );
};

function App() {
  return (
    <Router basename="/timetable">
      <div className="app-container">
        {/* 네비게이션: 데스크탑은 왼쪽 사이드바, 모바일은 하단 탭바 */}
        <aside className="navigation">
          <div className="nav-logo">3-6</div>
          <nav className="nav-menu">
            <ul>
              <NavItem to="/" icon="📅" label="시간표" />
              <NavItem to="/lunch" icon="🍱" label="급식" />
              <NavItem to="/settings" icon="⚙️" label="관리" />
            </ul>
          </nav>
        </aside>

        <main className="content">
          <Routes>
            <Route path="/" element={<TimeTable />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/lunch" element={<Lunch />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;