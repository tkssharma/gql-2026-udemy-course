export const typeDefs = /* GraphQL */ `
  # Simple User type
  type User {
    id: ID!
    name: String!
    email: String!
  }

  # Queries
  type Query {
    # Get all users from database (via context)
    users: [User!]!
    
    # Get user by ID
    user(id: ID!): User
  }
`;
