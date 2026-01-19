import { GraphQLContext } from '../types/index.js';

export const resolvers = {
  Query: {
    // Access Prisma through context.prisma
    users: (_: unknown, __: unknown, context: GraphQLContext) =>
      context.prisma.user.findMany({ include: { posts: true } }),

    user: (_: unknown, args: { id: number }, context: GraphQLContext) =>
      context.prisma.user.findUnique({ where: { id: args.id }, include: { posts: true } }),

    posts: (_: unknown, __: unknown, context: GraphQLContext) =>
      context.prisma.post.findMany({ where: { published: true }, include: { author: true } }),

    post: (_: unknown, args: { id: number }, context: GraphQLContext) =>
      context.prisma.post.findUnique({ where: { id: args.id }, include: { author: true } }),
  },

  Mutation: {
    createUser: (_: unknown, args: { email: string; name: string }, context: GraphQLContext) =>
      context.prisma.user.create({ data: { email: args.email, name: args.name } }),

    createPost: (_: unknown, args: { title: string; content?: string; authorId: number }, context: GraphQLContext) =>
      context.prisma.post.create({
        data: { title: args.title, content: args.content, authorId: args.authorId },
        include: { author: true },
      }),

    publishPost: (_: unknown, args: { id: number }, context: GraphQLContext) =>
      context.prisma.post.update({ where: { id: args.id }, data: { published: true }, include: { author: true } }),
  },

  User: {
    posts: (parent: { id: number }, _: unknown, context: GraphQLContext) =>
      context.prisma.post.findMany({ where: { authorId: parent.id } }),
  },

  Post: {
    author: (parent: { authorId: number }, _: unknown, context: GraphQLContext) =>
      context.prisma.user.findUnique({ where: { id: parent.authorId } }),
  },
};
