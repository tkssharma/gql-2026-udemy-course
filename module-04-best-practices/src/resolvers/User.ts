import type { UserModel } from '../types/index.js';

/**
 * User field resolvers
 * Transform database model to GraphQL response
 */
export const User = {
  // Convert Date to ISO string for GraphQL
  createdAt: (parent: UserModel): string => {
    return parent.createdAt.toISOString();
  },

  updatedAt: (parent: UserModel): string => {
    return parent.updatedAt.toISOString();
  },
};
