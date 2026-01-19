import { GraphQLError } from 'graphql';
import {
  GraphQLContext,
  CreateUserInput,
  UpdateUserInput,
  CreatePostInput,
  UpdatePostInput,
  CreateCommentInput,
} from '../types/index.js';

// Helper to check authentication
const requireAuth = (context: GraphQLContext) => {
  if (!context.currentUser) {
    throw new GraphQLError('Authentication required', {
      extensions: { code: 'UNAUTHENTICATED' },
    });
  }
  return context.currentUser;
};

// Helper to check admin role
const requireAdmin = (context: GraphQLContext) => {
  const user = requireAuth(context);
  if (user.role !== 'admin') {
    throw new GraphQLError('Admin access required', {
      extensions: { code: 'FORBIDDEN' },
    });
  }
  return user;
};

export const Mutation = {
  // Create user (admin only)
  createUser: async (
    _: unknown,
    args: { input: CreateUserInput },
    context: GraphQLContext
  ) => {
    requireAdmin(context);

    const { email, name, role = 'user' } = args.input;

    // Check if email already exists
    const existing = await context.prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      throw new GraphQLError(`User with email "${email}" already exists`, {
        extensions: { code: 'CONFLICT' },
      });
    }

    const user = await context.prisma.user.create({
      data: { email, name, role },
    });

    return {
      success: true,
      message: 'User created successfully',
      user,
    };
  },

  // Update user (admin only)
  updateUser: async (
    _: unknown,
    args: { id: string; input: UpdateUserInput },
    context: GraphQLContext
  ) => {
    requireAdmin(context);

    const user = await context.prisma.user.findUnique({
      where: { id: args.id },
    });

    if (!user) {
      throw new GraphQLError('User not found', {
        extensions: { code: 'NOT_FOUND' },
      });
    }

    const updated = await context.prisma.user.update({
      where: { id: args.id },
      data: args.input,
    });

    return {
      success: true,
      message: 'User updated successfully',
      user: updated,
    };
  },

  // Delete user (admin only)
  deleteUser: async (
    _: unknown,
    args: { id: string },
    context: GraphQLContext
  ) => {
    requireAdmin(context);

    const user = await context.prisma.user.findUnique({
      where: { id: args.id },
    });

    if (!user) {
      throw new GraphQLError('User not found', {
        extensions: { code: 'NOT_FOUND' },
      });
    }

    await context.prisma.user.delete({
      where: { id: args.id },
    });

    return {
      success: true,
      message: 'User deleted successfully',
    };
  },

  // Create post
  createPost: async (
    _: unknown,
    args: { input: CreatePostInput },
    context: GraphQLContext
  ) => {
    const user = requireAuth(context);

    const { title, content, published = false } = args.input;

    if (!title || title.trim().length < 3) {
      throw new GraphQLError('Title must be at least 3 characters', {
        extensions: { code: 'VALIDATION_ERROR', field: 'title' },
      });
    }

    const post = await context.prisma.post.create({
      data: {
        title: title.trim(),
        content: content.trim(),
        published,
        authorId: user.id,
      },
    });

    return {
      success: true,
      message: 'Post created successfully',
      post,
    };
  },

  // Update post (owner or admin)
  updatePost: async (
    _: unknown,
    args: { id: string; input: UpdatePostInput },
    context: GraphQLContext
  ) => {
    const user = requireAuth(context);

    const post = await context.prisma.post.findUnique({
      where: { id: args.id },
    });

    if (!post) {
      throw new GraphQLError('Post not found', {
        extensions: { code: 'NOT_FOUND' },
      });
    }

    // Check ownership
    if (post.authorId !== user.id && user.role !== 'admin') {
      throw new GraphQLError('Not authorized to update this post', {
        extensions: { code: 'FORBIDDEN' },
      });
    }

    const updated = await context.prisma.post.update({
      where: { id: args.id },
      data: {
        ...(args.input.title && { title: args.input.title.trim() }),
        ...(args.input.content && { content: args.input.content.trim() }),
        ...(args.input.published !== undefined && { published: args.input.published }),
      },
    });

    return {
      success: true,
      message: 'Post updated successfully',
      post: updated,
    };
  },

  // Delete post (owner or admin)
  deletePost: async (
    _: unknown,
    args: { id: string },
    context: GraphQLContext
  ) => {
    const user = requireAuth(context);

    const post = await context.prisma.post.findUnique({
      where: { id: args.id },
    });

    if (!post) {
      throw new GraphQLError('Post not found', {
        extensions: { code: 'NOT_FOUND' },
      });
    }

    if (post.authorId !== user.id && user.role !== 'admin') {
      throw new GraphQLError('Not authorized to delete this post', {
        extensions: { code: 'FORBIDDEN' },
      });
    }

    await context.prisma.post.delete({
      where: { id: args.id },
    });

    return {
      success: true,
      message: 'Post deleted successfully',
    };
  },

  // Publish post
  publishPost: async (
    _: unknown,
    args: { id: string },
    context: GraphQLContext
  ) => {
    const user = requireAuth(context);

    const post = await context.prisma.post.findUnique({
      where: { id: args.id },
    });

    if (!post) {
      throw new GraphQLError('Post not found', {
        extensions: { code: 'NOT_FOUND' },
      });
    }

    if (post.authorId !== user.id && user.role !== 'admin') {
      throw new GraphQLError('Not authorized to publish this post', {
        extensions: { code: 'FORBIDDEN' },
      });
    }

    const updated = await context.prisma.post.update({
      where: { id: args.id },
      data: { published: true },
    });

    return {
      success: true,
      message: 'Post published successfully',
      post: updated,
    };
  },

  // Unpublish post
  unpublishPost: async (
    _: unknown,
    args: { id: string },
    context: GraphQLContext
  ) => {
    const user = requireAuth(context);

    const post = await context.prisma.post.findUnique({
      where: { id: args.id },
    });

    if (!post) {
      throw new GraphQLError('Post not found', {
        extensions: { code: 'NOT_FOUND' },
      });
    }

    if (post.authorId !== user.id && user.role !== 'admin') {
      throw new GraphQLError('Not authorized to unpublish this post', {
        extensions: { code: 'FORBIDDEN' },
      });
    }

    const updated = await context.prisma.post.update({
      where: { id: args.id },
      data: { published: false },
    });

    return {
      success: true,
      message: 'Post unpublished successfully',
      post: updated,
    };
  },

  // Create comment
  createComment: async (
    _: unknown,
    args: { input: CreateCommentInput },
    context: GraphQLContext
  ) => {
    const user = requireAuth(context);

    const { content, postId } = args.input;

    // Check if post exists and is published
    const post = await context.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new GraphQLError('Post not found', {
        extensions: { code: 'NOT_FOUND' },
      });
    }

    if (!post.published) {
      throw new GraphQLError('Cannot comment on unpublished post', {
        extensions: { code: 'FORBIDDEN' },
      });
    }

    const comment = await context.prisma.comment.create({
      data: {
        content: content.trim(),
        authorId: user.id,
        postId,
      },
    });

    return {
      success: true,
      message: 'Comment created successfully',
      comment,
    };
  },

  // Delete comment (owner or admin)
  deleteComment: async (
    _: unknown,
    args: { id: string },
    context: GraphQLContext
  ) => {
    const user = requireAuth(context);

    const comment = await context.prisma.comment.findUnique({
      where: { id: args.id },
    });

    if (!comment) {
      throw new GraphQLError('Comment not found', {
        extensions: { code: 'NOT_FOUND' },
      });
    }

    if (comment.authorId !== user.id && user.role !== 'admin') {
      throw new GraphQLError('Not authorized to delete this comment', {
        extensions: { code: 'FORBIDDEN' },
      });
    }

    await context.prisma.comment.delete({
      where: { id: args.id },
    });

    return {
      success: true,
      message: 'Comment deleted successfully',
    };
  },
};
