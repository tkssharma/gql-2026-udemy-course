export const typeDefs = /* GraphQL */ `
  # User type
  type User {
    id: ID!
    name: String!
    email: String!
    role: String!
    createdAt: String!
    posts: [Post!]!
  }

  # Post type
  type Post {
    id: ID!
    title: String!
    content: String!
    published: Boolean!
    createdAt: String!
    author: User!
  }

  # Request info (demonstrates request-scoped data)
  type RequestInfo {
    requestId: String!
    timestamp: String!
    ip: String!
    userAgent: String!
    authenticated: Boolean!
    currentUser: User
  }

  # Input types
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

  # Mutation responses
  type PostMutationResponse {
    success: Boolean!
    message: String!
    post: Post
  }

  type DeleteResponse {
    success: Boolean!
    message: String!
  }

  # Queries
  type Query {
    # Get current request info (demonstrates context access)
    requestInfo: RequestInfo!
    
    # Get current authenticated user
    me: User
    
    # Get all users (admin only)
    users: [User!]!
    
    # Get user by ID
    user(id: ID!): User
    
    # Get all published posts
    posts: [Post!]!
    
    # Get post by ID
    post(id: ID!): Post
    
    # Get my posts (authenticated)
    myPosts: [Post!]!
  }

  # Mutations
  type Mutation {
    # Create a new post (authenticated)
    createPost(input: CreatePostInput!): PostMutationResponse!
    
    # Update a post (owner or admin)
    updatePost(id: ID!, input: UpdatePostInput!): PostMutationResponse!
    
    # Delete a post (owner or admin)
    deletePost(id: ID!): DeleteResponse!
    
    # Publish a post (owner or admin)
    publishPost(id: ID!): PostMutationResponse!
  }
`;
