import { GraphQLError } from 'graphql';
import { GraphQLContext } from '../types/index.js';

export const Query = {
  // Public - get all users
  users: (_: unknown, __: unknown, context: GraphQLContext) => {
    return context.db.users;
  },

  // Public - get user by ID
  user: (_: unknown, args: { id: string }, context: GraphQLContext) => {
    return context.db.users.find((u) => u.id === args.id);
  },

  // Protected - get current authenticated user
  me: (_: unknown, __: unknown, context: GraphQLContext) => {
    console.log(context);
    // Check if user is authenticated via JWT
    if (!context.currentUser) {
      throw new GraphQLError('Authentication required. Please provide a valid JWT token.', {
        extensions: { code: 'UNAUTHENTICATED' },
      });
    }

    // Return user from database using ID from JWT
    return context.db.users.find((u) => u.id === context.currentUser!.id);
  },

  // Protected - admin only
  adminOnly: (_: unknown, __: unknown, context: GraphQLContext) => {
    // Check authentication
    if (!context.currentUser) {
      throw new GraphQLError('Authentication required', {
        extensions: { code: 'UNAUTHENTICATED' },
      });
    }

    // Check admin role
    if (context.currentUser.role !== 'admin') {
      throw new GraphQLError('Admin access required', {
        extensions: { code: 'FORBIDDEN' },
      });
    }

    return 'Secret admin data! Only admins can see this.';
  },
};
