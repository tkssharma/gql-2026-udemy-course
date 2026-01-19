import { AuthUser } from '../types/index.js';

// Simulated token database (in real app, use JWT or session store)
const validTokens: Record<string, AuthUser> = {
  'admin-token-123': { id: '1', email: 'admin@example.com', role: 'admin' },
  'user-token-456': { id: '2', email: 'john@example.com', role: 'user' },
  'user-token-789': { id: '3', email: 'jane@example.com', role: 'user' },
};

// Extract and validate authentication token from request
export const authenticateRequest = (
  authHeader: string | undefined
): AuthUser | null => {
  if (!authHeader) {
    return null;
  }

  // Expected format: "Bearer <token>"
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  const token = parts[1];
  return validTokens[token] || null;
};

// Check if user has required role
export const hasRole = (user: AuthUser | null, role: 'admin' | 'user'): boolean => {
  if (!user) return false;
  if (role === 'user') return true; // Both admin and user have 'user' access
  return user.role === role;
};

// Check if user owns a resource
export const isOwner = (user: AuthUser | null, resourceOwnerId: string): boolean => {
  if (!user) return false;
  return user.id === resourceOwnerId;
};
