import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Intercept unhandled worker/background image reading exceptions
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    const msg = event.message || (event.error && event.error.message) || '';
    if (typeof msg === 'string' && msg.includes('Error attempting to read image')) {
      console.warn('Background image reading error gracefully intercepted:', msg);
      event.preventDefault();
      event.stopPropagation();
      return true;
    }
  });

  window.addEventListener('unhandledrejection', (event) => {
    const reasonMsg = (event.reason && event.reason.message) || String(event.reason || '');
    if (typeof reasonMsg === 'string' && reasonMsg.includes('Error attempting to read image')) {
      console.warn('Background image reading rejection gracefully intercepted:', reasonMsg);
      event.preventDefault();
      event.stopPropagation();
    }
  });
}

createRoot(document.getElementById('root')!).render(<App />);
