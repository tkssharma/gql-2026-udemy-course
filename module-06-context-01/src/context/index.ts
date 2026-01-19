import { GraphQLContext } from '../types/index.js';
import { db } from '../db/index.js';

// Simple context factory - just pass the database
export const createContext = (): GraphQLContext => {
  return {
    db, // Pass database via context
  };
};
