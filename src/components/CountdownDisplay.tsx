import React from 'react';
import { ElapsedTime, Journey } from '../types';
import { ThemeConfig } from '../styles/themes';
import { LiveDigit } from './LiveDigit';

interface CountdownDisplayProps {
  journey: Journey;
  time: ElapsedTime;
  theme: ThemeConfig;
}

export const CountdownDisplay: React.FC<CountdownDisplayProps> = ({
  journey,
  time,
  theme,
}) => {
  return (
    <div className="relative w-full max-w-6xl mx-auto flex flex-col items-center justify-center my-2.5 sm:my-4 md:my-5 px-2 sm:px-4">
      {/* Background Celestial Orbital Rings matching reference image */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none -z-1 overflow-visible">
        {/* Large Faint Celestial Ellipse */}
        <div
          className="w-[120%] sm:w-[105%] h-56 sm:h-72 md:h-80 rounded-[100%] border border-white/[0.04] absolute"
          style={{
            transform: 'scaleY(0.65)',
            boxShadow: '0 0 100px -20px rgba(56, 189, 248, 0.04)',
          }}
        />

        {/* Faint Horizontal Orbital Horizon Guide */}
        <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-white/[0.06] to-transparent absolute" />
      </div>

      {/* Row of 6 Circular Planetary Pods: Years, Months, Days, Hours, Minutes, Seconds */}
      <div className="relative z-10 w-full flex flex-wrap lg:flex-nowrap justify-center items-center gap-4 lg:gap-7">
        {/* Mobile/Tablet: 3 on top row, 3 on bottom row; Desktop: 1 clean horizontal row of 6 */}
        <div className="flex justify-center items-center gap-3 sm:gap-4 lg:gap-7">
          <LiveDigit
            value={time.years}
            label="Years"
            themeAccent={theme.accentColor}
            progressRatio={((time.years % 10) + 1) / 10}
          />
          <LiveDigit
            value={time.months}
            label="Months"
            themeAccent={theme.accentColor}
            progressRatio={Math.max(0.1, time.months / 12)}
          />
          <LiveDigit
            value={time.days}
            label="Days"
            themeAccent={theme.accentColor}
            progressRatio={Math.max(0.1, time.days / 31)}
          />
        </div>

        <div className="flex justify-center items-center gap-3 sm:gap-4 lg:gap-7">
          <LiveDigit
            value={time.hours}
            label="Hours"
            themeAccent={theme.accentColor}
            progressRatio={Math.max(0.1, time.hours / 24)}
          />
          <LiveDigit
            value={time.minutes}
            label="Minutes"
            themeAccent={theme.accentColor}
            progressRatio={Math.max(0.1, time.minutes / 60)}
          />
          <LiveDigit
            value={time.seconds}
            label="Seconds"
            isSecond={true}
            themeAccent={theme.accentColor}
            progressRatio={Math.max(0.08, time.seconds / 60)}
          />
        </div>
      </div>
    </div>
  );
};
