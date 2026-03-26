import axios from "axios";
import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Navigation } from "swiper/modules";

// Swiper 스타일
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import "../css/Lunch.css";

const Lunch = () => {
  const KEY = "8f0003535e6a4051b0e4d537f67b161a";
  const [lunchMap, setLunchMap] = useState({});
  const [dateList, setDateList] = useState([]);
  const [loading, setLoading] = useState(true);

  // 주말 체크 (0: 일요일, 6: 토요일)
  const isWeekend = (date) => {
    const day = date.getDay();
    return day === 0 || day === 6;
  };

  useEffect(() => {
    // 평일 리스트 생성 (오늘 + 미래 평일 5일)
    const getWeekdays = () => {
      const weekdays = [];
      const today = new Date();

      // 1. 오늘 (주말이 아닐 때만 포함)
      if (!isWeekend(today)) {
        weekdays.push(new Date(today));
      }

      // 2. 미래 평일 5일 추가
      let nextCount = 0;
      let dNext = new Date(today);
      while (nextCount < 4) {
        dNext.setDate(dNext.getDate() + 1);
        if (!isWeekend(dNext)) {
          weekdays.push(new Date(dNext));
          nextCount++;
        }
      }
      return weekdays;
    };

    const targetDates = getWeekdays();
    setDateList(targetDates);

    // API 호출 범위 설정
    const formatDate = (date) => date.toISOString().split('T')[0].replace(/-/g, '');
    const fromDate = formatDate(targetDates[0]);
    const toDate = formatDate(targetDates[targetDates.length - 1]);

    const URL = `https://open.neis.go.kr/hub/mealServiceDietInfo?KEY=${KEY}&Type=json&pindex=1&pSize=100&ATPT_OFCDC_SC_CODE=B10&SD_SCHUL_CODE=7010096&MLSV_FROM_YMD=${fromDate}&MLSV_TO_YMD=${toDate}`;

    axios.get(URL)
      .then((res) => {
        if (res.data["mealServiceDietInfo"]) {
          const rows = res.data["mealServiceDietInfo"][1]["row"];
          const newLunchMap = {};
          rows.forEach(row => {
            newLunchMap[row.MLSV_YMD] = row.DDISH_NM.split("<br/>");
          });
          setLunchMap(newLunchMap);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="loading-screen">식단표를 불러오는 중...</div>;

  // 오늘 날짜 문자열 (비교용)
  const todayStr = new Date().toDateString();

  return (
    <div className="lunch-container">
      <Swiper
        modules={[Pagination, Navigation]}
        spaceBetween={16}
        slidesPerView={"auto"}
        centeredSlides={true}
        initialSlide={0} // 리스트의 첫 번째가 오늘(혹은 가장 가까운 평일)이므로 0으로 고정
        pagination={{ clickable: true, dynamicBullets: true }}
        className="lunch-swiper"
      >
        {dateList.map((dateObj) => {
          const ymd = dateObj.toISOString().split('T')[0].replace(/-/g, '');
          const isToday = todayStr === dateObj.toDateString();
          const dayName = new Intl.DateTimeFormat('ko-KR', { weekday: 'short' }).format(dateObj);
          const menu = lunchMap[ymd];

          return (
            <SwiperSlide key={ymd} className="lunch-slide">
              <div className={`lunch-card ${isToday ? 'is-today' : ''}`}>
                {isToday && <div className="today-badge">TODAY</div>}
                
                <div className="lunch-header-group">
                  <div className="calendar-badge">
                    <span className="cal-month">{dateObj.getMonth() + 1}월</span>
                    <span className="cal-date">{dateObj.getDate()}</span>
                  </div>
                  <div className="title-text">
                    <span className="day-label">{dayName}요일</span>
                    <h2 className="lunch-title">식단표</h2>
                  </div>
                </div>

                <div className="lunch-divider"></div>

                <div className="menu-content">
                  {menu ? (
                    <ul className="lunch-list">
                      {menu.map((item, i) => (
                        <li key={i} className="lunch-item">
                          <span className="item-dot"></span>
                          <span className="item-text">{item.split("(")[0].trim()}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="no-lunch">
                      <p>급식 정보가 없어요 😴</p>
                    </div>
                  )}
                </div>
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </div>
  );
};

export default Lunch;