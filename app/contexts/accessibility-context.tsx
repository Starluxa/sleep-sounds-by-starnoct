'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type CardSize = 'small' | 'medium' | 'large';

interface AccessibilityContextType {
  cardSize: CardSize;
  setCardSize: (size: CardSize) => void;
}

// Default context value for SSR
const defaultValue: AccessibilityContextType = {
  cardSize: 'medium',
  setCardSize: () => {},
};

const AccessibilityContext = createContext<AccessibilityContextType>(defaultValue);

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [cardSize, setCardSizeState] = useState<CardSize>('medium');

  // Load from localStorage on mount (client-side only)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('accessibility-card-size');
      if (stored && ['small', 'medium', 'large'].includes(stored)) {
        setCardSizeState(stored as CardSize);
      }
    }
  }, []);

  // Save to localStorage when changed (client-side only)
  const setCardSize = (size: CardSize) => {
    setCardSizeState(size);
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessibility-card-size', size);
    }
  };

  return (
    <AccessibilityContext.Provider value={{ cardSize, setCardSize }}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  return useContext(AccessibilityContext);
}