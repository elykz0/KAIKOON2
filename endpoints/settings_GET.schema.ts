import { z } from "zod";
import superjson from 'superjson';
import { type Selectable } from "kysely";
import { type UserSettings } from "../helpers/schema";
import { persistence } from "../helpers/persistence";

export const schema = z.object({});

export type InputType = z.infer<typeof schema>;

export type OutputType = Selectable<UserSettings>;

// Function to get mock settings for a specific user
export const getMockSettings = (userId?: number): OutputType => {
  return persistence.loadSettings(userId) || {
    id: 1,
    userId: userId || 1,
    hapticBuzz: true,
    soundEffects: true,
    notifications: true,
    theme: 'light',
    fontSize: 'medium',
    grade: null,
    classes: null,
    biggerText: false,
    breakRemindersEnabled: true,
    breakReminderInterval: 30,
    celebrationNotificationsEnabled: true,
    dailyCheckinEnabled: true,
    kaibeatPlaylistUrl: null,
    notificationsEnabled: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as OutputType;
};

// Legacy mock settings for backward compatibility
export let mockSettings: OutputType = getMockSettings();

export const getSettings = async (init?: RequestInit): Promise<OutputType> => {
  try {
    const result = await fetch(`/_api/settings`, {
      method: "GET",
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers ?? {}),
      },
    });
    if (!result.ok) {
      const errorObject = superjson.parse(await result.text());
      const errorMessage = typeof errorObject === 'object' && errorObject !== null && 'error' in errorObject && typeof errorObject.error === 'string' 
        ? errorObject.error 
        : 'An unknown error occurred';
      throw new Error(errorMessage);
    }
    return superjson.parse<OutputType>(await result.text());
  } catch (error) {
    // Return mock data when API is not available
    console.warn('Settings API not available, using mock data:', error);
    return mockSettings;
  }
};