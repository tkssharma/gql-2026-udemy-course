import type { Context } from '../context/index.js';
import type { UserModel } from '../types/index.js';

interface UserArgs {
  id: string;
}

export const Query = {
  users: (_: unknown, __: unknown, context: Context): UserModel[] => {
    return context.userRepository.findAll();
  },

  user: (_: unknown, args: UserArgs, context: Context): UserModel | null => {
    return context.userRepository.findById(args.id);
  },
};
