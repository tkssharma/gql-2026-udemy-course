import { GraphQLError } from 'graphql';
import { GraphQLContext } from '../types/index.js';

export const Query = {
  // Get request info - demonstrates accessing request-scoped data
  requestInfo: (_: unknown, __: unknown, context: GraphQLContext) => {
    const { request, currentUser, db } = context;

    return {
      requestId: request.requestId,
      timestamp: new Date(request.startTime).toISOString(),
      ip: request.ip,
      userAgent: request.userAgent,
      authenticated: !!currentUser,
      currentUser: currentUser ? db.users.findById(currentUser.id) : null,
    };
  },

  // Get current authenticated user
  me: (_: unknown, __: unknown, context: GraphQLContext) => {
    const { currentUser, db, logger } = context;

    if (!currentUser) {
      logger.info('Unauthenticated access to me query');
      return null;
    }

    logger.info('Fetching current user', { userId: currentUser.id });
    return db.users.findById(currentUser.id);
  },

  // Get all users (admin only)
  users: (_: unknown, __: unknown, context: GraphQLContext) => {
    const { currentUser, db, logger } = context;

    if (!currentUser || currentUser.role !== 'admin') {
      logger.warn('Unauthorized access attempt to users query', {
        userId: currentUser?.id,
      });
      throw new GraphQLError('Admin access required', {
        extensions: { code: 'FORBIDDEN' },
      });
    }

    logger.info('Admin fetching all users');
    return db.users.findAll();
  },

  // Get user by ID
  user: (_: unknown, args: { id: string }, context: GraphQLContext) => {
    const { db, logger } = context;

    logger.info('Fetching user by ID', { userId: args.id });
    return db.users.findById(args.id);
  },

  // Get all published posts
  posts: (_: unknown, __: unknown, context: GraphQLContext) => {
    const { db, logger } = context;

    logger.info('Fetching published posts');
    return db.posts.findAll().filter((post) => post.published);
  },

  // Get post by ID
  post: (_: unknown, args: { id: string }, context: GraphQLContext) => {
    const { db, logger, currentUser } = context;

    logger.info('Fetching post by ID', { postId: args.id });
    const post = db.posts.findById(args.id);

    // Only return unpublished posts to owner or admin
    if (post && !post.published) {
      if (!currentUser || (currentUser.id !== post.authorId && currentUser.role !== 'admin')) {
        return null;
      }
    }

    return post;
  },

  // Get my posts (authenticated)
  myPosts: (_: unknown, __: unknown, context: GraphQLContext) => {
    const { currentUser, db, logger } = context;

    if (!currentUser) {
      throw new GraphQLError('Authentication required', {
        extensions: { code: 'UNAUTHENTICATED' },
      });
    }

    logger.info('Fetching user posts', { userId: currentUser.id });
    return db.posts.findByAuthor(currentUser.id);
  },
};
