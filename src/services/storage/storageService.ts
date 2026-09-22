import JSZip from 'jszip';
import { StorageProvider } from './types';
import { IndexedDBProvider } from './IndexedDBProvider';
import { Journey, Memory, Milestone, FutureLetter, AppSettings, JourneyBackup, StorageProviderType, DEFAULT_ATMOSPHERE } from '../../types';
import { DEFAULT_JOURNEY, DEFAULT_MEMORIES, DEFAULT_CUSTOM_MILESTONES } from './defaultJourney';

const ACTIVE_JOURNEY_KEY = 'the_journey_active_id';
const LOCAL_SETTINGS_KEY = 'the_journey_settings';

class StorageManager {
  private provider: StorageProvider;
  private isInitialized = false;

  constructor() {
    this.provider = new IndexedDBProvider();
  }

  async init(): Promise<void> {
    if (this.isInitialized) return;
    try {
      await this.provider.init();
      this.isInitialized = true;
      // Check if we need to seed the default journey
      const existing = await this.provider.loadJourney();
      if (!existing) {
        await this.seedInitialJourney();
      }
    } catch (err) {
      console.warn('Primary storage initialization failed, using local memory fallback', err);
    }
  }

  private async seedInitialJourney(): Promise<void> {
    try {
      await this.provider.saveJourney(DEFAULT_JOURNEY);
      for (const m of DEFAULT_MEMORIES) {
        await this.provider.saveMemory(m);
      }
      for (const mile of DEFAULT_CUSTOM_MILESTONES) {
        await this.provider.saveMilestone(mile);
      }
      this.setActiveJourneyId(DEFAULT_JOURNEY.id);
    } catch (err) {
      console.error('Error seeding initial journey:', err);
    }
  }

  getActiveJourneyId(): string {
    if (typeof window === 'undefined') return DEFAULT_JOURNEY.id;
    return localStorage.getItem(ACTIVE_JOURNEY_KEY) || DEFAULT_JOURNEY.id;
  }

