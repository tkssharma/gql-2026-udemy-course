import { createServer } from 'node:http';
import { createYoga } from 'graphql-yoga';
import { schema } from './schema/index.js';
import { createContext } from './context/index.js';

const yoga = createYoga({
  schema,
  context: createContext,
  graphiql: {
    title: 'Context Basic Demo',
    defaultQuery: `# Simple Context Demo
# 
# The database is passed via context to resolvers

# Get all users from database
query GetUsers {
  users {
    id
    name
    email
  }
}

# Get single user by ID
query GetUser {
  user(id: "1") {
    id
    name
    email
  }
}
`,
  },
});

const server = createServer(yoga);

const PORT = process.env.PORT || 4000;

server.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}/graphql`);
  console.log(`
📝 Simple Context Demo
   - Database is passed via context
   - Resolvers access db through context.db
  `);
});
