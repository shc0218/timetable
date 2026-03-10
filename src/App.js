import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import TimeTable from './pages/Timetable';
import Settings from './pages/settings';
import './css/App.css';

// 현재 경로에 따라 active 클래스를 추가하기 위한 컴포넌트
const NavItem = ({ to, children, icon }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <li className="nav-item">
      <Link to={to} className={`nav-link ${isActive ? 'active' : ''}`}>
        <span>{icon}</span>
        {children}
      </Link>
    </li>
  );
};

function App() {
  return (
    <Router basename="/timetable">
      <div className="app-container">
        {/* 사이드바 영역 */}
        <aside className="sidebar">
          <div className="sidebar-logo">
            <span>3-6</span>
            <span style={{ fontSize: '20px' }}>👍</span>
          </div>
          
          <nav>
            <ul>
              <NavItem to="/" >시간표 보기</NavItem>
              <NavItem to="/settings" >관리자 설정</NavItem>
            </ul>
          </nav>

          {/* 하단 여백 채우기용 (선택사항) */}
          <div style={{ marginTop: 'auto', padding: '10px', fontSize: '12px', color: '#cbd5e1' }}>
            © 2026 Class 3-6
          </div>
        </aside>

        {/* 오른쪽 컨텐츠 영역 */}
        <main className="content">
          <Routes>
            <Route path="/" element={<TimeTable />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;