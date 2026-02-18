'use client';

import React, { useState, useEffect } from "react";
import { useMoonViewModel } from "../../../hooks/useMoonViewModel";

export const MoonAnimation: React.FC = () => {
  const {
    geometry,
    colors,
    animationConfig,
  } = useMoonViewModel({ theme: "dark" });

  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);

    const handleChange = (e: any) => setReducedMotion(e.matches);

    mq.addEventListener("change", handleChange);

    return () => mq.removeEventListener("change", handleChange);
  }, []);

  return (
    <div className="relative w-32 h-32 mx-auto">
      <svg
        className={`w-full h-full ${reducedMotion ? "" : "animate-rock"}`}
        style={{
          animationDuration: reducedMotion ? "0s" : animationConfig.rock.duration,
          animationTimingFunction: animationConfig.rock.easing,
          animationIterationCount: reducedMotion ? "1" : animationConfig.rock.iterations,
          transformBox: animationConfig.rock.transformBox,
        }}
        viewBox={geometry.viewBox.join(" ")}
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        role="presentation"
      >
        <g opacity="1">
          <path
            d={geometry.face.leftEye}
            stroke={colors.face.stroke}
            strokeWidth={colors.face.strokeWidthEyes.toString()}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d={geometry.face.rightEye}
            stroke={colors.face.stroke}
            strokeWidth={colors.face.strokeWidthEyes.toString()}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d={geometry.face.smile}
            stroke={colors.face.stroke}
            strokeWidth={colors.face.strokeWidthSmile.toString()}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      </svg>
    </div>
  );
};
