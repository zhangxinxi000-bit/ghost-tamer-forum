import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';

import RoutesComponent from './app';
import './index.css';
import { createPortal } from 'react-dom';
import { Toaster } from '@client/src/components/ui/sonner';

const ErrorFallback: React.FC<{
  error: Error;
  resetErrorBoundary: () => void;
}> = ({ error, resetErrorBoundary }) => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      gap: '16px',
      background: 'var(--background)',
      color: 'var(--foreground)',
    }}
  >
    <h1 style={{ fontSize: '20px', fontWeight: 600 }}>页面出现异常</h1>
    <pre style={{ color: 'var(--foreground-dim)', fontSize: '13px' }}>
      {error.message}
    </pre>
    <button
      onClick={resetErrorBoundary}
      style={{
        padding: '8px 16px',
        border: '1px solid var(--border)',
        borderRadius: '4px',
        cursor: 'pointer',
        background: 'var(--surface)',
        color: 'var(--foreground)',
      }}
    >
      重试
    </button>
  </div>
);

const MainApp = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary
        fallbackRender={({ error, resetErrorBoundary }) => (
          <ErrorFallback
            error={error as Error}
            resetErrorBoundary={resetErrorBoundary}
          />
        )}
      >
        <RoutesComponent />
        {createPortal(<Toaster />, document.body)}
      </ErrorBoundary>
    </BrowserRouter>
  );
};

createRoot(document.getElementById('root')!).render(<MainApp />);
