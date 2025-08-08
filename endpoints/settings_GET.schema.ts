import { z } from "zod";
import superjson from 'superjson';
import { type Selectable } from "kysely";
import { type UserSettings } from "../helpers/schema";

export const schema = z.object({});

export type InputType = z.infer<typeof schema>;

export type OutputType = Selectable<UserSettings>;

// Mock storage for settings
export let mockSettings: OutputType = {
  id: 1,
  userId: 1,
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