export const typeDefs = /* GraphQL */ `
  enum Role {
    USER
    ADMIN
    MODERATOR
  }

  type User {
    id: ID!
    email: String!
    name: String!
    role: Role!
    createdAt: String!
    updatedAt: String!
    posts: [Post!]!
    profile: Profile
  }

  type Profile {
    id: ID!
    bio: String
    avatar: String
  }

  type Post {
    id: ID!
    title: String!
    content: String
    published: Boolean!
    tags: [String!]!
    metadata: JSON
    createdAt: String!
    updatedAt: String!
    author: User!
    categories: [Category!]!
  }

  type Category {
    id: ID!
    name: String!
    posts: [Post!]!
  }

  scalar JSON

  type Query {
    users: [User!]!
    user(id: ID!): User
    posts(published: Boolean): [Post!]!
    post(id: ID!): Post
    categories: [Category!]!
  }

  input CreateUserInput {
    email: String!
    name: String!
    role: Role
    bio: String
  }

  input CreatePostInput {
    title: String!
    content: String
    authorId: ID!
    tags: [String!]
    categoryIds: [ID!]
  }

  type Mutation {
    createUser(input: CreateUserInput!): User!
    createPost(input: CreatePostInput!): Post!
    publishPost(id: ID!): Post
    createCategory(name: String!): Category!
  }
`;
