# Prisma Setup with GraphQL Yoga

## What is Prisma?

Prisma is a modern database toolkit that provides:

- **Type-safe database client** - Auto-generated from your schema
- **Schema migrations** - Version control for your database
- **Prisma Studio** - Visual database browser
- **Support for multiple databases** - PostgreSQL, MySQL, SQLite, MongoDB, etc.

## Why Prisma with GraphQL?

```
┌─────────────────────────────────────────────────────────────┐
│                    GraphQL Schema                            │
│  type User { id, name, email, posts }                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Prisma Client                             │
│  prisma.user.findMany()                                      │
│  prisma.user.create({ data: {...} })                         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    SQLite Database                           │
│  users, posts, comments tables                               │
└─────────────────────────────────────────────────────────────┘
```

## Project Setup

### 1. Install Dependencies

```bash
npm install @prisma/client graphql graphql-yoga
npm install -D prisma typescript tsx @types/node
```

### 2. Initialize Prisma

```bash
npx prisma init --datasource-provider sqlite
```

This creates:

- `prisma/schema.prisma` - Database schema
- `.env` - Environment variables

### 3. Define Your Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String
  role      String   @default("user")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  posts     Post[]
  comments  Comment[]

  @@map("users")
}

model Post {
  id        String   @id @default(cuid())
  title     String
  content   String
  published Boolean  @default(false)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  author    User     @relation(fields: [authorId], references: [id])
  authorId  String
  comments  Comment[]

  @@map("posts")
}

model Comment {
  id        String   @id @default(cuid())
  content   String
  createdAt DateTime @default(now())
  author    User     @relation(fields: [authorId], references: [id])
  authorId  String
  post      Post     @relation(fields: [postId], references: [id])
  postId    String

  @@map("comments")
}
```

### 4. Generate Prisma Client

```bash
npx prisma generate
```

This generates the type-safe client in `node_modules/@prisma/client`.

### 5. Create Database & Apply Schema

```bash
npx prisma db push
```

This creates the SQLite database file and tables.

### 6. Seed the Database (Optional)

```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create users
  const admin = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      name: 'Admin User',
      role: 'admin',
    },
  });

  // Create posts
  await prisma.post.create({
    data: {
      title: 'First Post',
      content: 'Hello World!',
      published: true,
      authorId: admin.id,
    },
  });

  console.log('Seeding completed!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

Run with:

```bash
npx tsx prisma/seed.ts
```

## Prisma Client Instance

Create a singleton instance to share across your application:

```typescript
// src/db/prisma.ts
import { PrismaClient } from '@prisma/client';

declare global {
  var __prisma: PrismaClient | undefined;
}

// Prevent multiple instances during hot reloading
export const prisma =
  globalThis.__prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalThis.__prisma = prisma;
}
```

## Useful Commands

| Command                  | Description                  |
| ------------------------ | ---------------------------- |
| `npx prisma generate`    | Generate Prisma Client       |
| `npx prisma db push`     | Push schema to database      |
| `npx prisma db pull`     | Pull schema from database    |
| `npx prisma migrate dev` | Create migration             |
| `npx prisma studio`      | Open visual database browser |
| `npx prisma format`      | Format schema file           |

## SQLite vs Production Databases

SQLite is great for:

- Development and prototyping
- Small applications
- Embedded databases

For production, consider:

- **PostgreSQL** - Most popular, feature-rich
- **MySQL** - Widely used, good performance
- **MongoDB** - Document database (with Prisma)

Switching is easy - just change the provider and URL:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```
