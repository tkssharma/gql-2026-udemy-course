# Context with Prisma - Database Injection

## The Role of Context

Context is the **bridge between your GraphQL resolvers and the database**. Instead of importing Prisma directly in every resolver, we inject it through context.

```
┌─────────────────────────────────────────────────────────────┐
│                     HTTP Request                             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Context Factory                            │
│  createContext({ request }) => {                             │
│    prisma: PrismaClient,                                     │
│    currentUser: AuthUser | null,                             │
│    requestId: string                                         │
│  }                                                           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     Resolvers                                │
│  Query.users = (_, __, context) => {                         │
│    return context.prisma.user.findMany()                     │
│  }                                                           │
└─────────────────────────────────────────────────────────────┘
```

## Why Inject Prisma via Context?

| Without Context                  | With Context     |
| -------------------------------- | ---------------- |
| `import { prisma } from '../db'` | `context.prisma` |
| Tight coupling                   | Loose coupling   |
| Hard to test                     | Easy to mock     |
| No request isolation             | Request-scoped   |

## Implementation

### Step 1: Define Context Type

```typescript
// src/types/index.ts
import { PrismaClient } from '@prisma/client';

export interface AuthUser {
  id: string;
  email: string;
  role: 'admin' | 'user';
}

export interface GraphQLContext {
  prisma: PrismaClient;
  currentUser: AuthUser | null;
  requestId: string;
}
```

### Step 2: Create Prisma Instance

```typescript
// src/db/prisma.ts
import { PrismaClient } from '@prisma/client';

// Single instance shared across requests
export const prisma = new PrismaClient();
```

### Step 3: Create Context Factory

```typescript
// src/context/index.ts
import { YogaInitialContext } from 'graphql-yoga';
import { prisma } from '../db/prisma';
import { GraphQLContext, AuthUser } from '../types';

export const createContext = async (initialContext: YogaInitialContext): Promise<GraphQLContext> => {
  const { request } = initialContext;

  // Generate request ID
  const requestId = `req_${Date.now()}`;

  // Authenticate user from token
  let currentUser: AuthUser | null = null;
  const authHeader = request.headers.get('authorization');

  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    currentUser = await validateToken(token);
  }

  return {
    prisma, // Inject Prisma client
    currentUser, // Inject authenticated user
    requestId, // Inject request metadata
  };
};
```

### Step 4: Use in Yoga

```typescript
// src/index.ts
import { createYoga } from 'graphql-yoga';
import { schema } from './schema';
import { createContext } from './context';

const yoga = createYoga({
  schema,
  context: createContext, // Context factory
});
```

### Step 5: Use in Resolvers

```typescript
// src/resolvers/query.ts
import { GraphQLContext } from '../types';

export const Query = {
  // Access Prisma through context
  users: async (_, __, context: GraphQLContext) => {
    return context.prisma.user.findMany();
  },

  user: async (_, { id }, context: GraphQLContext) => {
    return context.prisma.user.findUnique({
      where: { id },
    });
  },

  // Combine auth check with database query
  me: async (_, __, context: GraphQLContext) => {
    if (!context.currentUser) {
      throw new Error('Not authenticated');
    }

    return context.prisma.user.findUnique({
      where: { id: context.currentUser.id },
    });
  },
};
```

## Field Resolvers with Context

Resolve nested fields using Prisma through context:

```typescript
// src/resolvers/types.ts
import { GraphQLContext } from '../types';

export const User = {
  // Resolve user's posts
  posts: async (parent, _, context: GraphQLContext) => {
    return context.prisma.post.findMany({
      where: { authorId: parent.id },
    });
  },
};

export const Post = {
  // Resolve post's author
  author: async (parent, _, context: GraphQLContext) => {
    return context.prisma.user.findUnique({
      where: { id: parent.authorId },
    });
  },
};
```

## Benefits of This Pattern

### 1. Testability

```typescript
// test/resolvers.test.ts
const mockPrisma = {
  user: {
    findMany: jest.fn().mockResolvedValue([{ id: '1', name: 'Test User' }]),
  },
};

const context = {
  prisma: mockPrisma,
  currentUser: null,
  requestId: 'test-123',
};

const result = await Query.users(null, null, context);
expect(result).toHaveLength(1);
```

### 2. Request Isolation

Each request gets its own context, but shares the Prisma connection pool:

```
Request 1                    Request 2
    │                            │
    ▼                            ▼
Context A                    Context B
{ prisma, user: John }       { prisma, user: Jane }
    │                            │
    └────────────┬───────────────┘
                 │
                 ▼
         Shared Prisma Client
         (Connection Pool)
```

### 3. Centralized Auth

Authentication is handled once in context, not in every resolver:

```typescript
// Context factory handles auth
const currentUser = await validateToken(token);

// Resolvers just check context.currentUser
if (!context.currentUser) {
  throw new AuthenticationError();
}
```

## Best Practices

1. **Single Prisma instance** - Share across requests for connection pooling
2. **Type your context** - Use TypeScript interface
3. **Handle auth in context** - Not in individual resolvers
4. **Add request metadata** - Request ID for logging/tracing
5. **Keep context creation async** - Database lookups may be needed
