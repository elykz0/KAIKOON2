import { z } from "zod";
import superjson from 'superjson';
import { type Selectable } from "kysely";
import { type Tasks, type TaskSteps } from "../helpers/schema";
import { persistence } from "../helpers/persistence";

// No input schema needed for a simple GET request
export const schema = z.object({});

export type InputType = z.infer<typeof schema>;

export type TaskWithSteps = Selectable<Tasks> & {
  steps: Selectable<TaskSteps>[];
};

export type OutputType = TaskWithSteps[];

// In-memory storage for mock tasks when API is not available
let mockTasks: TaskWithSteps[] = persistence.loadTasks() || [];

export const getTasks = async (init?: RequestInit): Promise<OutputType> => {
  try {
    const result = await fetch(`/_api/tasks`, {
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
    console.warn('Tasks API not available, using mock data:', error);
    console.log('Current mock tasks:', mockTasks);
    return mockTasks;
  }
};

// Function to add mock tasks (used by postTasks)
export const addMockTask = (task: TaskWithSteps) => {
  console.log('Adding mock task:', task);
  mockTasks.push(task);
  persistence.saveTasks(mockTasks);
  console.log('Updated mock tasks array:', mockTasks);
};

// Function to get mock tasks (for debugging)
export const getMockTasks = () => mockTasks;

// Function to update mock task (used by postTasksUpdate)
export const updateMockTask = (taskId: number, updates: Partial<TaskWithSteps>) => {
  console.log('Updating mock task:', taskId, updates);
  const taskIndex = mockTasks.findIndex(task => task.id === taskId);
  if (taskIndex !== -1) {
    mockTasks[taskIndex] = { ...mockTasks[taskIndex], ...updates };
    persistence.saveTasks(mockTasks);
    console.log('Updated mock tasks array:', mockTasks);
  } else {
    console.warn('Task not found in mock storage:', taskId);
  }
};

// Function to remove mock task (used when task is completed)
export const removeMockTask = (taskId: number) => {
  console.log('Removing mock task:', taskId);
  mockTasks = mockTasks.filter(task => task.id !== taskId);
  persistence.saveTasks(mockTasks);
  console.log('Updated mock tasks array:', mockTasks);
};