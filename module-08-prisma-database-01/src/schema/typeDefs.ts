export const typeDefs = /* GraphQL */ `
  type User {
    id: Int!
    email: String!
    name: String!
    createdAt: String!
    posts: [Post!]!
  }

  type Post {
    id: Int!
    title: String!
    content: String
    published: Boolean!
    createdAt: String!
    author: User!
  }

  type Query {
    users: [User!]!
    user(id: Int!): User
    posts: [Post!]!
    post(id: Int!): Post
  }

  type Mutation {
    createUser(email: String!, name: String!): User!
    createPost(title: String!, content: String, authorId: Int!): Post!
    publishPost(id: Int!): Post
  }
`;
