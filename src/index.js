import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import reportWebVitals from './reportWebVitals';


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// src/index.js

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // process.env.PUBLIC_URL은 빌드 시 public 폴더의 루트를 가리킵니다.
    // 개발 모드에서는 빈 문자열("")이므로 /service-worker.js와 동일하게 작동합니다.
    const swUrl = `${process.env.PUBLIC_URL}/service-worker.js`;

    navigator.setCheck = false; // 캐시 방지용 (선택 사항)

    navigator.serviceWorker
      .register(swUrl)
      .then((registration) => {
        console.log('✅ 서비스 워커 등록 성공! 범위:', registration.scope);
      })
      .catch((error) => {
        console.error('❌ 서비스 워커 등록 실패:', error);
      });
  });
}
reportWebVitals();
