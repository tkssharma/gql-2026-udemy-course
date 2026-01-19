import { createServer } from 'node:http';
import { createYoga } from 'graphql-yoga';
import { schema } from './schema/index.js';

const yoga = createYoga({
  schema,
  graphiql: {
    title: 'Prisma PostgreSQL Demo',
    defaultQuery: `# Prisma with PostgreSQL Demo
#
# Query all users with profiles
query GetUsers {
  users {
    id
    name
    email
    role
    profile {
      bio
      avatar
    }
    posts {
      title
      published
    }
  }
}

# Query posts with categories
# query GetPosts {
#   posts(published: true) {
#     id
#     title
#     tags
#     metadata
#     author {
#       name
#     }
#     categories {
#       name
#     }
#   }
# }

# Create user with profile
# mutation CreateUser {
#   createUser(input: {
#     email: "new@example.com"
#     name: "New User"
#     role: ADMIN
#     bio: "Developer"
#   }) {
#     id
#     name
#     role
#     profile {
#       bio
#     }
#   }
# }

# Create post with tags and categories
# mutation CreatePost {
#   createPost(input: {
#     title: "My Post"
#     content: "Content here"
#     authorId: "user-id-here"
#     tags: ["graphql", "prisma"]
#   }) {
#     id
#     title
#     tags
#   }
# }
`,
  },
});

const server = createServer(yoga);

server.listen(4000, () => {
  console.log('🚀 Server running at http://localhost:4000/graphql');
  console.log('📦 Using PostgreSQL database');
});
