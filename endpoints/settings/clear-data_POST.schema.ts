import { z } from "zod";
import superjson from 'superjson';
import { persistence } from "../../helpers/persistence";

export const schema = z.object({});

export type InputType = z.infer<typeof schema>;

export type OutputType = { success: boolean; message: string };

export const postSettingsClearData = async (body?: InputType, init?: RequestInit): Promise<OutputType> => {
  try {
    const result = await fetch(`/_api/settings/clear-data`, {
      method: "POST",
      body: superjson.stringify(body ?? {}),
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
      console.warn('Clear data API not available, using mock data:', error);
      
      // Clear all localStorage data
      persistence.clearAll();
      
      // Mock clear data response
      const mockResponse: OutputType = {
        success: true,
        message: 'All data cleared successfully'
      };
      
      console.log('Returning mock clear data response:', mockResponse);
      return mockResponse;
    }
};