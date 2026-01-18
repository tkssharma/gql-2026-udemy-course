import { createSchema } from 'graphql-yoga';
import { typeDefs } from './typeDefs';
import { resolvers } from '../resolver';

export const schema = createSchema({
  typeDefs,
  resolvers
});