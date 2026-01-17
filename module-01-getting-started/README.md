# Module 01: Getting Started with GraphQL Yoga & TypeScript

A comprehensive introduction to building GraphQL APIs with GraphQL Yoga and TypeScript.

---

## Course Outline

### 1. Introduction to GraphQL

- What is GraphQL?
- GraphQL vs REST: Key differences
- Core concepts: Queries, Mutations, Subscriptions
- GraphQL Schema Definition Language (SDL)
- Why GraphQL Yoga?

### 2. Project Setup

- Prerequisites (Node.js, npm/yarn/pnpm)
- Creating a new TypeScript project
- Installing dependencies
- TypeScript configuration
- Project structure

### 3. Your First GraphQL Server

- Creating a basic Yoga server
- Defining your first schema
- Writing resolvers
- Running the server
- Using GraphiQL playground

### 4. Type-Safe Schema with TypeScript

- Defining TypeScript types for your schema
- Type-safe resolvers
- Using codegen for automatic type generation
- Best practices for type organization

### 5. Queries Deep Dive

- Scalar types
- Object types
- Query arguments
- Nested queries
- Aliases and fragments

### 6. Mutations

- Creating mutations
- Input types
- Mutation responses
- Error handling in mutations

### 7. Context & Dependency Injection

- Understanding context
- Adding database connections
- Authentication context
- Request-scoped data

### 8. Error Handling

- GraphQL error types
- Custom error classes
- Error formatting
- Partial responses

---

## 1. Introduction to GraphQL

### What is GraphQL?

GraphQL is a query language for APIs that allows clients to request exactly the data they need.

```graphql
# Client requests only what they need
query {
  user(id: "1") {
    name
    email
    posts {
      title
    }
  }
}

# Server returns exactly that shape
{
  "data": {
    "user": {
      "name": "John",
      "email": "john@example.com",
      "posts": [
        { "title": "Hello GraphQL" }
      ]
    }
  }
}
```

### GraphQL vs REST

| Feature        | REST                            | GraphQL                |
| -------------- | ------------------------------- | ---------------------- |
| Endpoints      | Multiple (`/users`, `/posts`)   | Single (`/graphql`)    |
| Data fetching  | Fixed response shape            | Client specifies shape |
| Over-fetching  | Common                          | Eliminated             |
| Under-fetching | Requires multiple requests      | Single request         |
| Versioning     | URL versioning (`/v1/`, `/v2/`) | Schema evolution       |
| Type system    | Optional (OpenAPI)              | Built-in               |

### Why GraphQL Yoga?

- **Fully featured** - Subscriptions, file uploads, @defer/@stream
- **Platform agnostic** - Works everywhere (Node, Deno, Bun, Cloudflare Workers)
- **TypeScript first** - Excellent type support
- **Extensible** - Plugin system (Envelop)
- **Standards compliant** - Follows GraphQL spec
- **Built-in GraphiQL** - Interactive playground

---

## 2. Project Setup

### Initialize Project

```bash
# Create project directory
mkdir graphql-yoga-api
cd graphql-yoga-api

# Initialize package.json
npm init -y

# Install dependencies
npm install graphql-yoga graphql

# Install dev dependencies
npm install -D typescript @types/node ts-node-dev
```

### TypeScript Configuration

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### Package.json Scripts

```json
{
  "name": "graphql-yoga-api",
  "type": "module",
  "scripts": {
    "dev": "ts-node-dev --respawn --transpile-only src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "typecheck": "tsc --noEmit"
  }
}
```

### Project Structure

```
graphql-yoga-api/
├── src/
│   ├── index.ts           # Server entry point
│   ├── schema/
│   │   ├── index.ts       # Schema composition
│   │   ├── typeDefs.ts    # GraphQL type definitions
│   │   └── resolvers.ts   # Resolver functions
│   ├── types/
│   │   └── index.ts       # TypeScript types
│   ├── context/
│   │   └── index.ts       # Context creation
│   └── utils/
│       └── index.ts       # Utility functions
├── package.json
└── tsconfig.json
```

