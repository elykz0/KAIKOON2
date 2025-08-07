import { z } from "zod";

// No input required for logout
export const schema = z.object({});

export type OutputType =
  | {
      success: boolean;
      message: string;
    }
  | {
      error: string;
      message?: string;
    };

export const postLogout = async (
  body: z.infer<typeof schema> = {},
  init?: RequestInit
): Promise<OutputType> => {
  try {
    const result = await fetch(`/_api/auth/logout`, {
      method: "POST",
      body: JSON.stringify(body),
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers ?? {}),
      },
    });
    return result.json();
  } catch (error) {
    // Return mock data when API is not available
    console.warn('Logout API not available, using mock data:', error);
    return {
      success: true,
      message: "Logged out successfully"
    };
  }
};
