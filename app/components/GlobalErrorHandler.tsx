'use client';

import { useEffect } from 'react';
import { toast } from 'sonner';

export default function GlobalErrorHandler() {
  useEffect(() => {
    // Handle unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason);
      
      // Extract error message safely
      let errorMessage = 'An unexpected error occurred';
      
      if (event.reason) {
        if (typeof event.reason === 'string') {
          errorMessage = event.reason;
        } else if (event.reason instanceof Error) {
          errorMessage = event.reason.message;
        } else if (typeof event.reason === 'object' && event.reason !== null) {
          errorMessage = event.reason.message || event.reason.error || JSON.stringify(event.reason);
        }
      }
      
      // Show user-friendly error toast
      toast.error('Error', {
        description: errorMessage,
        duration: 5000,
      });
      
      // Prevent the default handler
      event.preventDefault();
    };

    // Handle global errors
    const handleError = (event: ErrorEvent) => {
      console.error('Global error:', event.error);
      
      // Extract error message safely
      let errorMessage = 'An unexpected error occurred';
      
      if (event.error) {
        if (typeof event.error === 'string') {
          errorMessage = event.error;
        } else if (event.error instanceof Error) {
          errorMessage = event.error.message;
        } else if (typeof event.error === 'object' && event.error !== null) {
          errorMessage = event.error.message || event.error.error || 'Unknown error';
        }
      } else if (event.message) {
        errorMessage = event.message;
      }
      
      // Show user-friendly error toast
      toast.error('Error', {
        description: errorMessage,
        duration: 5000,
      });
      
      // Prevent the default handler
      event.preventDefault();
    };

    // Add event listeners
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);

    // Cleanup
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
    };
  }, []);

  return null;
}