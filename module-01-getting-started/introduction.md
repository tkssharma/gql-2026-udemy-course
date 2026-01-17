# 1. Introduction to GraphQL

---

## What is GraphQL?

GraphQL is a **query language for APIs** and a **runtime for executing those queries**. It was developed by Facebook in 2012 and open-sourced in 2015.

### Key Characteristics

- **Declarative Data Fetching**: Clients specify exactly what data they need
- **Single Endpoint**: All operations go through one endpoint (`/graphql`)
- **Strongly Typed**: Every piece of data has a defined type
- **Hierarchical**: Queries mirror the shape of the response
- **Introspective**: APIs are self-documenting

### How It Works

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   Client    │ ──────► │   GraphQL   │ ──────► │   Data      │
│  (Query)    │         │   Server    │         │   Sources   │
└─────────────┘         └─────────────┘         └─────────────┘
                              │
                              ▼
                        ┌─────────────┐
                        │   Schema    │
                        │  (Types +   │
                        │  Resolvers) │
                        └─────────────┘
```

### Example

```graphql
# Client sends this query
query {
  user(id: "1") {
    name
    email
    posts {
      title
    }
  }
}
```

```json
// Server returns exactly this shape
{
  "data": {
    "user": {
      "name": "John Doe",
      "email": "john@example.com",
      "posts": [{ "title": "Getting Started with GraphQL" }, { "title": "Advanced TypeScript Patterns" }]
    }
  }
}
```

**The client asked for `name`, `email`, and `posts.title` — and got exactly that. Nothing more, nothing less.**

---

## GraphQL vs REST: Key Differences

### 1. Endpoints

| REST                 | GraphQL         |
| -------------------- | --------------- |
| Multiple endpoints   | Single endpoint |
| `GET /users`         | `POST /graphql` |
| `GET /users/1`       | `POST /graphql` |
| `GET /users/1/posts` | `POST /graphql` |
| `POST /users`        | `POST /graphql` |

### 2. Data Fetching

**REST: Over-fetching**

```bash
GET /users/1
# Returns ALL user fields, even if you only need the name
{
  "id": 1,
  "name": "John",
  "email": "john@example.com",
  "phone": "123-456-7890",
  "address": "...",
  "createdAt": "...",
  "updatedAt": "...",
  // ... 20 more fields you don't need
}
```

**GraphQL: Precise fetching**

```graphql
query {
  user(id: "1") {
    name # Only get what you need
  }
}
# Returns: { "data": { "user": { "name": "John" } } }
```

### 3. Multiple Resources

**REST: Multiple requests (Under-fetching)**

```bash
# Need user + their posts + each post's comments
GET /users/1           # Request 1
GET /users/1/posts     # Request 2
GET /posts/1/comments  # Request 3
GET /posts/2/comments  # Request 4
# ... N+1 problem
```

**GraphQL: Single request**

```graphql
query {
  user(id: "1") {
    name
    posts {
      title
      comments {
        text
        author {
          name
        }
      }
    }
  }
}
# One request, all data
```

### 4. Versioning

| REST                                 | GraphQL                     |
| ------------------------------------ | --------------------------- |
| URL versioning (`/v1/`, `/v2/`)      | Schema evolution            |
| Breaking changes require new version | Deprecate fields gracefully |
| Multiple versions to maintain        | Single evolving schema      |

**GraphQL Deprecation:**

```graphql
type User {
  id: ID!
  name: String!
  fullName: String! # New field
  username: String @deprecated(reason: "Use 'name' instead")
}
```

### 5. Type System

| REST                       | GraphQL                 |
| -------------------------- | ----------------------- |
| Optional (OpenAPI/Swagger) | Built-in, required      |
| Documentation separate     | Self-documenting        |
| Runtime type errors        | Compile-time validation |

### Comparison Summary

| Feature        | REST                | GraphQL           |
| -------------- | ------------------- | ----------------- |
| Endpoints      | Multiple            | Single            |
| Data fetching  | Fixed response      | Client-specified  |
| Over-fetching  | Common              | Eliminated        |
| Under-fetching | Common              | Eliminated        |
| Type system    | Optional            | Required          |
| Caching        | HTTP caching (easy) | Requires strategy |
| File uploads   | Native              | Requires spec     |
| Learning curve | Lower               | Higher            |
| Tooling        | Mature              | Growing rapidly   |

### When to Use Each

**Use REST when:**

- Simple CRUD operations
- Heavy caching requirements
- File-heavy operations
- Team is REST-experienced
- Public API with simple needs

**Use GraphQL when:**

- Complex, nested data relationships
- Multiple clients with different data needs (web, mobile, IoT)
- Rapid frontend iteration
- Real-time features needed
- Avoiding over/under-fetching is critical

---

## Core Concepts: Queries, Mutations, Subscriptions

GraphQL has three operation types:

### 1. Queries (Read Data)

Queries are for **fetching data**. They are read-only and don't modify server state.

```graphql
# Basic query
query {
  users {
    id
    name
  }
}

# Query with arguments
query {
  user(id: "1") {
    name
    email
  }
}

