import { users, products, orders } from '../data/index.js';
import { GraphQLContext } from '../types/index.js';
import {
  AuthenticationError,
  NotFoundError,
  InsufficientPermissionsError,
  InternalError,
} from '../errors/index.js';

export const Query = {
  // Basic queries
  users: () => users,

  user: (_: unknown, args: { id: string }) => {
    return users.find((u) => u.id === args.id) || null;
  },

  products: () => products,

  product: (_: unknown, args: { id: string }) => {
    return products.find((p) => p.id === args.id) || null;
  },

  orders: () => orders,

  order: (_: unknown, args: { id: string }) => {
    return orders.find((o) => o.id === args.id) || null;
  },

  // Query that throws NotFoundError
  userOrError: (_: unknown, args: { id: string }) => {
    const user = users.find((u) => u.id === args.id);
    if (!user) {
      throw new NotFoundError('User', args.id);
    }
    return user;
  },

  // Query that checks stock
  productWithStock: (_: unknown, args: { id: string }) => {
    const product = products.find((p) => p.id === args.id);
    if (!product) {
      throw new NotFoundError('Product', args.id);
    }
    if (product.stock === 0) {
      throw new NotFoundError('Product', args.id);
    }
    return product;
  },

  // Partial response demo - some users may not exist
  batchUsers: (_: unknown, args: { ids: string[] }) => {
    const results = args.ids.map((id) => {
      const user = users.find((u) => u.id === id);
      if (user) {
        return { user, error: null };
      }
      return { user: null, error: `User with id "${id}" not found` };
    });

    const successCount = results.filter((r) => r.user !== null).length;
    const errorCount = results.filter((r) => r.error !== null).length;

    return {
      users: results,
      successCount,
      errorCount,
    };
  },

  // Simulates random failures
  unreliableQuery: () => {
    if (Math.random() > 0.5) {
      throw new InternalError('Random failure occurred');
    }
    return 'Success! You got lucky.';
  },

  // Protected query - requires authentication
  me: (_: unknown, __: unknown, context: GraphQLContext) => {
    if (!context.currentUser) {
      throw new AuthenticationError();
    }
    return context.currentUser;
  },

  // Admin only query
  adminStats: (_: unknown, __: unknown, context: GraphQLContext) => {
    if (!context.currentUser) {
      throw new AuthenticationError();
    }
    if (context.currentUser.role !== 'admin') {
      throw new InsufficientPermissionsError('admin');
    }
    return `Total users: ${users.length}, Products: ${products.length}, Orders: ${orders.length}`;
  },
};
