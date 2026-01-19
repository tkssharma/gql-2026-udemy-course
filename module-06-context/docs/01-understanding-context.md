# Understanding Context in GraphQL

## What is Context?

Context is an **object that is shared across all resolvers** during the execution of a single GraphQL request. Think of it as a "request-scoped container" that carries everything your resolvers need to do their job.

```
┌─────────────────────────────────────────────────────────────┐
│                     HTTP Request                             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              Context Factory (runs once per request)         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     Context Object                           │
│  {                                                           │
│    db: Database,                                             │
│    currentUser: User | null,                                 │
│    logger: Logger,                                           │
│    request: { id, timestamp, ... }                           │
│  }                                                           │
└─────────────────────────────────────────────────────────────┘
                              │
            ┌─────────────────┼─────────────────┐
            ▼                 ▼                 ▼
      ┌──────────┐      ┌──────────┐      ┌──────────┐
      │ Resolver │      │ Resolver │      │ Resolver │
      │  Query   │      │ Mutation │      │  Field   │
      └──────────┘      └──────────┘      └──────────┘
```

## Why Do We Need Context?

### Problem Without Context

Without context, resolvers would need to:

1. Import database connections directly
2. Parse authentication headers themselves
3. Create their own loggers
4. Have no way to share request-specific data

```typescript
// ❌ BAD: Without context - tightly coupled
import { db } from '../db';
import { verifyToken } from '../auth';

export const Query = {
  posts: async (_, args, { req }) => {
    // Every resolver repeats this logic
    const token = req.headers.authorization;
    const user = await verifyToken(token);

    // Direct database import - hard to test
    return db.posts.findAll();
  },
};
```

### Solution With Context

```typescript
// ✅ GOOD: With context - loosely coupled
export const Query = {
  posts: (_, __, context) => {
    // Authentication already handled
    context.logger.info('Fetching posts');

    // Database injected via context
    return context.db.posts.findAll();
  },
};
```

## The Resolver Signature

Every resolver receives 4 arguments:

```typescript
(parent, args, context, info) => result;
```

| Argument  | Description                                     |
| --------- | ----------------------------------------------- |
| `parent`  | Result from parent resolver (for nested fields) |
| `args`    | Arguments passed to the field                   |
| `context` | **Shared object for the entire request**        |
| `info`    | GraphQL query metadata (rarely used)            |

## Creating Context in GraphQL Yoga

### Basic Context

```typescript
import { createYoga } from 'graphql-yoga';

const yoga = createYoga({
  schema,
  context: {
    // Static context - same for all requests
    appName: 'My App',
  },
});
```

### Dynamic Context (Per-Request)

```typescript
const yoga = createYoga({
  schema,
  context: async ({ request }) => {
    // This function runs for EACH request
    return {
      db: database,
      timestamp: Date.now(),
      userAgent: request.headers.get('user-agent'),
    };
  },
});
```

## Context Lifecycle

```
Request 1                          Request 2
    │                                  │
    ▼                                  ▼
┌─────────────┐                  ┌─────────────┐
│ Context A   │                  │ Context B   │
│ requestId:1 │                  │ requestId:2 │
│ user: John  │                  │ user: Jane  │
└─────────────┘                  └─────────────┘
    │                                  │
    ▼                                  ▼
 Resolvers                          Resolvers
 use A                              use B
    │                                  │
    ▼                                  ▼
 Response 1                        Response 2
```

**Key Point**: Each request gets its own context instance. They don't share state.

## Typing Context in TypeScript

Always define a type for your context:

```typescript
// src/types/index.ts
export interface GraphQLContext {
  db: Database;
  logger: Logger;
  currentUser: User | null;
  request: {
    id: string;
    startTime: number;
  };
}
```

Use it in resolvers:

```typescript
import { GraphQLContext } from '../types';

export const Query = {
  me: (_: unknown, __: unknown, context: GraphQLContext) => {
    return context.currentUser;
  },
};
```

## Common Context Patterns

### 1. Database Connection

```typescript
context: () => ({
  db: databaseConnection,
});
```

### 2. Authentication

```typescript
context: async ({ request }) => ({
  currentUser: await authenticate(request),
});
```

### 3. Request Tracing

```typescript
context: () => ({
  requestId: generateUUID(),
  startTime: Date.now(),
});
```

### 4. Feature Flags

```typescript
context: async ({ request }) => ({
  features: await getFeatureFlags(request),
});
```

## Summary

| Aspect           | Description                                     |
| ---------------- | ----------------------------------------------- |
| **What**         | Shared object across all resolvers in a request |
| **When Created** | Once per request, before resolvers execute      |
| **Scope**        | Request-scoped (isolated between requests)      |
| **Purpose**      | Dependency injection, auth, logging, tracing    |
| **Access**       | Third argument in every resolver                |
