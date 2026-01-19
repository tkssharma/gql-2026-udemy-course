import { GraphQLContext } from '../types/index.js';

export const Query = {
  // Get all users - access database via context
  users: (_: unknown, __: unknown, context: GraphQLContext) => {
    // Access database through context.db
    return context.db.users;
  },

  // Get user by ID
  user: (_: unknown, args: { id: string }, context: GraphQLContext) => {
    // Find user from database via context
    return context.db.users.find((user) => user.id === args.id);
  },
};
