import { PrismaClient } from '@prisma/client';

// GraphQL Context type with Prisma
export interface GraphQLContext {
  prisma: PrismaClient;
}
