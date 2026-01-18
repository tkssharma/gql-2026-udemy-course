import type { User, CreateUserMutationArgs } from '../types/index.js';
import { users, generateId } from '../data/users.js';

export const Mutation = {
  // Create a new user
  createUser: (_: unknown, args: CreateUserMutationArgs): User => {
    const newUser: User = {
      id: generateId(),
      name: args.name,
    };

    users.push(newUser);

    return newUser;
  },
};
