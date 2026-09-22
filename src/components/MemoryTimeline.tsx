import React, { useState } from 'react';
import { Memory } from '../types';
import { ThemeConfig } from '../styles/themes';
import { formatDisplayDate } from '../utils/dateCalculations';
import { Plus, Trash2, Calendar, MapPin, Tag, Image as ImageIcon, X } from 'lucide-react';

interface MemoryTimelineProps {
  memories: Memory[];
  theme: ThemeConfig;
  journeyStartDate: string;
  onAddMemory: (memory: Omit<Memory, 'id' | 'journeyId' | 'createdAt'>) => Promise<void>;
  onDeleteMemory: (id: string) => Promise<void>;
  isOpen: boolean;
  onClose: () => void;
}

export const MemoryTimeline: React.FC<MemoryTimelineProps> = ({
  memories,
  theme,
  journeyStartDate,
  onAddMemory,
  onDeleteMemory,
  isOpen,
  onClose,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  // Form fields
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [symbol, setSymbol] = useState('✦');
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoName, setPhotoName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (JPEG, PNG, WebP).');
      return;
    }

    setPhotoName(file.name);

    // Compress client-side via canvas
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 1200;
        let w = img.width;
        let h = img.height;

        if (w > MAX_WIDTH || h > MAX_HEIGHT) {
          if (w > h) {
            h = Math.round((h * MAX_WIDTH) / w);
            w = MAX_WIDTH;
          } else {
            w = Math.round((w * MAX_HEIGHT) / h);
            h = MAX_HEIGHT;
          }
        }

        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, w, h);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setPhotoUrl(dataUrl);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date) return;

    setIsSaving(true);
    try {
      const tags = tagInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      await onAddMemory({
        title: title.trim(),
        date: new Date(date).toISOString(),
        description: description.trim(),
        location: location.trim() || undefined,
        tags: tags.length > 0 ? tags : undefined,
        symbol,
        photoUrl: photoUrl || undefined,
        photoName: photoName || undefined,
      });

      // Reset form
      setTitle('');
      setDescription('');
      setLocation('');
      setTagInput('');
      setPhotoUrl(null);
      setPhotoName('');
      setIsAdding(false);
    } catch (err) {
      console.error('Failed to save memory:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      id="memory-timeline-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md animate-in fade-in duration-300"
    >
      <div
        className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl overflow-hidden shadow-2xl border"
        style={{
          backgroundColor: '#0c0e14',
          borderColor: 'rgba(255, 255, 255, 0.1)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
          <div>
            <span className="text-xs uppercase tracking-[0.25em] text-white/40 font-medium">
              Time Capsule
            </span>
            <h2 className="text-xl sm:text-2xl font-cinzel text-white">The Memory Timeline</h2>
          </div>
          <div className="flex items-center gap-3">
            {!isAdding && (
              <button
                id="open-add-memory-btn"
                type="button"
                onClick={() => setIsAdding(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold shadow-md transition-all hover:scale-105 active:scale-95"
                style={{
                  backgroundColor: theme.accentColor,
                  color: theme.accentContrastText,
                }}
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Add Memory</span>
              </button>
            )}
            <button
              id="close-memory-timeline-btn"
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-6">
          {/* Add Memory Form */}
          {isAdding && (
            <form
              onSubmit={handleSubmit}
              className="p-5 rounded-xl border border-white/15 bg-white/[0.03] space-y-4 animate-in fade-in duration-200"
            >
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <span className="text-sm font-medium text-white">Record a New Memory</span>
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
                  <label className="block text-[11px] text-white/50 mb-1">Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. The Night Under The Stars"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/15 text-sm text-white focus:outline-none focus:border-white/40"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-white/70 font-medium mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/20 text-sm text-white focus:outline-none focus:border-white/50 [color-scheme:dark]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-white/70 font-medium mb-1">Description / Thought</label>
                <textarea
                  rows={3}
                  placeholder="What happened in this moment? What did it feel like?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/20 text-sm text-white focus:outline-none focus:border-white/50 resize-none placeholder:text-white/30"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-white/70 font-medium mb-1">Location (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Old Town Promenade"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/20 text-sm text-white focus:outline-none focus:border-white/50 placeholder:text-white/30"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-white/70 font-medium mb-1">Tags (Comma separated)</label>
                  <input
                    type="text"
                    placeholder="e.g. Travel, First, Horizon"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/20 text-sm text-white focus:outline-none focus:border-white/50 placeholder:text-white/30"
                  />
                </div>
              </div>

              {/* Photo Upload & Preview */}
              <div>
                <label className="block text-[11px] text-white/50 mb-1">Attach Photo (Stored locally in IndexedDB)</label>
                <div className="flex items-center gap-4">
                  <label className="cursor-pointer flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-white/25 hover:border-white/50 bg-black/20 text-xs text-white/70 transition-colors">
                    <ImageIcon className="w-4 h-4 text-white/50" />
                    <span>{photoName ? 'Change Photo' : 'Select Photo'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handlePhotoUpload}
                    />
                  </label>
                  {photoUrl && (
                    <div className="relative group w-12 h-12 rounded-lg overflow-hidden border border-white/20">
                      <img src={photoUrl} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => {
                          setPhotoUrl(null);
                          setPhotoName('');
                        }}
                        className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Symbol picker */}
              <div>
                <label className="block text-[11px] text-white/50 mb-1">Timeline Symbol</label>
                <div className="flex gap-2">
                  {['✦', '♥', '◈', '★', '🌱', '🕊️'].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSymbol(s)}
                      className={`w-8 h-8 rounded-md flex items-center justify-center text-sm transition-all ${
                        symbol === s
                          ? 'bg-white/20 border border-white/40 scale-110'
                          : 'bg-black/30 border border-white/10 hover:bg-white/10'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-4 py-2 rounded-lg text-xs font-medium text-white/70 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  id="save-memory-btn"
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-lg text-xs font-semibold shadow-md transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                  style={{
                    backgroundColor: theme.accentColor,
                    color: theme.accentContrastText,
                  }}
                >
                  {isSaving ? 'Saving...' : 'Keep This Moment'}
                </button>
              </div>
            </form>
          )}

          {/* Timeline View */}
          {memories.length === 0 ? (
            /* Empty State */
            <div className="text-center py-12 px-4 space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-white/5 flex items-center justify-center text-white/30 text-xl font-cinzel">
                ✦
              </div>
              <h3 className="text-lg font-cinzel text-white">Every journey has a first memory.</h3>
              <p className="text-xs text-white/60 max-w-sm mx-auto">
                Add one when you're ready. Your memories live safely on your device in your own space.
              </p>
              <button
                id="add-first-memory-btn"
                type="button"
                onClick={() => setIsAdding(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 mt-2 rounded-full text-xs font-semibold shadow-md transition-transform hover:scale-105 active:scale-95"
                style={{
                  backgroundColor: theme.accentColor,
                  color: theme.accentContrastText,
                }}
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Add Your First Memory</span>
              </button>
            </div>
          ) : (
            <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-2.5 sm:before:left-3.5 before:top-3 before:bottom-3 before:w-[1px] before:bg-white/15">
              {memories.map((mem) => (
                <div key={mem.id} className="relative group">
                  {/* Timeline marker icon */}
                  <div
                    className="absolute -left-6 sm:-left-8 top-1 w-6 h-6 rounded-full flex items-center justify-center text-xs backdrop-blur-sm border shadow-sm transition-transform group-hover:scale-125"
                    style={{
                      backgroundColor: '#0c0e14',
                      borderColor: theme.accentColor,
                      color: theme.accentColor,
                    }}
                  >
                    {mem.symbol || '●'}
                  </div>

                  {/* Memory Card */}
                  <div className="p-4 sm:p-5 rounded-xl bg-white/[0.03] border border-white/10 hover:border-white/20 transition-all duration-300">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 text-[11px] text-white/40 mb-1">
                          <Calendar className="w-3 h-3" />
                          <span>{formatDisplayDate(mem.date)}</span>
                          {mem.location && (
                            <>
                              <span>•</span>
                              <MapPin className="w-3 h-3" />
                              <span>{mem.location}</span>
                            </>
                          )}
                        </div>
                        <h4 className="text-base sm:text-lg font-cinzel text-white group-hover:text-white transition-colors">
                          {mem.title}
                        </h4>
                      </div>

                      <button
                        type="button"
                        title="Delete memory"
                        onClick={() => onDeleteMemory(mem.id)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {mem.description && (
                      <p className="mt-2 text-xs sm:text-sm text-white/70 font-light leading-relaxed">
                        {mem.description}
                      </p>
                    )}

                    {/* Photo attachment */}
                    {mem.photoUrl && (
                      <div className="mt-3">
                        <img
                          src={mem.photoUrl}
                          alt={mem.title}
                          onClick={() => setSelectedPhoto(mem.photoUrl || null)}
                          className="max-h-60 rounded-lg object-cover border border-white/15 cursor-pointer hover:opacity-90 transition-opacity"
                        />
                      </div>
                    )}

                    {/* Tags */}
                    {mem.tags && mem.tags.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {mem.tags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-white/5 text-white/50 border border-white/5"
                          >
                            <Tag className="w-2.5 h-2.5" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Photo Lightbox */}
        {selectedPhoto && (
          <div
            className="fixed inset-0 z-60 bg-black/90 flex items-center justify-center p-4"
            onClick={() => setSelectedPhoto(null)}
          >
            <div className="relative max-w-4xl max-h-[90vh]">
              <img src={selectedPhoto} alt="Full view" className="max-w-full max-h-[85vh] rounded-lg object-contain" />
              <button
                type="button"
                onClick={() => setSelectedPhoto(null)}
                className="absolute top-2 right-2 p-2 rounded-full bg-black/60 text-white hover:bg-black/90"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
