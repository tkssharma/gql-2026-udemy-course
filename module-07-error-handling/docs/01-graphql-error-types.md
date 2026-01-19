# GraphQL Error Types

## Overview

GraphQL has a unique approach to error handling compared to REST APIs. Instead of HTTP status codes, GraphQL returns errors in a structured `errors` array alongside any partial data.

## The GraphQL Error Response Structure

```json
{
  "data": {
    "user": null
  },
  "errors": [
    {
      "message": "User not found",
      "locations": [{ "line": 2, "column": 3 }],
      "path": ["user"],
      "extensions": {
        "code": "NOT_FOUND",
        "resourceId": "999"
      }
    }
  ]
}
```

### Error Fields

| Field        | Description                            |
| ------------ | -------------------------------------- |
| `message`    | Human-readable error description       |
| `locations`  | Where in the query the error occurred  |
| `path`       | The field path that caused the error   |
| `extensions` | Custom metadata (error codes, details) |

## Types of GraphQL Errors

### 1. Syntax Errors

Occur when the query is malformed:

```graphql
# Missing closing brace
query {
  users {
    id
    name
```

Response:

```json
{
  "errors": [
    {
      "message": "Syntax Error: Expected Name, found <EOF>.",
      "locations": [{ "line": 5, "column": 1 }]
    }
  ]
}
```

### 2. Validation Errors

Occur when the query doesn't match the schema:

```graphql
query {
  users {
    id
    unknownField # Field doesn't exist
  }
}
```

Response:

```json
{
  "errors": [
    {
      "message": "Cannot query field \"unknownField\" on type \"User\".",
      "locations": [{ "line": 4, "column": 5 }]
    }
  ]
}
```

### 3. Execution Errors

Occur during resolver execution:

```graphql
query {
  user(id: "999") {
    id
    name
  }
}
```

Response:

```json
{
  "data": { "user": null },
  "errors": [
    {
      "message": "User with id \"999\" not found",
      "path": ["user"],
      "extensions": { "code": "NOT_FOUND" }
    }
  ]
}
```

## Error Categories by Use Case

### Authentication Errors

When a user is not logged in:

```typescript
throw new GraphQLError('Authentication required', {
  extensions: { code: 'UNAUTHENTICATED' },
});
```

### Authorization Errors

When a user lacks permission:

```typescript
throw new GraphQLError('Admin access required', {
  extensions: { code: 'FORBIDDEN' },
});
```

### Validation Errors

When input data is invalid:

```typescript
throw new GraphQLError('Email format is invalid', {
  extensions: {
    code: 'VALIDATION_ERROR',
    field: 'email',
    value: 'not-an-email',
  },
});
```

### Not Found Errors

When a resource doesn't exist:

```typescript
throw new GraphQLError('User not found', {
  extensions: {
    code: 'NOT_FOUND',
    resource: 'User',
    id: '999',
  },
});
```

### Business Logic Errors

Domain-specific errors:

```typescript
throw new GraphQLError('Insufficient stock', {
  extensions: {
    code: 'INSUFFICIENT_STOCK',
    requested: 10,
    available: 3,
  },
});
```

### Internal Errors

Unexpected server errors:

```typescript
throw new GraphQLError('An internal error occurred', {
  extensions: { code: 'INTERNAL_ERROR' },
});
```

## Standard Error Codes

Common error codes used in GraphQL APIs:

| Code               | HTTP Equivalent | Description                      |
| ------------------ | --------------- | -------------------------------- |
| `UNAUTHENTICATED`  | 401             | No valid credentials             |
| `FORBIDDEN`        | 403             | Valid credentials, no permission |
| `NOT_FOUND`        | 404             | Resource doesn't exist           |
| `VALIDATION_ERROR` | 400             | Invalid input data               |
| `CONFLICT`         | 409             | Resource conflict                |
| `INTERNAL_ERROR`   | 500             | Server error                     |

## GraphQL vs REST Error Handling

| Aspect          | REST                        | GraphQL              |
| --------------- | --------------------------- | -------------------- |
| Status Codes    | HTTP status (200, 404, 500) | Always 200 (usually) |
| Error Location  | Response body or status     | `errors` array       |
| Partial Data    | Not possible                | Supported            |
| Multiple Errors | One per request             | Multiple in array    |
| Error Details   | Varies by API               | Structured format    |

## Key Takeaways

1. **GraphQL returns 200 OK** even when errors occur (usually)
2. **Errors are in the `errors` array**, not HTTP status
3. **Use `extensions.code`** for machine-readable error types
4. **Partial responses are possible** - some fields succeed, others fail
5. **Always include meaningful messages** for debugging
