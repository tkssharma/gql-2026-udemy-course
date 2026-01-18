import { GraphQLError } from 'graphql';
import type { Context } from '../../shared/types/index.js';
import type { UserModel, CreateUserInput, UpdateUserInput } from './user.types.js';

export const userResolvers = {
  Query: {
    users: (_: unknown, __: unknown, context: Context): UserModel[] => {
      return context.userService.findAll();
    },

    user: (_: unknown, args: { id: string }, context: Context): UserModel | null => {
      return context.userService.findById(args.id);
    },
  },

  Mutation: {
    createUser: (
      _: unknown,
      args: { input: CreateUserInput },
      context: Context
    ): UserModel => {
      const existing = context.userService.findByEmail(args.input.email);
      if (existing) {
        throw new GraphQLError('Email already in use', {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }
      return context.userService.create(args.input);
    },

    updateUser: (
      _: unknown,
      args: { id: string; input: UpdateUserInput },
      context: Context
    ): UserModel | null => {
      const user = context.userService.findById(args.id);
      if (!user) return null;

      if (args.input.email) {
        const existing = context.userService.findByEmail(args.input.email);
        if (existing && existing.id !== args.id) {
          throw new GraphQLError('Email already in use', {
            extensions: { code: 'BAD_USER_INPUT' },
          });
        }
      }
      return context.userService.update(args.id, args.input);
    },

    deleteUser: (_: unknown, args: { id: string }, context: Context): boolean => {
      return context.userService.delete(args.id);
    },
  },

  User: {
    posts: (parent: UserModel, _: unknown, context: Context) => {
      return context.postService.findByAuthorId(parent.id);
    },

    comments: (parent: UserModel, _: unknown, context: Context) => {
      return context.commentService.findByAuthorId(parent.id);
    },

    createdAt: (parent: UserModel): string => {
      return parent.createdAt.toISOString();
    },

    updatedAt: (parent: UserModel): string => {
      return parent.updatedAt.toISOString();
    },
  },
};
