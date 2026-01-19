import { users, products } from '../data/index.js';
import { Order } from '../types/index.js';

// Field resolvers for Order type
export const Order_Resolver = {
  user: (parent: Order) => {
    return users.find((u) => u.id === parent.userId);
  },
  product: (parent: Order) => {
    return products.find((p) => p.id === parent.productId);
  },
};
