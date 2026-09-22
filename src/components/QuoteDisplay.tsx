import React from 'react';
import { ThemeConfig } from '../styles/themes';

interface QuoteDisplayProps {
  quote: string;
  theme: ThemeConfig;
  onEditClick?: () => void;
}

export const QuoteDisplay: React.FC<QuoteDisplayProps> = ({ quote, theme, onEditClick }) => {
  if (!quote) return null;

  return (
    <div
      className="max-w-xl mx-auto my-2.5 sm:my-3 px-6 text-center select-none"
    >
      {/* Romantic Inscription: Cormorant Garamond Italic, ~26px, softer warm white #EAE5DC/80 */}
      <blockquote className="font-cormorant text-xl sm:text-2xl md:text-[26px] italic font-normal text-[#EAE5DC]/80 text-center leading-[1.4] tracking-normal">
        “{quote}”
      </blockquote>
    </div>
  );
};
