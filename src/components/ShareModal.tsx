import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { Journey, ElapsedTime } from '../types';
import { ThemeConfig } from '../styles/themes';
import { formatDisplayDate } from '../utils/dateCalculations';
import { Share2, Download, Copy, Check, QrCode as QrIcon, X, ExternalLink } from 'lucide-react';

interface ShareModalProps {
  journey: Journey;
  time: ElapsedTime;
  theme: ThemeConfig;
  isOpen: boolean;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  journey,
  time,
  theme,
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [showQr, setShowQr] = useState(false);
  const [isGeneratingCard, setIsGeneratingCard] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Generate portable link encoding the journey data into URL hash
  const getShareableUrl = () => {
    if (typeof window === 'undefined') return '';
    try {
      const payload = {
        title: journey.title,
        mode: journey.mode,
        startDate: journey.startDate,
        endDate: journey.endDate,
        description: journey.description,
        quote: journey.quote,
        theme: journey.theme,
      };
      const encoded = encodeURIComponent(btoa(unescape(encodeURIComponent(JSON.stringify(payload)))));
      return `${window.location.origin}${window.location.pathname}#j=${encoded}`;
    } catch {
      return window.location.href;
    }
  };

  const shareableUrl = getShareableUrl();

  // Generate QR Code
  useEffect(() => {
    if (!isOpen) return;
    QRCode.toDataURL(shareableUrl, {
      width: 280,
      margin: 2,
      color: {
        dark: '#FFFFFF',
        light: '#0c0e14',
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('QR generation error:', err));
  }, [isOpen, shareableUrl]);

  if (!isOpen) return null;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareableUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleCopySummary = async () => {
    const summary = `${journey.title.toUpperCase()}
Since ${formatDisplayDate(journey.startDate)}
${time.years} Years, ${time.months} Months, ${time.days} Days, ${time.hours} Hours, ${time.minutes} Minutes

"${journey.quote}"

Created with The Journey — A place to remember when something began.
${shareableUrl}`;

    try {
      await navigator.clipboard.writeText(summary);
      setCopiedSummary(true);
      setTimeout(() => setCopiedSummary(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: journey.title,
          text: `"${journey.quote}" — ${journey.title} (${time.years} Years, ${time.months} Months, ${time.days} Days)`,
          url: shareableUrl,
        });
      } catch {
        // User cancelled or unsupported
      }
    } else {
      handleCopyLink();
    }
  };

  // Generate and download High-Res Shareable Card on Canvas
  const handleDownloadCard = () => {
    setIsGeneratingCard(true);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setIsGeneratingCard(false);
      return;
    }

    const width = 1080;
    const height = 1350; // Instagram portrait / editorial card ratio
    canvas.width = width;
    canvas.height = height;

    // 1. Background gradient matching theme
    const bgGradient = ctx.createLinearGradient(0, 0, width, height);
    if (journey.theme === 'aurora') {
      bgGradient.addColorStop(0, '#022c22');
      bgGradient.addColorStop(0.5, '#064e3b');
      bgGradient.addColorStop(1, '#051b17');
    } else if (journey.theme === 'sunset') {
      bgGradient.addColorStop(0, '#380918');
      bgGradient.addColorStop(0.5, '#4c0519');
      bgGradient.addColorStop(1, '#1f1315');
    } else if (journey.theme === 'serenity') {
      bgGradient.addColorStop(0, '#0f172a');
      bgGradient.addColorStop(0.5, '#1e293b');
      bgGradient.addColorStop(1, '#0b0f17');
    } else if (journey.theme === 'minimal') {
      bgGradient.addColorStop(0, '#18181b');
      bgGradient.addColorStop(1, '#09090b');
    } else {
      // Midnight
      bgGradient.addColorStop(0, '#0f172a');
      bgGradient.addColorStop(0.5, '#090a0f');
      bgGradient.addColorStop(1, '#05070a');
    }
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // Subtle border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 4;
    ctx.strokeRect(40, 40, width - 80, height - 80);

    // Decorative stars / particles
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    for (let i = 0; i < 60; i++) {
      const px = 60 + Math.random() * (width - 120);
      const py = 60 + Math.random() * (height - 120);
      const pr = Math.random() * 2 + 0.8;
      ctx.beginPath();
      ctx.arc(px, py, pr, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.textAlign = 'center';

    // Top Brand Tag
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.font = '500 24px -apple-system, sans-serif';
    ctx.letterSpacing = '8px';
    ctx.fillText('THE JOURNEY', width / 2, 160);

    // Journey Title
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '500 56px "Playfair Display", Georgia, serif';
    ctx.letterSpacing = '2px';
    ctx.fillText(journey.title, width / 2, 270);

    // Since date
    ctx.fillStyle = '#F5F1EA';
    ctx.font = 'italic 34px "Cormorant Garamond", Georgia, serif';
    ctx.fillText(`Since ${formatDisplayDate(journey.startDate)}`, width / 2, 340);

    // Calendar Breakdown Showcase
    ctx.fillStyle = theme.accentColor;
    ctx.font = '500 84px "Manrope", sans-serif';
    ctx.fillText(
      `${time.years}y ${time.months}m ${time.days}d`,
      width / 2,
      520
    );

    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = '500 24px "Manrope", sans-serif';
    ctx.letterSpacing = '6px';
    ctx.fillText(`${time.hours} HOURS · ${time.minutes} MINUTES · ${time.seconds} SECONDS`, width / 2, 585);

    // Subtle decorative divider
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(width / 2 - 120, 660);
    ctx.lineTo(width / 2 + 120, 660);
    ctx.stroke();

    // Inscription Quote
    ctx.fillStyle = 'rgba(245, 241, 234, 0.9)';
    ctx.font = 'italic 34px "Cormorant Garamond", Georgia, serif';
    const quoteWords = journey.quote.split(' ');
    let line = '';
    let y = 880;
    for (let n = 0; n < quoteWords.length; n++) {
      const testLine = line + quoteWords[n] + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > width - 240 && n > 0) {
        ctx.fillText(`“${line.trim()}”`, width / 2, y);
        line = quoteWords[n] + ' ';
        y += 50;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(`“${line.trim()}”`, width / 2, y);

    // Footer
    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.font = '300 22px -apple-system, sans-serif';
    ctx.fillText('A place to remember when something began.', width / 2, 1220);

    // Download PNG
    const link = document.createElement('a');
    link.download = `${journey.title.toLowerCase().replace(/\s+/g, '-')}-journey-card.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    setIsGeneratingCard(false);
  };

  return (
    <div
      id="share-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md animate-in fade-in duration-300"
    >
      <div
        className="relative w-full max-w-xl flex flex-col rounded-2xl overflow-hidden shadow-2xl border"
        style={{
          backgroundColor: '#0c0e14',
          borderColor: 'rgba(255, 255, 255, 0.1)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
          <div>
            <span className="text-xs uppercase tracking-[0.25em] text-white/40 font-medium">
              Share My Journey
            </span>
            <h2 className="text-xl sm:text-2xl font-cinzel text-white">Honor the Passage of Time</h2>
          </div>
          <button
            id="close-share-modal-btn"
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-white/40 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Visual Mini Card Preview */}
          <div
            className="p-5 rounded-xl border text-center relative overflow-hidden"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              borderColor: 'rgba(255, 255, 255, 0.12)',
            }}
          >
            <span className="text-[10px] uppercase tracking-[0.25em] text-white/40 font-manrope font-medium">
              THE JOURNEY
            </span>
            <h3 className="text-xl font-playfair text-[#F5F1EA] mt-1 font-medium">{journey.title}</h3>
            <p className="text-xs text-white/50 italic font-cormorant">
              Since {formatDisplayDate(journey.startDate)}
            </p>

            <div className="my-4 flex items-center justify-center gap-3">
              <div>
                <div
                  className="text-2xl sm:text-3xl font-manrope font-medium"
                  style={{ color: theme.accentColor }}
                >
                  {time.years}
                </div>
                <div className="text-[9px] text-white/40 font-manrope uppercase tracking-[0.2em] mt-0.5">
                  Years
                </div>
              </div>
              <span className="text-white/20 text-base">·</span>
              <div>
                <div
                  className="text-2xl sm:text-3xl font-manrope font-medium"
                  style={{ color: theme.accentColor }}
                >
                  {time.months}
                </div>
                <div className="text-[9px] text-white/40 font-manrope uppercase tracking-[0.2em] mt-0.5">
                  Months
                </div>
              </div>
              <span className="text-white/20 text-base">·</span>
              <div>
                <div
                  className="text-2xl sm:text-3xl font-manrope font-medium"
                  style={{ color: theme.accentColor }}
                >
                  {time.days}
                </div>
                <div className="text-[9px] text-white/40 font-manrope uppercase tracking-[0.2em] mt-0.5">
                  Days
                </div>
              </div>
            </div>

            <p className="text-xs text-[#EAE5DC]/80 font-cormorant italic max-w-md mx-auto line-clamp-2">
              “{journey.quote}”
            </p>
          </div>

          {/* Action Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Download High-Res Card */}
            <button
              id="download-share-card-btn"
              type="button"
              onClick={handleDownloadCard}
              disabled={isGeneratingCard}
              className="flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl border border-white/20 bg-white/10 hover:bg-white/15 text-white text-xs font-semibold shadow-sm transition-all hover:scale-[1.02] active:scale-98"
            >
              <Download className="w-4 h-4 stroke-[2.5]" />
              <span>{isGeneratingCard ? 'Rendering...' : 'Download Visual Card (PNG)'}</span>
            </button>

            {/* Native Share / Copy Link */}
            <button
              id="native-share-btn"
              type="button"
              onClick={handleNativeShare}
              className="flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl text-xs font-semibold shadow-md transition-all hover:scale-[1.02] active:scale-98"
              style={{
                backgroundColor: theme.accentColor,
                color: theme.accentContrastText,
              }}
            >
              <Share2 className="w-4 h-4 stroke-[2.5]" />
              <span>Share Journey</span>
            </button>

            {/* Copy Encoded Link */}
            <button
              id="copy-link-btn"
              type="button"
              onClick={handleCopyLink}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-white/20 bg-black/50 hover:bg-white/10 text-white text-xs font-medium transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400 stroke-[2.5]" /> : <Copy className="w-4 h-4 stroke-[2.5]" />}
              <span>{copied ? 'Link Copied!' : 'Copy Shareable Link'}</span>
            </button>

            {/* Toggle QR Code */}
            <button
              id="toggle-qr-btn"
              type="button"
              onClick={() => setShowQr(!showQr)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-white/20 bg-black/50 hover:bg-white/10 text-white text-xs font-medium transition-colors"
            >
              <QrIcon className="w-4 h-4 stroke-[2.5]" />
              <span>{showQr ? 'Hide QR Code' : 'Display QR Code'}</span>
            </button>
          </div>

          {/* QR Code Reveal */}
          {showQr && qrDataUrl && (
            <div className="p-4 rounded-xl bg-black/50 border border-white/15 flex flex-col items-center justify-center animate-in fade-in duration-200">
              <img src={qrDataUrl} alt="Journey QR Code" className="w-48 h-48 rounded-lg shadow-lg border border-white/20" />
              <p className="text-[11px] text-white/50 text-center mt-3 max-w-xs">
                Scan with any phone camera to view this exact journey. All parameters are self-contained in the link.
              </p>
            </div>
          )}

          {/* Privacy Note */}
          <div className="pt-2 text-[11px] text-white/40 flex items-center justify-between border-t border-white/10">
            <span>🔒 Privacy-First: No cloud tracking or accounts required.</span>
            <button
              type="button"
              onClick={handleCopySummary}
              className="text-white/60 hover:text-white underline transition-colors"
            >
              {copiedSummary ? 'Summary Copied!' : 'Copy Text Summary'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
