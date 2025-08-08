// Persistence helper for localStorage
export const PERSISTENCE_KEYS = {
  TASKS: 'kaikoon-tasks',
  SETTINGS: 'kaikoon-settings',
  USER_PROGRESS: 'kaikoon-user-progress',
  COLLECTIBLES: 'kaikoon-collectibles',
  REFLECTIONS: 'kaikoon-reflections',
} as const;

export const persistence = {
  // Generic save/load functions
  save: <T>(key: string, data: T): void => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      console.log(`Saved ${key} to localStorage:`, data);
    } catch (error) {
      console.error(`Failed to save ${key} to localStorage:`, error);
    }
  },

  load: <T>(key: string, defaultValue: T): T => {
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        const parsed = JSON.parse(stored);
        console.log(`Loaded ${key} from localStorage:`, parsed);
        return parsed;
      }
    } catch (error) {
      console.error(`Failed to load ${key} from localStorage:`, error);
    }
    return defaultValue;
  },

  // Specific functions for each data type
  saveTasks: (tasks: any[]) => persistence.save(PERSISTENCE_KEYS.TASKS, tasks),
  loadTasks: (): any[] => persistence.load(PERSISTENCE_KEYS.TASKS, []),

  saveSettings: (settings: any) => persistence.save(PERSISTENCE_KEYS.SETTINGS, settings),
  loadSettings: (): any => persistence.load(PERSISTENCE_KEYS.SETTINGS, null),

  saveUserProgress: (progress: any) => persistence.save(PERSISTENCE_KEYS.USER_PROGRESS, progress),
  loadUserProgress: (): any => persistence.load(PERSISTENCE_KEYS.USER_PROGRESS, null),

  saveCollectibles: (collectibles: any[]) => persistence.save(PERSISTENCE_KEYS.COLLECTIBLES, collectibles),
  loadCollectibles: (): any[] => persistence.load(PERSISTENCE_KEYS.COLLECTIBLES, []),

  saveReflections: (reflections: any[]) => persistence.save(PERSISTENCE_KEYS.REFLECTIONS, reflections),
  loadReflections: (): any[] => persistence.load(PERSISTENCE_KEYS.REFLECTIONS, []),

  // Clear all data (for logout/reset)
  clearAll: () => {
    Object.values(PERSISTENCE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    console.log('Cleared all Kaikoon data from localStorage');
  },
};
