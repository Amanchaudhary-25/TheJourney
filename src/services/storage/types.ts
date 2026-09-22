import { Journey, Memory, Milestone, FutureLetter, AppSettings, JourneyBackup, StorageProviderType } from '../../types';

export interface StorageProvider {
  name: StorageProviderType;
  displayName: string;
  isCloud: boolean;
  init(): Promise<void>;
  
  // Journey methods
  saveJourney(journey: Journey): Promise<void>;
  loadJourney(id?: string): Promise<Journey | null>;
  listJourneys(): Promise<Journey[]>;
  deleteJourney(id: string): Promise<void>;
  
  // Memory methods
  saveMemory(memory: Memory): Promise<void>;
  getMemories(journeyId: string): Promise<Memory[]>;
  deleteMemory(id: string): Promise<void>;
  
  // Milestone methods
  saveMilestone(milestone: Milestone): Promise<void>;
  getMilestones(journeyId: string): Promise<Milestone[]>;
  deleteMilestone(id: string): Promise<void>;

  // Future Letters
  saveFutureLetter(letter: FutureLetter): Promise<void>;
  getFutureLetters(journeyId: string): Promise<FutureLetter[]>;
  deleteFutureLetter(id: string): Promise<void>;
  
  // Settings
  saveSettings(settings: AppSettings): Promise<void>;
  loadSettings(): Promise<AppSettings | null>;

  // Full backup / restore
  exportBackup(journeyId: string): Promise<JourneyBackup>;
  importBackup(backup: JourneyBackup): Promise<Journey>;
  clearAllData(): Promise<void>;
}
