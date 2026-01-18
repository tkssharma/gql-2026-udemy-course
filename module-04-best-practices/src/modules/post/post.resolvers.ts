import { GraphQLError } from 'graphql';
import type { Context } from '../../shared/types/index.js';
import type { PostModel, PostStatus, CreatePostInput, UpdatePostInput } from './post.types.js';

export const postResolvers = {
  Query: {
    posts: (
      _: unknown,
      args: { status?: PostStatus },
      context: Context
    ): PostModel[] => {
      if (args.status) {
        return context.postService.findByStatus(args.status);
      }
      return context.postService.findAll();
    },

    post: (_: unknown, args: { id: string }, context: Context): PostModel | null => {
      return context.postService.findById(args.id);
    },
  },

  Mutation: {
    createPost: (
      _: unknown,
      args: { input: CreatePostInput },
      context: Context
    ): PostModel => {
      // For demo, use user "1" as the author
      // In real app, get from context.currentUser
      const authorId = '1';
      return context.postService.create(authorId, args.input);
    },

    updatePost: (
      _: unknown,
      args: { id: string; input: UpdatePostInput },
      context: Context
    ): PostModel | null => {
      const post = context.postService.findById(args.id);
      if (!post) return null;
      return context.postService.update(args.id, args.input);
    },

    publishPost: (_: unknown, args: { id: string }, context: Context): PostModel | null => {
      const post = context.postService.findById(args.id);
      if (!post) {
        throw new GraphQLError('Post not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }
      return context.postService.publish(args.id);
    },

    deletePost: (_: unknown, args: { id: string }, context: Context): boolean => {
      return context.postService.delete(args.id);
    },
  },

  Post: {
    author: (parent: PostModel, _: unknown, context: Context) => {
      const author = context.userService.findById(parent.authorId);
      if (!author) {
        throw new GraphQLError('Author not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }
      return author;
    },

    comments: (parent: PostModel, _: unknown, context: Context) => {
      return context.commentService.findByPostId(parent.id);
    },

    createdAt: (parent: PostModel): string => {
      return parent.createdAt.toISOString();
    },

    updatedAt: (parent: PostModel): string => {
      return parent.updatedAt.toISOString();
    },
  },
};
