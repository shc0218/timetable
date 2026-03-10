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
    onValue(ref(db, 'timetable'), (snapshot) => {
      const data = snapshot.val();
      if (!data) return;
      const days = ["월", "화", "수", "목", "금"];
      const formatted = Array.from({ length: 7 }, (_, pIdx) => 
        days.map(day => data[day]?.[pIdx] || "")
      );
      setBaseSchedule(formatted);
    });

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
    setIsCapturing(true);
    setTimeout(async () => {
      const canvas = await html2canvas(captureRef.current, {
        scale: 4,
        backgroundColor: "#ffffff",
        useCORS: true,
      });
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = `${selectedStudent || '시간표'}.png`;
      link.click();
      setIsCapturing(false);
    }, 100);
  };

  const currentSubjects = studentData[selectedStudent] || null;

  return (
    <div className="timetable-container">
      {/* 다시 디자인한 상단 컨트롤 영역 */}
      <div className="glass-control">
  <div className="select-container">
    <span className="select-badge">STUDENT</span>
    <select 
      value={selectedStudent} 
      onChange={(e) => setSelectedStudent(e.target.value)} 
      className="modern-select"
    >
      <option value="">학생을 선택해 주세요</option>
      {Object.keys(studentData).sort().map(name => (
        <option key={name} value={name}>{name}</option>
      ))}
    </select>
  </div>
  
  {/* 학생이 선택되었을 때만 저장 버튼 표시 */}
  {selectedStudent && (
    <button onClick={saveImage} className="save-action-btn">
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
                    <td style={{ 
                      textAlign: 'center', 
                      fontSize: '15px', 
                      fontWeight: '900', 
                      color: '#cbd5e1', 
                      borderRight: '1px solid #e2e8f0' 
                    }}>{rIdx + 1}</td>
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