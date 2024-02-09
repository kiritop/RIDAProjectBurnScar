import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux'; // ตรวจสอบว่ามีการ import Provider จาก react-redux หรือไม่
import App from './App';
import store from './store'; // ตรวจสอบว่ามีการ import store จากไฟล์ที่ถูกต้องหรือไม่

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Provider store={store}> {/* ตรวจสอบว่ามี Provider และกำหนด store ให้กับ Provider อย่างถูกต้องหรือไม่ */}
    <App />
  </Provider>
);

