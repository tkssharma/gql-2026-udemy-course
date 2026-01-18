import type { User } from '../types/index.js';

// In-memory data store
export const users: User[] = [
  { id: '1', name: 'Alice' },
  { id: '2', name: 'Bob' },
  { id: '3', name: 'Charlie' },
];

// Simple ID generator
let nextId = 4;

export function generateId(): string {
  return String(nextId++);
}
