// User types
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
}

// Product types
export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
}

// Order types
export interface Order {
  id: string;
  userId: string;
  productId: string;
  quantity: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
}

// Input types
export interface CreateOrderInput {
  productId: string;
  quantity: number;
}

// Context type
export interface GraphQLContext {
  currentUser: User | null;
}
