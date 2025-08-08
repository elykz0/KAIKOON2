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

// Function to get mock tasks for a specific user
export const getMockTasksForUser = (userId?: number): TaskWithSteps[] => {
  return persistence.loadTasks(userId) || [];
};

// Function to save mock tasks for a specific user
export const saveMockTasksForUser = (tasks: TaskWithSteps[], userId?: number) => {
  persistence.saveTasks(tasks, userId);
};

export const getTasks = async (init?: RequestInit, userId?: number): Promise<OutputType> => {
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
    const userTasks = getMockTasksForUser(userId);
    console.log('Current mock tasks for user:', userId, userTasks);
    return userTasks;
  }
};

// Function to add mock tasks (used by postTasks)
export const addMockTask = (task: TaskWithSteps, userId?: number) => {
  console.log('Adding mock task for user:', userId, task);
  const userTasks = getMockTasksForUser(userId);
  userTasks.push(task);
  saveMockTasksForUser(userTasks, userId);
  console.log('Updated mock tasks array for user:', userId, userTasks);
};

// Function to get mock tasks (for debugging)
export const getMockTasks = (userId?: number) => getMockTasksForUser(userId);

// Function to update mock task (used by postTasksUpdate)
export const updateMockTask = (taskId: number, updates: Partial<TaskWithSteps>, userId?: number) => {
  console.log('Updating mock task for user:', userId, taskId, updates);
  const userTasks = getMockTasksForUser(userId);
  const taskIndex = userTasks.findIndex(task => task.id === taskId);
  if (taskIndex !== -1) {
    userTasks[taskIndex] = { ...userTasks[taskIndex], ...updates };
    saveMockTasksForUser(userTasks, userId);
    console.log('Updated mock tasks array for user:', userId, userTasks);
  } else {
    console.warn('Task not found in mock storage for user:', userId, taskId);
  }
};

// Function to remove mock task (used when task is completed)
export const removeMockTask = (taskId: number, userId?: number) => {
  console.log('Removing mock task for user:', userId, taskId);
  const userTasks = getMockTasksForUser(userId);
  const updatedTasks = userTasks.filter(task => task.id !== taskId);
  saveMockTasksForUser(updatedTasks, userId);
  console.log('Updated mock tasks array for user:', userId, updatedTasks);
};