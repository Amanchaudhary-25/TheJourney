import React, { useState } from 'react';
import { Journey, JourneyMode, JourneyTheme, StorageProviderType } from '../types';
import { THEMES, ThemeConfig } from '../styles/themes';
import { validateJourneyDates } from '../utils/dateCalculations';
import { CLOUD_PROVIDERS } from '../services/storage/CloudStorageAdapters';
import { Check, ChevronRight, ChevronLeft, Calendar, Sparkles, HardDrive, ShieldCheck, X } from 'lucide-react';

interface CustomizeJourneyModalProps {
  journey: Journey;
  currentTheme: ThemeConfig;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedJourney: Journey) => Promise<void>;
}

export const CustomizeJourneyModal: React.FC<CustomizeJourneyModalProps> = ({
  journey,
  currentTheme,
  isOpen,
  onClose,
  onSave,
}) => {
  const [step, setStep] = useState(1);

  // Form State
  const [mode, setMode] = useState<JourneyMode>(journey.mode);
  const [startDate, setStartDate] = useState(journey.startDate.slice(0, 10));
  const [startTime, setStartTime] = useState(journey.startDate.slice(11, 16) || '00:00');
  const [hasStartTime, setHasStartTime] = useState(journey.hasStartTime || false);
  const [endDate, setEndDate] = useState(journey.endDate ? journey.endDate.slice(0, 10) : '');
  const [title, setTitle] = useState(journey.title);
  const [description, setDescription] = useState(journey.description || '');
  const [quote, setQuote] = useState(journey.quote || '');
  const [selectedTheme, setSelectedTheme] = useState<JourneyTheme>(journey.theme);
  const [selectedStorage, setSelectedStorage] = useState<StorageProviderType>('indexeddb');
  const [validationError, setValidationError] = useState<string | null>(null);

  // Active theme based on the current selection in Step 5 or fallback to journey theme
  const activeTheme: ThemeConfig = THEMES[selectedTheme] || currentTheme;

  if (!isOpen) return null;

  const handleNext = () => {
    setValidationError(null);

    // Validate Step 1
    if (step === 1) {
      let isoStart = `${startDate}T${hasStartTime ? startTime : '00:00'}:00.000Z`;
      let isoEnd = endDate ? `${endDate}T00:00:00.000Z` : null;

      const val = validateJourneyDates(mode, isoStart, isoEnd);
      if (!val.valid) {
        setValidationError(val.error || 'Invalid dates.');
        return;
      }
    }

    if (step < 6) {
      setStep(step + 1);
    } else {
      handleFinalSave();
    }
  };

  const handleFinalSave = async () => {
    let isoStart = `${startDate}T${hasStartTime ? startTime : '00:00'}:00.000Z`;
    let isoEnd = mode === 'between' && endDate ? `${endDate}T00:00:00.000Z` : null;

    const updated: Journey = {
      ...journey,
      title: title.trim() || 'The Journey',
      mode,
      startDate: isoStart,
      endDate: isoEnd,
      hasStartTime,
      description: description.trim(),
      quote: quote.trim() || 'We together fulfill our dreams, promises and what we have thought of.',
      theme: selectedTheme,
      updatedAt: new Date().toISOString(),
    };

    await onSave(updated);
    onClose();
  };

  const titleSuggestions = [
    'The Journey',
    'Our Journey',
    'The Day It Began',
    'Dream Started',
    'College Journey',
    'Startup Genesis',
    'Sobriety & Strength',
    'Fitness Transformation',
  ];

  return (
    <div
      id="customize-journey-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-300"
    >
      <div
        className="relative w-full max-w-2xl max-h-[92vh] sm:max-h-[85vh] flex flex-col rounded-2xl overflow-hidden shadow-2xl border"
        style={{
          backgroundColor: '#0b0d13',
          borderColor: 'rgba(255, 255, 255, 0.12)',
        }}
      >
        {/* Step Progress Bar */}
        <div className="w-full bg-white/5 h-1">
          <div
            className="h-full transition-all duration-300"
            style={{
              width: `${(step / 6) * 100}%`,
              backgroundColor: activeTheme.accentColor,
            }}
          />
        </div>

        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span
              className="text-xs font-mono font-medium px-2.5 py-1 rounded-full border"
              style={{
                backgroundColor: `${activeTheme.accentColor}25`,
                color: activeTheme.accentColor === '#E4E4E7' ? '#FFFFFF' : activeTheme.accentColor,
                borderColor: `${activeTheme.accentColor}50`,
              }}
            >
              Step {step} of 6
            </span>
            <span className="text-xs text-white/60 uppercase tracking-wider font-medium">Shape Your Journey</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Body */}
        <div className="p-5 sm:p-8 flex-1 flex flex-col justify-between overflow-hidden">
          {validationError && (
            <div className="mb-3 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-300 shrink-0">
              {validationError}
            </div>
          )}

          {/* Scrollable Step Content Container */}
          <div className="flex-1 overflow-y-auto pr-1 sm:pr-1.5 no-scrollbar mb-3 space-y-4">

          {/* STEP 1: What moment are you remembering? */}
          {step === 1 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div>
                <span className="text-xs text-white/40 uppercase tracking-widest font-medium">Moment in Time</span>
                <h3 className="text-2xl font-cinzel text-white mt-1">What moment are you remembering?</h3>
                <p className="text-xs text-white/50 mt-1">Choose the date and whether time counts forward, toward, or between.</p>
              </div>

              {/* Mode Tabs */}
              <div className="grid grid-cols-3 gap-2 p-1 rounded-xl bg-black/50 border border-white/15">
                {(['since', 'until', 'between'] as JourneyMode[]).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => {
                      setMode(m);
                      setValidationError(null);
                    }}
                    className={`py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                      mode === m
                        ? 'bg-white/25 text-white shadow-sm border border-white/30'
                        : 'text-white/60 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {m === 'since' ? 'Since' : m === 'until' ? 'Until' : 'Between'}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-white/80 font-medium mb-1">
                    {mode === 'until' ? 'Target Future Date' : 'Starting Date'}
                  </label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/20 text-sm text-white focus:outline-none focus:border-white/50 [color-scheme:dark]"
                  />
                </div>

                {mode === 'between' && (
                  <div>
                    <label className="block text-xs text-white/80 font-medium mb-1">Ending Date</label>
                    <input
                      type="date"
                      required
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/20 text-sm text-white focus:outline-none focus:border-white/50 [color-scheme:dark]"
                    />
                  </div>
                )}
              </div>

              {/* Optional exact time */}
              <div className="pt-2 border-t border-white/10">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-white/80 font-medium">
                  <input
                    type="checkbox"
                    checked={hasStartTime}
                    onChange={(e) => setHasStartTime(e.target.checked)}
                    className="rounded bg-black/50 border-white/30 text-white focus:ring-0"
                  />
                  <span>Record exact time of day (hours & minutes)</span>
                </label>

                {hasStartTime && (
                  <div className="mt-3 max-w-xs">
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="px-3.5 py-2 rounded-xl bg-black/50 border border-white/20 text-sm text-white focus:outline-none focus:border-white/50 [color-scheme:dark]"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 2: What should we call this journey? */}
          {step === 2 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div>
                <span className="text-xs text-white/50 uppercase tracking-widest font-medium">Naming</span>
                <h3 className="text-2xl font-cinzel text-white mt-1">What should we call this journey?</h3>
                <p className="text-xs text-white/60 mt-1">Every chapter deserves an evocative name.</p>
              </div>

              <div>
                <input
                  type="text"
                  placeholder="The Journey"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/25 text-lg font-cinzel text-white focus:outline-none focus:border-white/60 placeholder:text-white/30"
                />
              </div>

              <div>
                <span className="text-xs text-white/60 font-medium block mb-2">Suggestions:</span>
                <div className="flex flex-wrap gap-2">
                  {titleSuggestions.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setTitle(s)}
                      className="px-3 py-1.5 rounded-full text-xs font-medium bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all active:scale-95"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Why does this moment matter? */}
          {step === 3 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div>
                <span className="text-xs text-white/50 uppercase tracking-widest font-medium">Origin Story</span>
                <h3 className="text-2xl font-cinzel text-white mt-1">Why does this moment matter?</h3>
                <p className="text-xs text-white/60 mt-1">An optional brief sentence that grounds the timer in memory.</p>
              </div>

              <div>
                <textarea
                  rows={4}
                  placeholder="The day everything began."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/25 text-sm text-white focus:outline-none focus:border-white/60 resize-none placeholder:text-white/30"
                />
              </div>
            </div>
          )}

          {/* STEP 4: What would you like it to say? */}
          {step === 4 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div>
                <span className="text-xs text-white/50 uppercase tracking-widest font-medium">Inscription</span>
                <h3 className="text-2xl font-cinzel text-white mt-1">What would you like it to say?</h3>
                <p className="text-xs text-white/60 mt-1">A guiding quote, promise, or personal motto displayed beneath the time.</p>
              </div>

              <div>
                <textarea
                  rows={4}
                  placeholder="We together fulfill our dreams, promises and what we have thought of."
                  value={quote}
                  onChange={(e) => setQuote(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/25 font-editorial italic text-lg text-white focus:outline-none focus:border-white/60 resize-none leading-relaxed placeholder:text-white/30"
                />
              </div>
            </div>
          )}

          {/* STEP 5: Choose your atmosphere */}
          {step === 5 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div>
                <span className="text-xs text-white/50 uppercase tracking-widest font-medium">Atmosphere</span>
                <h3 className="text-2xl font-cinzel text-white mt-1">Choose your atmosphere</h3>
                <p className="text-xs text-white/60 mt-1">Select a visual theme that reflects the tone of your journey.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.values(THEMES).map((th) => {
                  const isSelected = selectedTheme === th.id;
                  return (
                    <div
                      key={th.id}
                      onClick={() => setSelectedTheme(th.id)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-white/80 ring-2 ring-white/30 bg-white/15 shadow-lg scale-[1.01]'
                          : 'border-white/15 hover:border-white/35 bg-black/35 hover:bg-black/45'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-5 h-5 rounded-full border border-white/30 shadow-sm shrink-0"
                            style={{ background: th.previewBg }}
                          />
                          <h4 className="text-sm font-cinzel text-white font-medium">{th.name}</h4>
                        </div>
                        {isSelected && (
                          <span
                            className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 shadow-sm"
                            style={{
                              backgroundColor: th.accentColor,
                              color: th.accentContrastText,
                            }}
                          >
                            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-white/70 leading-relaxed">{th.tagline}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 6: Where should your memories live? */}
          {step === 6 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div>
                <span className="text-xs text-white/50 uppercase tracking-widest font-medium">Privacy Architecture</span>
                <h3 className="text-2xl font-cinzel text-white mt-1">Where should your memories live?</h3>
                <p className="text-xs text-white/60 mt-1">
                  Bring Your Own Space (BYOS). Your data is private and never uploaded to a centralized server.
                </p>
              </div>

              <div className="space-y-2.5">
                {/* Local Storage Option */}
                <div
                  onClick={() => setSelectedStorage('indexeddb')}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    selectedStorage === 'indexeddb' || selectedStorage === 'browser'
                      ? 'border-white/80 ring-2 ring-white/30 bg-white/15 shadow-lg'
                      : 'border-white/15 hover:border-white/35 bg-black/35'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <HardDrive className="w-4 h-4 text-white/80" />
                      <div>
                        <div className="text-sm font-medium text-white flex items-center gap-2">
                          <span>This Device (Private Local Storage)</span>
                          <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-medium">
                            Recommended
                          </span>
                        </div>
                        <p className="text-xs text-white/60 mt-0.5">
                          Stores journey, photos, and letters inside browser IndexedDB. Zero tracking or cloud accounts required.
                        </p>
                      </div>
                    </div>
                    {(selectedStorage === 'indexeddb' || selectedStorage === 'browser') && (
                      <span
                        className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 shadow-sm"
                        style={{
                          backgroundColor: activeTheme.accentColor,
                          color: activeTheme.accentContrastText,
                        }}
                      >
                        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                      </span>
                    )}
                  </div>
                </div>

                {/* Cloud Providers */}
                {Object.values(CLOUD_PROVIDERS).map((cp) => {
                  const isSelected = selectedStorage === cp.type;
                  return (
                    <div
                      key={cp.type}
                      onClick={() => setSelectedStorage(cp.type)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-white/80 ring-2 ring-white/30 bg-white/15 shadow-lg'
                          : 'border-white/15 hover:border-white/35 bg-black/35'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <ShieldCheck className="w-4 h-4 text-white/80" />
                          <div>
                            <div className="text-sm font-medium text-white">{cp.name}</div>
                            <p className="text-xs text-white/60 mt-0.5">{cp.shortDesc}</p>
                          </div>
                        </div>
                        {isSelected && (
                          <span
                            className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 shadow-sm"
                            style={{
                              backgroundColor: activeTheme.accentColor,
                              color: activeTheme.accentContrastText,
                            }}
                          >
                            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          </div>

          {/* Navigation Controls */}
          <div className="pt-4 sm:pt-5 border-t border-white/10 flex items-center justify-between shrink-0">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>
            ) : (
              <div />
            )}

            <button
              id="onboarding-next-btn"
              type="button"
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-semibold shadow-lg transition-all hover:scale-105 active:scale-95"
              style={{
                backgroundColor: activeTheme.accentColor,
                color: activeTheme.accentContrastText,
              }}
            >
              <span>{step === 6 ? 'Begin the Journey' : 'Continue'}</span>
              <ChevronRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
