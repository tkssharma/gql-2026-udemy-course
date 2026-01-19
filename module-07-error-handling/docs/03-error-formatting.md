# Error Formatting

## Overview

Error formatting controls how errors are presented to API consumers. GraphQL Yoga provides hooks to customize error output for different environments (development vs production).

## Default Error Format

By default, GraphQL errors include:

```json
{
  "errors": [
    {
      "message": "Something went wrong",
      "locations": [{ "line": 2, "column": 3 }],
      "path": ["user", "posts"],
      "extensions": {
        "code": "INTERNAL_ERROR"
      }
    }
  ]
}
```

## Error Masking

In production, you often want to hide internal error details from clients:

### Development (Show Everything)

```json
{
  "errors": [
    {
      "message": "Cannot read property 'id' of undefined",
      "locations": [{ "line": 2, "column": 3 }],
      "path": ["user"],
      "extensions": {
        "code": "INTERNAL_ERROR",
        "stacktrace": [
          "TypeError: Cannot read property 'id' of undefined",
          "    at Query.user (/app/resolvers.js:15:20)",
          "    at ..."
        ]
      }
    }
  ]
}
```

### Production (Masked)

```json
{
  "errors": [
    {
      "message": "An unexpected error occurred",
      "path": ["user"],
      "extensions": {
        "code": "INTERNAL_ERROR"
      }
    }
  ]
}
```

## Configuring Error Masking in Yoga

```typescript
import { createYoga } from 'graphql-yoga';

const yoga = createYoga({
  schema,
  maskedErrors: {
    // Custom error masking logic
    maskError: (error, message, isDev) => {
      // In development, show full errors
      if (isDev) {
        return error;
      }

      // In production, check if it's an expected error
      if (isExpectedError(error)) {
        return error; // Show expected errors as-is
      }

      // Mask unexpected errors
      return new GraphQLError('An unexpected error occurred', {
        extensions: { code: 'INTERNAL_ERROR' },
      });
    },
  },
});

// Helper to identify expected errors
function isExpectedError(error: unknown): boolean {
  if (error instanceof GraphQLError) {
    const code = error.extensions?.code;
    const expectedCodes = ['UNAUTHENTICATED', 'FORBIDDEN', 'NOT_FOUND', 'VALIDATION_ERROR', 'CONFLICT'];
    return expectedCodes.includes(code as string);
  }
  return false;
}
```

## Custom Error Formatter

Create a custom formatter for consistent error output:

```typescript
interface FormattedError {
  message: string;
  code: string;
  path?: string[];
  details?: Record<string, unknown>;
  timestamp: string;
  requestId?: string;
}

const formatError = (error: GraphQLError, requestId?: string): FormattedError => {
  return {
    message: error.message,
    code: (error.extensions?.code as string) || 'UNKNOWN_ERROR',
    path: error.path?.map(String),
    details: extractDetails(error.extensions),
    timestamp: new Date().toISOString(),
    requestId,
  };
};

const extractDetails = (extensions?: Record<string, unknown>): Record<string, unknown> | undefined => {
  if (!extensions) return undefined;

  // Remove internal fields, keep useful details
  const { code, stacktrace, ...details } = extensions;
  return Object.keys(details).length > 0 ? details : undefined;
};
```

## Environment-Based Formatting

```typescript
const isDevelopment = process.env.NODE_ENV !== 'production';

const yoga = createYoga({
  schema,
  maskedErrors: !isDevelopment, // Mask errors in production

  // Or use custom logic
  plugins: [
    {
      onResultProcess({ result, setResult }) {
        if (result.errors) {
          const formattedErrors = result.errors.map((error) => {
            if (isDevelopment) {
              // Full error in development
              return {
                ...error,
                extensions: {
                  ...error.extensions,
                  stack: error.originalError?.stack,
                },
              };
            }
            // Minimal error in production
            return formatErrorForProduction(error);
          });

          setResult({
            ...result,
            errors: formattedErrors,
          });
        }
      },
    },
  ],
});
```

## Adding Request Context to Errors

Include request ID for debugging:

```typescript
const yoga = createYoga({
  schema,
  context: async ({ request }) => {
    const requestId = request.headers.get('x-request-id') || generateRequestId();
    return { requestId };
  },
  plugins: [
    {
      onResultProcess({ result, setResult, context }) {
        if (result.errors) {
          const errorsWithRequestId = result.errors.map((error) => ({
            ...error,
            extensions: {
              ...error.extensions,
              requestId: context.requestId,
            },
          }));

          setResult({
            ...result,
            errors: errorsWithRequestId,
          });
        }
      },
    },
  ],
});
```

Output:

```json
{
  "errors": [
    {
      "message": "User not found",
      "extensions": {
        "code": "NOT_FOUND",
        "requestId": "req_abc123"
      }
    }
  ]
}
```

## Logging Errors

Log errors server-side while returning clean errors to clients:

```typescript
const yoga = createYoga({
  schema,
  plugins: [
    {
      onResultProcess({ result, context }) {
        if (result.errors) {
          result.errors.forEach((error) => {
            // Log full error details server-side
            console.error({
              message: error.message,
              code: error.extensions?.code,
              path: error.path,
              stack: error.originalError?.stack,
              requestId: context.requestId,
              userId: context.currentUser?.id,
              timestamp: new Date().toISOString(),
            });
          });
        }
      },
    },
  ],
});
```

## Error Response Patterns

### Consistent Structure

Always return the same structure:

```typescript
interface ErrorResponse {
  errors: Array<{
    message: string;
    code: string;
    field?: string; // For validation errors
    details?: object; // Additional context
  }>;
}
```

### Validation Errors with Field Info

```json
{
  "errors": [
    {
      "message": "Invalid input",
      "extensions": {
        "code": "VALIDATION_ERROR",
        "validationErrors": [
          { "field": "email", "message": "Invalid email format" },
          { "field": "age", "message": "Must be at least 18" }
        ]
      }
    }
  ]
}
```

### Rate Limit Errors with Retry Info

```json
{
  "errors": [
    {
      "message": "Rate limit exceeded",
      "extensions": {
        "code": "RATE_LIMITED",
        "retryAfter": 60,
        "limit": 100,
        "remaining": 0
      }
    }
  ]
}
```

## Best Practices

| Practice                | Description                                |
| ----------------------- | ------------------------------------------ |
| **Mask in production**  | Hide stack traces and internal details     |
| **Include error codes** | Machine-readable codes for client handling |
| **Add request IDs**     | Enable error correlation in logs           |
| **Log server-side**     | Full details for debugging                 |
| **Consistent format**   | Same structure for all errors              |
| **Useful messages**     | Clear, actionable error messages           |

## Summary

```
┌─────────────────────────────────────────────────────────────┐
│                     Error Occurs                             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Log Full Error                             │
│  - Stack trace                                               │
│  - Request context                                           │
│  - User info                                                 │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Format for Client                          │
│  Development: Full details                                   │
│  Production: Masked/sanitized                                │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Return to Client                           │
│  { message, code, path, requestId }                          │
└─────────────────────────────────────────────────────────────┘
```
