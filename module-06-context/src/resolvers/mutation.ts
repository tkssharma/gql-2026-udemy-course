import { GraphQLError } from 'graphql';
import { GraphQLContext, CreatePostInput, UpdatePostInput } from '../types/index.js';

export const Mutation = {
  // Create a new post (authenticated users only)
  createPost: (
    _: unknown,
    args: { input: CreatePostInput },
    context: GraphQLContext
  ) => {
    const { currentUser, db, logger } = context;
    const { title, content, published = false } = args.input;

    // Check authentication
    if (!currentUser) {
      logger.warn('Unauthenticated attempt to create post');
      throw new GraphQLError('Authentication required', {
        extensions: { code: 'UNAUTHENTICATED' },
      });
    }

    // Validate input
    if (!title || title.trim().length < 3) {
      throw new GraphQLError('Title must be at least 3 characters', {
        extensions: { code: 'VALIDATION_ERROR', field: 'title' },
      });
    }

    if (!content || content.trim().length < 10) {
      throw new GraphQLError('Content must be at least 10 characters', {
        extensions: { code: 'VALIDATION_ERROR', field: 'content' },
      });
    }

    // Create post
    const post = db.posts.create({
      title: title.trim(),
      content: content.trim(),
      authorId: currentUser.id,
      published,
    });

    logger.info('Post created', { postId: post.id, authorId: currentUser.id });

    return {
      success: true,
      message: 'Post created successfully',
      post,
    };
  },

  // Update a post (owner or admin only)
  updatePost: (
    _: unknown,
    args: { id: string; input: UpdatePostInput },
    context: GraphQLContext
  ) => {
    const { currentUser, db, logger } = context;
    const { id, input } = args;

    // Check authentication
    if (!currentUser) {
      throw new GraphQLError('Authentication required', {
        extensions: { code: 'UNAUTHENTICATED' },
      });
    }

    // Find post
    const post = db.posts.findById(id);
    if (!post) {
      throw new GraphQLError('Post not found', {
        extensions: { code: 'NOT_FOUND' },
      });
    }

    // Check authorization (owner or admin)
    if (post.authorId !== currentUser.id && currentUser.role !== 'admin') {
      logger.warn('Unauthorized update attempt', {
        postId: id,
        userId: currentUser.id,
      });
      throw new GraphQLError('Not authorized to update this post', {
        extensions: { code: 'FORBIDDEN' },
      });
    }

    // Validate input
    if (input.title !== undefined && input.title.trim().length < 3) {
      throw new GraphQLError('Title must be at least 3 characters', {
        extensions: { code: 'VALIDATION_ERROR', field: 'title' },
      });
    }

    // Update post
    const updatedPost = db.posts.update(id, {
      ...(input.title !== undefined && { title: input.title.trim() }),
      ...(input.content !== undefined && { content: input.content.trim() }),
      ...(input.published !== undefined && { published: input.published }),
    });

    logger.info('Post updated', { postId: id, updatedBy: currentUser.id });

    return {
      success: true,
      message: 'Post updated successfully',
      post: updatedPost,
    };
  },

  // Delete a post (owner or admin only)
  deletePost: (_: unknown, args: { id: string }, context: GraphQLContext) => {
    const { currentUser, db, logger } = context;
    const { id } = args;

    // Check authentication
    if (!currentUser) {
      throw new GraphQLError('Authentication required', {
        extensions: { code: 'UNAUTHENTICATED' },
      });
    }

    // Find post
    const post = db.posts.findById(id);
    if (!post) {
      throw new GraphQLError('Post not found', {
        extensions: { code: 'NOT_FOUND' },
      });
    }

    // Check authorization (owner or admin)
    if (post.authorId !== currentUser.id && currentUser.role !== 'admin') {
      logger.warn('Unauthorized delete attempt', {
        postId: id,
        userId: currentUser.id,
      });
      throw new GraphQLError('Not authorized to delete this post', {
        extensions: { code: 'FORBIDDEN' },
      });
    }

    // Delete post
    db.posts.delete(id);
    logger.info('Post deleted', { postId: id, deletedBy: currentUser.id });

    return {
      success: true,
      message: 'Post deleted successfully',
    };
  },

  // Publish a post (owner or admin only)
  publishPost: (_: unknown, args: { id: string }, context: GraphQLContext) => {
    const { currentUser, db, logger } = context;
    const { id } = args;

    // Check authentication
    if (!currentUser) {
      throw new GraphQLError('Authentication required', {
        extensions: { code: 'UNAUTHENTICATED' },
      });
    }

    // Find post
    const post = db.posts.findById(id);
    if (!post) {
      throw new GraphQLError('Post not found', {
        extensions: { code: 'NOT_FOUND' },
      });
    }

    // Check authorization (owner or admin)
    if (post.authorId !== currentUser.id && currentUser.role !== 'admin') {
      throw new GraphQLError('Not authorized to publish this post', {
        extensions: { code: 'FORBIDDEN' },
      });
    }

    // Publish post
    const updatedPost = db.posts.update(id, { published: true });
    logger.info('Post published', { postId: id, publishedBy: currentUser.id });

    return {
      success: true,
      message: 'Post published successfully',
      post: updatedPost,
    };
  },
};
