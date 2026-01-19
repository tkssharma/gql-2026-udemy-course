import { users } from '../data/users.js';
import { User } from '../types/index.js';

export const Query = {
  // Get all users
  users: (): User[] => {
    return users;
  },

  // Get a single user by ID
  user: (_: unknown, args: { id: string }): User | undefined => {
    return users.find((user) => user.id === args.id);
  },

  // Search users by name (case-insensitive)
  searchUsers: (_: unknown, args: { name: string }): User[] => {
    const searchTerm = args.name.toLowerCase();
    return users.filter((user) =>
      user.name.toLowerCase().includes(searchTerm)
    );
  },
};
