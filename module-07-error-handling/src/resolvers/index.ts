import { Query } from './query.js';
import { Mutation } from './mutation.js';
import { Order_Resolver } from './types.js';

export const resolvers = {
  Query,
  Mutation,
  Order: Order_Resolver,
};
