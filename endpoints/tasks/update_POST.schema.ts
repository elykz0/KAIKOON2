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

export const postTasksUpdate = async (body: InputType, init?: RequestInit, userId?: number): Promise<OutputType> => {
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
    
    // Find the task before making changes
    const userTasks = getMockTasks(userId);
    const targetTask = userTasks.find(t => t.id === validatedInput.taskId);
    
    if (!targetTask) {
      console.warn('Task not found in mock storage for user:', userId, validatedInput.taskId);
      throw new Error('Task not found');
    }
    
    // Update the task in mock storage
    let kaibloomsAwarded = 0;
    
    if (validatedInput.completed) {
      // Award Kaiblooms for task completion BEFORE removing the task
      kaibloomsAwarded = awardKaibloomsForTask(targetTask.estimatedMinutes, userId);
      console.log(`Awarded ${kaibloomsAwarded} Kaiblooms for completing task: ${targetTask.title}`);
      
      // If task is being completed, remove it from the list
      removeMockTask(validatedInput.taskId, userId);
      console.log('Task completed and removed from mock storage for user:', userId);
      
      // Return the completed task with kaibloomsAwarded info
      return {
        ...targetTask,
        completed: true,
        kaibloomsAwarded,
        steps: validatedInput.steps?.map(step => ({
          id: step.id,
          taskId: validatedInput.taskId,
          description: targetTask.steps.find(s => s.id === step.id)?.description || "Step",
          materials: targetTask.steps.find(s => s.id === step.id)?.materials || null,
          orderIndex: targetTask.steps.find(s => s.id === step.id)?.orderIndex || 0,
          completed: step.completed,
          createdAt: targetTask.steps.find(s => s.id === step.id)?.createdAt || new Date(),
        })) || targetTask.steps,
      };
    } else {
      // Otherwise, update the task with new data (but don't remove it)
      updateMockTask(validatedInput.taskId, {
        completed: validatedInput.completed,
        steps: validatedInput.steps?.map(step => ({
          id: step.id,
          taskId: validatedInput.taskId,
          description: targetTask.steps.find(s => s.id === step.id)?.description || "Step",
          materials: targetTask.steps.find(s => s.id === step.id)?.materials || null,
          orderIndex: targetTask.steps.find(s => s.id === step.id)?.orderIndex || 0,
          completed: step.completed,
          createdAt: targetTask.steps.find(s => s.id === step.id)?.createdAt || new Date(),
        })) || targetTask.steps
      }, userId);
      
      // Return the updated task
      return {
        ...targetTask,
        completed: validatedInput.completed || false,
        steps: validatedInput.steps?.map(step => ({
          id: step.id,
          taskId: validatedInput.taskId,
          description: targetTask.steps.find(s => s.id === step.id)?.description || "Step",
          materials: targetTask.steps.find(s => s.id === step.id)?.materials || null,
          orderIndex: targetTask.steps.find(s => s.id === step.id)?.orderIndex || 0,
          completed: step.completed,
          createdAt: targetTask.steps.find(s => s.id === step.id)?.createdAt || new Date(),
        })) || targetTask.steps,
      };
    }
  }
};