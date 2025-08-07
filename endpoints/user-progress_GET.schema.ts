import { z } from "zod";
import superjson from 'superjson';
import { type Selectable } from "kysely";
import { type UserProgress } from "../helpers/schema";

// No input schema needed for a simple GET request
export const schema = z.object({});

export type InputType = z.infer<typeof schema>;

export type OutputType = Selectable<UserProgress>;

// Mock user progress storage
let mockUserProgress: OutputType = {
  userId: 1,
  kaibloomsPoints: 0,
  updatedAt: new Date(),
};

// Function to award Kaiblooms for task completion
export const awardKaibloomsForTask = (taskEstimatedMinutes: number) => {
  // Award 1 Kaibloom per 15 minutes of estimated time, minimum 1
  const kaibloomsToAward = Math.max(1, Math.floor(taskEstimatedMinutes / 15));
  
  mockUserProgress = {
    ...mockUserProgress,
    kaibloomsPoints: mockUserProgress.kaibloomsPoints + kaibloomsToAward,
    updatedAt: new Date(),
  };
  
  console.log(`Awarded ${kaibloomsToAward} Kaiblooms for task completion (${taskEstimatedMinutes} minutes estimated)`);
  console.log(`Total Kaiblooms: ${mockUserProgress.kaibloomsPoints}`);
  
  return kaibloomsToAward;
};

// Function to get current Kaiblooms
export const getCurrentKaiblooms = () => mockUserProgress.kaibloomsPoints;

export const getUserProgress = async (init?: RequestInit): Promise<OutputType> => {
  try {
    const result = await fetch(`/_api/user-progress`, {
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
    console.warn('User progress API not available, using mock data:', error);
    return mockUserProgress;
  }
};