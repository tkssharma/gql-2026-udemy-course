export const typeDefs = /* GraphQL */ `
  # User type
  type User {
    id: ID!
    name: String!
    email: String!
    role: String!
  }

  # Product type
  type Product {
    id: ID!
    name: String!
    price: Float!
    stock: Int!
  }

  # Order type
  type Order {
    id: ID!
    user: User!
    product: Product!
    quantity: Int!
    status: String!
    createdAt: String!
  }

  # Input types
  input CreateOrderInput {
    productId: ID!
    quantity: Int!
  }

  # Result types for demonstrating partial responses
  type UserResult {
    user: User
    error: String
  }

  type ProductResult {
    product: Product
    error: String
  }

  # Batch result for partial responses demo
  type BatchUsersResult {
    users: [UserResult!]!
    successCount: Int!
    errorCount: Int!
  }

  # Mutation responses
  type OrderResponse {
    success: Boolean!
    message: String!
    order: Order
  }

  # Queries
  type Query {
    # Basic queries
    users: [User!]!
    user(id: ID!): User
    
    products: [Product!]!
    product(id: ID!): Product
    
    orders: [Order!]!
    order(id: ID!): Order
    
    # Queries that demonstrate different error scenarios
    userOrError(id: ID!): User!
    productWithStock(id: ID!): Product!
    
    # Partial response demo - fetch multiple users, some may fail
    batchUsers(ids: [ID!]!): BatchUsersResult!
    
    # Query that simulates random failures
    unreliableQuery: String!
    
    # Protected query (requires auth)
    me: User!
    
    # Admin only query
    adminStats: String!
  }

  # Mutations
  type Mutation {
    # Create order with various validation
    createOrder(input: CreateOrderInput!): OrderResponse!
    
    # Cancel order
    cancelOrder(id: ID!): OrderResponse!
    
    # Update order (demonstrates conflict errors)
    updateOrderStatus(id: ID!, status: String!): OrderResponse!
    
    # Mutation that always fails (for testing)
    alwaysFails: String!
    
    # Mutation with multiple validation errors
    createProduct(name: String!, price: Float!, stock: Int!): Product!
  }
`;
