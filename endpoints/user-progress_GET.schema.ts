import { z } from "zod";
import superjson from 'superjson';
import { type Selectable } from "kysely";
import { type UserProgress } from "../helpers/schema";

// No input schema needed for a simple GET request
export const schema = z.object({});

export type InputType = z.infer<typeof schema>;

export type OutputType = Selectable<UserProgress>;

// Mock user progress storage
export let mockUserProgress: OutputType = {
  userId: 1,
  kaibloomsPoints: 500, // Start with some Kaiblooms for testing
  updatedAt: new Date(),
};

// Function to award Kaiblooms for task completion
export const awardKaibloomsForTask = (taskEstimatedMinutes: number) => {
  // Award 50 Kaiblooms per completed task
  const kaibloomsToAward = 50;
  
  mockUserProgress = {
    ...mockUserProgress,
    kaibloomsPoints: mockUserProgress.kaibloomsPoints + kaibloomsToAward,
    updatedAt: new Date(),
  };
  
  console.log(`Awarded ${kaibloomsToAward} Kaiblooms for task completion`);
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
    console.log('Returning mock user progress:', mockUserProgress);
    return mockUserProgress;
  }
};