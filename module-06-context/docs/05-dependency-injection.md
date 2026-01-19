# Dependency Injection in GraphQL

## What is Dependency Injection?

Dependency Injection (DI) is a design pattern where objects receive their dependencies from external sources rather than creating them internally. In GraphQL, the **context** is the primary mechanism for dependency injection.

```
┌─────────────────────────────────────────────────────────────┐
│                  Without Dependency Injection                │
│                                                              │
│  Resolver ──────────────────────► Database (direct import)   │
│  Resolver ──────────────────────► Logger (direct import)     │
│  Resolver ──────────────────────► Auth (direct import)       │
│                                                              │
│  ❌ Tight coupling, hard to test, hard to change             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                  With Dependency Injection                   │
│                                                              │
│  Context Factory ──► Database ──┐                            │
│  Context Factory ──► Logger ────┼──► Context ──► Resolvers   │
│  Context Factory ──► Auth ──────┘                            │
│                                                              │
│  ✅ Loose coupling, easy to test, flexible                   │
└─────────────────────────────────────────────────────────────┘
```

## Why Use Dependency Injection?

| Problem                                 | Solution with DI                                |
| --------------------------------------- | ----------------------------------------------- |
| Hard to test resolvers                  | Mock dependencies easily                        |
| Tight coupling to implementations       | Swap implementations without changing resolvers |
| Duplicate initialization code           | Centralize in context factory                   |
| No request isolation                    | Each request gets its own context               |
| Difficult to add cross-cutting concerns | Add logging, caching, etc. in one place         |

## The Context as DI Container

In GraphQL Yoga, the context acts as a dependency injection container:

```typescript
// src/types/index.ts
export interface GraphQLContext {
  // Dependencies injected via context
  db: Database; // Database connection
  logger: Logger; // Logging service
  currentUser: User | null; // Authentication
  cache: Cache; // Caching service
  emailService: EmailService; // Email service
}
```

## Implementing Dependency Injection

### Step 1: Define Service Interfaces

```typescript
// src/types/services.ts

// Database interface
export interface Database {
  users: UserRepository;
  posts: PostRepository;
}

// Logger interface
export interface Logger {
  info: (message: string, meta?: object) => void;
  error: (message: string, meta?: object) => void;
  warn: (message: string, meta?: object) => void;
}

// Cache interface
export interface Cache {
  get: <T>(key: string) => T | null;
  set: <T>(key: string, value: T, ttl?: number) => void;
  delete: (key: string) => void;
}

// Email service interface
export interface EmailService {
  send: (to: string, subject: string, body: string) => Promise<void>;
}
```

### Step 2: Create Service Implementations

```typescript
// src/services/database.ts
export const createDatabase = (): Database => ({
  users: new UserRepository(),
  posts: new PostRepository(),
});

// src/services/logger.ts
export const createLogger = (requestId: string): Logger => ({
  info: (msg, meta) => console.log(`[${requestId}] INFO: ${msg}`, meta),
  error: (msg, meta) => console.error(`[${requestId}] ERROR: ${msg}`, meta),
  warn: (msg, meta) => console.warn(`[${requestId}] WARN: ${msg}`, meta),
});

// src/services/cache.ts
export const createCache = (): Cache => {
  const store = new Map();
  return {
    get: (key) => store.get(key) ?? null,
    set: (key, value, ttl) => store.set(key, value),
    delete: (key) => store.delete(key),
  };
};

// src/services/email.ts
export const createEmailService = (): EmailService => ({
  send: async (to, subject, body) => {
    // Implementation
  },
});
```

### Step 3: Inject in Context Factory

```typescript
// src/context/index.ts
import { createDatabase } from '../services/database';
import { createLogger } from '../services/logger';
import { createCache } from '../services/cache';
import { createEmailService } from '../services/email';
import { authenticateRequest } from '../services/auth';

// Shared instances (singleton pattern)
const db = createDatabase();
const cache = createCache();
const emailService = createEmailService();

export const createContext = async ({ request }): Promise<GraphQLContext> => {
  const requestId = generateRequestId();

  return {
    // Shared across all requests
    db,
    cache,
    emailService,

    // Per-request instances
    logger: createLogger(requestId),
    currentUser: await authenticateRequest(request),
  };
};
```

### Step 4: Use Dependencies in Resolvers

```typescript
// src/resolvers/mutation.ts
export const Mutation = {
  createUser: async (_, args, context: GraphQLContext) => {
    const { db, logger, emailService } = context;

    logger.info('Creating user', { email: args.input.email });

    // Use injected database
    const user = await db.users.create(args.input);

    // Use injected email service
    await emailService.send(user.email, 'Welcome!', 'Thanks for signing up.');

    logger.info('User created', { userId: user.id });

    return { success: true, user };
  },
};
```

