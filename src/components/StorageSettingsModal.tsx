import React, { useState } from 'react';
import { AppSettings, Journey, StorageProviderType } from '../types';
import { ThemeConfig, THEMES } from '../styles/themes';
import { CLOUD_PROVIDERS } from '../services/storage/CloudStorageAdapters';
import { storageService } from '../services/storage/storageService';
import {
  ShieldCheck,
  HardDrive,
  Download,
  Upload,
  Trash2,
  Check,
  Sparkles,
  RefreshCw,
  X,
  FileArchive,
  Info,
} from 'lucide-react';

interface StorageSettingsModalProps {
  journey: Journey;
  settings: AppSettings;
  theme: ThemeConfig;
  isOpen: boolean;
  onClose: () => void;
  onUpdateSettings: (newSettings: AppSettings) => Promise<void>;
  onThemeChange: (themeId: any) => Promise<void>;
  onDataRestored: () => Promise<void>;
}

export const StorageSettingsModal: React.FC<StorageSettingsModalProps> = ({
  journey,
  settings,
  theme,
  isOpen,
  onClose,
  onUpdateSettings,
  onThemeChange,
  onDataRestored,
}) => {
  const [activeTab, setActiveTab] = useState<'storage' | 'appearance' | 'privacy' | 'about'>('storage');
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!isOpen) return null;

  // Export ZIP Archive
  const handleExportZip = async () => {
    setIsExporting(true);
    try {
      const zipBlob = await storageService.exportZipBackup(journey.id);
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `The-Journey-Backup-${new Date().toISOString().slice(0, 10)}.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export error:', err);
      alert('Failed to generate ZIP export.');
    } finally {
      setIsExporting(false);
    }
  };

  // Export JSON Single file
  const handleExportJson = async () => {
    setIsExporting(true);
    try {
      const jsonStr = await storageService.exportJsonBackup(journey.id);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `The-Journey-Data-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('JSON export error:', err);
    } finally {
      setIsExporting(false);
    }
  };

  // Import JSON or ZIP file
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportStatus('Verifying backup manifest...');

    try {
      if (file.name.endsWith('.zip')) {
        await storageService.importFromZip(file);
      } else {
        const text = await file.text();
        const parsed = JSON.parse(text);
        await storageService.importBackupData(parsed);
      }
      setImportStatus('Backup restored successfully!');
      setTimeout(async () => {
        await onDataRestored();
        onClose();
      }, 800);
    } catch (err: any) {
      console.error('Import error:', err);
      setImportStatus(`Failed to import: ${err.message || 'Corrupted file'}`);
    } finally {
      setIsImporting(false);
    }
  };

  // Clear & Reset All Local Data
  const handleResetData = async () => {
    await storageService.resetAllLocalData();
    setShowDeleteConfirm(false);
    await onDataRestored();
    onClose();
  };

  return (
    <div
      id="storage-settings-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-300"
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl overflow-hidden shadow-2xl border"
        style={{
          backgroundColor: '#0c0e14',
          borderColor: 'rgba(255, 255, 255, 0.12)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div>
            <span className="text-[10px] uppercase tracking-[0.25em] text-white/40 font-medium">
              Data Sovereignty
            </span>
            <h2 className="text-xl font-cinzel text-white">Shape Your Space & Storage</h2>
          </div>
          <button
            id="close-storage-modal-btn"
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-white/40 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-white/10 px-6 bg-white/[0.02] overflow-x-auto no-scrollbar">
          {(
            [
              { key: 'storage', label: 'Storage & Backup' },
              { key: 'appearance', label: 'Atmosphere' },
              { key: 'privacy', label: 'Privacy Promise' },
              { key: 'about', label: 'Philosophy' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`py-3 px-4 text-xs whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-white text-white font-semibold'
                  : 'border-transparent text-white/60 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-6">
          {/* TAB 1: Storage & Backup */}
          {activeTab === 'storage' && (
            <div className="space-y-6">
              {/* Storage Status */}
              <div className="p-4 rounded-xl border border-white/10 bg-white/[0.02] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <HardDrive className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white flex items-center gap-2">
                      <span>Saved locally in browser storage</span>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full">
                        Active
                      </span>
                    </div>
                    <span className="text-xs text-white/40">
                      IndexedDB · 100% offline-ready · Zero cloud dependence
                    </span>
                  </div>
                </div>
              </div>

              {/* Bring Your Own Space (BYOS) */}
              <div>
                <span className="text-xs font-medium text-white/70 uppercase tracking-wider block mb-2">
                  Bring Your Own Space (BYOS)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {Object.values(CLOUD_PROVIDERS).map((cp) => (
                    <div
                      key={cp.type}
                      className="p-3.5 rounded-xl border border-white/10 bg-black/30 hover:border-white/20 transition-all flex flex-col justify-between"
                    >
                      <div>
                        <span className="text-sm font-medium text-white block mb-1">
                          {cp.name}
                        </span>
                        <p className="text-[11px] text-white/50 leading-relaxed mb-2">
                          {cp.shortDesc}
                        </p>
                      </div>
                      <div className="pt-2 border-t border-white/5 text-[10px] text-white/40">
                        {cp.scope}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Portable Backup: Export & Import */}
              <div className="p-5 rounded-xl border border-white/15 bg-white/[0.02] space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-white">Own & Move Your Data</h4>
                  <p className="text-xs text-white/50 mt-0.5">
                    Export a full self-contained package with all memories, milestones, and high-res photos.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    id="export-zip-btn"
                    type="button"
                    onClick={handleExportZip}
                    disabled={isExporting}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold shadow-md transition-transform hover:scale-105 active:scale-95"
                    style={{
                      backgroundColor: theme.accentColor,
                      color: theme.accentContrastText,
                    }}
                  >
                    <FileArchive className="w-4 h-4 stroke-[2.5]" />
                    <span>{isExporting ? 'Packaging...' : 'Export Complete Backup (ZIP)'}</span>
                  </button>

                  <button
                    id="export-json-btn"
                    type="button"
                    onClick={handleExportJson}
                    disabled={isExporting}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/20 bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition-colors"
                  >
                    <Download className="w-4 h-4 stroke-[2.5]" />
                    <span>Export JSON</span>
                  </button>

                  <label className="cursor-pointer flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-white/30 hover:border-white/60 bg-black/40 hover:bg-black/60 text-xs font-medium text-white transition-colors">
                    <Upload className="w-4 h-4 text-white/80 stroke-[2.5]" />
                    <span>{isImporting ? 'Importing...' : 'Restore From Backup (ZIP or JSON)'}</span>
                    <input
                      type="file"
                      accept=".zip,.json"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                  </label>
                </div>

                {importStatus && (
                  <div className="text-xs text-emerald-400 flex items-center gap-1.5 animate-in fade-in">
                    <Check className="w-3.5 h-3.5" />
                    <span>{importStatus}</span>
                  </div>
                )}
              </div>

              {/* Danger Zone: Delete Local Data */}
              <div className="pt-4 border-t border-white/10">
                {!showDeleteConfirm ? (
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="flex items-center gap-2 text-xs text-red-400/80 hover:text-red-300 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete My Local Data & Return to the Beginning</span>
                  </button>
                ) : (
                  <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 space-y-3">
                    <p className="text-xs text-red-300">
                      Are you sure? This will remove all local memories and reset to the original default journey.
                    </p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleResetData}
                        className="px-3 py-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white text-xs font-medium"
                      >
                        Yes, Delete Everything
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowDeleteConfirm(false)}
                        className="px-3 py-1.5 rounded-lg bg-white/10 text-white/70 hover:text-white text-xs"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: Atmosphere & Appearance */}
          {activeTab === 'appearance' && (
            <div className="space-y-6">
              <div>
                <span className="text-xs font-medium text-white/70 uppercase tracking-wider block mb-2">
                  Theme Palette
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Object.values(THEMES).map((th) => {
                    const isSelected = journey.theme === th.id;
                    return (
                      <div
                        key={th.id}
                        onClick={() => onThemeChange(th.id)}
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

              {/* Atmospheric Elements */}
              <div className="space-y-3 pt-4 border-t border-white/10">
                <span className="text-xs font-medium text-white/70 uppercase tracking-wider block mb-1">
                  Atmospheric Elements
                </span>

                {/* Cosmic Ambient Dust & Particles Toggle */}
                <label className={`flex items-center justify-between cursor-pointer p-4 rounded-xl border transition-all duration-300 ${
                  settings.ambientParticles
                    ? 'bg-white/[0.05] border-white/30 shadow-lg'
                    : 'bg-white/[0.01] border-white/10 opacity-75 hover:opacity-100 hover:border-white/20'
                }`}>
                  <div className="pr-4 select-none">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-white font-medium block">Cosmic Ambient Dust & Particles</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-medium ${
                        settings.ambientParticles
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-white/10 text-white/40'
                      }`}>
                        {settings.ambientParticles ? 'Active' : 'Off'}
                      </span>
                    </div>
                    <span className="text-xs text-white/45 block mt-0.5">
                      Subtle floating stardust and particles drifting in the background canvas
                    </span>
                  </div>

                  <div className="relative inline-flex items-center shrink-0">
                    <input
                      type="checkbox"
                      id="toggle-ambient-particles"
                      checked={settings.ambientParticles}
                      onChange={(e) =>
                        onUpdateSettings({ ...settings, ambientParticles: e.target.checked })
                      }
                      className="sr-only peer"
                    />
                    <div className={`w-11 h-6 rounded-full transition-colors duration-300 relative border ${
                      settings.ambientParticles
                        ? 'bg-emerald-500 border-emerald-400/80 shadow-[0_0_12px_rgba(16,185,129,0.35)]'
                        : 'bg-white/10 border-white/20'
                    }`}>
                      <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-300 absolute top-[1px] ${
                        settings.ambientParticles ? 'left-[21px]' : 'left-[1px]'
                      }`} />
                    </div>
                  </div>
                </label>

                {/* Desktop Cursor Aurora Glow Toggle */}
                <label className={`flex items-center justify-between cursor-pointer p-4 rounded-xl border transition-all duration-300 ${
                  settings.cursorGlow
                    ? 'bg-white/[0.05] border-white/30 shadow-lg'
                    : 'bg-white/[0.01] border-white/10 opacity-75 hover:opacity-100 hover:border-white/20'
                }`}>
                  <div className="pr-4 select-none">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-white font-medium block">Desktop Cursor Aurora Glow</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-medium ${
                        settings.cursorGlow
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-white/10 text-white/40'
                      }`}>
                        {settings.cursorGlow ? 'Active' : 'Off'}
                      </span>
                    </div>
                    <span className="text-xs text-white/45 block mt-0.5">
                      Warm atmospheric radial illumination smoothly tracking pointer motion
                    </span>
                  </div>

                  <div className="relative inline-flex items-center shrink-0">
                    <input
                      type="checkbox"
                      id="toggle-cursor-glow"
                      checked={settings.cursorGlow}
                      onChange={(e) =>
                        onUpdateSettings({ ...settings, cursorGlow: e.target.checked })
                      }
                      className="sr-only peer"
                    />
                    <div className={`w-11 h-6 rounded-full transition-colors duration-300 relative border ${
                      settings.cursorGlow
                        ? 'bg-emerald-500 border-emerald-400/80 shadow-[0_0_12px_rgba(16,185,129,0.35)]'
                        : 'bg-white/10 border-white/20'
                    }`}>
                      <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-300 absolute top-[1px] ${
                        settings.cursorGlow ? 'left-[21px]' : 'left-[1px]'
                      }`} />
                    </div>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* TAB 3: Privacy Promise */}
          {activeTab === 'privacy' && (
            <div className="space-y-5">
              <div className="p-5 rounded-xl border border-white/15 bg-white/[0.02] space-y-3">
                <div className="flex items-center gap-2 text-white">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <h4 className="text-lg font-cinzel">Your memories. Your storage. Your control.</h4>
                </div>
                <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
                  The Journey operates on a strict **Bring Your Own Space (BYOS)** architecture.
                  The application runs completely inside your browser using IndexedDB. No accounts, emails, or phone numbers are ever required.
                </p>
                <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
                  When you optionally connect cloud storage, authentication occurs directly with the provider (Google, Microsoft, or Dropbox). We never store your tokens, passwords, or personal photos on any intermediary company database.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-white/60">
                <div className="p-3.5 rounded-xl bg-black/30 border border-white/10">
                  <strong className="text-white block mb-1">Zero Tracking & Ads</strong>
                  No promotional trackers, tracking pixels, or third-party behavioral scripts.
                </div>
                <div className="p-3.5 rounded-xl bg-black/30 border border-white/10">
                  <strong className="text-white block mb-1">Total Portability</strong>
                  Export anytime as open JSON or ZIP archive with all photos included.
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: About & Philosophy */}
          {activeTab === 'about' && (
            <div className="space-y-4 text-center py-6">
              <span className="text-xs uppercase tracking-[0.3em] text-white/40">The Journey</span>
              <h3 className="text-2xl font-cinzel text-white">A place to remember when something began.</h3>
              <p className="font-editorial text-lg italic text-white/75 max-w-md mx-auto leading-relaxed">
                “Time passes. Memories stay. We create the experience. You own the memories.”
              </p>

              <div className="pt-6 text-xs text-white/40">
                Version 1.0.0 · Progressive Web App · Client-Side Architecture
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
