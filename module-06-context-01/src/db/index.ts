import { Database } from '../types/index.js';

// Simple mock database - just a list of users
export const db: Database = {
  users: [
    { id: '1', name: 'John Doe', email: 'john@example.com' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
    { id: '3', name: 'Bob Wilson', email: 'bob@example.com' },
  ],
};
