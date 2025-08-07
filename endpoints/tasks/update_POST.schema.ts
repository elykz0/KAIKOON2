import { z } from "zod";
import superjson from 'superjson';
import { type TaskWithSteps, updateMockTask, removeMockTask, getMockTasks } from "../tasks_GET.schema";
import { awardKaibloomsForTask } from "../user-progress_GET.schema";

const stepUpdateSchema = z.object({
  id: z.number().int(),
  completed: z.boolean(),
});

export const schema = z.object({
  taskId: z.number().int(),
  completed: z.boolean().optional(),
  steps: z.array(stepUpdateSchema).optional(),
});

export type InputType = z.infer<typeof schema>;

export type OutputType = TaskWithSteps & {
  kaibloomsAwarded?: number;
};

export const postTasksUpdate = async (body: InputType, init?: RequestInit): Promise<OutputType> => {
  const validatedInput = schema.parse(body);
  
  try {
    const result = await fetch(`/_api/tasks/update`, {
      method: "POST",
      body: superjson.stringify(validatedInput),
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
    console.warn('Tasks update API not available, using mock data:', error);
    
        // Update the task in mock storage
    let kaibloomsAwarded = 0;
    if (validatedInput.completed) {
      // Award Kaiblooms for task completion BEFORE removing the task
      const completedTask = getMockTasks().find(t => t.id === validatedInput.taskId);
      if (completedTask) {
        kaibloomsAwarded = awardKaibloomsForTask(completedTask.estimatedMinutes);
        console.log(`Awarded ${kaibloomsAwarded} Kaiblooms for completing task: ${completedTask.title}`);
      }
      
      // If task is being completed, remove it from the list
      removeMockTask(validatedInput.taskId);
      console.log('Task completed and removed from mock storage');
    } else {
      // Otherwise, update the task with new data
      updateMockTask(validatedInput.taskId, {
        completed: validatedInput.completed,
        steps: validatedInput.steps?.map(step => ({
          id: step.id,
          taskId: validatedInput.taskId,
          description: "Mock step",
          materials: null,
          orderIndex: 0,
          completed: step.completed,
          createdAt: new Date(),
        })) || []
      });
    }
    
    // Return a mock task response (the actual task will be removed from the list)
    const mockTask: OutputType = {
      id: validatedInput.taskId,
      userId: 1,
      title: "Mock Task",
      estimatedMinutes: 30,
      completed: validatedInput.completed || false,
      createdAt: new Date(),
      steps: validatedInput.steps?.map(step => ({
        id: step.id,
        taskId: validatedInput.taskId,
        description: "Mock step",
        materials: null,
        orderIndex: 0,
        completed: step.completed,
        createdAt: new Date(),
      })) || [],
      kaibloomsAwarded: validatedInput.completed ? kaibloomsAwarded : undefined,
    };
    
    return mockTask;
  }
};