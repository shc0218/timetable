// public/service-worker.js

// 설치 단계: 서비스 워커가 설치될 때 제어권을 즉시 가져옴
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// 활성화 단계
self.addEventListener('activate', (event) => {
  return self.clients.claim();
});

// 네트워크 요청 가로채기 (현재는 아무것도 하지 않음)
self.addEventListener('fetch', (event) => {
  // 나중에 오프라인 캐싱 기능을 여기에 추가할 수 있습니다.
});