import { GraphQLError } from 'graphql';
import type { Context } from '../context/index.js';
import type { UserModel, CreateUserData, UpdateUserData } from '../types/index.js';

interface CreateUserArgs {
  input: CreateUserData;
}

interface UpdateUserArgs {
  id: string;
  input: UpdateUserData;
}

interface DeleteUserArgs {
  id: string;
}

export const Mutation = {
  createUser: (_: unknown, args: CreateUserArgs, context: Context): UserModel => {
    // Check if email already exists
    const existing = context.userRepository.findByEmail(args.input.email);
    if (existing) {
      throw new GraphQLError('Email already in use', {
        extensions: { code: 'BAD_USER_INPUT' },
      });
    }

    return context.userRepository.create(args.input);
  },

  updateUser: (
    _: unknown,
    args: UpdateUserArgs,
    context: Context
  ): UserModel | null => {
    // Check if user exists
    const user = context.userRepository.findById(args.id);
    if (!user) {
      return null;
    }

    // Check email uniqueness if updating email
    if (args.input.email) {
      const existing = context.userRepository.findByEmail(args.input.email);
      if (existing && existing.id !== args.id) {
        throw new GraphQLError('Email already in use', {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }
    }

    return context.userRepository.update(args.id, args.input);
  },

  deleteUser: (_: unknown, args: DeleteUserArgs, context: Context): boolean => {
    return context.userRepository.delete(args.id);
  },
};
