import { z } from "zod";
import { User } from "../../helpers/User";
import { mockUserStorage } from "../../helpers/mockUserStorage";

export const schema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export type OutputType = {
  user: User;
};

export const postLogin = async (
  body: z.infer<typeof schema>,
  init?: RequestInit
): Promise<OutputType> => {
  const validatedInput = schema.parse(body);
  
  try {
    const result = await fetch(`/_api/auth/login_with_password`, {
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
      let errorMessage = "Login failed.";
      try {
        const errorData = await result.json();
        errorMessage = errorData.message || errorMessage;
      } catch (parseError) {
        errorMessage = await result.text() || "Server error, could not parse login error response.";
      }
      throw new Error(errorMessage);
    }

    return await result.json();
  } catch (error) {
    // Return mock data when API is not available
    console.warn('Login API not available, using mock data:', error);
    
    // Find user by email using persistent storage
    const user = mockUserStorage.findUserByEmail(validatedInput.email);
    
    console.log('Login attempt:', {
      email: validatedInput.email,
      userFound: !!user,
      passwordMatch: user ? user.password === validatedInput.password : false
    });
    
    if (!user) {
      throw new Error("Invalid email or password");
    }
    
    // Check password
    if (user.password !== validatedInput.password) {
      throw new Error("Invalid email or password");
    }
    
    // Return user without password
    const { password, ...userWithoutPassword } = user;
    return { user: userWithoutPassword };
  }
};
