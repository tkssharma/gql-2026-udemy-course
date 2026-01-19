export const typeDefs = /* GraphQL */ `
  # User type
  type User {
    id: ID!
    name: String!
    email: String!
    age: Int
    createdAt: String!
  }

  # Input type for creating a user
  input CreateUserInput {
    name: String!
    email: String!
    age: Int
  }

  # Input type for updating a user
  input UpdateUserInput {
    name: String
    email: String
    age: Int
  }

  # Standard mutation response
  type MutationResponse {
    success: Boolean!
    message: String!
  }

  # User mutation response with user data
  type UserMutationResponse {
    success: Boolean!
    message: String!
    user: User
  }

  # Delete response with deleted ID
  type DeleteUserResponse {
    success: Boolean!
    message: String!
    deletedId: ID
  }

  # Queries
  type Query {
    # Get all users
    users: [User!]!
    
    # Get a single user by ID
    user(id: ID!): User
    
    # Search users by name
    searchUsers(name: String!): [User!]!
  }

  # Mutations
  type Mutation {
    # Create a new user
    createUser(input: CreateUserInput!): UserMutationResponse!
    
    # Update an existing user
    updateUser(id: ID!, input: UpdateUserInput!): UserMutationResponse!
    
    # Delete a user
    deleteUser(id: ID!): DeleteUserResponse!
  }
`;
