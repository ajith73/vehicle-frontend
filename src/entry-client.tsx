import { StrictMode } from 'react';
import { hydrateRoot, createRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import App from './App';
import './index.css';
import { initGA } from './utils/analytics';

initGA();

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

const app = (
  <StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </StrictMode>
);

const isSsr = rootElement.innerHTML.trim() !== '<!--ssr-outlet-->';

if (isSsr) {
  hydrateRoot(rootElement, app);
} else {
  createRoot(rootElement).render(app);
}
