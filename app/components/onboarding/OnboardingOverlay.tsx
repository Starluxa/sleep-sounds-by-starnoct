'use client';

import React from 'react';

interface OnboardingOverlayProps {
  children: React.ReactNode;
}

export const OnboardingOverlay: React.FC<OnboardingOverlayProps> = ({ children }) => {
  return (
    <div
      className="fixed inset-0 z-100 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 overflow-y-auto overscroll-none"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
    >
      <div className="min-h-screen flex flex-col relative z-10">
        {children}
      </div>
    </div>
  );
};