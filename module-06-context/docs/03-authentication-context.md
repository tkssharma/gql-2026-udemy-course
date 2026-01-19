# Authentication Context

## Overview

Authentication in GraphQL is typically handled in the context layer, not in individual resolvers. The context factory:

1. Extracts the auth token from headers
2. Validates the token
3. Attaches the user to context
4. Resolvers simply check `context.currentUser`

```
┌─────────────────────────────────────────────────────────────┐
│  Request Headers: { Authorization: "Bearer xyz123" }         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Context Factory                           │
│  1. Extract token from Authorization header                  │
│  2. Validate token (JWT verify, database lookup, etc.)       │
│  3. Return user object or null                               │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  Context: { currentUser: { id: "1", role: "admin" } }        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  Resolvers check: if (!context.currentUser) throw Error      │
└─────────────────────────────────────────────────────────────┘
```

## Implementation

### Step 1: Define Auth Types

```typescript
// src/types/index.ts
export interface AuthUser {
  id: string;
  email: string;
  role: 'admin' | 'user';
}

export interface GraphQLContext {
  currentUser: AuthUser | null;
  // ... other context properties
}
```

### Step 2: Create Auth Service

```typescript
// src/services/auth.ts
import { AuthUser } from '../types';

// In production, use JWT or session validation
export const authenticateRequest = (authHeader: string | undefined): AuthUser | null => {
  // No header = no user
  if (!authHeader) {
    return null;
  }

  // Expected format: "Bearer <token>"
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  const token = parts[1];

  // Validate token (simplified - use JWT in production)
  return validateToken(token);
};

// Simulated token validation
const validTokens: Record<string, AuthUser> = {
  'admin-token': { id: '1', email: 'admin@example.com', role: 'admin' },
  'user-token': { id: '2', email: 'user@example.com', role: 'user' },
};

const validateToken = (token: string): AuthUser | null => {
  return validTokens[token] || null;
};
```

### Step 3: Add to Context

```typescript
// src/context/index.ts
import { authenticateRequest } from '../services/auth';
import { GraphQLContext } from '../types';

export const createContext = async ({ request }): Promise<GraphQLContext> => {
  const authHeader = request.headers.get('authorization');
  const currentUser = authenticateRequest(authHeader);

  return {
    currentUser,
    // ... other context
  };
};
```

### Step 4: Use in Resolvers

```typescript
// src/resolvers/query.ts
import { GraphQLError } from 'graphql';
import { GraphQLContext } from '../types';

export const Query = {
  // Public query - no auth required
  posts: (_, __, context: GraphQLContext) => {
    return context.db.posts.findAll();
  },

  // Protected query - auth required
  me: (_, __, context: GraphQLContext) => {
    if (!context.currentUser) {
      throw new GraphQLError('Authentication required', {
        extensions: { code: 'UNAUTHENTICATED' },
      });
    }
    return context.db.users.findById(context.currentUser.id);
  },

  // Admin only query
  users: (_, __, context: GraphQLContext) => {
    if (!context.currentUser) {
      throw new GraphQLError('Authentication required', {
        extensions: { code: 'UNAUTHENTICATED' },
      });
    }
    if (context.currentUser.role !== 'admin') {
      throw new GraphQLError('Admin access required', {
        extensions: { code: 'FORBIDDEN' },
      });
    }
    return context.db.users.findAll();
  },
};
```

## Authorization Patterns

### Pattern 1: Simple Auth Check

```typescript
const requireAuth = (context: GraphQLContext) => {
  if (!context.currentUser) {
    throw new GraphQLError('Authentication required', {
      extensions: { code: 'UNAUTHENTICATED' },
    });
  }
  return context.currentUser;
};

// Usage
export const Mutation = {
  createPost: (_, args, context) => {
    const user = requireAuth(context);
    return context.db.posts.create({
      ...args.input,
      authorId: user.id,
    });
  },
};
```

### Pattern 2: Role-Based Access

```typescript
const requireRole = (context: GraphQLContext, role: 'admin' | 'user') => {
  const user = requireAuth(context);

  if (role === 'admin' && user.role !== 'admin') {
    throw new GraphQLError('Admin access required', {
      extensions: { code: 'FORBIDDEN' },
    });
  }

  return user;
};

// Usage
export const Query = {
  users: (_, __, context) => {
    requireRole(context, 'admin');
    return context.db.users.findAll();
  },
};
```

### Pattern 3: Resource Ownership

```typescript
const requireOwnership = (context: GraphQLContext, resourceOwnerId: string) => {
  const user = requireAuth(context);

  // Admins can access anything
  if (user.role === 'admin') return user;

  // Users can only access their own resources
  if (user.id !== resourceOwnerId) {
    throw new GraphQLError('Not authorized', {
      extensions: { code: 'FORBIDDEN' },
    });
  }

  return user;
};

// Usage
export const Mutation = {
  updatePost: (_, { id, input }, context) => {
    const post = context.db.posts.findById(id);
    if (!post) throw new GraphQLError('Post not found');

    requireOwnership(context, post.authorId);

    return context.db.posts.update(id, input);
  },
};
```

## JWT Authentication Example

```typescript
// src/services/auth.ts
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;

export const authenticateRequest = (authHeader: string | undefined): AuthUser | null => {
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.slice(7);

  try {
    const payload = jwt.verify(token, JWT_SECRET) as AuthUser;
    return payload;
  } catch (error) {
    // Invalid or expired token
    return null;
  }
};

// Generate token (for login mutation)
export const generateToken = (user: AuthUser): string => {
  return jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
};
```

## Error Codes

Use consistent error codes for auth errors:

| Code              | Meaning                          | HTTP Equivalent |
| ----------------- | -------------------------------- | --------------- |
| `UNAUTHENTICATED` | No valid credentials             | 401             |
| `FORBIDDEN`       | Valid credentials, no permission | 403             |

```typescript
// Unauthenticated - no token or invalid token
throw new GraphQLError('Authentication required', {
  extensions: { code: 'UNAUTHENTICATED' },
});

// Forbidden - valid token but no permission
throw new GraphQLError('Admin access required', {
  extensions: { code: 'FORBIDDEN' },
});
```

## Testing Authentication

```typescript
// test/auth.test.ts
import { Query } from '../src/resolvers/query';

describe('Authentication', () => {
  const mockDb = { users: { findById: jest.fn() } };

  test('me query requires authentication', () => {
    const context = { currentUser: null, db: mockDb };

    expect(() => Query.me(null, null, context)).toThrow('Authentication required');
  });

  test('me query returns current user', () => {
    const user = { id: '1', name: 'Test' };
    mockDb.users.findById.mockReturnValue(user);

    const context = {
      currentUser: { id: '1', role: 'user' },
      db: mockDb,
    };

    const result = Query.me(null, null, context);
    expect(result).toEqual(user);
  });
});
```

## Summary

| Aspect     | Implementation                                |
| ---------- | --------------------------------------------- |
| **Where**  | Context factory                               |
| **When**   | Before resolvers execute                      |
| **How**    | Extract header → Validate → Attach to context |
| **Access** | `context.currentUser` in resolvers            |
| **Errors** | `UNAUTHENTICATED`, `FORBIDDEN`                |
