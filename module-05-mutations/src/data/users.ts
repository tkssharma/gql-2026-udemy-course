import { User } from '../types/index.js';

// In-memory database for demo purposes
export const users: User[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    age: 30,
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    age: 25,
    createdAt: new Date().toISOString(),
  },
];

// Helper to generate unique IDs
let nextId = 3;
export const generateId = (): string => String(nextId++);
