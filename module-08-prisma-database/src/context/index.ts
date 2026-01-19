import { YogaInitialContext } from 'graphql-yoga';
import { prisma } from '../db/prisma.js';
import { GraphQLContext, AuthUser } from '../types/index.js';

// Simulated token validation (in production, use JWT)
const validateToken = async (token: string): Promise<AuthUser | null> => {
  // Look up user by token (simplified - in real app, decode JWT)
  const tokenMap: Record<string, string> = {
    'admin-token': 'admin@example.com',
    'john-token': 'john@example.com',
    'jane-token': 'jane@example.com',
  };

  const email = tokenMap[token];
  if (!email) return null;

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, role: true },
  });

  if (!user) return null;

  return {
    id: user.id,
    email: user.email,
    role: user.role as 'admin' | 'user',
  };
};

// Generate unique request ID
const generateRequestId = (): string => {
  return `req_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 9)}`;
};

// Context factory - called for each request
export const createContext = async (
  initialContext: YogaInitialContext
): Promise<GraphQLContext> => {
  const { request } = initialContext;

  // Generate request ID for tracing
  const requestId = generateRequestId();

  // Extract and validate auth token
  let currentUser: AuthUser | null = null;
  const authHeader = request.headers.get('authorization');

  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    currentUser = await validateToken(token);
  }

  // Return context with Prisma client injected
  return {
    prisma,      // Database access via context
    currentUser, // Authenticated user
    requestId,   // Request tracing
  };
};
