// Persistence helper for localStorage with user-specific storage
export const PERSISTENCE_KEYS = {
  TASKS: 'kaikoon-tasks',
  SETTINGS: 'kaikoon-settings',
  USER_PROGRESS: 'kaikoon-user-progress',
  COLLECTIBLES: 'kaikoon-collectibles',
  REFLECTIONS: 'kaikoon-reflections',
} as const;

// Function to get user-specific storage keys
export const getUserSpecificKey = (baseKey: string, userId?: number): string => {
  if (!userId) {
    // Fallback to global storage for unauthenticated users
    return baseKey;
  }
  return `${baseKey}-user-${userId}`;
};

export const persistence = {
  // Generic save/load functions with user-specific keys
  save: <T>(key: string, data: T, userId?: number): void => {
    try {
      const userKey = getUserSpecificKey(key, userId);
      localStorage.setItem(userKey, JSON.stringify(data));
      console.log(`Saved ${userKey} to localStorage:`, data);
    } catch (error) {
      console.error(`Failed to save ${key} to localStorage:`, error);
    }
  },

  load: <T>(key: string, defaultValue: T, userId?: number): T => {
    try {
      const userKey = getUserSpecificKey(key, userId);
      const stored = localStorage.getItem(userKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        console.log(`Loaded ${userKey} from localStorage:`, parsed);
        return parsed;
      }
    } catch (error) {
      console.error(`Failed to load ${key} from localStorage:`, error);
    }
    return defaultValue;
  },

  // Specific functions for each data type with user ID
  saveTasks: (tasks: any[], userId?: number) => persistence.save(PERSISTENCE_KEYS.TASKS, tasks, userId),
  loadTasks: (userId?: number): any[] => persistence.load(PERSISTENCE_KEYS.TASKS, [], userId),

  saveSettings: (settings: any, userId?: number) => persistence.save(PERSISTENCE_KEYS.SETTINGS, settings, userId),
  loadSettings: (userId?: number): any => persistence.load(PERSISTENCE_KEYS.SETTINGS, null, userId),

  saveUserProgress: (progress: any, userId?: number) => persistence.save(PERSISTENCE_KEYS.USER_PROGRESS, progress, userId),
  loadUserProgress: (userId?: number): any => persistence.load(PERSISTENCE_KEYS.USER_PROGRESS, null, userId),

  saveCollectibles: (collectibles: any[], userId?: number) => persistence.save(PERSISTENCE_KEYS.COLLECTIBLES, collectibles, userId),
  loadCollectibles: (userId?: number): any[] => persistence.load(PERSISTENCE_KEYS.COLLECTIBLES, [], userId),

  saveReflections: (reflections: any[], userId?: number) => persistence.save(PERSISTENCE_KEYS.REFLECTIONS, reflections, userId),
  loadReflections: (userId?: number): any[] => persistence.load(PERSISTENCE_KEYS.REFLECTIONS, [], userId),

  // Clear all data for a specific user (for logout/reset)
  clearUserData: (userId?: number) => {
    if (!userId) {
      // Clear global data if no user ID
      Object.values(PERSISTENCE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
      console.log('Cleared all global Kaikoon data from localStorage');
    } else {
      // Clear user-specific data
      Object.values(PERSISTENCE_KEYS).forEach(key => {
        const userKey = getUserSpecificKey(key, userId);
        localStorage.removeItem(userKey);
      });
      console.log(`Cleared all Kaikoon data for user ${userId} from localStorage`);
    }
  },

  // Clear all data (for logout/reset) - legacy function
  clearAll: () => {
    Object.values(PERSISTENCE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    console.log('Cleared all Kaikoon data from localStorage');
  },
};
