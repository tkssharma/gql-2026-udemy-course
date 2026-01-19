# Database Injection via Context

## The Problem

Directly importing database connections in resolvers creates tight coupling:

```typescript
// ❌ Tightly coupled - hard to test, hard to change
import { prisma } from '../db/prisma';

export const Query = {
  users: () => prisma.user.findMany(),
};
```

**Issues:**

- Can't easily mock for testing
- Can't swap database implementations
- No connection pooling control
- Hard to add middleware (logging, caching)

## The Solution: Inject via Context

```typescript
// ✅ Loosely coupled - easy to test, flexible
export const Query = {
  users: (_, __, context) => context.db.users.findAll(),
};
```

## Implementation

### Step 1: Define Database Interface

```typescript
// src/types/index.ts
export interface Database {
  users: {
    findAll: () => User[];
    findById: (id: string) => User | undefined;
    create: (data: CreateUserInput) => User;
    update: (id: string, data: UpdateUserInput) => User | undefined;
    delete: (id: string) => boolean;
  };
  posts: {
    findAll: () => Post[];
    findById: (id: string) => Post | undefined;
    findByAuthor: (authorId: string) => Post[];
    // ... more methods
  };
}
```

### Step 2: Create Database Instance

```typescript
// src/db/index.ts
import { Database, User, Post } from '../types';

// In-memory store (replace with real DB in production)
const users: User[] = [];
const posts: Post[] = [];

export const createDatabase = (): Database => ({
  users: {
    findAll: () => users,
    findById: (id) => users.find((u) => u.id === id),
    create: (data) => {
      const user = { ...data, id: generateId() };
      users.push(user);
      return user;
    },
    update: (id, data) => {
      const index = users.findIndex((u) => u.id === id);
      if (index === -1) return undefined;
      users[index] = { ...users[index], ...data };
      return users[index];
    },
    delete: (id) => {
      const index = users.findIndex((u) => u.id === id);
      if (index === -1) return false;
      users.splice(index, 1);
      return true;
    },
  },
  posts: {
    // ... similar implementation
  },
});
```

### Step 3: Inject in Context

```typescript
// src/context/index.ts
import { createDatabase } from '../db';

// Create single instance (connection pool simulation)
const db = createDatabase();

export const createContext = () => ({
  db, // Same instance shared across requests
});
```

### Step 4: Use in Resolvers

```typescript
// src/resolvers/query.ts
import { GraphQLContext } from '../types';

export const Query = {
  users: (_: unknown, __: unknown, context: GraphQLContext) => {
    return context.db.users.findAll();
  },

  user: (_: unknown, args: { id: string }, context: GraphQLContext) => {
    return context.db.users.findById(args.id);
  },
};
```

## Real-World Example: Prisma

```typescript
// src/db/prisma.ts
import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

// src/context/index.ts
import { prisma } from '../db/prisma';

export const createContext = () => ({
  db: prisma,
});

// src/resolvers/query.ts
export const Query = {
  users: (_, __, { db }) => db.user.findMany(),

  user: (_, { id }, { db }) =>
    db.user.findUnique({
      where: { id },
    }),
};
```

## Benefits of Database Injection

### 1. Easy Testing

```typescript
// test/resolvers.test.ts
import { Query } from '../src/resolvers/query';

const mockDb = {
  users: {
    findAll: jest.fn().mockReturnValue([{ id: '1', name: 'Test User' }]),
  },
};

test('users query returns all users', () => {
  const result = Query.users(null, null, { db: mockDb });
  expect(result).toHaveLength(1);
  expect(mockDb.users.findAll).toHaveBeenCalled();
});
```

### 2. Swap Implementations

```typescript
// Development: In-memory
const db = createInMemoryDatabase();

// Production: PostgreSQL
const db = createPostgresDatabase();

// Testing: Mock
const db = createMockDatabase();

// Same context interface, different implementations
export const createContext = () => ({ db });
```

### 3. Connection Pooling

```typescript
// Create pool once at startup
const pool = new Pool({ max: 20 });
const db = createDatabase(pool);

// Share across all requests
export const createContext = () => ({
  db, // All requests share the same pool
});
```

### 4. Add Middleware/Logging

```typescript
const createLoggingDatabase = (db: Database, logger: Logger): Database => ({
  users: {
    findAll: () => {
      logger.info('Fetching all users');
      const start = Date.now();
      const result = db.users.findAll();
      logger.info(`Found ${result.length} users in ${Date.now() - start}ms`);
      return result;
    },
    // ... wrap other methods
  },
});
```

## Pattern: Repository per Request vs Shared

### Shared Database (Recommended)

```typescript
// Single instance, shared across requests
const db = createDatabase();

export const createContext = () => ({
  db, // Same instance
});
```

**Use when:** Connection pooling, stateless operations

### Per-Request Database

```typescript
export const createContext = () => ({
  db: createDatabase(), // New instance per request
});
```

**Use when:** Request-specific transactions, isolation needed

## Summary

| Without Injection    | With Injection    |
| -------------------- | ----------------- |
| Direct imports       | Context parameter |
| Hard to test         | Easy to mock      |
| Tight coupling       | Loose coupling    |
| Fixed implementation | Swappable         |
| No middleware        | Easy to wrap      |
