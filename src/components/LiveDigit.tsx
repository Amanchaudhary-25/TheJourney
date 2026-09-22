import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface LiveDigitProps {
  value: string | number;
  label: string;
  themeAccent?: string;
  progressRatio?: number; // 0 to 1 for orbital arc
  isSecond?: boolean;
}

export const LiveDigit: React.FC<LiveDigitProps> = ({
  value,
  label,
  themeAccent = '#38BDF8',
  progressRatio = 0.35,
  isSecond = false,
}) => {
  const formattedValue = typeof value === 'number' ? String(value).padStart(2, '0') : String(value);
  const [prevValue, setPrevValue] = useState(formattedValue);
  const [pulse, setPulse] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (formattedValue !== prevValue) {
      setPrevValue(formattedValue);
      if (isSecond) {
        setPulse(true);
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = window.setTimeout(() => setPulse(false), 350);
      }
    }
  }, [formattedValue, prevValue, isSecond]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // Calculate SVG arc for the outer concentric orbit ring
  // Outer circle radius
  const size = 136;
  const strokeWidth = 1.5;
  const radius = (size - 14) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - Math.min(1, Math.max(0.12, progressRatio)));

  return (
    <div className="relative flex flex-col items-center justify-center select-none group">
      {/* Outer Orbital Ring with SVG Arc & Pip dot */}
      <div className="relative w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 lg:w-36 lg:h-36 flex items-center justify-center">
        {/* SVG Outer Orbit track */}
        <svg
          className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none"
          viewBox={`0 0 ${size} ${size}`}
        >
          {/* Faint complete orbit track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth={strokeWidth}
          />

          {/* Active arc segment as seen in the image */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={themeAccent}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
            style={{
              opacity: isSecond && pulse ? 0.9 : 0.45,
              filter: isSecond && pulse ? `drop-shadow(0 0 6px ${themeAccent})` : undefined,
            }}
          />
        </svg>

        {/* Small glowing cyan pip node at 12 o'clock position on the outer orbit */}
        <div
          className="absolute top-0.5 sm:top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full pointer-events-none transition-all duration-300"
          style={{
            backgroundColor: themeAccent,
            boxShadow: `0 0 ${pulse && isSecond ? '8px' : '4px'} ${themeAccent}`,
            opacity: pulse && isSecond ? 1 : 0.75,
          }}
        />

        {/* Inner Dark Circular Pod */}
        <div
          className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-30 lg:h-30 rounded-full flex flex-col items-center justify-center transition-transform duration-300 group-hover:scale-105"
          style={{
            background: 'radial-gradient(circle at 50% 40%, #111a28 0%, #090e16 85%, #06090f 100%)',
            border: `1px solid ${pulse && isSecond ? `${themeAccent}50` : 'rgba(255, 255, 255, 0.08)'}`,
            boxShadow: pulse && isSecond
              ? `0 0 30px -4px ${themeAccent}35, inset 0 0 20px rgba(0, 0, 0, 0.8)`
              : '0 12px 35px -8px rgba(0, 0, 0, 0.7), inset 0 0 16px rgba(0, 0, 0, 0.6)',
          }}
        >
          {/* Number Window: Manrope Medium ~38px, crisp white #FFFFFF */}
          <div className="relative h-7 sm:h-9 md:h-10 lg:h-11 flex items-center justify-center overflow-hidden">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.div
                key={formattedValue}
                initial={{ y: 16, opacity: 0, filter: 'blur(2px)' }}
                animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
                exit={{ y: -16, opacity: 0, filter: 'blur(2px)' }}
                transition={{
                  y: { type: 'spring', stiffness: 350, damping: 28 },
                  opacity: { duration: 0.2 },
                  filter: { duration: 0.16 },
                }}
                className="text-2xl sm:text-3xl md:text-[35px] lg:text-[38px] font-manrope font-medium tracking-tight text-white tabular-nums leading-none"
              >
                {formattedValue}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Unit Label: Manrope Medium 10px with increased letter spacing (2-3px) */}
          <span className="text-[8px] sm:text-[9px] md:text-[10px] font-manrope font-medium tracking-[0.25em] text-white/50 uppercase mt-0.5 sm:mt-1">
            {label}
          </span>
        </div>
      </div>
    </div>
  );
};
