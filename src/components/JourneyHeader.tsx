import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Journey } from '../types';
import { ThemeConfig } from '../styles/themes';
import { formatDisplayDate, MilestoneProgress } from '../utils/dateCalculations';
import { Sparkles } from 'lucide-react';

// 5 radically distinct romantic & editorial typography styles across 5 distinct typographic genres:
// 1. Classical Roman Inscriptional Serif (Cinzel)
// 2. Romantic Handwritten Calligraphic Script (Great Vibes)
// 3. Ultra-Modern Geometric Luxury Sans (Montserrat)
// 4. High-Drama Romantic Slanted Editorial Italic (Playfair Display Italic)
// 5. Nostalgic Vintage Typewriter Monospace (Courier Prime)
const ROMANTIC_FONTS = [
  {
    name: 'Cinzel',
    fontFamily: "'Cinzel', Georgia, serif",
    fontStyle: 'normal' as const,
    fontWeight: 700,
    letterSpacing: '0.28em',
    fontSize: '18px',
    transform: (text: string) => text.toUpperCase(),
    offsetY: '0px',
  },
  {
    name: 'Great Vibes',
    fontFamily: "'Great Vibes', cursive",
    fontStyle: 'normal' as const,
    fontWeight: 400,
    letterSpacing: '0.04em',
    fontSize: '26px',
    transform: (text: string) =>
      text
        .toLowerCase()
        .split(' ')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' '),
    offsetY: '-1px',
  },
  {
    name: 'Montserrat',
    fontFamily: "'Montserrat', sans-serif",
    fontStyle: 'normal' as const,
    fontWeight: 600,
    letterSpacing: '0.34em',
    fontSize: '17px',
    transform: (text: string) => text.toUpperCase(),
    offsetY: '0px',
  },
  {
    name: 'Playfair Display Italic',
    fontFamily: "'Playfair Display', Georgia, serif",
    fontStyle: 'italic' as const,
    fontWeight: 600,
    letterSpacing: '0.12em',
    fontSize: '20px',
    transform: (text: string) =>
      text
        .toLowerCase()
        .split(' ')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' '),
    offsetY: '0px',
  },
  {
    name: 'Courier Prime',
    fontFamily: "'Courier Prime', Courier, monospace",
    fontStyle: 'normal' as const,
    fontWeight: 700,
    letterSpacing: '0.20em',
    fontSize: '17px',
    transform: (text: string) => text.toUpperCase(),
    offsetY: '0px',
  },
];

interface JourneyHeaderProps {
  journey: Journey;
  theme: ThemeConfig;
  milestoneProgress: MilestoneProgress;
  currentSecond?: number;
  onEditClick: () => void;
}

export const JourneyHeader: React.FC<JourneyHeaderProps> = ({
  journey,
  theme,
  milestoneProgress,
  currentSecond = 0,
  onEditClick,
}) => {
  // Sync font index directly to the countdown seconds dial (changes every second in lockstep)
  const fontIndex = Math.abs(currentSecond) % ROMANTIC_FONTS.length;

  const formattedStart = formatDisplayDate(journey.startDate, journey.hasStartTime);
  const formattedEnd = journey.endDate ? formatDisplayDate(journey.endDate) : '';

  const getDisplayHeading = () => {
    if (journey.mode === 'between' && formattedEnd) {
      return `${formattedStart} — ${formattedEnd}`;
    }
    return formattedStart;
  };

  const getSubtitle = () => {
    if (journey.description) return journey.description;
    if (journey.mode === 'until') return 'Until this moment arrives.';
    if (journey.mode === 'between') return 'The duration between two horizons.';
    return 'The journey began here.';
  };

  const currentFont = ROMANTIC_FONTS[fontIndex];

  return (
    <header className="w-full flex flex-col items-center text-center px-4 pt-3 pb-1 md:pt-6 md:pb-2 relative z-10">
      {/* 1. Cycling Romantic Fonts for “THE JOURNEY” with fixed left-alignment to the star icon */}
      <button
        id="journey-title-tag-btn"
        type="button"
        onClick={onEditClick}
        className="group inline-flex items-center gap-2 mb-3 sm:mb-4 px-3 py-1 rounded-full transition-all duration-300 hover:opacity-95 select-none"
        style={{ color: theme.accentColor }}
        title="Customize Title"
      >
        {/* Star icon with permanent fixed optical alignment */}
        <span className="flex items-center justify-center shrink-0 w-4 h-4">
          <Sparkles className="w-4 h-4 transition-transform duration-300 group-hover:rotate-45 shrink-0 opacity-90 drop-shadow-[0_0_8px_currentColor]" />
        </span>

        {/* Font cycling container: left-aligned to lock distance from the star */}
        <div className="relative inline-flex items-center justify-start h-8">
          {/* mode="wait" ensures the outgoing font fades out cleanly before the next arrives, eliminating double-text ghosting */}
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={fontIndex}
              initial={{ opacity: 0, y: 1.5, filter: 'blur(1px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -1.5, filter: 'blur(1px)' }}
              transition={{ duration: 0.12, ease: 'easeOut' }}
              className="absolute left-0 inset-y-0 flex items-center justify-start leading-none text-glow whitespace-nowrap"
              style={{
                fontFamily: currentFont.fontFamily,
                fontStyle: currentFont.fontStyle,
                fontWeight: currentFont.fontWeight,
                letterSpacing: currentFont.letterSpacing,
                fontSize: currentFont.fontSize,
                transform: `translateY(${currentFont.offsetY})`,
              }}
            >
              {currentFont.transform(journey.title)}
            </motion.span>
          </AnimatePresence>

          {/* Invisible sizing anchor ensuring the container width remains stable without shifting the star */}
          <span
            aria-hidden="true"
            className="invisible text-[17px] font-normal leading-none whitespace-nowrap px-1 select-none pointer-events-none"
            style={{
              fontFamily: "'Montserrat', sans-serif",
              letterSpacing: '0.34em',
              fontWeight: 600,
            }}
          >
            {journey.title.toUpperCase()}
          </span>
        </div>
      </button>

      {/* 2. Romantic & Premium Date Headline: Playfair Display Medium, ~54px, warm white #F5F1EA */}
      <h1
        id="journey-date-headline"
        className="font-playfair font-medium text-4xl sm:text-5xl md:text-[52px] lg:text-[56px] tracking-normal text-[#F5F1EA] mb-2 sm:mb-2.5 select-none leading-tight"
        style={{
          textShadow: '0 0 35px rgba(245, 241, 234, 0.12)',
        }}
      >
        {getDisplayHeading()}
      </h1>

      {/* 3. Muted descriptor beneath the date */}
      <p className="text-xs sm:text-sm text-white/45 font-manrope font-normal tracking-wide max-w-lg mx-auto">
        {getSubtitle()}
      </p>

      {/* Optional milestone chip if close */}
      {milestoneProgress.nextMilestone && milestoneProgress.nextMilestone.daysRemaining <= 100 && (
        <div
          className="mt-3 inline-flex items-center gap-2 px-3 py-0.5 rounded-full text-[11px] text-white/60 bg-white/[0.03] border border-white/10"
        >
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: theme.accentColor }} />
          <span>Next: {milestoneProgress.nextMilestone.label} in {milestoneProgress.nextMilestone.daysRemaining} days</span>
        </div>
      )}
    </header>
  );
};