# Named query with variables
query GetUser($userId: ID!) {
  user(id: $userId) {
    name
    email
    posts(limit: 5) {
      title
      createdAt
    }
  }
}
```

**Query Execution:**

```
┌──────────────────────────────────────────────────────────┐
│  query {                                                 │
│    user(id: "1") {        ◄── Resolver: Query.user       │
│      name                 ◄── Field from User type       │
│      posts {              ◄── Resolver: User.posts       │
│        title              ◄── Field from Post type       │
│      }                                                   │
│    }                                                     │
│  }                                                       │
└──────────────────────────────────────────────────────────┘
```

### 2. Mutations (Write Data)

Mutations are for **creating, updating, or deleting data**. They modify server state.

```graphql
# Create
mutation {
  createUser(input: { name: "John", email: "john@example.com" }) {
    id
    name
  }
}

# Update
mutation {
  updateUser(id: "1", input: { name: "John Doe" }) {
    id
    name
  }
}

# Delete
mutation {
  deleteUser(id: "1") {
    success
    message
  }
}

# Named mutation with variables
mutation CreatePost($input: CreatePostInput!) {
  createPost(input: $input) {
    id
    title
    author {
      name
    }
  }
}
```

**Mutation Best Practices:**

- Return the modified object
- Use input types for complex inputs
- Return success/error information
- Mutations run sequentially (unlike queries which can run in parallel)

### 3. Subscriptions (Real-time Data)

Subscriptions are for **real-time updates**. They use WebSockets to push data to clients.

```graphql
# Subscribe to new messages
subscription {
  messageCreated(roomId: "general") {
    id
    text
    author {
      name
    }
    createdAt
  }
}

# Subscribe to user status changes
subscription OnUserStatusChange($userId: ID!) {
  userStatusChanged(userId: $userId) {
    userId
    status
    lastSeen
  }
}
```

**Subscription Flow:**

```
┌─────────┐                    ┌─────────┐
│ Client  │ ◄───WebSocket────► │ Server  │
└────┬────┘                    └────┬────┘
     │                              │
     │  subscription {              │
     │    messageCreated {          │
     │      text                    │
     │    }                         │
     │  }                           │
     │ ─────────────────────────────►
     │                              │
     │     { text: "Hello!" }       │
     │ ◄─────────────────────────────
     │                              │
     │     { text: "Hi there!" }    │
     │ ◄─────────────────────────────
     │                              │
     │     { text: "How are you?" } │
     │ ◄─────────────────────────────
```

### Operation Comparison

| Operation    | Purpose     | HTTP Method   | Real-time |
| ------------ | ----------- | ------------- | --------- |
| Query        | Read data   | POST (or GET) | No        |
| Mutation     | Write data  | POST          | No        |
| Subscription | Stream data | WebSocket     | Yes       |

---

## GraphQL Schema Definition Language (SDL)

SDL is the language used to define your GraphQL schema. It describes:

- **Types**: The shape of your data
- **Queries**: How to read data
- **Mutations**: How to write data
- **Subscriptions**: How to receive real-time updates

### Scalar Types (Primitives)

```graphql
type Example {
  id: ID! # Unique identifier
  name: String! # UTF-8 string
  age: Int! # 32-bit integer
  price: Float! # Double-precision float
  active: Boolean! # true or false
}
```

**The `!` means non-nullable (required).**

### Object Types

```graphql
type User {
  id: ID!
  name: String!
  email: String!
  age: Int
  posts: [Post!]! # List of Posts (non-null list, non-null items)
  profile: Profile # Nullable relationship
}

type Post {
  id: ID!
  title: String!
  content: String!
  published: Boolean!
  author: User! # Relationship to User
  tags: [String!] # Nullable list of non-null strings
}

type Profile {
  bio: String
  avatar: String
  website: String
}
```

### Nullability Rules

```graphql
field: String      # Nullable string (can be null)
field: String!     # Non-null string (never null)
field: [String]    # Nullable list of nullable strings
field: [String!]   # Nullable list of non-null strings
field: [String]!   # Non-null list of nullable strings
field: [String!]!  # Non-null list of non-null strings
```

### Input Types

Input types are used for mutation/query arguments:

```graphql
input CreateUserInput {
  name: String!
  email: String!
  age: Int
}

input UpdateUserInput {
  name: String
  email: String
  age: Int
}

input PostFilters {
  published: Boolean
  authorId: ID
  tags: [String!]
}
```

### Enums

```graphql
enum UserRole {
  ADMIN
  MODERATOR
  USER
  GUEST
}

enum PostStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}

type User {
  id: ID!
  name: String!
  role: UserRole!
}
```

### Interfaces

```graphql
interface Node {
  id: ID!
}

interface Timestamped {
  createdAt: String!
  updatedAt: String!
}

type User implements Node & Timestamped {
  id: ID!
  name: String!
  createdAt: String!
  updatedAt: String!
}

type Post implements Node & Timestamped {
  id: ID!
  title: String!
  createdAt: String!
  updatedAt: String!
}
```

### Union Types

```graphql
union SearchResult = User | Post | Comment