  setActiveJourneyId(id: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(ACTIVE_JOURNEY_KEY, id);
    }
  }

  async getActiveJourney(): Promise<Journey> {
    await this.init();
    const activeId = this.getActiveJourneyId();
    let journey = await this.provider.loadJourney(activeId);
    if (!journey) {
      // Try to load any journey
      journey = await this.provider.loadJourney();
    }
    if (!journey) {
      journey = DEFAULT_JOURNEY;
      await this.provider.saveJourney(journey);
    }
    return journey;
  }

  async saveJourney(journey: Journey): Promise<void> {
    await this.init();
    journey.updatedAt = new Date().toISOString();
    await this.provider.saveJourney(journey);
    this.setActiveJourneyId(journey.id);
  }

  async getMemories(journeyId: string): Promise<Memory[]> {
    await this.init();
    return await this.provider.getMemories(journeyId);
  }

  async saveMemory(memory: Memory): Promise<void> {
    await this.init();
    await this.provider.saveMemory(memory);
  }

  async deleteMemory(id: string): Promise<void> {
    await this.init();
    await this.provider.deleteMemory(id);
  }

  async getMilestones(journeyId: string): Promise<Milestone[]> {
    await this.init();
    return await this.provider.getMilestones(journeyId);
  }

  async saveMilestone(milestone: Milestone): Promise<void> {
    await this.init();
    await this.provider.saveMilestone(milestone);
  }

  async deleteMilestone(id: string): Promise<void> {
    await this.init();
    await this.provider.deleteMilestone(id);
  }

  async getFutureLetters(journeyId: string): Promise<FutureLetter[]> {
    await this.init();
    return await this.provider.getFutureLetters(journeyId);
  }

  async saveFutureLetter(letter: FutureLetter): Promise<void> {
    await this.init();
    await this.provider.saveFutureLetter(letter);
  }

  async deleteFutureLetter(id: string): Promise<void> {
    await this.init();
    await this.provider.deleteFutureLetter(id);
  }

  async getSettings(): Promise<AppSettings> {
    await this.init();
    const settings = await this.provider.loadSettings();
    if (settings) {
      if (!settings.atmosphere) {
        settings.atmosphere = DEFAULT_ATMOSPHERE;
      }
      return settings;
    }

    const defaultSettings: AppSettings = {
      ambientParticles: true,
      cursorGlow: true,
      soundEnabled: false,
      notificationsEnabled: false,
      prefersReducedMotion: false,
      storageProvider: 'indexeddb',
      atmosphere: DEFAULT_ATMOSPHERE,
      cloudSyncStatus: {
        lastSyncedAt: null,
        status: 'idle',
        providerName: 'This Device (IndexedDB)',
        folderName: 'The Journey/'
      }
    };
    return defaultSettings;
  }

  async saveSettings(settings: AppSettings): Promise<void> {
    await this.init();
    await this.provider.saveSettings(settings);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(LOCAL_SETTINGS_KEY, JSON.stringify(settings));
      } catch {
        // Safe fail
      }
    }
  }

  async exportJsonBackup(journeyId: string): Promise<string> {
    const backup = await this.provider.exportBackup(journeyId);
    return JSON.stringify(backup, null, 2);
  }

  async exportZipBackup(journeyId: string): Promise<Blob> {
    const backup = await this.provider.exportBackup(journeyId);
    const zip = new JSZip();

    // 1. journey.json
    zip.file('journey.json', JSON.stringify(backup.journey, null, 2));

    // 2. settings.json
    zip.file('settings.json', JSON.stringify(backup.settings, null, 2));

    // 3. milestones.json
    zip.file('milestones.json', JSON.stringify(backup.milestones, null, 2));

    // 4. letters.json
    zip.file('future_letters.json', JSON.stringify(backup.futureLetters, null, 2));

    // 5. memories folder & photos
    const memoriesFolder = zip.folder('memories');
    const photosFolder = zip.folder('photos');

    const cleanMemories = backup.memories.map((mem, index) => {
      if (mem.photoUrl && mem.photoUrl.startsWith('data:image')) {
        try {
          const parts = mem.photoUrl.split(',');
          const mime = parts[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
          const ext = mime.split('/')[1] || 'jpg';
          const filename = `photo_${index + 1}_${mem.id.slice(0, 6)}.${ext}`;
          const base64Data = parts[1];
          photosFolder?.file(filename, base64Data, { base64: true });
          return { ...mem, photoAttachmentFile: filename };
        } catch {
          return mem;
        }
      }
      return mem;
    });

    memoriesFolder?.file('memories.json', JSON.stringify(cleanMemories, null, 2));

    // Full manifest
    zip.file('The-Journey-Backup-Manifest.json', JSON.stringify(backup, null, 2));

    return await zip.generateAsync({ type: 'blob' });
  }

  async importBackupData(backupData: JourneyBackup): Promise<Journey> {
    await this.init();
    const restoredJourney = await this.provider.importBackup(backupData);
    this.setActiveJourneyId(restoredJourney.id);
    return restoredJourney;
  }

  async importFromZip(file: File): Promise<Journey> {
    const zip = await JSZip.loadAsync(file);

    // Look for manifest first
    const manifestFile = zip.file('The-Journey-Backup-Manifest.json');
    if (manifestFile) {
      const jsonStr = await manifestFile.async('string');
      const parsed = JSON.parse(jsonStr) as JourneyBackup;
      return await this.importBackupData(parsed);
    }

    // Fallback: parse modular files
    const journeyFile = zip.file('journey.json');
    if (!journeyFile) {
      throw new Error('Invalid archive. "journey.json" is missing.');
    }
    const journeyJson = await journeyFile.async('string');
    const journey = JSON.parse(journeyJson) as Journey;

    let memories: Memory[] = [];
    const memoriesFile = zip.file('memories/memories.json');
    if (memoriesFile) {
      const memStr = await memoriesFile.async('string');
      memories = JSON.parse(memStr);
    }

    let milestones: Milestone[] = [];
    const milestonesFile = zip.file('milestones.json');
    if (milestonesFile) {
      const milStr = await milestonesFile.async('string');
      milestones = JSON.parse(milStr);
    }

    let futureLetters: FutureLetter[] = [];
    const lettersFile = zip.file('future_letters.json');
    if (lettersFile) {
      const letStr = await lettersFile.async('string');
      futureLetters = JSON.parse(letStr);
    }

    const settings: AppSettings = {
      ambientParticles: true,
      cursorGlow: true,
      soundEnabled: false,
      notificationsEnabled: false,
      prefersReducedMotion: false,
      storageProvider: 'indexeddb',
      cloudSyncStatus: {
        lastSyncedAt: null,
        status: 'idle',
        providerName: 'This Device (IndexedDB)',
        folderName: 'The Journey/'
      }
    };

    const backup: JourneyBackup = {
      version: 1,
      exportedAt: new Date().toISOString(),
      journey,
      memories,
      milestones,
      futureLetters,
      settings
    };

    return await this.importBackupData(backup);
  }

  async resetAllLocalData(): Promise<void> {
    await this.init();
    await this.provider.clearAllData();
    if (typeof window !== 'undefined') {
      localStorage.removeItem(ACTIVE_JOURNEY_KEY);
      localStorage.removeItem(LOCAL_SETTINGS_KEY);
    }
    await this.seedInitialJourney();
  }
}

export const storageService = new StorageManager();
