import { createServer } from 'node:http';
import { createYoga } from 'graphql-yoga';
import { schema } from './schema/index.js';
import type { Context } from './shared/types/index.js';
import { UserService } from './modules/user/index.js';
import { PostService } from './modules/post/index.js';
import { CommentService } from './modules/comment/index.js';

// Instantiate services
const userService = new UserService();
const postService = new PostService();
const commentService = new CommentService();

// Create Yoga instance with typed context
const yoga = createYoga<{}, Context>({
  schema,
  context: async ({ request }) => ({
    request,
    userService,
    postService,
    commentService,
  }),
  graphiql: {
    title: 'User Post Comment API',
  },
});

// Create HTTP server
const server = createServer(yoga);

// Get port from environment or default
const PORT = process.env.PORT || 4000;

// Start server
server.listen(PORT, () => {
  console.log(`🧘 Server is running on http://localhost:${PORT}/graphql`);
});
