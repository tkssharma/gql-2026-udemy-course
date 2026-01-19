import { IncomingMessage } from 'node:http';

// User types
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  createdAt: string;
}

// Post types
export interface Post {
  id: string;
  title: string;
  content: string;
  authorId: string;
  published: boolean;
  createdAt: string;
}

// Authenticated user from token
export interface AuthUser {
  id: string;
  email: string;
  role: 'admin' | 'user';
}

// Database interface (simulating a database connection)
export interface Database {
  users: {
    findAll: () => User[];
    findById: (id: string) => User | undefined;
    findByEmail: (email: string) => User | undefined;
    create: (data: Omit<User, 'id' | 'createdAt'>) => User;
  };
  posts: {
    findAll: () => Post[];
    findById: (id: string) => Post | undefined;
    findByAuthor: (authorId: string) => Post[];
    create: (data: Omit<Post, 'id' | 'createdAt'>) => Post;
    update: (id: string, data: Partial<Post>) => Post | undefined;
    delete: (id: string) => boolean;
  };
}

// Logger interface
export interface Logger {
  info: (message: string, meta?: Record<string, unknown>) => void;
  error: (message: string, meta?: Record<string, unknown>) => void;
  warn: (message: string, meta?: Record<string, unknown>) => void;
}

// Request metadata (request-scoped data)
export interface RequestMeta {
  requestId: string;
  startTime: number;
  ip: string;
  userAgent: string;
}

// GraphQL Context type
export interface GraphQLContext {
  // Database connection
  db: Database;

  // Logger instance
  logger: Logger;

  // Authenticated user (null if not authenticated)
  currentUser: AuthUser | null;

  // Request-scoped metadata
  request: RequestMeta;

  // Raw HTTP request (for advanced use cases)
  req: IncomingMessage;
}

// Input types
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
