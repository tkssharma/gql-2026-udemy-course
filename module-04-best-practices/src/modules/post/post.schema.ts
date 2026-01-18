export const postTypeDefs = /* GraphQL */ `
  enum PostStatus {
    DRAFT
    PUBLISHED
  }

  type Post {
    id: ID!
    title: String!
    content: String!
    status: PostStatus!
    author: User!
    comments: [Comment!]!
    createdAt: String!
    updatedAt: String!
  }

  input CreatePostInput {
    title: String!
    content: String!
  }

  input UpdatePostInput {
    title: String
    content: String
  }

  extend type Query {
    posts(status: PostStatus): [Post!]!
    post(id: ID!): Post
  }

  extend type Mutation {
    createPost(input: CreatePostInput!): Post!
    updatePost(id: ID!, input: UpdatePostInput!): Post
    publishPost(id: ID!): Post
    deletePost(id: ID!): Boolean!
  }
`;
