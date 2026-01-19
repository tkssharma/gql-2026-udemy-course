# Request-Scoped Data

## What is Request-Scoped Data?

Request-scoped data is information that is unique to each individual request and should not be shared across requests. Examples include:

- **Request ID** - Unique identifier for tracing
- **Timestamp** - When the request started
- **Client IP** - For logging and rate limiting
- **User Agent** - Browser/client information
- **Correlation ID** - For distributed tracing

```
Request 1 (10:00:00)              Request 2 (10:00:01)
┌─────────────────────┐           ┌─────────────────────┐
│ requestId: "abc123" │           │ requestId: "def456" │
│ startTime: 10:00:00 │           │ startTime: 10:00:01 │
│ ip: "192.168.1.1"   │           │ ip: "192.168.1.2"   │
└─────────────────────┘           └─────────────────────┘
         │                                 │
         ▼                                 ▼
    Resolvers                         Resolvers
    (isolated)                        (isolated)
```

## Implementation

### Step 1: Define Request Metadata Type

```typescript
// src/types/index.ts
export interface RequestMeta {
  requestId: string;
  startTime: number;
  ip: string;
  userAgent: string;
}

export interface GraphQLContext {
  request: RequestMeta;
  // ... other context
}
```

### Step 2: Generate Request ID

```typescript
// src/utils/request.ts
export const generateRequestId = (): string => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 9);
  return `req_${timestamp}_${random}`;
};

// Examples: req_m1abc12_x7k9p2q, req_m1abc13_y8l0q3r
```

### Step 3: Extract Request Info in Context

```typescript
// src/context/index.ts
import { generateRequestId } from '../utils/request';
import { RequestMeta, GraphQLContext } from '../types';

export const createContext = async ({ request }): Promise<GraphQLContext> => {
  // Generate unique request ID
  const requestId = generateRequestId();

  // Capture start time
  const startTime = Date.now();

  // Extract client info from headers
  const userAgent = request.headers.get('user-agent') || 'unknown';
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';

  const requestMeta: RequestMeta = {
    requestId,
    startTime,
    ip,
    userAgent,
  };

  return {
    request: requestMeta,
    // ... other context
  };
};
```

### Step 4: Use in Resolvers

```typescript
// src/resolvers/query.ts
export const Query = {
  // Expose request info (useful for debugging)
  requestInfo: (_, __, context: GraphQLContext) => ({
    requestId: context.request.requestId,
    timestamp: new Date(context.request.startTime).toISOString(),
    ip: context.request.ip,
    userAgent: context.request.userAgent,
  }),

  posts: (_, __, context: GraphQLContext) => {
    // Use request ID for tracing
    console.log(`[${context.request.requestId}] Fetching posts`);
    return context.db.posts.findAll();
  },
};
```

## Request-Scoped Logger

A powerful pattern is creating a logger that automatically includes the request ID:

### Logger Implementation

```typescript
// src/services/logger.ts
export interface Logger {
  info: (message: string, meta?: Record<string, unknown>) => void;
  error: (message: string, meta?: Record<string, unknown>) => void;
  warn: (message: string, meta?: Record<string, unknown>) => void;
}

export const createLogger = (requestId: string): Logger => {
  const format = (level: string, message: string, meta?: Record<string, unknown>): string => {
    const timestamp = new Date().toISOString();
    const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] [${level}] [${requestId}] ${message}${metaStr}`;
  };

  return {
    info: (message, meta) => console.log(format('INFO', message, meta)),
    error: (message, meta) => console.error(format('ERROR', message, meta)),
    warn: (message, meta) => console.warn(format('WARN', message, meta)),
  };
};
```

### Add Logger to Context

```typescript
// src/context/index.ts
import { createLogger } from '../services/logger';

export const createContext = async ({ request }): Promise<GraphQLContext> => {
  const requestId = generateRequestId();
  const logger = createLogger(requestId);

  // Log incoming request
  logger.info('Incoming request', {
    path: new URL(request.url).pathname,
    method: request.method,
  });

  return {
    request: { requestId, startTime: Date.now(), ... },
    logger,
    // ... other context
  };
};
```

### Use Logger in Resolvers

```typescript
export const Query = {
  posts: (_, __, context: GraphQLContext) => {
    context.logger.info('Fetching posts');

    const posts = context.db.posts.findAll();

    context.logger.info('Posts fetched', { count: posts.length });
    return posts;
  },
};

export const Mutation = {
  createPost: (_, args, context: GraphQLContext) => {
    context.logger.info('Creating post', { title: args.input.title });

    try {
      const post = context.db.posts.create(args.input);
      context.logger.info('Post created', { postId: post.id });
      return { success: true, post };
    } catch (error) {
      context.logger.error('Failed to create post', { error: error.message });
      throw error;
    }
  },
};
```

### Log Output Example

```
[2024-01-15T10:30:00.000Z] [INFO] [req_m1abc12_x7k9p2q] Incoming request {"path":"/graphql","method":"POST"}
[2024-01-15T10:30:00.005Z] [INFO] [req_m1abc12_x7k9p2q] Fetching posts
[2024-01-15T10:30:00.010Z] [INFO] [req_m1abc12_x7k9p2q] Posts fetched {"count":5}
[2024-01-15T10:30:00.500Z] [INFO] [req_m1abc13_y8l0q3r] Incoming request {"path":"/graphql","method":"POST"}
[2024-01-15T10:30:00.505Z] [INFO] [req_m1abc13_y8l0q3r] Creating post {"title":"New Post"}
```

Notice how each request has its own ID, making it easy to trace all logs for a single request.

## Performance Tracking

Track request duration using request-scoped start time:

```typescript
// Middleware or plugin to log duration
const logDuration = (context: GraphQLContext) => {
  const duration = Date.now() - context.request.startTime;
  context.logger.info('Request completed', { durationMs: duration });
};
```

## Use Cases

### 1. Distributed Tracing

```typescript
// Pass request ID to downstream services
const fetchUserData = async (userId: string, context: GraphQLContext) => {
  return fetch(`http://user-service/users/${userId}`, {
    headers: {
      'X-Request-ID': context.request.requestId,
    },
  });
};
```

### 2. Rate Limiting

```typescript
// Track requests per IP
const checkRateLimit = (context: GraphQLContext) => {
  const { ip } = context.request;
  const count = rateLimiter.increment(ip);

  if (count > MAX_REQUESTS_PER_MINUTE) {
    throw new GraphQLError('Rate limit exceeded');
  }
};
```

### 3. Audit Logging

```typescript
export const Mutation = {
  deleteUser: (_, { id }, context: GraphQLContext) => {
    context.logger.info('User deletion requested', {
      targetUserId: id,
      requestedBy: context.currentUser?.id,
      ip: context.request.ip,
    });

    // ... delete logic
  },
};
```

### 4. Error Correlation

```typescript
// Include request ID in error responses
throw new GraphQLError('Something went wrong', {
  extensions: {
    code: 'INTERNAL_ERROR',
    requestId: context.request.requestId, // For support tickets
  },
});
```

## Summary

| Data        | Purpose                     | Example                 |
| ----------- | --------------------------- | ----------------------- |
| `requestId` | Trace logs across a request | `req_m1abc12_x7k9p2q`   |
| `startTime` | Measure duration            | `1705312200000`         |
| `ip`        | Rate limiting, audit        | `192.168.1.1`           |
| `userAgent` | Analytics, debugging        | `Mozilla/5.0...`        |
| `logger`    | Contextual logging          | `context.logger.info()` |

**Key Principle**: Each request gets its own isolated metadata. Never share request-scoped data between requests.
