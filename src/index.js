import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

const root = ReactDOM.createRoot(
  document.getElementById("root")
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Service Worker 등록
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register(
        `${process.env.PUBLIC_URL || ""}/service-worker.js`
      )
      .then((registration) => {
        console.log(
          "PWA Service Worker 등록 성공:",
          registration.scope
        );
      })
      .catch((error) => {
        console.error(
          "PWA Service Worker 등록 실패:",
          error
        );
      });
  });
}