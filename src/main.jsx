import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// Initialize theme before rendering
const savedTheme = localStorage.getItem('chikitsa_theme');
const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

if (savedTheme === 'dark' || (!savedTheme && systemDark)) {
  document.documentElement.classList.add('dark');
  document.documentElement.style.colorScheme = 'dark';
} else {
  document.documentElement.classList.remove('dark');
  document.documentElement.style.colorScheme = 'light';
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
