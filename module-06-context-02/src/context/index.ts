import { YogaInitialContext } from 'graphql-yoga';
import { GraphQLContext, AuthUser } from '../types/index.js';
import { db } from '../db/index.js';

// Simulated JWT token validation
// In production, use a real JWT library like 'jsonwebtoken'
const verifyToken = (token: string): AuthUser | null => {
  // Simulated tokens - in real app, decode and verify JWT
  const tokenUserMap: Record<string, AuthUser> = {
    'admin-jwt-token': { id: '1', email: 'admin@example.com', role: 'admin' },
    'john-jwt-token': { id: '2', email: 'john@example.com', role: 'user' },
    'jane-jwt-token': { id: '3', email: 'jane@example.com', role: 'user' },
  };

  return tokenUserMap[token] || null;
};

// Context factory - extracts JWT from headers and validates
export const createContext = async (
  initialContext: YogaInitialContext
): Promise<GraphQLContext> => {
  const { request } = initialContext;

  // Extract Authorization header
  const authHeader = request.headers.get('authorization');
  let currentUser: AuthUser | null = null;
  

  // Validate JWT token if present
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7); // Remove 'Bearer ' prefix
    currentUser = verifyToken(token);
  }

  return {
    db,
    currentUser,  // Will be null if no valid token
  };
};
