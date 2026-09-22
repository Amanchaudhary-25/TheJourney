import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Journey, Memory, Milestone, FutureLetter, AppSettings, ElapsedTime, DEFAULT_ATMOSPHERE, JourneyTheme } from './types';
import { THEMES, ThemeConfig } from './styles/themes';
import { calculateElapsedTime, calculateMilestoneProgress, MilestoneProgress } from './utils/dateCalculations';
import { storageService } from './services/storage/storageService';
import { DEFAULT_JOURNEY, DEFAULT_JOURNEY_ID } from './services/storage/defaultJourney';
import { AmbientCanvas } from './components/AmbientCanvas';
import { JourneyHeader } from './components/JourneyHeader';
import { CountdownDisplay } from './components/CountdownDisplay';
import { QuoteDisplay } from './components/QuoteDisplay';
import { CustomizeJourneyModal } from './components/CustomizeJourneyModal';
import { ShareModal } from './components/ShareModal';
import { MemoryTimeline } from './components/MemoryTimeline';
import { MilestonesPanel } from './components/MilestonesPanel';
import { FutureLettersModal } from './components/FutureLettersModal';
import { StorageSettingsModal } from './components/StorageSettingsModal';
import { AtmosphereModal } from './components/AtmosphereModal';
import {
  Calendar,
  ChevronRight,
  Maximize2,
  Minimize2,
  BookOpen,
  Flag,
  Lock,
  Share2,
  HardDrive,
  Palette,
  WifiOff,
  Edit3,
  Sparkles,
} from 'lucide-react';

