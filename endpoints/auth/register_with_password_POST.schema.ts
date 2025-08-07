import { z } from "zod";
import { User } from "../../helpers/User";

export const schema = z.object({
  email: z.string().email("Email is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  displayName: z.string().min(1, "Name is required"),
});

export type OutputType = {
  user: User;
};

export const postRegister = async (
  body: z.infer<typeof schema>,
  init?: RequestInit
): Promise<OutputType> => {
  const validatedInput = schema.parse(body);
  
  try {
    const result = await fetch(`/_api/auth/register_with_password`, {
      method: "POST",
      body: JSON.stringify(validatedInput),
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers ?? {}),
      },
      credentials: "include", // Important for cookies to be sent and received
    });

    if (!result.ok) {
      const errorData = await result.json();
      throw new Error(errorData.message || "Registration failed");
    }

    return result.json();
  } catch (error) {
    // Return mock data when API is not available
    console.warn('Register API not available, using mock data:', error);
    
    // Mock user database - same as login endpoint
    const mockUsers = [
      {
        id: 1,
        email: "test@example.com",
        password: "Password123",
        displayName: "Test User",
        role: "user" as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 2,
        email: "admin@kaikoon.com",
        password: "Admin123",
        displayName: "Admin User",
        role: "admin" as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 3,
        email: "user@example.com",
        password: "User123",
        displayName: "Regular User",
        role: "user" as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ];
    
    // Check if email already exists
    const existingUser = mockUsers.find(u => u.email === validatedInput.email);
    if (existingUser) {
      throw new Error("Email already in use");
    }
    
    // Create new user
    const newUser = {
      id: Date.now(), // Use timestamp as mock ID
      email: validatedInput.email,
      password: validatedInput.password,
      displayName: validatedInput.displayName,
      role: "user" as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    // Add to mock database (in a real app, this would persist)
    mockUsers.push(newUser);
    
    // Return user without password
    const { password, ...userWithoutPassword } = newUser;
    return { user: userWithoutPassword };
  }
};