---

## 3. Your First GraphQL Server

### Basic Server Setup

```typescript
// src/index.ts
import { createServer } from 'node:http';
import { createYoga, createSchema } from 'graphql-yoga';

// Define schema
const schema = createSchema({
  typeDefs: /* GraphQL */ `
    type Query {
      hello: String!
      greet(name: String!): String!
    }
  `,
  resolvers: {
    Query: {
      hello: () => 'Hello, World!',
      greet: (_, args) => `Hello, ${args.name}!`,
    },
  },
});

// Create Yoga instance
const yoga = createYoga({ schema });

// Create HTTP server
const server = createServer(yoga);

// Start server
server.listen(4000, () => {
  console.log('🚀 Server running at http://localhost:4000/graphql');
});
```

### Run the Server

```bash
npm run dev
```

### Test in GraphiQL

Open `http://localhost:4000/graphql` and run:

```graphql
query {
  hello
  greet(name: "GraphQL Yoga")
}
```

---

## 4. Type-Safe Schema with TypeScript

### Define TypeScript Types

```typescript
// src/types/index.ts

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  published: boolean;
  authorId: string;
}

export interface CreateUserInput {
  name: string;
  email: string;
}

export interface CreatePostInput {
  title: string;
  content: string;
  authorId: string;
}
```

### Type-Safe Resolvers

```typescript
// src/schema/typeDefs.ts
export const typeDefs = /* GraphQL */ `
  type User {
    id: ID!
    name: String!
    email: String!
    createdAt: String!
    posts: [Post!]!
  }

  type Post {
    id: ID!
    title: String!
    content: String!
    published: Boolean!
    author: User!
  }

  type Query {
    users: [User!]!
    user(id: ID!): User
    posts: [Post!]!
    post(id: ID!): Post
  }

  type Mutation {
    createUser(input: CreateUserInput!): User!
    createPost(input: CreatePostInput!): Post!
    publishPost(id: ID!): Post!
  }

  input CreateUserInput {
    name: String!
    email: String!
  }

  input CreatePostInput {
    title: String!
    content: String!
    authorId: ID!
  }
`;
```

```typescript
// src/schema/resolvers.ts
import type { User, Post, CreateUserInput, CreatePostInput } from '../types';

// In-memory data store (replace with database later)
const users: User[] = [
  { id: '1', name: 'Alice', email: 'alice@example.com', createdAt: new Date() },
  { id: '2', name: 'Bob', email: 'bob@example.com', createdAt: new Date() },
];

const posts: Post[] = [
  { id: '1', title: 'Hello GraphQL', content: 'Getting started...', published: true, authorId: '1' },
  { id: '2', title: 'Advanced Yoga', content: 'Deep dive...', published: false, authorId: '1' },
];

export const resolvers = {
  Query: {
    users: (): User[] => users,
    user: (_: unknown, args: { id: string }): User | undefined => users.find((u) => u.id === args.id),
    posts: (): Post[] => posts,
    post: (_: unknown, args: { id: string }): Post | undefined => posts.find((p) => p.id === args.id),
  },

  Mutation: {
    createUser: (_: unknown, args: { input: CreateUserInput }): User => {
      const user: User = {
        id: String(users.length + 1),
        ...args.input,
        createdAt: new Date(),
      };
      users.push(user);
      return user;
    },

    createPost: (_: unknown, args: { input: CreatePostInput }): Post => {
      const post: Post = {
        id: String(posts.length + 1),
        ...args.input,
        published: false,
      };
      posts.push(post);
      return post;
    },

    publishPost: (_: unknown, args: { id: string }): Post => {
      const post = posts.find((p) => p.id === args.id);
      if (!post) throw new Error('Post not found');
      post.published = true;
      return post;
    },
  },

  // Field resolvers for relationships
  User: {
    posts: (parent: User): Post[] => posts.filter((p) => p.authorId === parent.id),
  },

  Post: {
    author: (parent: Post): User | undefined => users.find((u) => u.id === parent.authorId),
  },
};
```

