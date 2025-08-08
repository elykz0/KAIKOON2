import { z } from "zod";
import superjson from 'superjson';
import { type Selectable } from "kysely";
import { type UserProgress } from "../helpers/schema";
import { persistence } from "../helpers/persistence";

// No input schema needed for a simple GET request
export const schema = z.object({});

export type InputType = z.infer<typeof schema>;

export type OutputType = Selectable<UserProgress>;

// Function to get mock user progress for a specific user
export const getMockUserProgressForUser = (userId?: number): OutputType => {
  return persistence.loadUserProgress(userId) || {
    userId: userId || 1,
    kaibloomsPoints: 500, // Start with some Kaiblooms for testing
    updatedAt: new Date(),
  };
};

// Function to save mock user progress for a specific user
export const saveMockUserProgressForUser = (progress: OutputType, userId?: number) => {
  persistence.saveUserProgress(progress, userId);
};

// Function to award Kaiblooms for task completion
export const awardKaibloomsForTask = (taskEstimatedMinutes: number, userId?: number) => {
  // Award 50 Kaiblooms per completed task
  const kaibloomsToAward = 50;
  
  const currentProgress = getMockUserProgressForUser(userId);
  const updatedProgress = {
    ...currentProgress,
    kaibloomsPoints: currentProgress.kaibloomsPoints + kaibloomsToAward,
    updatedAt: new Date(),
  };
  
  // Save to localStorage with user-specific key
  saveMockUserProgressForUser(updatedProgress, userId);
  
  console.log(`Awarded ${kaibloomsToAward} Kaiblooms for task completion for user:`, userId);
  console.log(`Total Kaiblooms for user ${userId}: ${updatedProgress.kaibloomsPoints}`);
  
  return kaibloomsToAward;
};

// Function to get current Kaiblooms for a specific user
export const getCurrentKaiblooms = (userId?: number) => {
  const progress = getMockUserProgressForUser(userId);
  return progress.kaibloomsPoints;
};

export const getUserProgress = async (init?: RequestInit, userId?: number): Promise<OutputType> => {
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
    const userProgress = getMockUserProgressForUser(userId);
    console.log('Returning mock user progress for user:', userId, userProgress);
    return userProgress;
  }
};