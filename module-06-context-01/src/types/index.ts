// Simple User type
export interface User {
  id: string;
  name: string;
  email: string;
}

// Simple mock database - just a user list
export interface Database {
  users: User[];
}

// GraphQL Context type - simple version
export interface GraphQLContext {
  // Database passed via context
  db: Database;
}
