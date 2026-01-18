import type { User, UserQueryArgs } from '../types/index.js';
import { users } from '../data/users.js';

export const Query = {
  // Get all users
  users: (): User[] => {
    return users;
  },

  // Get user by ID (returns null if not found)
  user: (_: unknown, args: UserQueryArgs): User | null => {
    const user = users.find((u) => u.id === args.id);
    return user ?? null;
  },
};
