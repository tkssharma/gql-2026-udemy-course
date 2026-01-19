import { Database, User, Post } from '../types/index.js';

// In-memory data store
const usersData: User[] = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'user',
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'user',
    createdAt: new Date().toISOString(),
  },
];

const postsData: Post[] = [
  {
    id: '1',
    title: 'Getting Started with GraphQL',
    content: 'GraphQL is a query language for APIs...',
    authorId: '2',
    published: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Understanding Context in GraphQL Yoga',
    content: 'Context is a powerful feature that allows...',
    authorId: '2',
    published: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    title: 'Draft Post',
    content: 'This is a draft post...',
    authorId: '3',
    published: false,
    createdAt: new Date().toISOString(),
  },
];

let nextUserId = 4;
let nextPostId = 4;

// Create database instance (simulating a database connection)
export const createDatabase = (): Database => {
  return {
    users: {
      findAll: () => usersData,
      findById: (id: string) => usersData.find((u) => u.id === id),
      findByEmail: (email: string) =>
        usersData.find((u) => u.email.toLowerCase() === email.toLowerCase()),
      create: (data) => {
        const user: User = {
          ...data,
          id: String(nextUserId++),
          createdAt: new Date().toISOString(),
        };
        usersData.push(user);
        return user;
      },
    },
    posts: {
      findAll: () => postsData,
      findById: (id: string) => postsData.find((p) => p.id === id),
      findByAuthor: (authorId: string) =>
        postsData.filter((p) => p.authorId === authorId),
      create: (data) => {
        const post: Post = {
          ...data,
          id: String(nextPostId++),
          createdAt: new Date().toISOString(),
        };
        postsData.push(post);
        return post;
      },
      update: (id: string, data: Partial<Post>) => {
        const index = postsData.findIndex((p) => p.id === id);
        if (index === -1) return undefined;
        postsData[index] = { ...postsData[index], ...data };
        return postsData[index];
      },
      delete: (id: string) => {
        const index = postsData.findIndex((p) => p.id === id);
        if (index === -1) return false;
        postsData.splice(index, 1);
        return true;
      },
    },
  };
};
