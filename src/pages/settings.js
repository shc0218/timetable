import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { ref, onValue, get, set } from 'firebase/database';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import '../css/Settings.css';

const Settings = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [inputKey, setInputKey] = useState("");
  const [scheduleData, setScheduleData] = useState({ "월": [], "화": [], "수": [], "목": [], "금": [] });
  const [swapSource, setSwapSource] = useState(null);
  const [activeDayIdx, setActiveDayIdx] = useState(new Date().getDay() === 0 || new Date().getDay() === 6 ? 0 : new Date().getDay() - 1);
  
  const days = ["월", "화", "수", "목", "금"];

  // 인증 로직
  const handleAuth = async (e) => {
    e.preventDefault();
    try {
      const snapshot = await get(ref(db, 'admin'));
      if (snapshot.exists()) {
        const keyList = Array.isArray(snapshot.val()) ? snapshot.val().map(String) : [String(snapshot.val())];
        if (keyList.includes(inputKey)) {
          setIsAdmin(true);
          onValue(ref(db, 'timetable'), (snap) => {
            if (snap.val()) setScheduleData(snap.val());
          });
        } else {
          alert("키가 일치하지 않습니다.");
        }
      }
    } catch (err) { alert("인증 오류"); }
  };

  const handleSwap = (day, index) => {
    if (!swapSource) {
      setSwapSource({ day, index });
    } else {
      if (swapSource.day === day && swapSource.index === index) {
        setSwapSource(null);
        return;
      }
      const newS = { ...scheduleData };
      const temp = newS[swapSource.day][swapSource.index];
      newS[swapSource.day][swapSource.index] = newS[day][index];
      newS[day][index] = temp;
      setScheduleData(newS);
      setSwapSource(null);
    }
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const { source, destination } = result;
    const newS = { ...scheduleData };
    const [moved] = newS[source.droppableId].splice(source.index, 1);
    newS[destination.droppableId].splice(destination.index, 0, moved);
    setScheduleData(newS);
  };

  const saveAll = async () => {
    if (window.confirm("변경사항을 서버에 저장할까요?")) {
      await set(ref(db, 'timetable'), scheduleData);
      alert("저장 완료!");
      navigate("/")
    }
  };

  if (!isAdmin) {
    return (
      <div className="auth-container">
        <form className="auth-box" onSubmit={handleAuth}>
          <div className="auth-header">
            <span>🔐</span>
            <h2>시간표 바꾸기</h2>
          </div>
          <input 
            type="password" 
            placeholder="비밀번호를 입력하세요" 
            value={inputKey} 
            onChange={(e) => setInputKey(e.target.value)}
            inputMode="numeric"
          />
          <button type="submit">인증</button>
        </form>
      </div>
    );
  }

  return (
    <div className="set-page">
      <header className="set-header">
        <div className="set-info">
          <h1>시간표 편집</h1>
          <p>{swapSource ? "교체할 과목을 선택하세요" : "자유롭게 편집하세요"}</p>
        </div>
        <div className="set-actions">
          <button className="btn-exit" onClick={() => navigate('/')}>닫기</button>
          <button className="btn-save" onClick={saveAll}>저장</button>
        </div>
      </header>

      {/* 요일 탭 내비게이션 */}
      <nav className="day-tabs">
        {days.map((d, i) => (
          <button 
            key={d} 
            className={activeDayIdx === i ? 'active' : ''} 
            onClick={() => setActiveDayIdx(i)}
          >
            {d}
          </button>
        ))}
      </nav>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="board-container">
          {days.map((day, idx) => (
            <div key={day} className={`day-pane ${activeDayIdx === idx ? 'active' : ''}`}>
              <Droppable droppableId={day}>
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className="card-list">
                    {scheduleData[day]?.map((item, i) => (
                      <Draggable key={`${day}-${i}-${item}`} draggableId={`${day}-${i}-${item}`} index={i}>
                        {(p, s) => (
                          <div 
                            ref={p.innerRef} {...p.draggableProps}
                            className={`subj-card ${s.isDragging ? 'dragging' : ''} ${swapSource?.day === day && swapSource?.index === i ? 'target' : ''}`}
                          >
                            <div className="drag-icon" {...p.dragHandleProps}>⠿</div>
                            <span className="num">{i + 1}</span>
                            <span className="name">{item || "공강"}</span>
                            <button className="swap-trigger" onClick={() => handleSwap(day, i)}>
                              {swapSource ? (swapSource.day === day && swapSource.index === i ? '취소' : '선택') : '교체'}
                            </button>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
};

export default Settings;
