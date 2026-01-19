import { User, Product, Order } from '../types/index.js';

// In-memory data stores
export const users: User[] = [
  { id: '1', name: 'Admin User', email: 'admin@example.com', role: 'admin' },
  { id: '2', name: 'John Doe', email: 'john@example.com', role: 'user' },
  { id: '3', name: 'Jane Smith', email: 'jane@example.com', role: 'user' },
];

export const products: Product[] = [
  { id: '1', name: 'Laptop', price: 999.99, stock: 10 },
  { id: '2', name: 'Mouse', price: 29.99, stock: 50 },
  { id: '3', name: 'Keyboard', price: 79.99, stock: 0 }, // Out of stock
  { id: '4', name: 'Monitor', price: 299.99, stock: 5 },
];

export const orders: Order[] = [
  {
    id: '1',
    userId: '2',
    productId: '1',
    quantity: 1,
    status: 'delivered',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    userId: '2',
    productId: '2',
    quantity: 2,
    status: 'cancelled',
    createdAt: new Date().toISOString(),
  },
];

let nextOrderId = 3;
export const generateOrderId = (): string => String(nextOrderId++);
