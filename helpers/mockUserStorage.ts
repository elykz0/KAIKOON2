import { User } from './User';

// Mock user storage with localStorage persistence
export const mockUserStorage = {
  // Get all mock users from localStorage
  getUsers: (): Array<User & { password: string }> => {
    try {
      const stored = localStorage.getItem('kaikoon-mock-users');
      if (stored) {
        const users = JSON.parse(stored);
        // Convert date strings back to Date objects
        return users.map((user: any) => ({
          ...user,
          createdAt: new Date(user.createdAt),
          updatedAt: new Date(user.updatedAt),
        }));
      }
    } catch (error) {
      console.error('Failed to load mock users from localStorage:', error);
    }
    
    // Return default users if no stored data
    return [
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
  },

  // Save users to localStorage
  saveUsers: (users: Array<User & { password: string }>) => {
    try {
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
    return users.find(u => u.email === email);
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
