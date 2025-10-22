import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { FirebaseProvider } from '@buenobrows/shared/useFirebase';
import { ErrorBoundary } from '@buenobrows/shared/ErrorBoundary';
import { FullPageError } from '@buenobrows/shared/FallbackUI';
import { ErrorCategory } from '@buenobrows/shared/errorHandling';
import App from './App';
import './index.css';

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
