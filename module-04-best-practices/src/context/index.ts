import type { YogaInitialContext } from 'graphql-yoga';
import type { UserService } from '../modules/user/user.service.js';
import type { PostService } from '../modules/post/post.service.js';
import type { CommentService } from '../modules/comment/comment.service.js';

/**
 * Context interface - available in all resolvers
 */
export interface Context {
  // Request info
  request: Request;

  // Services (business logic)
  userService: UserService;
  postService: PostService;
  commentService: CommentService;
}
