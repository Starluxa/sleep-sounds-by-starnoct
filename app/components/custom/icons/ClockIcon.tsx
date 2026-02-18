import React from 'react';

export default function ClockIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l2 2M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}