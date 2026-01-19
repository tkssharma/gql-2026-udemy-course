import { prisma } from '../db/prisma.js';

export const resolvers = {
  Query: {
    users: () => prisma.user.findMany({ include: { posts: true } }),
    user: (_: unknown, args: { id: number }) =>
      prisma.user.findUnique({ where: { id: args.id }, include: { posts: true } }),
    posts: () => prisma.post.findMany({ where: { published: true }, include: { author: true } }),
    post: (_: unknown, args: { id: number }) =>
      prisma.post.findUnique({ where: { id: args.id }, include: { author: true } }),
  },

  Mutation: {
    createUser: (_: unknown, args: { email: string; name: string }) =>
      prisma.user.create({ data: { email: args.email, name: args.name } }),

    createPost: (_: unknown, args: { title: string; content?: string; authorId: number }) =>
      prisma.post.create({
        data: { title: args.title, content: args.content, authorId: args.authorId },
        include: { author: true },
      }),

    publishPost: (_: unknown, args: { id: number }) =>
      prisma.post.update({ where: { id: args.id }, data: { published: true }, include: { author: true } }),
  },

  User: {
    posts: (parent: { id: number }) => prisma.post.findMany({ where: { authorId: parent.id } }),
  },

  Post: {
    author: (parent: { authorId: number }) => prisma.user.findUnique({ where: { id: parent.authorId } }),
  },
};
