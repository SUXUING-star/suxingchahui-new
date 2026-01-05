import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App'; // 注意：在 TS 中，导入本地组件不要带 .tsx 或 .jsx 后缀
import './index.css';
import './utils/mockFs'; 

// 核心修复逻辑：
// 1. 获取元素
const rootElement = document.getElementById('root');

// 2. 这里的“守卫”逻辑是为了让 TS 闭嘴，如果找不到 root 直接抛错，不会让 null 传给 createRoot
if (!rootElement) {
  throw new Error('他妈的找不到 id 为 "root" 的元素，检查一下你的 index.html！');
}

// 3. 既然过了上面的检查，rootElement 现在绝对是 HTMLElement，直接传进去
const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);