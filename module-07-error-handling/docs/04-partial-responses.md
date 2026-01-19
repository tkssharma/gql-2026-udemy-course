# Partial Responses

## What are Partial Responses?

Unlike REST APIs where a request either succeeds or fails entirely, GraphQL can return **partial data** - some fields succeed while others fail. This is one of GraphQL's most powerful features.

## How Partial Responses Work

```graphql
query {
  user(id: "1") {
    name # ✅ Succeeds
    email # ✅ Succeeds
    secretData # ❌ Fails (no permission)
  }
}
```

Response:

```json
{
  "data": {
    "user": {
      "name": "John",
      "email": "john@example.com",
      "secretData": null
    }
  },
  "errors": [
    {
      "message": "Not authorized to view secret data",
      "path": ["user", "secretData"],
      "extensions": { "code": "FORBIDDEN" }
    }
  ]
}
```

**Key Point**: The client gets the data that succeeded AND information about what failed.

## Nullable vs Non-Nullable Fields

The schema determines how errors propagate:

### Nullable Field (Recommended for partial responses)

```graphql
type User {
  name: String!
  posts: [Post] # Nullable - can be null on error
}
```

If `posts` fails, only that field is null:

```json
{
  "data": {
    "user": {
      "name": "John",
      "posts": null
    }
  },
  "errors": [{ "path": ["user", "posts"], ... }]
}
```

### Non-Nullable Field

```graphql
type User {
  name: String!
  posts: [Post]! # Non-nullable - error bubbles up
}
```

If `posts` fails, the entire `user` becomes null:

```json
{
  "data": {
    "user": null
  },
  "errors": [{ "path": ["user", "posts"], ... }]
}
```

## Error Propagation Rules

```
Field Error
    │
    ▼
┌─────────────────────────────────────┐
│  Is field nullable?                  │
└─────────────────────────────────────┘
    │                    │
   Yes                   No
    │                    │
    ▼                    ▼
Field = null        Error bubbles to parent
                         │
                         ▼
                ┌─────────────────────────────────────┐
                │  Is parent nullable?                 │
                └─────────────────────────────────────┘
                    │                    │
                   Yes                   No
                    │                    │
                    ▼                    ▼
              Parent = null       Continue bubbling...
```

## Implementing Partial Responses

### Pattern 1: Result Types

Create wrapper types that include both data and errors:

```graphql
type UserResult {
  user: User
  error: String
}

type BatchUsersResult {
  users: [UserResult!]!
  successCount: Int!
  errorCount: Int!
}

type Query {
  batchUsers(ids: [ID!]!): BatchUsersResult!
}
```

Resolver:

```typescript
const Query = {
  batchUsers: (_, { ids }) => {
    const results = ids.map((id) => {
      const user = db.users.findById(id);
      if (user) {
        return { user, error: null };
      }
      return { user: null, error: `User ${id} not found` };
    });

    return {
      users: results,
      successCount: results.filter((r) => r.user).length,
      errorCount: results.filter((r) => r.error).length,
    };
  },
};
```

Response:

```json
{
  "data": {
    "batchUsers": {
      "users": [
        { "user": { "id": "1", "name": "John" }, "error": null },
        { "user": null, "error": "User 999 not found" },
        { "user": { "id": "2", "name": "Jane" }, "error": null }
      ],
      "successCount": 2,
      "errorCount": 1
    }
  }
}
```

### Pattern 2: Union Types for Results

```graphql
type User {
  id: ID!
  name: String!
}

type UserNotFound {
  message: String!
  requestedId: ID!
}

union UserResult = User | UserNotFound

type Query {
  user(id: ID!): UserResult!
}
```

Resolver:

```typescript
const Query = {
  user: (_, { id }) => {
    const user = db.users.findById(id);
    if (user) {
      return { __typename: 'User', ...user };
    }
    return {
      __typename: 'UserNotFound',
      message: 'User not found',
      requestedId: id,
    };
  },
};
```

Query:

```graphql
query {
  user(id: "999") {
    ... on User {
      id
      name
    }
    ... on UserNotFound {
      message
      requestedId
    }
  }
}
```

### Pattern 3: Graceful Degradation

Return default/fallback values instead of errors:

```typescript
const User_Resolver = {
  avatar: async (user, _, context) => {
    try {
      return await fetchAvatar(user.id);
    } catch (error) {
      context.logger.error('Failed to fetch avatar', { userId: user.id });
      return '/default-avatar.png'; // Fallback
    }
  },

  recentPosts: async (user, _, context) => {
    try {
      return await fetchRecentPosts(user.id);
    } catch (error) {
      context.logger.error('Failed to fetch posts', { userId: user.id });
      return []; // Empty array fallback
    }
  },
};
```

## Batch Operations

For operations on multiple items:

```graphql
input CreateUsersInput {
  users: [CreateUserInput!]!
}

type CreateUserResult {
  input: CreateUserInput!
  user: User
  error: String
}

type CreateUsersResponse {
  results: [CreateUserResult!]!
  successCount: Int!
  failureCount: Int!
}

type Mutation {
  createUsers(input: CreateUsersInput!): CreateUsersResponse!
}
```

Resolver:

```typescript
const Mutation = {
  createUsers: async (_, { input }) => {
    const results = await Promise.all(
      input.users.map(async (userInput) => {
        try {
          const user = await db.users.create(userInput);
          return { input: userInput, user, error: null };
        } catch (error) {
          return {
            input: userInput,
            user: null,
            error: error.message,
          };
        }
      }),
    );

    return {
      results,
      successCount: results.filter((r) => r.user).length,
      failureCount: results.filter((r) => r.error).length,
    };
  },
};
```

## When to Use Partial Responses

| Scenario           | Approach                                 |
| ------------------ | ---------------------------------------- |
| Batch fetching     | Result types with success/error per item |
| Optional data      | Nullable fields                          |
| Critical data      | Non-nullable fields (fail fast)          |
| Fallback available | Graceful degradation                     |
| Multiple outcomes  | Union types                              |

## Client-Side Handling

```typescript
// Client code
const { data, errors } = await client.query({ query: BATCH_USERS });

if (errors) {
  // Log errors but continue with partial data
  console.warn('Some requests failed:', errors);
}

// Process successful results
const successfulUsers = data.batchUsers.users.filter((result) => result.user !== null).map((result) => result.user);

// Handle failures
const failedRequests = data.batchUsers.users.filter((result) => result.error !== null);

if (failedRequests.length > 0) {
  showWarning(`${failedRequests.length} users could not be loaded`);
}
```

## Best Practices

1. **Use nullable fields** for non-critical data
2. **Use non-nullable fields** for essential data
3. **Provide result types** for batch operations
4. **Include error details** in result types
5. **Log failures server-side** even with graceful degradation
6. **Document partial response behavior** in your API docs

## Summary

```
┌─────────────────────────────────────────────────────────────┐
│                    GraphQL Query                             │
│  { user { name, posts, avatar } }                            │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
   name: ✅              posts: ❌              avatar: ✅
   "John"              (service down)         "pic.jpg"
        │                     │                     │
        └─────────────────────┼─────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  Response:                                                   │
│  {                                                           │
│    "data": { "user": { "name": "John", "posts": null,       │
│                        "avatar": "pic.jpg" } },              │
│    "errors": [{ "path": ["user", "posts"], ... }]           │
│  }                                                           │
└─────────────────────────────────────────────────────────────┘
```

Partial responses let clients get the best possible result even when some parts fail.
