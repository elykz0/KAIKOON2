import { z } from "zod";
import superjson from 'superjson';
import { type Selectable } from "kysely";
import { type Reflections } from "../helpers/schema";

// No input schema needed for a simple GET request
export const schema = z.object({});

export type InputType = z.infer<typeof schema>;

export type ReflectionLog = Selectable<Reflections> & {
  taskTitle: string;
};

export type OutputType = ReflectionLog[];

// Mock reflection logs storage
let mockReflectionLogs: OutputType = [];

// Function to add a reflection log
export const addMockReflectionLog = (reflection: OutputType[0]) => {
  mockReflectionLogs.unshift(reflection); // Add to beginning
  console.log('Added reflection log:', reflection);
  console.log('Current reflection logs:', mockReflectionLogs);
};

export const getReflectionLogs = async (init?: RequestInit): Promise<OutputType> => {
  try {
    const result = await fetch(`/_api/reflection-logs`, {
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
    console.warn('Reflection logs API not available, using mock data:', error);
    return mockReflectionLogs;
  }
};