export const typeDefs = /* GraphQL */ `
  type Query {
    """
    Get all users
    """
    users: [User!]!

    """
    Get a user by ID
    """
    user(id: ID!): User
  }

  type Mutation {
    """
    Create a new user
    """
    createUser(input: CreateUserInput!): User!

    """
    Update an existing user
    """
    updateUser(id: ID!, input: UpdateUserInput!): User

    """
    Delete a user
    """
    deleteUser(id: ID!): Boolean!
  }

  """
  User type
  """
  type User {
    id: ID!
    name: String!
    email: String!
    createdAt: String!
    updatedAt: String!
  }

  """
  Input for creating a new user
  """
  input CreateUserInput {
    name: String!
    email: String!
  }

  """
  Input for updating a user
  """
  input UpdateUserInput {
    name: String
    email: String
  }
`;
