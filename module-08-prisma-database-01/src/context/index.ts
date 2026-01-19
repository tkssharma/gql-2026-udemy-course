import { prisma } from '../db/prisma.js';
import { GraphQLContext } from '../types/index.js';

// Context factory - injects Prisma client into context
export const createContext = (): GraphQLContext => {
  return {
    prisma,  // Prisma client passed via context
  };
};