type Query {
  search(query: String!): [SearchResult!]!
}
```

### Complete Schema Example

```graphql
# Enums
enum UserRole {
  ADMIN
  USER
}

# Types
type User {
  id: ID!
  name: String!
  email: String!
  role: UserRole!
  posts: [Post!]!
  createdAt: String!
}

type Post {
  id: ID!
  title: String!
  content: String!
  published: Boolean!
  author: User!
  createdAt: String!
}

# Input Types
input CreateUserInput {
  name: String!
  email: String!
  role: UserRole = USER
}

input CreatePostInput {
  title: String!
  content: String!
}

# Root Types
type Query {
  users: [User!]!
  user(id: ID!): User
  posts(published: Boolean): [Post!]!
  post(id: ID!): Post
}

type Mutation {
  createUser(input: CreateUserInput!): User!
  createPost(input: CreatePostInput!): Post!
  publishPost(id: ID!): Post!
  deletePost(id: ID!): Boolean!
}

type Subscription {
  postCreated: Post!
  postPublished: Post!
}
```

---

## Why GraphQL Yoga?

GraphQL Yoga is a fully-featured, batteries-included GraphQL server by [The Guild](https://the-guild.dev/).

### Key Features

#### 1. Fully Spec-Compliant

- Follows the official GraphQL specification
- Supports all GraphQL features out of the box

#### 2. Platform Agnostic

```typescript
// Node.js
import { createServer } from 'node:http';
const server = createServer(yoga);

// Express
app.use('/graphql', yoga);

// Fastify
app.route({ url: '/graphql', method: ['GET', 'POST'], handler: yoga });

// Cloudflare Workers
export default { fetch: yoga.fetch };

// Deno
Deno.serve(yoga.fetch);

// Bun
Bun.serve({ fetch: yoga.fetch });

// AWS Lambda
export const handler = yoga;
```

#### 3. Built-in Features

| Feature            | Description               |
| ------------------ | ------------------------- |
| **GraphiQL**       | Interactive playground    |
| **Subscriptions**  | Real-time with WebSockets |
| **File Uploads**   | GraphQL multipart spec    |
| **@defer/@stream** | Incremental delivery      |
| **CORS**           | Cross-origin support      |
| **Health Check**   | `/health` endpoint        |

#### 4. TypeScript First

```typescript
import { createYoga, createSchema } from 'graphql-yoga';

interface Context {
  currentUser: User | null;
}

const yoga = createYoga<Context>({
  schema,
  context: async ({ request }) => ({
    currentUser: await authenticate(request),
  }),
});
```

#### 5. Plugin System (Envelop)

```typescript
import { createYoga } from 'graphql-yoga';
import { useDepthLimit } from '@envelop/depth-limit';
import { useRateLimiter } from '@envelop/rate-limiter';
import { useJWT } from '@envelop/jwt';

const yoga = createYoga({
  schema,
  plugins: [
    useDepthLimit({ maxDepth: 10 }),
    useRateLimiter({
      /* config */
    }),
    useJWT({
      /* config */
    }),
  ],
});
```

#### 6. Performance

- Minimal overhead
- Efficient execution
- Built on modern standards (Fetch API)

### Comparison with Other Servers

| Feature          | Yoga           | Apollo Server   | Express-GraphQL |
| ---------------- | -------------- | --------------- | --------------- |
| TypeScript       | ✅ First-class | ✅ Good         | ⚠️ Basic        |
| Subscriptions    | ✅ Built-in    | ✅ Separate pkg | ❌ No           |
| File Uploads     | ✅ Built-in    | ⚠️ Plugin       | ❌ No           |
| Platform Support | ✅ Universal   | ⚠️ Limited      | ⚠️ Express only |
| Bundle Size      | ✅ Small       | ❌ Large        | ✅ Small        |
| Plugin System    | ✅ Envelop     | ✅ Apollo       | ❌ No           |
| Maintained       | ✅ Active      | ✅ Active       | ⚠️ Minimal      |

### Quick Start

```typescript
import { createServer } from 'node:http';
import { createYoga, createSchema } from 'graphql-yoga';

const yoga = createYoga({
  schema: createSchema({
    typeDefs: /* GraphQL */ `
      type Query {
        hello: String!
      }
    `,
    resolvers: {
      Query: {
        hello: () => 'Hello from GraphQL Yoga!',
      },
    },
  }),
});

const server = createServer(yoga);

server.listen(4000, () => {
  console.log('🧘 Yoga server running at http://localhost:4000/graphql');
});
```

---

## Summary

| Concept           | Key Takeaway                                       |
| ----------------- | -------------------------------------------------- |
| **GraphQL**       | Query language for APIs with precise data fetching |
| **vs REST**       | Single endpoint, no over/under-fetching, typed     |
| **Queries**       | Read data (like GET)                               |
| **Mutations**     | Write data (like POST/PUT/DELETE)                  |
| **Subscriptions** | Real-time data via WebSockets                      |
| **SDL**           | Language to define types, queries, mutations       |
| **GraphQL Yoga**  | Modern, TypeScript-first, universal GraphQL server |

---

## Next: [2. Project Setup →](./2.md)
