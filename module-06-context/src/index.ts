import { createServer } from 'node:http';
import { createYoga } from 'graphql-yoga';
import { schema } from './schema/index.js';
import { createContext } from './context/index.js';

const yoga = createYoga({
  schema,
  context: createContext,
  graphiql: {
    title: 'GraphQL Context Demo',
    defaultQuery: `# Try these queries!
# 
# 1. Check request info (no auth needed):
query RequestInfo {
  requestInfo {
    requestId
    timestamp
    ip
    userAgent
    authenticated
  }
}

# 2. Get published posts (no auth needed):
query GetPosts {
  posts {
    id
    title
    author {
      name
    }
  }
}

# 3. To test authenticated queries, add this header:
# { "Authorization": "Bearer user-token-456" }
#
# Then try:
# query Me {
#   me {
#     id
#     name
#     email
#     posts {
#       title
#       published
#     }
#   }
# }
`,
  },
});

const server = createServer(yoga);

const PORT = process.env.PORT || 4000;

server.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}/graphql`);
  console.log(`
📝 Available test tokens:
   - Admin: Bearer admin-token-123
   - User (John): Bearer user-token-456
   - User (Jane): Bearer user-token-789
   
Add to HTTP Headers: { "Authorization": "Bearer <token>" }
  `);
});
