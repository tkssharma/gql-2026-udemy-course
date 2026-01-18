import type { UserModel, CreateUserData, UpdateUserData } from '../types/index.js';

// In-memory data store
const users: UserModel[] = [
  {
    id: '1',
    name: 'Alice Johnson',
    email: 'alice@example.com',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: '2',
    name: 'Bob Smith',
    email: 'bob@example.com',
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02'),
  },
  {
    id: '3',
    name: 'Charlie Brown',
    email: 'charlie@example.com',
    createdAt: new Date('2024-01-03'),
    updatedAt: new Date('2024-01-03'),
  },
];

// ID generator
let nextId = 4;
function generateId(): string {
  return String(nextId++);
}

/**
 * User Repository - Data access layer
 */
export const userRepository = {
  findAll(): UserModel[] {
    return users;
  },

  findById(id: string): UserModel | null {
    return users.find((u) => u.id === id) ?? null;
  },

  findByEmail(email: string): UserModel | null {
    return users.find((u) => u.email === email) ?? null;
  },

  create(data: CreateUserData): UserModel {
    const now = new Date();
    const user: UserModel = {
      id: generateId(),
      name: data.name,
      email: data.email,
      createdAt: now,
      updatedAt: now,
    };
    users.push(user);
    return user;
  },

  update(id: string, data: UpdateUserData): UserModel | null {
    const index = users.findIndex((u) => u.id === id);
    if (index === -1) return null;

    const user = users[index];
    if (!user) return null;

    const updated: UserModel = {
      ...user,
      ...data,
      updatedAt: new Date(),
    };
    users[index] = updated;
    return updated;
  },

  delete(id: string): boolean {
    const index = users.findIndex((u) => u.id === id);
    if (index === -1) return false;
    users.splice(index, 1);
    return true;
  },
};