## Dependency Injection Patterns

### Pattern 1: Singleton (Shared Instance)

Use for stateless services that can be shared across requests:

```typescript
// Created once at startup
const db = createDatabase();
const cache = createCache();

export const createContext = () => ({
  db, // Same instance for all requests
  cache, // Same instance for all requests
});
```

**Use for:** Database connections, cache, external API clients

### Pattern 2: Factory (Per-Request Instance)

Use for request-specific services:

```typescript
export const createContext = ({ request }) => ({
  // New instance for each request
  logger: createLogger(generateRequestId()),
  currentUser: authenticateRequest(request),
});
```

**Use for:** Loggers, request metadata, user context

### Pattern 3: Lazy Initialization

Create dependencies only when needed:

```typescript
export const createContext = () => {
  let _expensiveService: ExpensiveService | null = null;

  return {
    get expensiveService() {
      if (!_expensiveService) {
        _expensiveService = createExpensiveService();
      }
      return _expensiveService;
    },
  };
};
```

**Use for:** Services that are expensive to create but rarely used

## Testing with Dependency Injection

The main benefit of DI is testability:

```typescript
// test/resolvers/mutation.test.ts
import { Mutation } from '../src/resolvers/mutation';

describe('createUser mutation', () => {
  test('creates user and sends welcome email', async () => {
    // Create mock dependencies
    const mockDb = {
      users: {
        create: jest.fn().mockResolvedValue({
          id: '1',
          email: 'test@example.com',
        }),
      },
    };

    const mockEmailService = {
      send: jest.fn().mockResolvedValue(undefined),
    };

    const mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
    };

    // Inject mocks via context
    const context = {
      db: mockDb,
      emailService: mockEmailService,
      logger: mockLogger,
    };

    // Execute
    const result = await Mutation.createUser(null, { input: { email: 'test@example.com', name: 'Test' } }, context);

    // Assert
    expect(result.success).toBe(true);
    expect(mockDb.users.create).toHaveBeenCalled();
    expect(mockEmailService.send).toHaveBeenCalledWith('test@example.com', 'Welcome!', expect.any(String));
  });
});
```

## Swapping Implementations

DI makes it easy to swap implementations:

```typescript
// Development: In-memory database
const db = createInMemoryDatabase();

// Production: PostgreSQL
const db = createPostgresDatabase();

// Testing: Mock database
const db = createMockDatabase();

// Same context interface, different implementations
export const createContext = () => ({ db });
```

## Adding Cross-Cutting Concerns

Wrap services to add logging, caching, or metrics:

```typescript
// Add logging to database calls
const createLoggingDatabase = (db: Database, logger: Logger): Database => ({
  users: {
    findById: async (id) => {
      logger.info('DB: Finding user', { id });
      const start = Date.now();
      const result = await db.users.findById(id);
      logger.info('DB: Found user', { id, duration: Date.now() - start });
      return result;
    },
    // ... wrap other methods
  },
});

// Use in context
export const createContext = ({ request }) => {
  const logger = createLogger(generateRequestId());
  const db = createLoggingDatabase(rawDatabase, logger);

  return { db, logger };
};
```

## Best Practices

### 1. Define Interfaces

Always define interfaces for your dependencies:

```typescript
// ✅ Good: Interface-based
interface UserService {
  findById: (id: string) => Promise<User>;
}

// ❌ Bad: Concrete implementation
import { PrismaClient } from '@prisma/client';
```

### 2. Keep Context Flat

Avoid deeply nested context objects:

```typescript
// ✅ Good: Flat structure
context.db;
context.logger;
context.currentUser;

// ❌ Bad: Nested structure
context.services.database.connection;
```

### 3. Don't Mutate Context

Treat context as read-only in resolvers:

```typescript
// ✅ Good: Read from context
const user = context.currentUser;

// ❌ Bad: Mutate context
context.currentUser = newUser;
```

### 4. Type Everything

Use TypeScript for type safety:

```typescript
export const Query = {
  users: (_: unknown, __: unknown, context: GraphQLContext) => {
    // TypeScript knows context.db exists and its type
    return context.db.users.findAll();
  },
};
```

## Summary

| Concept          | Description                           |
| ---------------- | ------------------------------------- |
| **DI Container** | Context object holds all dependencies |
| **Singleton**    | Shared instances (db, cache)          |
| **Factory**      | Per-request instances (logger, auth)  |
| **Interfaces**   | Define contracts for dependencies     |
| **Testing**      | Inject mocks via context              |
| **Flexibility**  | Swap implementations easily           |

Dependency Injection via context is the foundation of maintainable, testable GraphQL APIs.
