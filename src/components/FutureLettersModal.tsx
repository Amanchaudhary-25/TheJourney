import React, { useState } from 'react';
import { FutureLetter } from '../types';
import { ThemeConfig } from '../styles/themes';
import { formatDisplayDate } from '../utils/dateCalculations';
import { Lock, Unlock, Plus, Trash2, X, Send } from 'lucide-react';

interface FutureLettersModalProps {
  letters: FutureLetter[];
  theme: ThemeConfig;
  isOpen: boolean;
  onClose: () => void;
  onAddLetter: (letter: Omit<FutureLetter, 'id' | 'journeyId' | 'createdAt'>) => Promise<void>;
  onDeleteLetter: (id: string) => Promise<void>;
}

export const FutureLettersModal: React.FC<FutureLettersModalProps> = ({
  letters,
  theme,
  isOpen,
  onClose,
  onAddLetter,
  onDeleteLetter,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  // Default to 1 year in the future
  const defaultFutureDate = new Date();
  defaultFutureDate.setFullYear(defaultFutureDate.getFullYear() + 1);
  const [unlockDate, setUnlockDate] = useState(defaultFutureDate.toISOString().slice(0, 10));
  const [isSaving, setIsSaving] = useState(false);
  const [unlockedReadLetter, setUnlockedReadLetter] = useState<FutureLetter | null>(null);

  if (!isOpen) return null;

  const now = new Date();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !unlockDate) return;

    setIsSaving(true);
    try {
      await onAddLetter({
        title: title.trim() || 'A letter to the future',
        message: message.trim(),
        unlockDate: new Date(unlockDate).toISOString(),
      });
      setTitle('');
      setMessage('');
      setIsAdding(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      id="future-letters-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md animate-in fade-in duration-300"
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl overflow-hidden shadow-2xl border"
        style={{
          backgroundColor: '#0c0e14',
          borderColor: 'rgba(255, 255, 255, 0.1)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
          <div>
            <span className="text-xs uppercase tracking-[0.25em] text-white/40 font-medium">
              Digital Time Capsule
            </span>
            <h2 className="text-xl sm:text-2xl font-cinzel text-white">A Letter to the Future</h2>
          </div>
          <div className="flex items-center gap-3">
            {!isAdding && (
              <button
                type="button"
                onClick={() => setIsAdding(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold shadow-md transition-all hover:scale-105 active:scale-95"
                style={{
                  backgroundColor: theme.accentColor,
                  color: theme.accentContrastText,
                }}
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Write Letter</span>
              </button>
            )}
            <button
              id="close-letters-modal-btn"
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-6">
          {/* Add form */}
          {isAdding && (
            <form
              onSubmit={handleCreate}
              className="p-5 rounded-xl border border-white/15 bg-white/[0.03] space-y-4"
            >
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <span className="text-sm font-medium text-white">Seal a Letter for Tomorrow</span>
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="text-xs text-white/40 hover:text-white"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] text-white/70 font-medium mb-1">Subject / Capsule Title</label>
                  <input
                    type="text"
                    placeholder="e.g. To us on our 5th year..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/20 text-sm text-white focus:outline-none focus:border-white/50 placeholder:text-white/30"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-white/70 font-medium mb-1">Unlock Date</label>
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().slice(0, 10)}
                    value={unlockDate}
                    onChange={(e) => setUnlockDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/20 text-sm text-white focus:outline-none focus:border-white/50 [color-scheme:dark]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-white/70 font-medium mb-1">Your Message to the Future</label>
                <textarea
                  rows={5}
                  required
                  placeholder="I hope when we read this years from now, we are still chasing the dreams we talked about today..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/20 text-sm text-white focus:outline-none focus:border-white/50 resize-none font-editorial text-base italic placeholder:text-white/30"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-white/50 flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Sealed until the date arrives
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAdding(false)}
                    className="px-3 py-2 rounded-lg text-xs font-medium text-white/70 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold shadow-md transition-all hover:scale-105 active:scale-95"
                    style={{
                      backgroundColor: theme.accentColor,
                      color: theme.accentContrastText,
                    }}
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Seal Time Capsule</span>
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Letter list */}
          {letters.length === 0 ? (
            <div className="text-center py-10 px-4 space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-white/5 flex items-center justify-center text-white/40">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-cinzel text-white">No letters sealed yet.</h3>
              <p className="text-xs text-white/60 max-w-sm mx-auto">
                Leave a secret message for your future self or partner that remains locked until a milestone date.
              </p>
              <button
                type="button"
                onClick={() => setIsAdding(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 mt-2 rounded-full text-xs font-semibold shadow-md transition-transform hover:scale-105 active:scale-95"
                style={{
                  backgroundColor: theme.accentColor,
                  color: theme.accentContrastText,
                }}
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Write Your First Letter</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {letters.map((lettr) => {
                const target = new Date(lettr.unlockDate);
                const isUnlocked = now.getTime() >= target.getTime();

                return (
                  <div
                    key={lettr.id}
                    className={`p-5 rounded-xl border flex flex-col justify-between transition-all duration-300 ${
                      isUnlocked
                        ? 'bg-white/[0.05] border-white/20'
                        : 'bg-black/30 border-white/10'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div
                          className={`p-2 rounded-full ${
                            isUnlocked ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/5 text-white/40'
                          }`}
                        >
                          {isUnlocked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                        </div>
                        <button
                          type="button"
                          onClick={() => onDeleteLetter(lettr.id)}
                          className="text-white/30 hover:text-red-400 p-1 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <h4 className="text-base font-cinzel text-white mb-1">
                        {lettr.title}
                      </h4>

                      {isUnlocked ? (
                        <p className="text-xs text-emerald-400 mb-2 font-medium">
                          Unlocked on {formatDisplayDate(lettr.unlockDate)}
                        </p>
                      ) : (
                        <p className="text-xs text-white/50 mb-2">
                          Opens on <strong className="text-white/80">{formatDisplayDate(lettr.unlockDate)}</strong>
                        </p>
                      )}
                    </div>

                    <div className="pt-3 border-t border-white/10 mt-3">
                      {isUnlocked ? (
                        <button
                          type="button"
                          onClick={() => setUnlockedReadLetter(lettr)}
                          className="w-full py-2 rounded-lg text-xs font-semibold shadow-md transition-all hover:scale-[1.02] active:scale-98"
                          style={{
                            backgroundColor: theme.accentColor,
                            color: theme.accentContrastText,
                          }}
                        >
                          Read Unlocked Letter
                        </button>
                      ) : (
                        <div className="text-[11px] text-white/40 italic text-center">
                          🔒 Sealed in digital storage
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Read unlocked letter modal */}
        {unlockedReadLetter && (
          <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="relative w-full max-w-lg p-6 sm:p-8 rounded-2xl bg-[#11131a] border border-white/20 shadow-2xl">
              <button
                type="button"
                onClick={() => setUnlockedReadLetter(null)}
                className="absolute top-4 right-4 text-white/40 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <span className="text-[10px] uppercase tracking-widest text-emerald-400">
                Your past self left you something
              </span>
              <h3 className="text-2xl font-cinzel text-white mt-1 mb-4">
                {unlockedReadLetter.title}
              </h3>

              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 my-4 max-h-60 overflow-y-auto no-scrollbar">
                <p className="font-editorial text-lg italic text-white/90 leading-relaxed whitespace-pre-wrap">
                  "{unlockedReadLetter.message}"
                </p>
              </div>

              <div className="text-right text-xs text-white/40">
                Sealed on {formatDisplayDate(unlockedReadLetter.createdAt)}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
