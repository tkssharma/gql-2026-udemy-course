# Module 08: Prisma Database with GraphQL Yoga

A comprehensive demo showing how to connect GraphQL Yoga with Prisma ORM and SQLite database, demonstrating the role of context for database injection.

## Topics Covered

1. **Prisma Setup** - Installing and configuring Prisma with SQLite
2. **Context with Prisma** - Injecting database client via context
3. **Prisma Queries** - CRUD operations in GraphQL resolvers

## 📚 Documentation

Detailed explanations are available in the `docs/` folder:

- [01-prisma-setup.md](./docs/01-prisma-setup.md) - Setting up Prisma with SQLite
- [02-context-with-prisma.md](./docs/02-context-with-prisma.md) - Database injection via context
- [03-prisma-queries.md](./docs/03-prisma-queries.md) - CRUD operations and relations

---

## Project Structure

```
module-08-prisma-database/
├── prisma/
│   ├── schema.prisma     # Database schema
│   ├── seed.ts           # Seed data script
│   └── dev.db            # SQLite database (generated)
├── src/
│   ├── index.ts          # Server entry point
│   ├── db/
│   │   └── prisma.ts     # Prisma client instance
│   ├── context/
│   │   └── index.ts      # Context factory with Prisma
│   ├── resolvers/
│   │   ├── index.ts
│   │   ├── query.ts      # Query resolvers
│   │   ├── mutation.ts   # Mutation resolvers
│   │   └── types.ts      # Field resolvers
│   ├── schema/
│   │   ├── index.ts
│   │   └── typeDefs.ts   # GraphQL schema
│   └── types/
│       └── index.ts      # TypeScript interfaces
├── package.json
└── tsconfig.json
```

---

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Generate Prisma Client

```bash
npm run db:generate
```

### 3. Create Database & Tables

```bash
npm run db:push
```

### 4. Seed Sample Data

```bash
npm run db:seed
```

### 5. Start Development Server

```bash
npm run dev
```

Server runs at: **http://localhost:4000/graphql**

---

## Database Commands

| Command               | Description                            |
| --------------------- | -------------------------------------- |
| `npm run db:generate` | Generate Prisma Client                 |
| `npm run db:push`     | Push schema to database                |
| `npm run db:seed`     | Seed with sample data                  |
| `npm run db:studio`   | Open Prisma Studio (visual DB browser) |
| `npm run db:reset`    | Reset database and re-seed             |

---

## Test Tokens

| Token                | User       | Role  |
| -------------------- | ---------- | ----- |
| `Bearer admin-token` | Admin User | admin |
| `Bearer john-token`  | John Doe   | user  |
| `Bearer jane-token`  | Jane Smith | user  |

Add to HTTP Headers:

```json
{
  "Authorization": "Bearer john-token"
}
```

---

## The Role of Context

Context is the **key to database injection** in GraphQL. Instead of importing Prisma directly in resolvers, we inject it through context:

```typescript
// Context factory
export const createContext = async ({ request }): Promise<GraphQLContext> => {
  return {
    prisma, // Database client
    currentUser, // Authenticated user
    requestId, // Request tracing
  };
};

// Resolver uses context
export const Query = {
  users: async (_, __, context) => {
    return context.prisma.user.findMany();
  },
};
```

### Benefits

- **Testability** - Easy to mock Prisma in tests
- **Loose coupling** - Resolvers don't import database directly
- **Request isolation** - Each request gets its own context
- **Centralized auth** - Authentication handled once in context

---

## Example Queries

### Get All Published Posts

```graphql
query {
  posts {
    id
    title
    published
    author {
      name
    }
    comments {
      content
      author {
        name
      }
    }
  }
}
```

### Get Current User (Requires Auth)

```graphql
# Header: { "Authorization": "Bearer john-token" }
query {
  me {
    id
    name
    email
    posts {
      title
      published
    }
  }
}
```

### Get Single Post with Relations

```graphql
query {
  post(id: "post-id-here") {
    id
    title
    content
    author {
      name
      email
    }
    comments {
      content
      author {
        name
      }
    }
  }
}
```

---

## Example Mutations

### Create Post (Requires Auth)

```graphql
# Header: { "Authorization": "Bearer john-token" }
mutation {
  createPost(input: { title: "My New Post", content: "This is the content of my post...", published: false }) {
    success
    message
    post {
      id
      title
      author {
        name
      }
    }
  }
}
```

### Publish Post

```graphql
# Header: { "Authorization": "Bearer john-token" }
mutation {
  publishPost(id: "post-id-here") {
    success
    message
    post {
      id
      title
      published
    }
  }
}
```

### Create Comment

```graphql
# Header: { "Authorization": "Bearer jane-token" }
mutation {
  createComment(input: { content: "Great post!", postId: "post-id-here" }) {
    success
    message
    comment {
      id
      content
      author {
        name
      }
    }
  }
}
```

### Admin: Create User

```graphql
# Header: { "Authorization": "Bearer admin-token" }
mutation {
  createUser(input: { email: "newuser@example.com", name: "New User", role: "user" }) {
    success
    message
    user {
      id
      name
      email
    }
  }
}
```

---

## Prisma Schema

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String
  role      String   @default("user")
  posts     Post[]
  comments  Comment[]
}

model Post {
  id        String   @id @default(cuid())
  title     String
  content   String
  published Boolean  @default(false)
  author    User     @relation(fields: [authorId], references: [id])
  authorId  String
  comments  Comment[]
}

model Comment {
  id        String   @id @default(cuid())
  content   String
  author    User     @relation(fields: [authorId], references: [id])
  authorId  String
  post      Post     @relation(fields: [postId], references: [id])
  postId    String
}
```

---

## Key Concepts

| Concept                | Description                                          |
| ---------------------- | ---------------------------------------------------- |
| **Prisma Client**      | Type-safe database client auto-generated from schema |
| **Context Injection**  | Pass Prisma to resolvers via context                 |
| **Field Resolvers**    | Resolve nested relations (User.posts, Post.author)   |
| **Connection Pooling** | Single Prisma instance shared across requests        |
| **SQLite**             | File-based database for development                  |

---

## Best Practices

1. **Single Prisma instance** - Share across requests for connection pooling
2. **Inject via context** - Don't import Prisma directly in resolvers
3. **Use field resolvers** - For nested relations instead of `include`
4. **Handle errors** - Check if records exist before update/delete
5. **Type your context** - Use TypeScript interface for type safety