### Compose Schema

```typescript
// src/schema/index.ts
import { createSchema } from 'graphql-yoga';
import { typeDefs } from './typeDefs';
import { resolvers } from './resolvers';

export const schema = createSchema({
  typeDefs,
  resolvers,
});
```

### Updated Server

```typescript
// src/index.ts
import { createServer } from 'node:http';
import { createYoga } from 'graphql-yoga';
import { schema } from './schema';

const yoga = createYoga({
  schema,
  graphiql: {
    title: 'GraphQL Yoga API',
  },
});

const server = createServer(yoga);

server.listen(4000, () => {
  console.log('🚀 Server running at http://localhost:4000/graphql');
});
```

---

## 5. Queries Deep Dive

### Scalar Types

```graphql
type Query {
  # Built-in scalars
  id: ID!
  name: String!
  age: Int!
  price: Float!
  active: Boolean!
}
```

### Query with Arguments

```typescript
// typeDefs
const typeDefs = /* GraphQL */ `
  type Query {
    user(id: ID!): User
    users(limit: Int, offset: Int): [User!]!
    searchUsers(query: String!, limit: Int = 10): [User!]!
  }
`;

// resolvers
const resolvers = {
  Query: {
    user: (_: unknown, args: { id: string }) => users.find((u) => u.id === args.id),

    users: (_: unknown, args: { limit?: number; offset?: number }) => {
      const { limit = 10, offset = 0 } = args;
      return users.slice(offset, offset + limit);
    },

    searchUsers: (_: unknown, args: { query: string; limit: number }) =>
      users.filter((u) => u.name.toLowerCase().includes(args.query.toLowerCase())).slice(0, args.limit),
  },
};
```

### Nested Queries

```graphql
# Client can query nested relationships
query {
  user(id: "1") {
    name
    posts {
      title
      published
    }
  }
}

# Multiple levels deep
query {
  posts {
    title
    author {
      name
      posts {
        title
      }
    }
  }
}
```

### Aliases and Fragments

```graphql
# Aliases - query same field with different args
query {
  alice: user(id: "1") {
    ...UserFields
  }
  bob: user(id: "2") {
    ...UserFields
  }
}

# Fragment - reusable field selection
fragment UserFields on User {
  id
  name
  email
  posts {
    title
  }
}
```

---

## 6. Mutations

### Input Types

```typescript
// typeDefs
const typeDefs = /* GraphQL */ `
  input CreateUserInput {
    name: String!
    email: String!
  }

  input UpdateUserInput {
    name: String
    email: String
  }

  type Mutation {
    createUser(input: CreateUserInput!): User!
    updateUser(id: ID!, input: UpdateUserInput!): User!
    deleteUser(id: ID!): Boolean!
  }
`;
```

### Mutation Resolvers

```typescript
// resolvers
const resolvers = {
  Mutation: {
    createUser: (_: unknown, args: { input: CreateUserInput }): User => {
      const user: User = {
        id: crypto.randomUUID(),
        ...args.input,
        createdAt: new Date(),
      };
      users.push(user);
      return user;
    },

    updateUser: (_: unknown, args: { id: string; input: UpdateUserInput }): User => {
      const index = users.findIndex((u) => u.id === args.id);
      if (index === -1) throw new Error('User not found');

      users[index] = { ...users[index], ...args.input };
      return users[index];
    },

    deleteUser: (_: unknown, args: { id: string }): boolean => {
      const index = users.findIndex((u) => u.id === args.id);
      if (index === -1) return false;

      users.splice(index, 1);
      return true;
    },
  },
};
```

### Mutation Response Pattern

```typescript
// Better mutation responses with status
const typeDefs = /* GraphQL */ `
  type MutationResponse {
    success: Boolean!
    message: String
  }

  type CreateUserResponse {
    success: Boolean!
    message: String
    user: User
  }

  type Mutation {
    createUser(input: CreateUserInput!): CreateUserResponse!
  }
