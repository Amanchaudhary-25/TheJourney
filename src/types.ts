export type JourneyMode = 'since' | 'until' | 'between';

export type JourneyTheme =
  | 'midnight'
  | 'aurora'
  | 'sunset'
  | 'serenity'
  | 'minimal'
  | 'web'
  | 'thunder'
  | 'shield'
  | 'tech'
  | 'gamma'
  | 'mystic';

export type UniverseTheme =
  | 'cosmic'
  | 'web'
  | 'thunder'
  | 'shield'
  | 'tech'
  | 'gamma'
  | 'mystic'
  | 'aurora'
  | 'sunset'
  | 'serenity'
  | 'minimal';

export type AtmosphereType =
  | 'cosmic'
  | 'electric'
  | 'ember'
  | 'frost'
  | 'ocean'
  | 'nature'
  | 'moonlight'
  | 'stardust'
  | 'mystic'
  | 'shadow'
  | 'golden_hour'
  | 'dreamy';

export type CursorEffect = 'none' | 'glow' | 'particles' | 'trail';

export interface AtmosphereConfig {
  universe: UniverseTheme;
  effect: AtmosphereType;
  cursor: CursorEffect;
  intensity: number; // 0.2 to 1.0 (subtle to cinematic)
  interactiveEnabled: boolean;
}

export const DEFAULT_ATMOSPHERE: AtmosphereConfig = {
  universe: 'minimal',
  effect: 'dreamy',
  cursor: 'glow',
  intensity: 0.35,
  interactiveEnabled: true,
};

export type StorageProviderType = 
  | 'browser' 
  | 'indexeddb' 
  | 'googledrive' 
  | 'onedrive' 
  | 'dropbox';

export interface Journey {
  id: string;
  title: string;
  subtitle?: string;
  mode: JourneyMode;
  startDate: string; // ISO 8601 string
  endDate?: string | null; // ISO 8601 string for 'between' or 'until'
  hasStartTime?: boolean;
  description: string;
  quote: string;
  theme: JourneyTheme;
  createdAt: string;
  updatedAt: string;
}

export interface Memory {
  id: string;
  journeyId: string;
  date: string; // ISO 8601
  title: string;
  description: string;
  photoUrl?: string; // Base64 or Blob URL stored in IndexedDB
  photoName?: string;
  location?: string;
  tags?: string[];
  symbol?: string; // e.g. "✦", "♥", "★", "◈"
  createdAt: string;
}

export interface Milestone {
  id: string;
  journeyId: string;
  days: number;
  label: string;
  isCustom?: boolean;
  notes?: string;
  reachedAt?: string;
}

export interface FutureLetter {
  id: string;
  journeyId: string;
  title: string;
  message: string;
  unlockDate: string; // ISO 8601
  isUnlocked?: boolean;
  createdAt: string;
}

export interface JourneyBackup {
  version: number;
  exportedAt: string;
  journey: Journey;
  memories: Memory[];
  milestones: Milestone[];
  futureLetters: FutureLetter[];
  settings: AppSettings;
}

export interface AppSettings {
  ambientParticles: boolean;
  cursorGlow: boolean;
  soundEnabled: boolean;
  notificationsEnabled: boolean;
  prefersReducedMotion: boolean;
  storageProvider: StorageProviderType;
  atmosphere?: AtmosphereConfig;
  cloudSyncStatus: {
    lastSyncedAt: string | null;
    status: 'idle' | 'syncing' | 'synced' | 'error';
    providerName: string;
    accountEmail?: string;
    folderName: string;
  };
}

export interface ElapsedTime {
  years: number;
  months: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
  totalDays: number;
  totalHours: number;
  totalMinutes: number;
  totalSeconds: number;
  formattedDateRange?: string;
}
