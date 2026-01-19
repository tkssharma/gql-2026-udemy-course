export const typeDefs = /* GraphQL */ `
  # User type
  type User {
    id: ID!
    email: String!
    name: String!
    role: String!
    createdAt: String!
    posts: [Post!]!
    comments: [Comment!]!
  }

  # Post type
  type Post {
    id: ID!
    title: String!
    content: String!
    published: Boolean!
    createdAt: String!
    updatedAt: String!
    author: User!
    comments: [Comment!]!
  }

  # Comment type
  type Comment {
    id: ID!
    content: String!
    createdAt: String!
    author: User!
    post: Post!
  }

  # Input types
  input CreateUserInput {
    email: String!
    name: String!
    role: String
  }

  input UpdateUserInput {
    email: String
    name: String
  }

  input CreatePostInput {
    title: String!
    content: String!
    published: Boolean
  }

  input UpdatePostInput {
    title: String
    content: String
    published: Boolean
  }

  input CreateCommentInput {
    content: String!
    postId: ID!
  }

  # Mutation responses
  type MutationResponse {
    success: Boolean!
    message: String!
  }

  type UserMutationResponse {
    success: Boolean!
    message: String!
    user: User
  }

  type PostMutationResponse {
    success: Boolean!
    message: String!
    post: Post
  }

  type CommentMutationResponse {
    success: Boolean!
    message: String!
    comment: Comment
  }

  # Queries
  type Query {
    # User queries
    users: [User!]!
    user(id: ID!): User
    me: User

    # Post queries
    posts(published: Boolean): [Post!]!
    post(id: ID!): Post
    myPosts: [Post!]!

    # Comment queries
    comments(postId: ID!): [Comment!]!
  }

  # Mutations
  type Mutation {
    # User mutations (admin only)
    createUser(input: CreateUserInput!): UserMutationResponse!
    updateUser(id: ID!, input: UpdateUserInput!): UserMutationResponse!
    deleteUser(id: ID!): MutationResponse!

    # Post mutations
    createPost(input: CreatePostInput!): PostMutationResponse!
    updatePost(id: ID!, input: UpdatePostInput!): PostMutationResponse!
    deletePost(id: ID!): MutationResponse!
    publishPost(id: ID!): PostMutationResponse!
    unpublishPost(id: ID!): PostMutationResponse!

    # Comment mutations
    createComment(input: CreateCommentInput!): CommentMutationResponse!
    deleteComment(id: ID!): MutationResponse!
  }
`;
