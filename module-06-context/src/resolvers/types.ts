import { GraphQLContext, User, Post } from '../types/index.js';

// Field resolvers for nested types
export const User_Resolver = {
  // Resolve posts for a user
  posts: (parent: User, _: unknown, context: GraphQLContext): Post[] => {
    const { db, currentUser } = context;
    const posts = db.posts.findByAuthor(parent.id);

    // Only show unpublished posts to owner or admin
    if (currentUser?.id === parent.id || currentUser?.role === 'admin') {
      return posts;
    }

    return posts.filter((post) => post.published);
  },
};

export const Post_Resolver = {
  // Resolve author for a post
  author: (parent: Post, _: unknown, context: GraphQLContext): User | undefined => {
    const { db } = context;
    return db.users.findById(parent.authorId);
  },
};
