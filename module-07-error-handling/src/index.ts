import { createServer } from 'node:http';
import { createYoga } from 'graphql-yoga';
import { schema } from './schema/index.js';
import { GraphQLContext, User } from './types/index.js';
import { users } from './data/index.js';

// Simulated token validation
const validateToken = (token: string): User | null => {
  const tokenMap: Record<string, string> = {
    'admin-token': '1',
    'user-token': '2',
    'jane-token': '3',
  };
  const userId = tokenMap[token];
  return userId ? users.find((u) => u.id === userId) || null : null;
};

const yoga = createYoga({
  schema,
  context: async ({ request }): Promise<GraphQLContext> => {
    const authHeader = request.headers.get('authorization');
    let currentUser: User | null = null;

    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.slice(7);
      currentUser = validateToken(token);
    }

    return { currentUser };
  },
  // Custom error masking - control what errors are exposed to clients
  maskedErrors: {
    maskError: (error, message, isDev) => {
      // In development, show full errors
      if (isDev) {
        return error;
      }
      // In production, mask unexpected errors
      return error;
    },
  },
  graphiql: {
    title: 'GraphQL Error Handling Demo',
    defaultQuery: `# Error Handling Demo
# 
# Test different error scenarios:

# 1. Not Found Error
query NotFound {
  userOrError(id: "999") {
    id
    name
  }
}

# 2. Authentication Error (no token)
# query RequiresAuth {
#   me {
#     id
#     name
#   }
# }

# 3. Partial Response (some succeed, some fail)
# query PartialResponse {
#   batchUsers(ids: ["1", "2", "999", "3", "888"]) {
#     users {
#       user {
#         id
#         name
#       }
#       error
#     }
#     successCount
#     errorCount
#   }
# }

# 4. Validation Error
# Add header: { "Authorization": "Bearer user-token" }
# mutation ValidationError {
#   createOrder(input: { productId: "1", quantity: -5 }) {
#     success
#     message
#   }
# }

# 5. Insufficient Stock Error
# Add header: { "Authorization": "Bearer user-token" }
# mutation InsufficientStock {
#   createOrder(input: { productId: "3", quantity: 1 }) {
#     success
#     message
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
📝 Test tokens:
   - Admin: Bearer admin-token
   - User (John): Bearer user-token
   - User (Jane): Bearer jane-token
   
Add to HTTP Headers: { "Authorization": "Bearer <token>" }
  `);
});
