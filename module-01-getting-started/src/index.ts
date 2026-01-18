import { createServer } from 'node:http';
import { createYoga } from 'graphql-yoga';
import { schema } from './schema/index.js';

// Create Yoga instance
const yoga = createYoga({
  schema,
  graphiql: {
    title: 'GraphQL Yoga API',
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