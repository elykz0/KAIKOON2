import { useCurrentUserId } from './useAuth';
import { persistence } from './persistence';

export const useUserPersistence = () => {
  const userId = useCurrentUserId();

  return {
    // Tasks
    saveTasks: (tasks: any[]) => persistence.saveTasks(tasks, userId),
    loadTasks: () => persistence.loadTasks(userId),

    // Settings
    saveSettings: (settings: any) => persistence.saveSettings(settings, userId),
    loadSettings: () => persistence.loadSettings(userId),

    // User Progress
    saveUserProgress: (progress: any) => persistence.saveUserProgress(progress, userId),
    loadUserProgress: () => persistence.loadUserProgress(userId),

    // Collectibles
    saveCollectibles: (collectibles: any[]) => persistence.saveCollectibles(collectibles, userId),
    loadCollectibles: () => persistence.loadCollectibles(userId),

    // Reflections
    saveReflections: (reflections: any[]) => persistence.saveReflections(reflections, userId),
    loadReflections: () => persistence.loadReflections(userId),

    // Clear user data
    clearUserData: () => persistence.clearUserData(userId),

    // Get current user ID
    userId,
  };
};
