import type { YogaInitialContext } from 'graphql-yoga';
import type { UserService } from '../../modules/user/user.service.js';
import type { PostService } from '../../modules/post/post.service.js';
import type { CommentService } from '../../modules/comment/comment.service.js';

export interface Context {
  request: Request;
  userService: UserService;
  postService: PostService;
  commentService: CommentService;
}

export type ContextFactory = (initialContext: YogaInitialContext) => Promise<Context>;
