# Module 08-01: Prisma Basics with SQLite

A minimal example demonstrating **Prisma ORM concepts** with SQLite database, using **GraphQL context** to inject the Prisma client.

## Prisma Concepts Covered

1. **Schema** - Define your data models in `prisma/schema.prisma`
2. **Migration** - Version control your database schema changes
3. **Seed** - Populate database with initial data
4. **Client** - Type-safe database queries
5. **Context** - Inject Prisma client via GraphQL context

---

## Project Structure

```
module-08-prisma-database-01/
├── prisma/
│   ├── schema.prisma    # Database schema definition
│   ├── seed.ts          # Seed script for initial data
│   └── dev.db           # SQLite database file (generated)
├── src/
│   ├── index.ts         # Server entry point
│   ├── db/prisma.ts     # Prisma client singleton
│   ├── context/index.ts # Context factory (injects Prisma)
│   ├── types/index.ts   # TypeScript types for context
│   ├── schema/          # GraphQL schema
│   └── resolvers/       # GraphQL resolvers using context.prisma
└── package.json
```

---

## Prisma Schema Explained

```prisma
// prisma/schema.prisma

// 1. Generator - Creates the Prisma Client
generator client {
  provider = "prisma-client-js"
}

// 2. Datasource - Database connection (SQLite)
datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}

// 3. Models - Define your data structure
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String
  createdAt DateTime @default(now())
  posts     Post[]   // Relation: User has many Posts
}

model Post {
  id        Int      @id @default(autoincrement())
  title     String
  content   String?
  published Boolean  @default(false)
  authorId  Int
  author    User     @relation(fields: [authorId], references: [id])
  createdAt DateTime @default(now())
}
```

---

## Prisma Commands

| Command                  | Description                            |
| ------------------------ | -------------------------------------- |
| `npx prisma generate`    | Generate Prisma Client from schema     |
| `npx prisma db push`     | Push schema to database (no migration) |
| `npx prisma migrate dev` | Create and apply migration             |
| `npx prisma db seed`     | Run seed script                        |
| `npx prisma studio`      | Open database GUI                      |

---

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Generate Prisma Client
npm run db:generate

# 3. Create database and apply schema
npm run db:push

# 4. Seed the database
npm run db:seed

# 5. Start the server
npm run dev
```

Server runs at: **http://localhost:4000/graphql**

---

## Migration vs db push

### `prisma db push` (Development)

- Quick way to sync schema with database
- No migration history
- Good for prototyping

### `prisma migrate dev` (Production-ready)

- Creates migration files
- Tracks schema history
- Can be replayed on other environments

```bash
# Create a migration
npx prisma migrate dev --name add_user_table

# This creates:
# prisma/migrations/
#   └── 20240101_add_user_table/
#       └── migration.sql
```

---

## Seed Script

```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  const alice = await prisma.user.create({
    data: { email: 'alice@example.com', name: 'Alice' },
  });

  // Create posts
  await prisma.post.create({
    data: {
      title: 'Hello World',
      authorId: alice.id,
      published: true,
    },
  });
}

main().finally(() => prisma.$disconnect());
```

---

## Example Queries

### Get All Users

```graphql
query {
  users {
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

### Create User

```graphql
mutation {
  createUser(email: "new@example.com", name: "New User") {
    id
    name
    email
  }
}
```

### Create Post

```graphql
mutation {
  createPost(title: "My Post", content: "Content", authorId: 1) {
    id
    title
    author {
      name
    }
  }
}
```

---

## Why SQLite for Development?

- **No setup required** - Just a file
- **Fast** - Great for local development
- **Portable** - Database is a single file
- **Easy to reset** - Just delete `dev.db`

---

## Using Prisma with GraphQL Context

Instead of importing Prisma directly in resolvers, we inject it via context:

### 1. Define Context Type

```typescript
// src/types/index.ts
import { PrismaClient } from '@prisma/client';

export interface GraphQLContext {
  prisma: PrismaClient;
}
```

### 2. Create Context Factory

```typescript
// src/context/index.ts
import { prisma } from '../db/prisma.js';
import { GraphQLContext } from '../types/index.js';

export const createContext = (): GraphQLContext => {
  return {
    prisma, // Prisma client passed via context
  };
};
```

### 3. Pass Context to Yoga

```typescript
// src/index.ts
const yoga = createYoga({
  schema,
  context: createContext, // Inject Prisma via context
});
```

### 4. Use context.prisma in Resolvers

```typescript
// src/resolvers/index.ts
export const resolvers = {
  Query: {
    users: (_, __, context: GraphQLContext) => context.prisma.user.findMany(),

    user: (_, args: { id: number }, context: GraphQLContext) =>
      context.prisma.user.findUnique({ where: { id: args.id } }),
  },
};
```

### Why Use Context?

- **Testability** - Easy to mock Prisma in tests
- **Flexibility** - Can swap implementations
- **Best Practice** - Resolvers don't import dependencies directly

---

## Key Takeaways

1. **Schema-first** - Define models in `schema.prisma`
2. **Type-safe** - Prisma Client provides full TypeScript support
3. **Migrations** - Track database changes over time
4. **Seeding** - Automate initial data setup
5. **Context injection** - Pass Prisma via context, not direct imports
