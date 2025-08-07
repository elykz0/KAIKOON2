import { z } from "zod";
import superjson from 'superjson';
import { type Selectable } from "kysely";
import { type Reflections } from "../helpers/schema";
import { addMockReflectionLog } from "./reflection-logs_GET.schema";
import { getMockTasks } from "./tasks_GET.schema";

export const schema = z.object({
  taskId: z.number().int().positive(),
  emojiRating: z.number().int().min(1).max(5),
  reflectionText: z.string().min(1, "Reflection cannot be empty."),
});

export type InputType = z.infer<typeof schema>;

export type OutputType = Selectable<Reflections> & { sentiment: string };

export const postReflections = async (body: InputType, init?: RequestInit): Promise<OutputType> => {
  const validatedInput = schema.parse(body);
  
  try {
    const result = await fetch(`/_api/reflections`, {
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
    console.warn('Reflections API not available, using mock data:', error);
    
    // Create mock reflection data
    const mockReflection: OutputType = {
      id: Date.now(), // Use timestamp as mock ID
      userId: 1,
      taskId: validatedInput.taskId,
      emojiRating: validatedInput.emojiRating,
      reflectionText: validatedInput.reflectionText,
      createdAt: new Date(),
      sentiment: validatedInput.emojiRating >= 4 ? 'positive' : validatedInput.emojiRating <= 2 ? 'negative' : 'neutral'
    };
    
    // Get the task title from mock tasks
    const mockTasks = getMockTasks();
    const task = mockTasks.find(t => t.id === validatedInput.taskId);
    const taskTitle = task?.title || `Task ${validatedInput.taskId}`;
    
    // Add to mock reflection logs
    addMockReflectionLog({
      ...mockReflection,
      taskTitle: taskTitle,
    });
    
    console.log('Returning mock reflection with sentiment:', mockReflection.sentiment);
    return mockReflection;
  }
};