`;

const resolvers = {
  Mutation: {
    createUser: (_: unknown, args: { input: CreateUserInput }): CreateUserResponse => {
      try {
        const user: User = {
          id: crypto.randomUUID(),
          ...args.input,
          createdAt: new Date(),
        };
        users.push(user);
        return { success: true, message: 'User created', user };
      } catch (error) {
        return { success: false, message: error.message, user: null };
      }
    },
  },
};
```

---

## 7. Context & Dependency Injection

### Creating Context

```typescript
// src/context/index.ts
import type { YogaInitialContext } from 'graphql-yoga';

// Define your context type
export interface Context {
  // Request info
  request: Request;

  // User from auth (null if not authenticated)
  currentUser: User | null;

  // Data sources
  db: Database;

  // Services
  userService: UserService;
  postService: PostService;
}

// Context factory function
export async function createContext(initialContext: YogaInitialContext): Promise<Context> {
  const { request } = initialContext;

  // Extract auth token
  const token = request.headers.get('authorization')?.replace('Bearer ', '');

  // Verify token and get user
  const currentUser = token ? await verifyToken(token) : null;

  // Create database connection
  const db = await getDatabase();

  return {
    request,
    currentUser,
    db,
    userService: new UserService(db),
    postService: new PostService(db),
  };
}
```

### Using Context in Resolvers

```typescript
// src/schema/resolvers.ts
import type { Context } from '../context';

export const resolvers = {
  Query: {
    me: (_: unknown, __: unknown, context: Context) => {
      if (!context.currentUser) {
        throw new Error('Not authenticated');
      }
      return context.currentUser;
    },

    users: async (_: unknown, __: unknown, context: Context) => {
      return context.userService.findAll();
    },

    user: async (_: unknown, args: { id: string }, context: Context) => {
      return context.userService.findById(args.id);
    },
  },

  Mutation: {
    createPost: async (_: unknown, args: { input: CreatePostInput }, context: Context) => {
      if (!context.currentUser) {
        throw new Error('Not authenticated');
      }

      return context.postService.create({
        ...args.input,
        authorId: context.currentUser.id,
      });
    },
  },
};
```

### Server with Context

```typescript
// src/index.ts
import { createServer } from 'node:http';
import { createYoga } from 'graphql-yoga';
import { schema } from './schema';
import { createContext, type Context } from './context';

const yoga = createYoga<Context>({
  schema,
  context: createContext,
});

const server = createServer(yoga);

server.listen(4000, () => {
  console.log('🚀 Server running at http://localhost:4000/graphql');
});
```

---

## 8. Error Handling

### GraphQL Error Types

```typescript
import { GraphQLError } from 'graphql';

// Standard GraphQL error
throw new GraphQLError('User not found', {
  extensions: {
    code: 'USER_NOT_FOUND',
    http: { status: 404 },
  },
});

// Authentication error
throw new GraphQLError('Not authenticated', {
  extensions: {
    code: 'UNAUTHENTICATED',
    http: { status: 401 },
  },
});

// Authorization error
throw new GraphQLError('Not authorized', {
  extensions: {
    code: 'FORBIDDEN',
    http: { status: 403 },
  },
});

// Validation error
throw new GraphQLError('Invalid input', {
  extensions: {
    code: 'BAD_USER_INPUT',
    validationErrors: {
      email: 'Invalid email format',
    },
  },
});
```

### Custom Error Classes

