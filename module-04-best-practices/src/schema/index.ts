import { createSchema } from 'graphql-yoga';
import { mergeTypeDefs, mergeResolvers } from '@graphql-tools/merge';

import { baseTypeDefs } from './base.js';
import { userTypeDefs, userResolvers } from '../modules/user/index.js';
import { postTypeDefs, postResolvers } from '../modules/post/index.js';
import { commentTypeDefs, commentResolvers } from '../modules/comment/index.js';

const typeDefs = mergeTypeDefs([
  baseTypeDefs,
  userTypeDefs,
  postTypeDefs,
  commentTypeDefs,
]);

const resolvers = mergeResolvers([
  userResolvers,
  postResolvers,
  commentResolvers,
]);

export const schema = createSchema({
  typeDefs,
  resolvers,
});
