import { StorageProvider } from './types';
import { Journey, Memory, Milestone, FutureLetter, AppSettings, JourneyBackup, DEFAULT_ATMOSPHERE } from '../../types';

const DB_NAME = 'TheJourneyDB';
const DB_VERSION = 1;

export class IndexedDBProvider implements StorageProvider {
  name = 'indexeddb' as const;
  displayName = 'This Device (IndexedDB)';
  isCloud = false;
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    if (this.db) return;

    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        reject(new Error('IndexedDB is not supported on this platform.'));
        return;
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('journeys')) {
          db.createObjectStore('journeys', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('memories')) {
          const memStore = db.createObjectStore('memories', { keyPath: 'id' });
          memStore.createIndex('journeyId', 'journeyId', { unique: false });
        }
        if (!db.objectStoreNames.contains('milestones')) {
          const milStore = db.createObjectStore('milestones', { keyPath: 'id' });
          milStore.createIndex('journeyId', 'journeyId', { unique: false });
        }
        if (!db.objectStoreNames.contains('futureLetters')) {
          const letStore = db.createObjectStore('futureLetters', { keyPath: 'id' });
          letStore.createIndex('journeyId', 'journeyId', { unique: false });
        }
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'id' });
        }
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onerror = () => {
        reject(new Error(request.error?.message || 'Failed to open IndexedDB'));
      };
    });
  }

  private getStore(storeName: string, mode: IDBTransactionMode = 'readonly'): IDBObjectStore {
    if (!this.db) {
      throw new Error('IndexedDB is not initialized');
    }
    const tx = this.db.transaction(storeName, mode);
    return tx.objectStore(storeName);
  }

  async saveJourney(journey: Journey): Promise<void> {
    await this.init();
    return new Promise((resolve, reject) => {
      try {
        const store = this.getStore('journeys', 'readwrite');
        const req = store.put(journey);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      } catch (err) {
        reject(err);
      }
    });
  }

  async loadJourney(id?: string): Promise<Journey | null> {
    await this.init();
    return new Promise((resolve, reject) => {
      try {
        const store = this.getStore('journeys');
        if (id) {
          const req = store.get(id);
          req.onsuccess = () => resolve(req.result || null);
          req.onerror = () => reject(req.error);
        } else {
          // Get the most recent journey
          const req = store.getAll();
          req.onsuccess = () => {
            const list = req.result as Journey[];
            if (!list || list.length === 0) {
              resolve(null);
            } else {
              // Return the first or latest updated
              list.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
              resolve(list[0]);
            }
          };
          req.onerror = () => reject(req.error);
        }
      } catch (err) {
        reject(err);
      }
    });
  }

  async listJourneys(): Promise<Journey[]> {
    await this.init();
    return new Promise((resolve, reject) => {
      try {
        const store = this.getStore('journeys');
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => reject(req.error);
      } catch (err) {
        reject(err);
      }
    });
  }

  async deleteJourney(id: string): Promise<void> {
    await this.init();
    return new Promise((resolve, reject) => {
      try {
        const store = this.getStore('journeys', 'readwrite');
        const req = store.delete(id);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      } catch (err) {
        reject(err);
      }
    });
  }

  async saveMemory(memory: Memory): Promise<void> {
    await this.init();
    return new Promise((resolve, reject) => {
      try {
        const store = this.getStore('memories', 'readwrite');
        const req = store.put(memory);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      } catch (err) {
        reject(err);
      }
    });
  }

  async getMemories(journeyId: string): Promise<Memory[]> {
    await this.init();
    return new Promise((resolve, reject) => {
      try {
        const store = this.getStore('memories');
        const index = store.index('journeyId');
        const req = index.getAll(journeyId);
        req.onsuccess = () => {
          const list = (req.result || []) as Memory[];
          // Sort chronologically
          list.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
          resolve(list);
        };
        req.onerror = () => reject(req.error);
      } catch (err) {
        reject(err);
      }
    });
  }

  async deleteMemory(id: string): Promise<void> {
    await this.init();
    return new Promise((resolve, reject) => {
      try {
        const store = this.getStore('memories', 'readwrite');
        const req = store.delete(id);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      } catch (err) {
        reject(err);
      }
    });
  }

  async saveMilestone(milestone: Milestone): Promise<void> {
    await this.init();
    return new Promise((resolve, reject) => {
      try {
        const store = this.getStore('milestones', 'readwrite');
        const req = store.put(milestone);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      } catch (err) {
        reject(err);
      }
    });
  }

  async getMilestones(journeyId: string): Promise<Milestone[]> {
    await this.init();
    return new Promise((resolve, reject) => {
      try {
        const store = this.getStore('milestones');
        const index = store.index('journeyId');
        const req = index.getAll(journeyId);
        req.onsuccess = () => {
          const list = (req.result || []) as Milestone[];
          list.sort((a, b) => a.days - b.days);
          resolve(list);
        };
        req.onerror = () => reject(req.error);
      } catch (err) {
        reject(err);
      }
    });
  }

  async deleteMilestone(id: string): Promise<void> {
    await this.init();
    return new Promise((resolve, reject) => {
      try {
        const store = this.getStore('milestones', 'readwrite');
        const req = store.delete(id);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      } catch (err) {
        reject(err);
      }
    });
  }

  async saveFutureLetter(letter: FutureLetter): Promise<void> {
    await this.init();
    return new Promise((resolve, reject) => {
      try {
        const store = this.getStore('futureLetters', 'readwrite');
        const req = store.put(letter);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      } catch (err) {
        reject(err);
      }
    });
  }

  async getFutureLetters(journeyId: string): Promise<FutureLetter[]> {
    await this.init();
    return new Promise((resolve, reject) => {
      try {
        const store = this.getStore('futureLetters');
        const index = store.index('journeyId');
        const req = index.getAll(journeyId);
        req.onsuccess = () => {
          const list = (req.result || []) as FutureLetter[];
          list.sort((a, b) => new Date(a.unlockDate).getTime() - new Date(b.unlockDate).getTime());
          resolve(list);
        };
        req.onerror = () => reject(req.error);
      } catch (err) {
        reject(err);
      }
    });
  }

  async deleteFutureLetter(id: string): Promise<void> {
    await this.init();
    return new Promise((resolve, reject) => {
      try {
        const store = this.getStore('futureLetters', 'readwrite');
        const req = store.delete(id);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      } catch (err) {
        reject(err);
      }
    });
  }

  async saveSettings(settings: AppSettings): Promise<void> {
    await this.init();
    return new Promise((resolve, reject) => {
      try {
        const store = this.getStore('settings', 'readwrite');
        const req = store.put({ id: 'app_settings', ...settings });
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      } catch (err) {
        reject(err);
      }
    });
  }

  async loadSettings(): Promise<AppSettings | null> {
    await this.init();
    return new Promise((resolve, reject) => {
      try {
        const store = this.getStore('settings');
        const req = store.get('app_settings');
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => reject(req.error);
      } catch (err) {
        reject(err);
      }
    });
  }

  async exportBackup(journeyId: string): Promise<JourneyBackup> {
    const journey = await this.loadJourney(journeyId);
    if (!journey) {
      throw new Error('Journey not found');
    }
    const memories = await this.getMemories(journeyId);
    const milestones = await this.getMilestones(journeyId);
    const futureLetters = await this.getFutureLetters(journeyId);
    const settings = (await this.loadSettings()) || {
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
        providerName: 'This Device',
        folderName: 'The Journey/'
      }
    };

    return {
      version: 1,
      exportedAt: new Date().toISOString(),
      journey,
      memories,
      milestones,
      futureLetters,
      settings
    };
  }

  async importBackup(backup: JourneyBackup): Promise<Journey> {
    if (!backup || !backup.journey || !backup.journey.id) {
      throw new Error('Invalid journey backup file. Missing journey metadata.');
    }

    await this.saveJourney(backup.journey);

    if (Array.isArray(backup.memories)) {
      for (const mem of backup.memories) {
        await this.saveMemory(mem);
      }
    }

    if (Array.isArray(backup.milestones)) {
      for (const mile of backup.milestones) {
        await this.saveMilestone(mile);
      }
    }

    if (Array.isArray(backup.futureLetters)) {
      for (const lettr of backup.futureLetters) {
        await this.saveFutureLetter(lettr);
      }
    }

    if (backup.settings) {
      await this.saveSettings(backup.settings);
    }

    return backup.journey;
  }

  async clearAllData(): Promise<void> {
    await this.init();
    return new Promise((resolve, reject) => {
      try {
        if (!this.db) return resolve();
        const tx = this.db.transaction(
          ['journeys', 'memories', 'milestones', 'futureLetters', 'settings'],
          'readwrite'
        );
        tx.objectStore('journeys').clear();
        tx.objectStore('memories').clear();
        tx.objectStore('milestones').clear();
        tx.objectStore('futureLetters').clear();
        tx.objectStore('settings').clear();
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      } catch (err) {
        reject(err);
      }
    });
  }
}
