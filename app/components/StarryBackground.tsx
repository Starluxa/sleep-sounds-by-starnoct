'use client';

import { useStarryController } from '../hooks/useStarryController';

const StarryBackground = () => {
  const canvasRef = useStarryController();

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-[--safe-area-top] left-0 right-0 bottom-[--safe-area-bottom] -z-30"
      aria-hidden="true"
    />
  );
};

export default StarryBackground;
