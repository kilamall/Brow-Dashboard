import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { FirebaseProvider } from '@buenobrows/shared/useFirebase';
import { ErrorBoundary } from '@buenobrows/shared/ErrorBoundary';
import { FullPageError } from '@buenobrows/shared/FallbackUI';
import { ErrorCategory } from '@buenobrows/shared/errorHandling';
import App from './App';
import './index.css';

// Runtime console filter that can be toggled from Admin Settings
(() => {
  if (!import.meta.env.PROD) return;
  const original = {
    log: console.log,
    debug: console.debug,
    info: console.info
  };
  const noop = () => {};
  const apply = (enabled: boolean) => {
    if (enabled) {
      console.log = original.log;
      console.debug = original.debug;
      console.info = original.info;
    } else {
      console.log = noop;
      console.debug = noop;
      console.info = noop;
    }
  };
  // Expose to window so Settings can toggle without reload
  (window as any).__applyConsoleFilter = apply;
  const initial = localStorage.getItem('admin:debugLogs') === 'true';
  apply(initial);
})();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary 
      fallback={(error, reset) => <FullPageError error={error} reset={reset} />}
      category={ErrorCategory.UNKNOWN}
    >
      <FirebaseProvider>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <App />
        </BrowserRouter>
      </FirebaseProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
