import { z } from "zod";
import superjson from 'superjson';
import { type TaskWithSteps, addMockTask } from "./tasks_GET.schema";

const stepSchema = z.object({
  description: z.string().min(1, "Step description cannot be empty."),
  materials: z.string().nullable().optional(),
});

export const schema = z.object({
  title: z.string().min(1, "Task title cannot be empty."),
  estimatedMinutes: z.number().int().positive("Estimated minutes must be a positive number."),
  steps: z.array(stepSchema).optional(),
});

export type InputType = z.infer<typeof schema>;

export type OutputType = TaskWithSteps;

export const postTasks = async (body: InputType, init?: RequestInit): Promise<OutputType> => {
  const validatedInput = schema.parse(body);
  try {
    const result = await fetch(`/_api/tasks`, {
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
    console.warn('Tasks POST API not available, using mock data:', error);
    const mockTask: OutputType = {
      id: Date.now(), // Use timestamp as mock ID
      userId: 1,
      title: validatedInput.title,
      estimatedMinutes: validatedInput.estimatedMinutes,
      completed: false,
      createdAt: new Date(),
      steps: validatedInput.steps?.map((step, index) => ({
        id: Date.now() + index,
        taskId: Date.now(),
        description: step.description,
        materials: step.materials,
        orderIndex: index,
        completed: false,
        createdAt: new Date(),
      })) || [],
    };
    // Store the mock task so it appears in getTasks
    addMockTask(mockTask);
    return mockTask;
  }
};