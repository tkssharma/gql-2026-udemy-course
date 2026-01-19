import { prisma } from '../db/prisma.js';
import { GraphQLError } from 'graphql';

interface CreateUserInput {
  email: string;
  name: string;
  role?: 'USER' | 'ADMIN' | 'MODERATOR';
  bio?: string;
}

interface CreatePostInput {
  title: string;
  content?: string;
  authorId: string;
  tags?: string[];
  categoryIds?: string[];
}

export const resolvers = {
  Query: {
    users: () => prisma.user.findMany({ include: { posts: true, profile: true } }),

    user: (_: unknown, args: { id: string }) =>
      prisma.user.findUnique({ where: { id: args.id }, include: { posts: true, profile: true } }),

    posts: (_: unknown, args: { published?: boolean }) =>
      prisma.post.findMany({
        where: args.published !== undefined ? { published: args.published } : undefined,
        include: { author: true, categories: true },
      }),

    post: (_: unknown, args: { id: string }) =>
      prisma.post.findUnique({ where: { id: args.id }, include: { author: true, categories: true } }),

    categories: () => prisma.category.findMany({ include: { posts: true } }),
  },

  Mutation: {
    createUser: async (_: unknown, args: { input: CreateUserInput }) => {
      const { email, name, role, bio } = args.input;
      return prisma.user.create({
        data: {
          email,
          name,
          role: role || 'USER',
          profile: bio ? { create: { bio } } : undefined,
        },
        include: { profile: true },
      });
    },

    createPost: async (_: unknown, args: { input: CreatePostInput }) => {
      const { title, content, authorId, tags, categoryIds } = args.input;
      return prisma.post.create({
        data: {
          title,
          content,
          authorId,
          tags: tags || [],
          categories: categoryIds ? { connect: categoryIds.map((id) => ({ id })) } : undefined,
        },
        include: { author: true, categories: true },
      });
    },

    publishPost: (_: unknown, args: { id: string }) =>
      prisma.post.update({
        where: { id: args.id },
        data: { published: true },
        include: { author: true },
      }),

    createCategory: (_: unknown, args: { name: string }) =>
      prisma.category.create({ data: { name: args.name } }),
  },

  User: {
    posts: (parent: { id: string }) => prisma.post.findMany({ where: { authorId: parent.id } }),
    profile: (parent: { id: string }) => prisma.profile.findUnique({ where: { userId: parent.id } }),
  },

  Post: {
    author: (parent: { authorId: string }) => prisma.user.findUnique({ where: { id: parent.authorId } }),
    categories: (parent: { id: string }) =>
      prisma.category.findMany({ where: { posts: { some: { id: parent.id } } } }),
  },

  Category: {
    posts: (parent: { id: string }) => prisma.post.findMany({ where: { categories: { some: { id: parent.id } } } }),
  },

  JSON: {
    __serialize: (value: unknown) => value,
    __parseValue: (value: unknown) => value,
    __parseLiteral: (ast: unknown) => ast,
  },
};
