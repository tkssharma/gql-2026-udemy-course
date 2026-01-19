import { createServer } from 'node:http';
import { createYoga } from 'graphql-yoga';
import { schema } from './schema/index.js';
import { createContext } from './context/index.js';

const yoga = createYoga({
  schema,
  context: createContext,
  graphiql: {
    title: 'JWT Auth Context Demo',
    defaultQuery: `# JWT Authentication Demo
#
# 1. Public query (no auth needed):
query GetUsers {
  users {
    id
    name
    email
    role
  }
}

# 2. Protected query - requires JWT token
# Add header: { "Authorization": "Bearer john-jwt-token" }
# query Me {
#   me {
#     id
#     name
#     email
#     role
#   }
# }

# 3. Admin only query
# Add header: { "Authorization": "Bearer admin-jwt-token" }
# query AdminOnly {
#   adminOnly
# }

# 4. Try with wrong token - will get UNAUTHENTICATED error
# Add header: { "Authorization": "Bearer invalid-token" }
# query Me {
#   me { id name }
# }
`,
  },
});

const server = createServer(yoga);

const PORT = process.env.PORT || 4000;

server.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}/graphql`);
  console.log(`
🔐 JWT Authentication Demo

Test tokens (add to Authorization header):
   - Admin:  Bearer admin-jwt-token
   - John:   Bearer john-jwt-token
   - Jane:   Bearer jane-jwt-token

Example header: { "Authorization": "Bearer john-jwt-token" }
  `);
});
