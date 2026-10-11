import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import IndiaToursPage from './components/IndiaToursPage';
import './india-tours.css';

const rootElement = document.getElementById('india-tours-root');
if (!rootElement) throw new Error('India tours page is missing its React root.');

createRoot(rootElement).render(
  <StrictMode>
    <IndiaToursPage />
  </StrictMode>,
);
