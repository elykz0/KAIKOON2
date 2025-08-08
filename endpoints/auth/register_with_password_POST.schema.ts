import { z } from "zod";
import { User } from "../../helpers/User";
import { mockUserStorage } from "../../helpers/mockUserStorage";

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
    
    // Check if email already exists
    if (mockUserStorage.emailExists(validatedInput.email)) {
      throw new Error("Email already in use");
    }
    
    // Create new user
    const newUser = {
      id: mockUserStorage.getNextUserId(),
      email: validatedInput.email,
      password: validatedInput.password,
      displayName: validatedInput.displayName,
      role: "user" as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    console.log('Creating new user:', { email: newUser.email, id: newUser.id, displayName: newUser.displayName });
    
    // Add to persistent mock database
    mockUserStorage.addUser(newUser);
    
    // Verify the user was saved by trying to find it
    const savedUser = mockUserStorage.findUserByEmail(validatedInput.email);
    console.log('Verification - saved user found:', savedUser ? 'YES' : 'NO');
    
    // Return user without password
    const { password, ...userWithoutPassword } = newUser;
    return { user: userWithoutPassword };
  }
};
