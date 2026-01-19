import { createServer } from 'node:http';
import { createYoga } from 'graphql-yoga';
import { schema } from './schema/index.js';
import { createContext } from './context/index.js';

const yoga = createYoga({
  schema,
  context: createContext,
  graphiql: {
    title: 'GraphQL Prisma Demo',
    defaultQuery: `# Prisma Database Demo
#
# Test tokens (add to HTTP Headers):
# { "Authorization": "Bearer admin-token" }
# { "Authorization": "Bearer john-token" }
# { "Authorization": "Bearer jane-token" }

# Get all published posts
query GetPosts {
  posts {
    id
    title
    published
    author {
      name
    }
    comments {
      content
      author {
        name
      }
    }
  }
}

# Get current user (requires auth)
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

# Create a post (requires auth)
# mutation CreatePost {
#   createPost(input: {
#     title: "My New Post"
#     content: "This is the content..."
#     published: false
#   }) {
#     success
#     message
#     post {
#       id
#       title
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
📝 Test tokens:
   - Admin: Bearer admin-token
   - John:  Bearer john-token
   - Jane:  Bearer jane-token

🗄️  Database: SQLite (prisma/dev.db)

📋 Setup commands:
   npm run db:push    - Create/update database
   npm run db:seed    - Seed with sample data
   npm run db:studio  - Open Prisma Studio
  `);
});
