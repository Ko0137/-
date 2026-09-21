import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Global error handlers to capture crash info
try {
  window.addEventListener('error', (event) => {
    const errData = {
      message: event.message || event.error?.message || 'Unknown Error',
      stack: event.error?.stack || 'No stack trace available',
      time: new Date().toISOString(),
      type: 'error'
    };
    localStorage.setItem('lira_last_crash', JSON.stringify(errData));
  });

  window.addEventListener('unhandledrejection', (event) => {
    const errData = {
      message: event.reason?.message || (typeof event.reason === 'string' ? event.reason : 'Unhandled Promise Rejection'),
      stack: event.reason?.stack || 'No stack trace available',
      time: new Date().toISOString(),
      type: 'unhandledrejection'
    };
    localStorage.setItem('lira_last_crash', JSON.stringify(errData));
  });
} catch (e) {
  console.error('Error registering global error handlers', e);
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
