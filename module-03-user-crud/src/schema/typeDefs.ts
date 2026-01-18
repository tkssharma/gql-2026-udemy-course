export const typeDefs = /* GraphQL */ `
  type Query {
    users: [User!]!
    user(id: ID!): User
  }

  type Mutation {
    createUser(name: String!): User!
  }

  type User {
    id: ID!
    name: String!
  }

  type Post {
    id: ID!
    title: String!
    content: String!
    author: User!
  }

  input CreateUserInput {
    name: String!
    email: String!
  }

  input CreatePostInput {
    title: String!
    content: String!
  }

`;
