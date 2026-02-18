'use client';

import React, { ReactNode, useEffect } from 'react';
import { Toaster } from 'sonner';
import ErrorBoundary from '../../components/error-boundary';

interface ErrorProviderProps {
  children: ReactNode;
}

const ErrorProvider: React.FC<ErrorProviderProps> = ({ children }) => {
  return (
    <>
      <ErrorBoundary>
        {children}
      </ErrorBoundary>
      <Toaster
        position="top-center"
        toastOptions={{
          className: 'bg-background border border-border',
          style: {
            background: 'hsl(var(--background))',
            color: 'hsl(var(--foreground))',
          },
        }}
        style={{
          top: '30px',
        }}
      />
    </>
  );
};

export default ErrorProvider;