export default function App() {
  const [journey, setJourney] = useState<Journey>(DEFAULT_JOURNEY);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [futureLetters, setFutureLetters] = useState<FutureLetter[]>([]);
  const [settings, setSettings] = useState<AppSettings>({
    ambientParticles: true,
    cursorGlow: true,
    soundEnabled: false,
    notificationsEnabled: false,
    prefersReducedMotion: false,
    storageProvider: 'indexeddb',
    cloudSyncStatus: {
      lastSyncedAt: null,
      status: 'idle',
      providerName: 'This Device',
      folderName: 'The Journey/',
    },
  });

  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isOffline, setIsOffline] = useState<boolean>(
    typeof navigator !== 'undefined' ? !navigator.onLine : false
  );

  // Modals
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isTimelineOpen, setIsTimelineOpen] = useState(false);
  const [isMilestonesOpen, setIsMilestonesOpen] = useState(false);
  const [isLettersOpen, setIsLettersOpen] = useState(false);
  const [isStorageOpen, setIsStorageOpen] = useState(false);
  const [isAtmosphereOpen, setIsAtmosphereOpen] = useState(false);
  const [isBooting, setIsBooting] = useState(true);
  const [bootIndex, setBootIndex] = useState(0);

  const startupNames = [
    'The Journey',
    'Le Voyage',
    'El Viaje',
    'Die Reise',
    'यात्रा',
    'رحلة',
    '旅',
    'The Journey',
  ];

  useEffect(() => {
    const interval = window.setInterval(() => {
      setBootIndex((current) => {
        const next = current + 1;
        if (next >= startupNames.length) {
          window.clearInterval(interval);
          window.setTimeout(() => setIsBooting(false), 600);
          return current;
        }
        return next;
      });
    }, 250);

    const finishTimer = window.setTimeout(() => {
      setIsBooting(false);
      window.clearInterval(interval);
    }, startupNames.length * 250 + 700);

    return () => {
      window.clearInterval(interval);
      window.clearTimeout(finishTimer);
    };
  }, []);

  useEffect(() => {
    document.title = `${startupNames[bootIndex] || 'The Journey'} • The Journey`;
  }, [bootIndex]);

  // Active theme configuration
  const currentTheme: ThemeConfig = THEMES[journey.theme] || THEMES.midnight;

  // Load Journey and Data
  const loadData = useCallback(async () => {
    try {
      // Check for shared journey encoded in URL hash
      if (typeof window !== 'undefined' && window.location.hash.startsWith('#j=')) {
        try {
          const encoded = window.location.hash.slice(3);
          const decoded = JSON.parse(decodeURIComponent(escape(atob(decodeURIComponent(encoded)))));
          if (decoded && decoded.startDate) {
            const sharedJourney: Journey = {
              ...DEFAULT_JOURNEY,
              id: `shared-${Date.now()}`,
              title: decoded.title || 'The Journey',
              mode: decoded.mode || 'since',
              startDate: decoded.startDate,
              endDate: decoded.endDate || null,
              description: decoded.description || '',
              quote: decoded.quote || DEFAULT_JOURNEY.quote,
              theme: decoded.theme || 'midnight',
              updatedAt: new Date().toISOString(),
            };
            setJourney(sharedJourney);
            await storageService.saveJourney(sharedJourney);
            window.history.replaceState(null, '', window.location.pathname);
            return;
          }
        } catch (e) {
          console.warn('Could not parse shared journey from hash', e);
        }
      }

      const active = await storageService.getActiveJourney();
      setJourney(active);

      const [loadedMemories, loadedMilestones, loadedLetters, loadedSettings] = await Promise.all([
        storageService.getMemories(active.id),
        storageService.getMilestones(active.id),
        storageService.getFutureLetters(active.id),
        storageService.getSettings(),
      ]);

      setMemories(loadedMemories);
      setMilestones(loadedMilestones);
      setFutureLetters(loadedLetters);
      setSettings(loadedSettings);
    } catch (err) {
      console.error('Error loading journey data:', err);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Online / Offline tracking
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Timer Tick Every Second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Compute Elapsed Time
  const elapsedTime: ElapsedTime = useMemo(() => {
    return calculateElapsedTime(journey.startDate, journey.endDate, journey.mode, currentTime);
  }, [journey.startDate, journey.endDate, journey.mode, currentTime]);

  // Compute Milestone Progress
  const milestoneProgress: MilestoneProgress = useMemo(() => {
    return calculateMilestoneProgress(
      journey.startDate,
      milestones,
      currentTime,
      journey.id === DEFAULT_JOURNEY_ID
    );
  }, [journey.id, journey.startDate, milestones, currentTime]);

  // Save updated journey
  const handleSaveJourney = async (updated: Journey) => {
    const hasNewStartingDate = updated.startDate !== journey.startDate;
    const savedJourney = hasNewStartingDate
      ? {
          ...updated,
          id: `journey-${Date.now()}`,
          createdAt: new Date().toISOString(),
        }
      : updated;

    setJourney(savedJourney);
    if (hasNewStartingDate) {
      setMemories([]);
      setMilestones([]);
      setFutureLetters([]);
    }
    await storageService.saveJourney(savedJourney);
  };

  // Toggle Fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  // Add memory
  const handleAddMemory = async (newMem: Omit<Memory, 'id' | 'journeyId' | 'createdAt'>) => {
    const memory: Memory = {
      ...newMem,
      id: `mem-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      journeyId: journey.id,
      createdAt: new Date().toISOString(),
    };
    await storageService.saveMemory(memory);
    setMemories((prev) => [...prev, memory].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
  };

  // Delete memory
  const handleDeleteMemory = async (id: string) => {
    await storageService.deleteMemory(id);
    setMemories((prev) => prev.filter((m) => m.id !== id));
  };

  // Add custom milestone
  const handleAddMilestone = async (
    days: number,
    label: string,
    trackingType: Milestone['trackingType'],
    startDate: string | undefined,
    targetDate: string | undefined,
    status: Milestone['status']
  ) => {
    const newMile: Milestone = {
      id: `mile-${Date.now()}`,
      journeyId: journey.id,
      days,
      label,
      trackingType,
      startDate,
      targetDate,
      status,
      isCustom: true,
      startedAt: status === 'started' ? new Date().toISOString() : undefined,
    };
    await storageService.saveMilestone(newMile);
    setMilestones((prev) => [...prev, newMile].sort((a, b) => a.days - b.days));
  };

  // Delete milestone
  const handleDeleteMilestone = async (id: string) => {
    await storageService.deleteMilestone(id);
    setMilestones((prev) => prev.filter((m) => m.id !== id));
  };

  const handleUpdateMilestoneStatus = async (id: string, status: NonNullable<Milestone['status']>) => {
    const milestone = milestones.find((item) => item.id === id);
    if (!milestone) return;

    const updated = {
      ...milestone,
      status,
      startedAt: status === 'started' ? new Date().toISOString() : milestone.startedAt,
      reachedAt: status === 'achieved' ? new Date().toISOString() : milestone.reachedAt,
    };
    await storageService.saveMilestone(updated);
    setMilestones((prev) => prev.map((item) => (item.id === id ? updated : item)));
  };

  // Add future letter
  const handleAddLetter = async (newLetter: Omit<FutureLetter, 'id' | 'journeyId' | 'createdAt'>) => {
    const letter: FutureLetter = {
      ...newLetter,
      id: `letter-${Date.now()}`,
      journeyId: journey.id,
      createdAt: new Date().toISOString(),
    };
    await storageService.saveFutureLetter(letter);
    setFutureLetters((prev) => [...prev, letter]);
  };

  // Delete future letter
  const handleDeleteLetter = async (id: string) => {
    await storageService.deleteFutureLetter(id);
    setFutureLetters((prev) => prev.filter((l) => l.id !== id));
  };

  // Update Settings
  const handleUpdateSettings = async (newSettings: AppSettings) => {
    setSettings(newSettings);
    await storageService.saveSettings(newSettings);
  };

  // Theme switch
  const handleThemeChange = async (themeId: any) => {
    const updated = { ...journey, theme: themeId };
    setJourney(updated);
    await storageService.saveJourney(updated);
  };

  // Notification toggle
  const handleToggleNotifications = async (enabled: boolean) => {
    if (enabled && typeof window !== 'undefined' && 'Notification' in window) {
      const perm = await Notification.requestPermission();
      if (perm !== 'granted') {
        alert('Notification permission was not granted by the browser.');
        return;
      }
    }
    const updated = { ...settings, notificationsEnabled: enabled };
    setSettings(updated);
    await storageService.saveSettings(updated);
  };

  return (
    <>
      {isBooting && (
        <div className="splash-screen" aria-live="polite" aria-label="Application starting">
          <div className="splash-orb" />
          <img src="/logo.svg" alt="The Journey logo" className="splash-logo" />
          <div className="splash-text-wrap">
            <span className="splash-text" key={startupNames[bootIndex]}>{startupNames[bootIndex] || 'The Journey'}</span>
          </div>
        </div>
      )}

      <div
        id="journey-root"
        className={`relative h-dvh w-full flex flex-col justify-between text-slate-100 overflow-y-auto overflow-x-hidden no-scrollbar selection:bg-white/20 transition-all duration-700 font-clean ${isBooting ? 'opacity-0 scale-[0.98]' : 'opacity-100 scale-100'}`}
        style={{
          background: currentTheme.bgGradient,
        }}
      >
      {/* Ambient background particles & cursor light */}
      <AmbientCanvas
        theme={currentTheme}
        atmosphere={settings.atmosphere || DEFAULT_ATMOSPHERE}
        enabled={settings.ambientParticles || settings.cursorGlow || settings.atmosphere?.cursor !== 'none'}
        prefersReducedMotion={settings.prefersReducedMotion}
      />

      {/* Top Bar / Offline & Quick Controls */}
      <div className="relative z-10 w-full px-4 sm:px-8 pt-4 flex items-center justify-between text-xs text-white/60">
        <div className="flex items-center gap-2">
          <button
            id="open-storage-status-btn"
            type="button"
            onClick={() => setIsStorageOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/40 border border-white/20 hover:bg-black/60 hover:border-white/35 transition-colors text-white/85 shadow-sm font-medium"
            title="Privacy & Storage Settings"
          >
            <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
            <span>Saved locally</span>
          </button>

          {/* Quick World Atmosphere Launcher */}
          <button
            id="open-atmosphere-top-btn"
            type="button"
            onClick={() => setIsAtmosphereOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/40 border border-white/20 hover:bg-black/60 hover:border-white/35 transition-colors text-white/85 shadow-sm font-medium"
            title="Create Your World & Atmosphere"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
            <span className="hidden sm:inline">Atmosphere</span>
          </button>

          {isOffline && (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-200 text-[11px] font-medium">
              <WifiOff className="w-3 h-3" />
              <span>Offline Ready</span>
            </span>
          )}
        </div>

        {/* Top Right Quick Actions */}
        <div className="flex items-center gap-2">
          <button
            id="open-share-top-btn"
            type="button"
            onClick={() => setIsShareOpen(true)}
            className="p-2 rounded-full bg-black/40 border border-white/20 hover:bg-black/60 hover:border-white/35 text-white/80 hover:text-white transition-colors shadow-sm"
            title="Share Journey"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>
          <button
            id="open-theme-btn"
            type="button"
            onClick={() => setIsAtmosphereOpen(true)}
            className="p-2 rounded-full bg-black/40 border border-white/20 hover:bg-black/60 hover:border-white/35 text-white/80 hover:text-white transition-colors shadow-sm"
            title="Create Your World (Atmosphere & Themes)"
          >
            <Palette className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* MAIN CONTAINER */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-2 sm:py-3.5 max-w-6xl mx-auto w-full">
        {/* 1. Header matching reference image (Title tag, 18 December 2022, subtitle) */}
        <JourneyHeader
          journey={journey}
          theme={currentTheme}
          milestoneProgress={milestoneProgress}
          currentSecond={elapsedTime.seconds}
          onEditClick={() => setIsCustomizeOpen(true)}
        />

        {/* 2. Planetary Orbital Circular Countdown Display (Calendar View: Years, Months, Days, Hours, Minutes, Seconds) */}
        <CountdownDisplay
          journey={journey}
          time={elapsedTime}
          theme={currentTheme}
        />

        {/* 3. Inscription Quote in Editorial Italic Serif */}
        <QuoteDisplay
          quote={journey.quote}
          theme={currentTheme}
          onEditClick={() => setIsCustomizeOpen(true)}
        />

        {/* 4. Action Button */}
        <div className="flex flex-col items-center justify-center mt-1.5 mb-2.5">
          {/* Begin from another moment pill button */}
          <button
            id="begin-another-moment-btn"
            type="button"
            onClick={() => setIsCustomizeOpen(true)}
            className="group inline-flex items-center gap-2.5 px-6 py-2.5 sm:py-3 rounded-full text-[13px] sm:text-sm font-manrope font-semibold tracking-normal text-white bg-black/60 hover:bg-black/80 border border-white/25 hover:border-white/50 backdrop-blur-md shadow-2xl transition-all duration-300 hover:scale-[1.03] active:scale-98"
          >
            <Calendar className="w-4 h-4 text-white/80 group-hover:text-white transition-colors" />
            <span>Begin from another moment</span>
            <ChevronRight className="w-4 h-4 text-white/60 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
          </button>
        </div>
      </main>

      {/* FOOTER & FLOATING DOCK */}
      <footer className="relative z-10 w-full text-center pt-2 pb-4 sm:pb-6 px-4 text-xs text-white/40 flex flex-col items-center gap-2.5 max-w-6xl mx-auto">
        {/* Floating Minimalist Control Dock */}
        <div
          id="floating-control-dock"
          className="inline-flex items-center gap-1 sm:gap-2 px-3 py-1.5 rounded-full bg-black/70 border border-white/20 backdrop-blur-xl shadow-2xl"
        >
          {/* Fullscreen Toggle */}
          <button
            id="toggle-fullscreen-btn"
            type="button"
            onClick={toggleFullscreen}
            className="p-2 rounded-full text-white/70 hover:text-white hover:bg-white/15 transition-colors"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Customize / Edit Journey */}
          <button
            id="dock-customize-btn"
            type="button"
            onClick={() => setIsCustomizeOpen(true)}
            className="p-2 rounded-full text-white/70 hover:text-white hover:bg-white/15 transition-colors"
            title="Customize Journey"
          >
            <Edit3 className="w-4 h-4" />
          </button>

          {/* Memories Timeline */}
          <button
            id="dock-memories-btn"
            type="button"
            onClick={() => setIsTimelineOpen(true)}
            className="relative p-2 rounded-full text-white/70 hover:text-white hover:bg-white/15 transition-colors"
            title="Memories & Timeline"
          >
            <BookOpen className="w-4 h-4" />
            {memories.length > 0 && (
              <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-emerald-400" />
            )}
          </button>

          {/* Milestones */}
          <button
            id="dock-milestones-btn"
            type="button"
            onClick={() => setIsMilestonesOpen(true)}
            className="p-2 rounded-full text-white/70 hover:text-white hover:bg-white/15 transition-colors"
            title="Milestone Horizon"
          >
            <Flag className="w-4 h-4" />
          </button>

          {/* Future Letters */}
          <button
            id="dock-letters-btn"
            type="button"
            onClick={() => setIsLettersOpen(true)}
            className="relative p-2 rounded-full text-white/70 hover:text-white hover:bg-white/15 transition-colors"
            title="A Letter to the Future"
          >
            <Lock className="w-4 h-4" />
            {futureLetters.length > 0 && (
              <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: currentTheme.accentColor }} />
            )}
          </button>

          {/* Atmosphere & Create Your World */}
          <button
            id="dock-atmosphere-btn"
            type="button"
            onClick={() => setIsAtmosphereOpen(true)}
            className="p-2 rounded-full text-white/70 hover:text-white hover:bg-white/15 transition-colors"
            title="Create Your World & Atmosphere"
          >
            <Sparkles className="w-4 h-4 text-cyan-300" />
          </button>

          {/* Share */}
          <button
            id="dock-share-btn"
            type="button"
            onClick={() => setIsShareOpen(true)}
            className="p-2 rounded-full text-white/70 hover:text-white hover:bg-white/15 transition-colors"
            title="Share & Visual Card"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center justify-between w-full max-w-md pt-1 text-xs font-manrope font-normal text-white/45">
          <span>Every second becomes a memory.</span>
          <span>Your memories. Your storage.</span>
        </div>

        {/* Creator Signature */}
        <div id="creator-signature" className="pt-2 sm:pt-3 select-none pointer-events-auto">
          <p
            className="font-cormorant italic text-[16px] text-white/45 tracking-wide transition-all duration-500 hover:text-white/70"
            style={{
              textShadow: '0 0 14px rgba(255, 255, 255, 0.18)',
            }}
          >
            A little world, crafted by Aman ♡
          </p>
        </div>
      </footer>

      {/* MODALS */}
      {/* 1. Customize Journey Modal */}
      <CustomizeJourneyModal
        journey={journey}
        currentTheme={currentTheme}
        isOpen={isCustomizeOpen}
        onClose={() => setIsCustomizeOpen(false)}
        onSave={handleSaveJourney}
      />

      {/* 2. Share Modal */}
      <ShareModal
        journey={journey}
        time={elapsedTime}
        theme={currentTheme}
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
      />

      {/* 3. Memory Timeline */}
      <MemoryTimeline
        memories={memories}
        theme={currentTheme}
        journeyStartDate={journey.startDate}
        onAddMemory={handleAddMemory}
        onDeleteMemory={handleDeleteMemory}
        isOpen={isTimelineOpen}
        onClose={() => setIsTimelineOpen(false)}
      />

      {/* 4. Milestones Panel */}
      <MilestonesPanel
        milestoneProgress={milestoneProgress}
        customMilestones={milestones}
        showDefaultMilestones={journey.id === DEFAULT_JOURNEY_ID}
        theme={currentTheme}
        isOpen={isMilestonesOpen}
        onClose={() => setIsMilestonesOpen(false)}
        onAddMilestone={handleAddMilestone}
        onDeleteMilestone={handleDeleteMilestone}
        onUpdateMilestoneStatus={handleUpdateMilestoneStatus}
        notificationsEnabled={settings.notificationsEnabled}
        onToggleNotifications={handleToggleNotifications}
      />

      {/* 5. Future Letters Modal */}
      <FutureLettersModal
        letters={futureLetters}
        theme={currentTheme}
        isOpen={isLettersOpen}
        onClose={() => setIsLettersOpen(false)}
        onAddLetter={handleAddLetter}
        onDeleteLetter={handleDeleteLetter}
      />

      {/* 6. Storage & Settings Modal */}
      <StorageSettingsModal
        journey={journey}
        settings={settings}
        theme={currentTheme}
        isOpen={isStorageOpen}
        onClose={() => setIsStorageOpen(false)}
        onUpdateSettings={handleUpdateSettings}
        onThemeChange={handleThemeChange}
        onDataRestored={loadData}
      />

      {/* 7. Atmosphere & World Creator Modal */}
      <AtmosphereModal
        isOpen={isAtmosphereOpen}
        onClose={() => setIsAtmosphereOpen(false)}
        currentConfig={settings.atmosphere || DEFAULT_ATMOSPHERE}
        currentTheme={currentTheme}
        onApply={async (newConfig, syncTheme) => {
          const updatedSettings: AppSettings = {
            ...settings,
            ambientParticles: newConfig.intensity > 0.1,
            cursorGlow: newConfig.cursor !== 'none',
            atmosphere: newConfig,
          };
          setSettings(updatedSettings);
          await storageService.saveSettings(updatedSettings);

          if (syncTheme && newConfig.universe) {
            const themeId = newConfig.universe as JourneyTheme;
            if (THEMES[themeId]) {
              const updatedJourney = { ...journey, theme: themeId };
              setJourney(updatedJourney);
              await storageService.saveJourney(updatedJourney);
            }
          }
        }}
      />
    </div>
    </>
  );
}
