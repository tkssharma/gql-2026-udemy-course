import { PrismaClient } from '@prisma/client';

// Authenticated user from token
export interface AuthUser {
  id: string;
  email: string;
  role: 'admin' | 'user';
}

// GraphQL Context - the key to dependency injection
export interface GraphQLContext {
  // Prisma client for database access
  prisma: PrismaClient;

  // Current authenticated user (null if not authenticated)
  currentUser: AuthUser | null;

  // Request metadata
  requestId: string;
}

// Input types
export interface CreateUserInput {
  email: string;
  name: string;
  role?: string;
}

export interface UpdateUserInput {
  email?: string;
  name?: string;
}

export interface CreatePostInput {
  title: string;
  content: string;
  published?: boolean;
}

export interface UpdatePostInput {
  title?: string;
  content?: string;
  published?: boolean;
}

export interface CreateCommentInput {
  content: string;
  postId: string;
}
