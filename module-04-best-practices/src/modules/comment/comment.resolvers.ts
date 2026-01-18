import { GraphQLError } from 'graphql';
import type { Context } from '../../shared/types/index.js';
import type { CommentModel, CreateCommentInput, UpdateCommentInput } from './comment.types.js';

export const commentResolvers = {
  Query: {
    comments: (_: unknown, __: unknown, context: Context): CommentModel[] => {
      return context.commentService.findAll();
    },

    comment: (_: unknown, args: { id: string }, context: Context): CommentModel | null => {
      return context.commentService.findById(args.id);
    },

    commentsByPost: (
      _: unknown,
      args: { postId: string },
      context: Context
    ): CommentModel[] => {
      return context.commentService.findByPostId(args.postId);
    },
  },

  Mutation: {
    createComment: (
      _: unknown,
      args: { input: CreateCommentInput },
      context: Context
    ): CommentModel => {
      // Verify post exists
      const post = context.postService.findById(args.input.postId);
      if (!post) {
        throw new GraphQLError('Post not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      // For demo, use user "1" as the author
      // In real app, get from context.currentUser
      const authorId = '1';
      return context.commentService.create(authorId, args.input);
    },

    updateComment: (
      _: unknown,
      args: { id: string; input: UpdateCommentInput },
      context: Context
    ): CommentModel | null => {
      const comment = context.commentService.findById(args.id);
      if (!comment) return null;
      return context.commentService.update(args.id, args.input);
    },

    deleteComment: (_: unknown, args: { id: string }, context: Context): boolean => {
      return context.commentService.delete(args.id);
    },
  },

  Comment: {
    author: (parent: CommentModel, _: unknown, context: Context) => {
      const author = context.userService.findById(parent.authorId);
      if (!author) {
        throw new GraphQLError('Author not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }
      return author;
    },

    post: (parent: CommentModel, _: unknown, context: Context) => {
      const post = context.postService.findById(parent.postId);
      if (!post) {
        throw new GraphQLError('Post not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }
      return post;
    },

    createdAt: (parent: CommentModel): string => {
      return parent.createdAt.toISOString();
    },

    updatedAt: (parent: CommentModel): string => {
      return parent.updatedAt.toISOString();
    },
  },
};
