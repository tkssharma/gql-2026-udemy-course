export const commentTypeDefs = /* GraphQL */ `
  type Comment {
    id: ID!
    content: String!
    author: User!
    post: Post!
    createdAt: String!
    updatedAt: String!
  }

  input CreateCommentInput {
    content: String!
    postId: ID!
  }

  input UpdateCommentInput {
    content: String!
  }

  extend type Query {
    comments: [Comment!]!
    comment(id: ID!): Comment
    commentsByPost(postId: ID!): [Comment!]!
  }

  extend type Mutation {
    createComment(input: CreateCommentInput!): Comment!
    updateComment(id: ID!, input: UpdateCommentInput!): Comment
    deleteComment(id: ID!): Boolean!
  }
`;
