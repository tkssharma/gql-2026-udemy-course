import { users, products, orders, generateOrderId } from '../data/index.js';
import { GraphQLContext, CreateOrderInput } from '../types/index.js';
import {
  AuthenticationError,
  NotFoundError,
  ValidationError,
  InvalidInputError,
  InsufficientStockError,
  OrderCancelledError,
  ConflictError,
  InternalError,
} from '../errors/index.js';

export const Mutation = {
  // Create order with various validations
  createOrder: (
    _: unknown,
    args: { input: CreateOrderInput },
    context: GraphQLContext
  ) => {
    // Check authentication
    if (!context.currentUser) {
      throw new AuthenticationError();
    }

    const { productId, quantity } = args.input;

    // Validate quantity
    if (quantity <= 0) {
      throw new ValidationError('Quantity must be greater than 0', 'quantity', quantity);
    }

    if (quantity > 100) {
      throw new ValidationError('Maximum quantity per order is 100', 'quantity', quantity);
    }

    // Find product
    const product = products.find((p) => p.id === productId);
    if (!product) {
      throw new NotFoundError('Product', productId);
    }

    // Check stock
    if (product.stock < quantity) {
      throw new InsufficientStockError(productId, quantity, product.stock);
    }

    // Create order
    const order = {
      id: generateOrderId(),
      userId: context.currentUser.id,
      productId,
      quantity,
      status: 'pending' as const,
      createdAt: new Date().toISOString(),
    };

    // Update stock
    product.stock -= quantity;
    orders.push(order);

    return {
      success: true,
      message: 'Order created successfully',
      order,
    };
  },

  // Cancel order
  cancelOrder: (
    _: unknown,
    args: { id: string },
    context: GraphQLContext
  ) => {
    if (!context.currentUser) {
      throw new AuthenticationError();
    }

    const order = orders.find((o) => o.id === args.id);
    if (!order) {
      throw new NotFoundError('Order', args.id);
    }

    // Check ownership (unless admin)
    if (order.userId !== context.currentUser.id && context.currentUser.role !== 'admin') {
      throw new AuthenticationError('You can only cancel your own orders');
    }

    // Check if already cancelled
    if (order.status === 'cancelled') {
      throw new OrderCancelledError(args.id);
    }

    // Check if can be cancelled
    if (order.status === 'delivered') {
      throw new ConflictError('Cannot cancel a delivered order', {
        orderId: args.id,
        currentStatus: order.status,
      });
    }

    // Restore stock
    const product = products.find((p) => p.id === order.productId);
    if (product) {
      product.stock += order.quantity;
    }

    order.status = 'cancelled';

    return {
      success: true,
      message: 'Order cancelled successfully',
      order,
    };
  },

  // Update order status
  updateOrderStatus: (
    _: unknown,
    args: { id: string; status: string },
    context: GraphQLContext
  ) => {
    if (!context.currentUser) {
      throw new AuthenticationError();
    }

    if (context.currentUser.role !== 'admin') {
      throw new AuthenticationError('Only admins can update order status');
    }

    const order = orders.find((o) => o.id === args.id);
    if (!order) {
      throw new NotFoundError('Order', args.id);
    }

    const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(args.status)) {
      throw new ValidationError(
        `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
        'status',
        args.status
      );
    }

    if (order.status === 'cancelled') {
      throw new OrderCancelledError(args.id);
    }

    order.status = args.status as typeof order.status;

    return {
      success: true,
      message: `Order status updated to ${args.status}`,
      order,
    };
  },

  // Mutation that always fails (for testing error handling)
  alwaysFails: () => {
    throw new InternalError('This mutation always fails for demonstration purposes');
  },

  // Create product with multiple validations
  createProduct: (
    _: unknown,
    args: { name: string; price: number; stock: number },
    context: GraphQLContext
  ) => {
    if (!context.currentUser) {
      throw new AuthenticationError();
    }

    if (context.currentUser.role !== 'admin') {
      throw new AuthenticationError('Only admins can create products');
    }

    const errors: Array<{ field: string; message: string }> = [];

    // Validate name
    if (!args.name || args.name.trim().length < 2) {
      errors.push({ field: 'name', message: 'Name must be at least 2 characters' });
    }

    // Validate price
    if (args.price <= 0) {
      errors.push({ field: 'price', message: 'Price must be greater than 0' });
    }

    if (args.price > 1000000) {
      errors.push({ field: 'price', message: 'Price cannot exceed 1,000,000' });
    }

    // Validate stock
    if (args.stock < 0) {
      errors.push({ field: 'stock', message: 'Stock cannot be negative' });
    }

    // If there are validation errors, throw them all at once
    if (errors.length > 0) {
      throw new InvalidInputError(errors);
    }

    // Check for duplicate name
    const existing = products.find(
      (p) => p.name.toLowerCase() === args.name.toLowerCase()
    );
    if (existing) {
      throw new ConflictError(`Product with name "${args.name}" already exists`);
    }

    const product = {
      id: String(products.length + 1),
      name: args.name.trim(),
      price: args.price,
      stock: args.stock,
    };

    products.push(product);
    return product;
  },
};
