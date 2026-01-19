import { Database } from '../types/index.js';

// Simple mock database - user list with roles
export const db: Database = {
  users: [
    { id: '1', name: 'Admin User', email: 'admin@example.com', role: 'admin' },
    { id: '2', name: 'John Doe', email: 'john@example.com', role: 'user' },
    { id: '3', name: 'Jane Smith', email: 'jane@example.com', role: 'user' },
  ],
};
