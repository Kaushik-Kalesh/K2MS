import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import Admin from './admin/Admin'
import './index.css'

const root = document.getElementById('root')!;
const isAdmin = window.location.hash === '#admin' || window.location.pathname.includes('/admin');

if (isAdmin) {
  const meta = document.createElement('meta');
  meta.name = 'robots';
  meta.content = 'noindex, nofollow';
  document.head.appendChild(meta);
}

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    {isAdmin ? <Admin /> : <App />}
  </React.StrictMode>,
)
