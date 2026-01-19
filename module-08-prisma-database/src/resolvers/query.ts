import { GraphQLError } from 'graphql';
import { GraphQLContext } from '../types/index.js';

export const Query = {
  // Get all users (admin only)
  users: async (_: unknown, __: unknown, context: GraphQLContext) => {
    if (!context.currentUser || context.currentUser.role !== 'admin') {
      throw new GraphQLError('Admin access required', {
        extensions: { code: 'FORBIDDEN' },
      });
    }

    return context.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    });
  },

  // Get user by ID
  user: async (_: unknown, args: { id: string }, context: GraphQLContext) => {
    return context.prisma.user.findUnique({
      where: { id: args.id },
    });
  },

  // Get current authenticated user
  me: async (_: unknown, __: unknown, context: GraphQLContext) => {
    if (!context.currentUser) {
      throw new GraphQLError('Authentication required', {
        extensions: { code: 'UNAUTHENTICATED' },
      });
    }

    return context.prisma.user.findUnique({
      where: { id: context.currentUser.id },
    });
  },

  // Get posts (optionally filter by published status)
  posts: async (
    _: unknown,
    args: { published?: boolean },
    context: GraphQLContext
  ) => {
    const where = args.published !== undefined
      ? { published: args.published }
      : { published: true }; // Default to published only

    return context.prisma.post.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  },

  // Get post by ID
  post: async (_: unknown, args: { id: string }, context: GraphQLContext) => {
    const post = await context.prisma.post.findUnique({
      where: { id: args.id },
    });

    // Only show unpublished posts to author or admin
    if (post && !post.published) {
      if (
        !context.currentUser ||
        (context.currentUser.id !== post.authorId &&
          context.currentUser.role !== 'admin')
      ) {
        return null;
      }
    }

    return post;
  },

  // Get current user's posts
  myPosts: async (_: unknown, __: unknown, context: GraphQLContext) => {
    if (!context.currentUser) {
      throw new GraphQLError('Authentication required', {
        extensions: { code: 'UNAUTHENTICATED' },
      });
    }

    return context.prisma.post.findMany({
      where: { authorId: context.currentUser.id },
      orderBy: { createdAt: 'desc' },
    });
  },

  // Get comments for a post
  comments: async (
    _: unknown,
    args: { postId: string },
    context: GraphQLContext
  ) => {
    return context.prisma.comment.findMany({
      where: { postId: args.postId },
      orderBy: { createdAt: 'desc' },
    });
  },
};
