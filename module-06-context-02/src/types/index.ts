// User type
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
}

// Authenticated user from JWT token
export interface AuthUser {
  id: string;
  email: string;
  role: 'admin' | 'user';
}

// Simple database - user list
export interface Database {
  users: User[];
}

// GraphQL Context with auth
export interface GraphQLContext {
  db: Database;
  currentUser: AuthUser | null;  // null if not authenticated
}
