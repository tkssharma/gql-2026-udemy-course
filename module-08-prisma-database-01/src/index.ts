import { createServer } from 'node:http';
import { createYoga } from 'graphql-yoga';
import { schema } from './schema/index.js';

const yoga = createYoga({
  schema,
  graphiql: {
    title: 'Prisma SQLite Demo',
    defaultQuery: `# Prisma with SQLite Demo
#
# Query all users
query GetUsers {
  users {
    id
    name
    email
    posts {
      title
      published
    }
  }
}

# Query all published posts
# query GetPosts {
#   posts {
#     id
#     title
#     author {
#       name
#     }
#   }
# }

# Create a new user
# mutation CreateUser {
#   createUser(email: "new@example.com", name: "New User") {
#     id
#     name
#     email
#   }
# }

# Create a post
# mutation CreatePost {
#   createPost(title: "My Post", content: "Content here", authorId: 1) {
#     id
#     title
#     author {
#       name
#     }
#   }
# }
`,
  },
});

const server = createServer(yoga);

server.listen(4000, () => {
  console.log('🚀 Server running at http://localhost:4000/graphql');
});
