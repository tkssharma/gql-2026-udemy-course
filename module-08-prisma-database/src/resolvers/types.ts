import { GraphQLContext } from '../types/index.js';

// Field resolvers for nested types

// User field resolvers
export const User = {
  posts: async (parent: { id: string }, _: unknown, context: GraphQLContext) => {
    return context.prisma.post.findMany({
      where: { authorId: parent.id },
      orderBy: { createdAt: 'desc' },
    });
  },

  comments: async (parent: { id: string }, _: unknown, context: GraphQLContext) => {
    return context.prisma.comment.findMany({
      where: { authorId: parent.id },
      orderBy: { createdAt: 'desc' },
    });
  },
};

// Post field resolvers
export const Post = {
  author: async (parent: { authorId: string }, _: unknown, context: GraphQLContext) => {
    return context.prisma.user.findUnique({
      where: { id: parent.authorId },
    });
  },

  comments: async (parent: { id: string }, _: unknown, context: GraphQLContext) => {
    return context.prisma.comment.findMany({
      where: { postId: parent.id },
      orderBy: { createdAt: 'desc' },
    });
  },
};

// Comment field resolvers
export const Comment = {
  author: async (parent: { authorId: string }, _: unknown, context: GraphQLContext) => {
    return context.prisma.user.findUnique({
      where: { id: parent.authorId },
    });
  },

  post: async (parent: { postId: string }, _: unknown, context: GraphQLContext) => {
    return context.prisma.post.findUnique({
      where: { id: parent.postId },
    });
  },
};
