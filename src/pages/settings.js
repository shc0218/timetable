import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { ref, onValue, get, set } from 'firebase/database';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import '../css/settings.css';

const Settings = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [scheduleData, setScheduleData] = useState({
    "월": [], "화": [], "수": [], "목": [], "금": []
  });

  const isAuthProcessed = useRef(false);

  useEffect(() => {
    if (isAuthProcessed.current) return;
    isAuthProcessed.current = true;

    const authenticate = async () => {
      try {
        const snapshot = await get(ref(db, 'admin'));
        if (snapshot.exists()) {
          const serverKeys = snapshot.val();
          const userKey = prompt("관리자 키를 입력하세요:");
          if (userKey === null) return navigate("/");

          const keyList = Array.isArray(serverKeys) ? serverKeys : [serverKeys];
          if (keyList.map(String).includes(String(userKey))) {
            setIsAdmin(true);
            onValue(ref(db, 'timetable'), (snap) => {
              const data = snap.val();
              if (data) setScheduleData({
                "월": data["월"] || [], "화": data["화"] || [],
                "수": data["수"] || [], "목": data["목"] || [], "금": data["금"] || []
              });
            });
          } else {
            alert("유효하지 않은 키입니다.");
            navigate("/");
          }
        }
      } catch (err) { navigate("/"); }
    };
    authenticate();
  }, [navigate]);

  const onDragEnd = (result) => {
    const { source, destination } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const day = source.droppableId;
    const newList = Array.from(scheduleData[day]);
    const [movedItem] = newList.splice(source.index, 1);
    newList.splice(destination.index, 0, movedItem);

    setScheduleData({ ...scheduleData, [day]: newList });
  };

  const handleSave = async () => {
    if (window.confirm("변경사항을 저장할까요?")) {
      try {
        await set(ref(db, 'timetable'), scheduleData);
        alert("저장되었습니다.");
        navigate("/");
      } catch (err) { alert("저장 실패: " + err.message); }
    }
  };

  if (!isAdmin) return null;

  return (
    <div className="settings-container">
      <header className="settings-header">
        <div className="settings-title-group">
          <h1 className="settings-title">시간표 설정</h1>
          <p className="settings-subtitle">모바일에서는 항목을 <b>길게 눌러서</b> 이동하세요.</p>
        </div>
        <div className="btn-group">
          <button onClick={() => navigate("/")} className="cancel-btn">취소</button>
          <button onClick={handleSave} className="save-btn">저장하기</button>
        </div>
      </header>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="settings-board">
          {["월", "화", "수", "목", "금"].map((day) => (
            <div key={day} className="settings-column">
              <div className="column-header">{day}요일</div>
              <Droppable droppableId={day}>
                {(provided, snapshot) => (
                  <div 
                    {...provided.droppableProps} 
                    ref={provided.innerRef} 
                    className={`drop-zone ${snapshot.isDraggingOver ? 'active' : ''}`}
                  >
                    {scheduleData[day].map((item, index) => (
                      <Draggable key={`item-${day}-${index}`} draggableId={`${day}-${index}`} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`draggable-card ${snapshot.isDragging ? 'is-dragging' : ''}`}
                            style={{
                              ...provided.draggableProps.style,
                              // 모바일 드래그 시작 시 브라우저 스크롤 방지
                              touchAction: 'none' 
                            }}
                          >
                            <span className="card-badge">{index + 1}교시</span>
                            <span className="card-text">{item || "—"}</span>
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