// src/main.tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import './index.css'
import App from './App.tsx'
import { preloadCriticalResources, trackWebVitals } from './utils/seoUtils'

// Preload critical resources
preloadCriticalResources();

// Track Web Vitals for performance monitoring
trackWebVitals();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </StrictMode>,
)