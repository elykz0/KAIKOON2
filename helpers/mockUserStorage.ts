import { User } from './User';

// Mock user storage with localStorage persistence
export const mockUserStorage = {
  // Get all mock users from localStorage
  getUsers: (): Array<User & { password: string }> => {
    try {
      const stored = localStorage.getItem('kaikoon-mock-users');
      console.log('Loading users from localStorage:', stored);
      
      if (stored) {
        const users = JSON.parse(stored);
        console.log('Parsed users from localStorage:', users);
        
        // Validate that we have a proper array
        if (Array.isArray(users) && users.length > 0) {
          // Convert date strings back to Date objects
          const validUsers = users.map((user: any) => ({
            ...user,
            createdAt: new Date(user.createdAt),
            updatedAt: new Date(user.updatedAt),
          }));
          console.log('Returning valid users from localStorage:', validUsers.length, 'users');
          return validUsers;
        } else {
          console.log('Invalid user data in localStorage, using defaults');
        }
      } else {
        console.log('No user data in localStorage, using defaults');
      }
    } catch (error) {
      console.error('Failed to load mock users from localStorage:', error);
    }
    
    // Return default users if no stored data
    const defaultUsers = [
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
    console.log('Returning default users:', defaultUsers.length, 'users');
    return defaultUsers;
  },

  // Save users to localStorage
  saveUsers: (users: Array<User & { password: string }>) => {
    try {
      console.log('Saving users to localStorage:', users);
      localStorage.setItem('kaikoon-mock-users', JSON.stringify(users));
      console.log('Saved mock users to localStorage:', users.length, 'users');
    } catch (error) {
      console.error('Failed to save mock users to localStorage:', error);
    }
  },

  // Add a new user
  addUser: (user: User & { password: string }) => {
    const users = mockUserStorage.getUsers();
    users.push(user);
    mockUserStorage.saveUsers(users);
    console.log('Added new mock user:', user.email);
  },

  // Find user by email
  findUserByEmail: (email: string): (User & { password: string }) | undefined => {
    const users = mockUserStorage.getUsers();
    console.log('Looking for user with email:', email);
    console.log('Available users:', users.map(u => ({ email: u.email, id: u.id })));
    const foundUser = users.find(u => u.email === email);
    console.log('Found user:', foundUser ? { email: foundUser.email, id: foundUser.id } : 'Not found');
    return foundUser;
  },

  // Find user by ID
  findUserById: (id: number): (User & { password: string }) | undefined => {
    const users = mockUserStorage.getUsers();
    return users.find(u => u.id === id);
  },

  // Check if email exists
  emailExists: (email: string): boolean => {
    return !!mockUserStorage.findUserByEmail(email);
  },

  // Get next available user ID
  getNextUserId: (): number => {
    const users = mockUserStorage.getUsers();
    const maxId = Math.max(...users.map(u => u.id), 0);
    return maxId + 1;
  },
};
