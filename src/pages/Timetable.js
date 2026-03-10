import React, { useState, useEffect, useRef } from 'react';
import { db } from '../firebase';
import { ref, onValue } from 'firebase/database';
import html2canvas from 'html2canvas';
import '../css/Timetable.css';

const Timetable = () => {
  const [studentData, setStudentData] = useState({});
  const [selectedStudent, setSelectedStudent] = useState('');
  const [baseSchedule, setBaseSchedule] = useState(Array(7).fill([]).map(() => Array(5).fill("")));
  const [isCapturing, setIsCapturing] = useState(false);
  const captureRef = useRef(null);

  const todayIdx = new Date().getDay() - 1;

  useEffect(() => {
    // 시간표 데이터 로드
    onValue(ref(db, 'timetable'), (snapshot) => {
      const data = snapshot.val();
      if (!data) return;
      const days = ["월", "화", "수", "목", "금"];
      const formatted = Array.from({ length: 7 }, (_, pIdx) => 
        days.map(day => data[day]?.[pIdx] || "")
      );
      setBaseSchedule(formatted);
    });

    // 학생별 선택 데이터 로드
    onValue(ref(db, "studentData"), (snapshot) => {
      setStudentData(snapshot.val() || {});
    });
  }, []);

  const renderCellContent = (cell, currentSubjects) => {
    if (!cell) return "";
    if (cell === "SELF") return <span style={{color:'#b45309', fontWeight:950}}>자율</span>;

    if (currentSubjects) {
      const key = Object.keys(currentSubjects).find(k => k.toLowerCase() === cell.toLowerCase());
      if (key) {
        const text = currentSubjects[key];
        if (!text.includes(':')) return <strong className="subject-text">{text}</strong>;
        const [subject, info] = text.split(':');
        return (
          <div className="cell-content">
            <div className="subject-text">{subject}</div>
            <div className="info-text">{info}{info === '별' ? '실' : '반'}</div>
          </div>
        );
      }
    }
    return <strong className="subject-text">{cell}</strong>;
  };

  const saveImage = async () => {
    if (!captureRef.current) return;
    setIsCapturing(true); // 캡처 시 오늘 날짜 강조 효과 잠시 제거
    
    setTimeout(async () => {
      const canvas = await html2canvas(captureRef.current, {
        scale: 4, // 고해상도 저장
        backgroundColor: "#ffffff",
        useCORS: true,
        logging: false,
      });
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = `${selectedStudent || '3-6_시간표'}.png`;
      link.click();
      setIsCapturing(false);
    }, 100);
  };

  const currentSubjects = studentData[selectedStudent] || null;

  return (
    <div className="timetable-container">
      <div className="glass-control">
  <div className="select-container">
    {/* 시각적 포인트인 아이콘 배지 */}
    <div className="select-icon-wrapper">
      <span className="user-icon">👤</span>
    </div>
    
    <div className="select-inner">
      <span className="select-label">학생 선택</span>
      <select 
        value={selectedStudent} 
        onChange={(e) => setSelectedStudent(e.target.value)} 
        className="modern-select"
      >
        <option value="" disabled>목록에서 이름을 선택하세요</option>
        {Object.keys(studentData).sort().map(name => (
          <option key={name} value={name}>{name}</option>
        ))}
      </select>
    </div>
  </div>
  
  {selectedStudent && (
    <button onClick={saveImage} className="save-action-btn">
      <span className="btn-icon">📸</span>
      이미지 저장
    </button>
  )}
</div>

      <div className="table-wrapper">
        <div ref={captureRef} className="capture-canvas">
          <div className="header-text">
            {selectedStudent ? (
              <>{selectedStudent} <span style={{fontWeight: 400, color: '#64748b'}}>학생 시간표</span></>
            ) : (
              <span style={{color: '#94a3b8'}}>3-6 시간표</span>
            )}
          </div>

          <div className="table-container-rounded">
            <table className="timetable-table">
              <thead>
                <tr>
                  <th style={{ width: '50px', backgroundColor: '#fff' }}></th>
                  {['월', '화', '수', '목', '금'].map((day, idx) => {
                    const isToday = !isCapturing && idx === todayIdx;
                    return (
                      <th key={day} className="timetable-th" style={{
                        color: isToday ? '#2563eb' : '#0f172a',
                        backgroundColor: isToday ? '#f8fafc' : '#fff',
                      }}>{day}</th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {baseSchedule.map((row, rIdx) => (
                  <tr key={rIdx}>
                    <td className="period-cell">{rIdx + 1}</td>
                    {row.map((cell, cIdx) => {
                      const isCommon = !["L", "A", "B", "C", "D", "E", "F", "G", "H", "I", "SELF"].includes(cell?.toUpperCase());
                      const bgColor = cell === "SELF" ? "#fffbeb" : (isCommon && cell) ? "#f1f5f9" : "#ffffff";
                      return (
                        <td key={cIdx} className="timetable-td">
                          <div className="subject-wrapper" style={{ backgroundColor: bgColor }}>
                            {renderCellContent(cell, currentSubjects)}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Timetable;