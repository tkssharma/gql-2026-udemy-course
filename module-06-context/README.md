# Module 06: Context & Dependency Injection

A comprehensive demo showcasing GraphQL context, dependency injection, authentication, and request-scoped data with GraphQL Yoga.

## Topics Covered

1. **Understanding Context** - What context is and how it works
2. **Adding Database Connections** - Injecting database access into resolvers
3. **Authentication Context** - Handling user authentication via headers
4. **Request-Scoped Data** - Managing per-request metadata and logging

## 📚 Documentation

Detailed explanations for each topic are available in the `docs/` folder:

- [01-understanding-context.md](./docs/01-understanding-context.md) - Core concepts of GraphQL context
- [02-database-injection.md](./docs/02-database-injection.md) - Injecting database connections
- [03-authentication-context.md](./docs/03-authentication-context.md) - Authentication and authorization patterns
- [04-request-scoped-data.md](./docs/04-request-scoped-data.md) - Request metadata and logging
- [05-dependency-injection.md](./docs/05-dependency-injection.md) - DI patterns, testing, and best practices

---

## What is Context?

Context in GraphQL is an object that is shared across all resolvers during the execution of a single request. It's the primary mechanism for:

- **Dependency Injection** - Providing services (database, logger, etc.) to resolvers
- **Authentication** - Passing the authenticated user to all resolvers
- **Request Metadata** - Sharing request-specific data (request ID, timestamps, etc.)

### How Context Works

```
┌─────────────────────────────────────────────────────────────┐
│                     HTTP Request                             │
│  Headers: { Authorization: "Bearer token" }                  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Context Factory                            │
│  - Extract auth token                                        │
│  - Validate user                                             │
│  - Create logger with request ID                             │
│  - Attach database connection                                │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   GraphQL Context                            │
│  {                                                           │
│    db: Database,                                             │
│    logger: Logger,                                           │
│    currentUser: AuthUser | null,                             │
│    request: { requestId, startTime, ip, userAgent }          │
│  }                                                           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     Resolvers                                │
│  Query.posts(parent, args, context) => context.db.posts...   │
│  Mutation.createPost(parent, args, context) => ...           │
└─────────────────────────────────────────────────────────────┘
```

---

## Project Structure

```
src/
├── index.ts                 # Server entry point with context setup
├── context/
│   └── index.ts             # Context factory function
├── db/
│   └── index.ts             # Database connection/service
├── services/
│   ├── auth.ts              # Authentication service
│   └── logger.ts            # Request-scoped logger
├── resolvers/
│   ├── index.ts             # Resolver exports
│   ├── query.ts             # Query resolvers using context
│   ├── mutation.ts          # Mutation resolvers with auth checks
│   └── types.ts             # Field resolvers (User.posts, Post.author)
├── schema/
│   ├── index.ts             # Schema creation
│   └── typeDefs.ts          # GraphQL type definitions
└── types/
    └── index.ts             # TypeScript interfaces
```

---

## 1. Understanding Context

### Defining the Context Type

```typescript
// src/types/index.ts
export interface GraphQLContext {
  db: Database; // Database connection
  logger: Logger; // Request-scoped logger
  currentUser: AuthUser | null; // Authenticated user
  request: RequestMeta; // Request metadata
}
```

### Creating the Context Factory

```typescript
// src/context/index.ts
export const createContext = async (
  initialContext: YogaInitialContext
): Promise<GraphQLContext> => {
  const req = initialContext.request;

  // Generate request-scoped metadata
  const requestId = generateRequestId();
  const authHeader = req.headers.get('authorization');

  return {
    db: database,
    logger: createLogger(requestId),
    currentUser: authenticateRequest(authHeader),
    request: { requestId, startTime: Date.now(), ... },
  };
};
```

### Using Context in Yoga

```typescript
// src/index.ts
const yoga = createYoga({
  schema,
  context: createContext, // Called for each request
});
```

---

## 2. Adding Database Connections

The database is injected via context, allowing resolvers to access data without importing directly:

```typescript
// src/resolvers/query.ts
export const Query = {
  posts: (_: unknown, __: unknown, context: GraphQLContext) => {
    // Access database through context
    return context.db.posts.findAll().filter((p) => p.published);
  },

  user: (_: unknown, args: { id: string }, context: GraphQLContext) => {
    return context.db.users.findById(args.id);
  },
};
```

### Benefits of Database Injection

- **Testability** - Easy to mock database in tests
- **Flexibility** - Can swap database implementations
- **Connection Pooling** - Share connection pool across requests

---

## 3. Authentication Context

### Token Validation

```typescript
// src/services/auth.ts
export const authenticateRequest = (authHeader: string | undefined): AuthUser | null => {
  if (!authHeader) return null;

  const [type, token] = authHeader.split(' ');
  if (type !== 'Bearer') return null;

  return validateToken(token); // Returns user or null
};
```

### Using Authentication in Resolvers

```typescript
// src/resolvers/mutation.ts
export const Mutation = {
  createPost: (_, args, context: GraphQLContext) => {
    // Check authentication
    if (!context.currentUser) {
      throw new GraphQLError('Authentication required', {
        extensions: { code: 'UNAUTHENTICATED' },
      });
    }

    // Use authenticated user's ID
    return context.db.posts.create({
      ...args.input,
      authorId: context.currentUser.id,
    });
  },
};
```

