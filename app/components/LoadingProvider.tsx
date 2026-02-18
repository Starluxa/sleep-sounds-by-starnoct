'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { PageLoadingOverlay } from './Skeletons';

interface LoadingContextType {
  showPageLoader: (message?: string) => void;
  hidePageLoader: () => void;
  showGlobalLoader: () => void;
  hideGlobalLoader: () => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const LoadingProvider = ({ children }: { children: ReactNode }) => {
  const [pageLoading, setPageLoading] = useState(false);
  const [globalLoading, setGlobalLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Loading...');

  const showPageLoader = (message = 'Loading...') => {
    setLoadingMessage(message);
    setPageLoading(true);
  };

  const hidePageLoader = () => {
    setPageLoading(false);
  };

  const showGlobalLoader = () => {
    setGlobalLoading(true);
  };

  const hideGlobalLoader = () => {
    setGlobalLoading(false);
  };

  return (
    <LoadingContext.Provider
      value={{
        showPageLoader,
        hidePageLoader,
        showGlobalLoader,
        hideGlobalLoader,
      }}
    >
      {children}
      <PageLoadingOverlay isLoading={pageLoading} />
    </LoadingContext.Provider>
  );
};

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};