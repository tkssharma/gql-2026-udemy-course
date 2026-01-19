export const typeDefs = /* GraphQL */ `
  # User type
  type User {
    id: ID!
    name: String!
    email: String!
    role: String!
  }

  # Queries
  type Query {
    # Public - get all users
    users: [User!]!
    
    # Public - get user by ID
    user(id: ID!): User
    
    # Protected - get current authenticated user (requires JWT)
    me: User
    
    # Protected - admin only query
    adminOnly: String!
  }
`;