### Authorization Patterns

```typescript
// Owner or Admin check
if (post.authorId !== context.currentUser.id && context.currentUser.role !== 'admin') {
  throw new GraphQLError('Not authorized', {
    extensions: { code: 'FORBIDDEN' },
  });
}
```

---

## 4. Request-Scoped Data

Each request gets unique metadata for tracing and debugging:

```typescript
interface RequestMeta {
  requestId: string; // Unique ID for this request
  startTime: number; // Request start timestamp
  ip: string; // Client IP address
  userAgent: string; // Client user agent
}
```

### Request-Scoped Logger

```typescript
// src/services/logger.ts
export const createLogger = (requestId: string): Logger => ({
  info: (message, meta) => {
    console.log(`[${requestId}] ${message}`, meta);
  },
  error: (message, meta) => {
    console.error(`[${requestId}] ${message}`, meta);
  },
});
```

### Using in Resolvers

```typescript
export const Query = {
  posts: (_, __, context: GraphQLContext) => {
    context.logger.info('Fetching published posts');
    return context.db.posts.findAll().filter((p) => p.published);
  },
};
```

---

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Server runs at: **http://localhost:4000/graphql**

---

## Test Tokens

For testing authentication, use these tokens in the `Authorization` header:

| Token                    | User       | Role  |
| ------------------------ | ---------- | ----- |
| `Bearer admin-token-123` | Admin User | admin |
| `Bearer user-token-456`  | John Doe   | user  |
| `Bearer user-token-789`  | Jane Smith | user  |

Add to HTTP Headers in GraphiQL:

```json
{
  "Authorization": "Bearer user-token-456"
}
```

---

## Example Queries

### 1. Check Request Info (No Auth Required)

```graphql
query {
  requestInfo {
    requestId
    timestamp
    ip
    userAgent
    authenticated
  }
}
```

### 2. Get Published Posts (No Auth Required)

```graphql
query {
  posts {
    id
    title
    content
    author {
      name
      email
    }
  }
}
```

### 3. Get Current User (Auth Required)

```graphql
# Header: { "Authorization": "Bearer user-token-456" }
query {
  me {
    id
    name
    email
    role
    posts {
      title
      published
    }
  }
}
```

### 4. Get All Users (Admin Only)

```graphql
# Header: { "Authorization": "Bearer admin-token-123" }
query {
  users {
    id
    name
    email
    role
  }
}
```

---

## Example Mutations

### Create Post (Auth Required)

```graphql
# Header: { "Authorization": "Bearer user-token-456" }
mutation {
  createPost(input: { title: "My New Post", content: "This is the content of my new post...", published: false }) {
    success
    message
    post {
      id
      title
      author {
        name
      }
    }
  }
}
```

### Update Post (Owner or Admin)

```graphql
# Header: { "Authorization": "Bearer user-token-456" }
mutation {
  updatePost(id: "1", input: { title: "Updated Title", published: true }) {
    success
    message
    post {
      id
      title
      published
    }
  }
}
```

### Publish Post

```graphql
# Header: { "Authorization": "Bearer user-token-456" }
mutation {
  publishPost(id: "1") {
    success
    message
    post {
      id
      title
      published
    }
  }
}
```

---

## Error Handling Examples

### Unauthenticated Access

```graphql
# No Authorization header
mutation {
  createPost(input: { title: "Test", content: "Test content..." }) {
    success
  }
}
# Error: "Authentication required" (code: UNAUTHENTICATED)
```

### Unauthorized Access

```graphql
# Header: { "Authorization": "Bearer user-token-456" }
# Trying to access admin-only query
query {
  users {
    id
    name
  }
}
# Error: "Admin access required" (code: FORBIDDEN)
```

### Trying to Modify Another User's Post

```graphql
# Header: { "Authorization": "Bearer user-token-789" } (Jane)
# Trying to update John's post
mutation {
  updatePost(id: "1", input: { title: "Hacked!" }) {
    success
  }
}
# Error: "Not authorized to update this post" (code: FORBIDDEN)
```

---

## Key Concepts Summary

| Concept                 | Purpose                     | Example                             |
| ----------------------- | --------------------------- | ----------------------------------- |
| **Context**             | Share data across resolvers | `context.db`, `context.currentUser` |
| **Database Injection**  | Decouple data access        | `context.db.users.findById(id)`     |
| **Authentication**      | Identify the current user   | `context.currentUser?.id`           |
| **Authorization**       | Control access to resources | `if (currentUser.role !== 'admin')` |
| **Request-Scoped Data** | Per-request metadata        | `context.request.requestId`         |
| **Logger**              | Request-aware logging       | `context.logger.info('message')`    |

---

## Best Practices

1. **Type your context** - Always define a TypeScript interface for your context
2. **Keep context creation async** - Database connections and auth may be async
3. **Don't mutate context** - Treat context as read-only within resolvers
4. **Use context for cross-cutting concerns** - Auth, logging, tracing
5. **Inject dependencies** - Don't import services directly in resolvers
6. **Handle errors gracefully** - Use GraphQLError with proper error codes
