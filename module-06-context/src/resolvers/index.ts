import { Query } from './query.js';
import { Mutation } from './mutation.js';
import { User_Resolver, Post_Resolver } from './types.js';

export const resolvers = {
  Query,
  Mutation,
  User: User_Resolver,
  Post: Post_Resolver,
};