```typescript
// src/utils/errors.ts
import { GraphQLError } from 'graphql';

export class NotFoundError extends GraphQLError {
  constructor(resource: string, id: string) {
    super(`${resource} with id ${id} not found`, {
      extensions: {
        code: 'NOT_FOUND',
        http: { status: 404 },
      },
    });
  }
}

export class AuthenticationError extends GraphQLError {
  constructor(message = 'Not authenticated') {
    super(message, {
      extensions: {
        code: 'UNAUTHENTICATED',
        http: { status: 401 },
      },
    });
  }
}

export class AuthorizationError extends GraphQLError {
  constructor(message = 'Not authorized') {
    super(message, {
      extensions: {
        code: 'FORBIDDEN',
        http: { status: 403 },
      },
    });
  }
}

export class ValidationError extends GraphQLError {
  constructor(errors: Record<string, string>) {
    super('Validation failed', {
      extensions: {
        code: 'BAD_USER_INPUT',
        validationErrors: errors,
      },
    });
  }
}
```

### Using Custom Errors

```typescript
// src/schema/resolvers.ts
import { NotFoundError, AuthenticationError } from '../utils/errors';

export const resolvers = {
  Query: {
    user: async (_: unknown, args: { id: string }, context: Context) => {
      const user = await context.userService.findById(args.id);
      if (!user) {
        throw new NotFoundError('User', args.id);
      }
      return user;
    },

    me: (_: unknown, __: unknown, context: Context) => {
      if (!context.currentUser) {
        throw new AuthenticationError();
      }
      return context.currentUser;
    },
  },
};
```

### Error Formatting

```typescript
// src/index.ts
import { createYoga } from 'graphql-yoga';

const yoga = createYoga({
  schema,
  context: createContext,
  maskedErrors: {
    // In production, mask unexpected errors
    isDev: process.env.NODE_ENV !== 'production',
  },
});
```

---

## Complete Example: Full Server

```typescript
// src/index.ts
import { createServer } from 'node:http';
import { createYoga, createSchema } from 'graphql-yoga';

// Types
interface User {
  id: string;
  name: string;
  email: string;
}

interface Context {
  currentUser: User | null;
}

// Data
const users: User[] = [
  { id: '1', name: 'Alice', email: 'alice@example.com' },
  { id: '2', name: 'Bob', email: 'bob@example.com' },
];

// Schema
const schema = createSchema({
  typeDefs: /* GraphQL */ `
    type User {
      id: ID!
      name: String!
      email: String!
    }

    type Query {
      me: User
      users: [User!]!
      user(id: ID!): User
    }

    input CreateUserInput {
      name: String!
      email: String!
    }

    type Mutation {
      createUser(input: CreateUserInput!): User!
    }
  `,
  resolvers: {
    Query: {
      me: (_: unknown, __: unknown, ctx: Context) => ctx.currentUser,
      users: () => users,
      user: (_: unknown, args: { id: string }) => users.find((u) => u.id === args.id),
    },
    Mutation: {
      createUser: (_: unknown, args: { input: { name: string; email: string } }) => {
        const user: User = {
          id: String(users.length + 1),
          ...args.input,
        };
        users.push(user);
        return user;
      },
    },
  },
});

// Yoga instance
const yoga = createYoga<Context>({
  schema,
  context: async ({ request }) => {
    // Simple auth example
    const token = request.headers.get('authorization');
    const currentUser = token ? users[0] : null;
    return { currentUser };
  },
});

// Server
const server = createServer(yoga);

server.listen(4000, () => {
  console.log('🚀 GraphQL Yoga server running at http://localhost:4000/graphql');
});
```

---

## Next Steps

After completing this module, you'll be ready for:

- **Module 02**: Database Integration (Prisma, Drizzle)
- **Module 03**: Authentication & Authorization
- **Module 04**: Subscriptions (Real-time)
- **Module 05**: File Uploads
- **Module 06**: Caching & Performance
- **Module 07**: Testing GraphQL APIs
- **Module 08**: Deployment & Production

---

## Resources

- [GraphQL Yoga Documentation](https://the-guild.dev/graphql/yoga-server)
- [GraphQL Specification](https://spec.graphql.org/)
- [GraphQL Best Practices](https://graphql.org/learn/best-practices/)
- [The Guild - GraphQL Tools](https://the-guild.dev/)
