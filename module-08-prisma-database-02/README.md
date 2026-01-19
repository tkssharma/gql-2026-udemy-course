# Module 08-02: Prisma with PostgreSQL

Demonstrates **Prisma ORM with PostgreSQL** - showcasing PostgreSQL-specific features like UUIDs, enums, JSON, arrays, and advanced relations.

## PostgreSQL-Specific Features

| Feature | SQLite  | PostgreSQL             |
| ------- | ------- | ---------------------- |
| UUID    | ❌      | ✅ `@default(uuid())`  |
| Enums   | ❌      | ✅ Native enum types   |
| JSON    | Limited | ✅ Full JSON support   |
| Arrays  | ❌      | ✅ `String[]`, `Int[]` |
| Indexes | Basic   | ✅ Advanced indexes    |

---

## Project Structure

```
module-08-prisma-database-02/
├── prisma/
│   ├── schema.prisma    # PostgreSQL schema
│   └── seed.ts          # Seed with PG features
├── src/
│   ├── index.ts
│   ├── db/prisma.ts
│   ├── schema/
│   └── resolvers/
├── docker-compose.yml   # PostgreSQL container
├── .env.example         # Database URL template
└── package.json
```

---

## PostgreSQL Schema Features

```prisma
// UUID primary keys
model User {
  id   String @id @default(uuid())
  role Role   @default(USER)  // Native enum
}

// PostgreSQL enum
enum Role {
  USER
  ADMIN
  MODERATOR
}

// PostgreSQL-specific types
model Post {
  tags     String[]  // Array type
  metadata Json?     // JSON type
}

// One-to-one relation with cascade delete
model Profile {
  userId String @unique
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)
}

// Database indexes
@@index([email])
@@index([published])
```

---

## Getting Started

### 1. Start PostgreSQL (Docker)

```bash
docker-compose up -d
```

This starts PostgreSQL on `localhost:5432`.

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env`:

```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/graphql_demo"
```

### 3. Setup Database

```bash
npm install
npm run db:generate   # Generate Prisma Client
npm run db:push       # Create tables
npm run db:seed       # Seed data
```

### 4. Start Server

```bash
npm run dev
```

Server runs at: **http://localhost:4000/graphql**

---

## PostgreSQL Connection String

```
postgresql://USER:PASSWORD@HOST:PORT/DATABASE
```

Examples:

```bash
# Local
DATABASE_URL="postgresql://postgres:password@localhost:5432/mydb"

# Docker
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/graphql_demo"

# Remote (e.g., Supabase, Neon)
DATABASE_URL="postgresql://user:pass@db.example.com:5432/mydb?sslmode=require"
```

---

## Example Queries

### Get Users with Profiles

```graphql
query {
  users {
    id
    name
    email
    role
    profile {
      bio
      avatar
    }
  }
}
```

### Get Posts with Tags (Array) and Metadata (JSON)

```graphql
query {
  posts(published: true) {
    id
    title
    tags
    metadata
    categories {
      name
    }
  }
}
```

### Create User with Profile

```graphql
mutation {
  createUser(input: { email: "dev@example.com", name: "Developer", role: ADMIN, bio: "Full-stack developer" }) {
    id
    name
    role
    profile {
      bio
    }
  }
}
```

### Create Post with Tags

```graphql
mutation {
  createPost(
    input: {
      title: "PostgreSQL Tips"
      content: "Advanced PostgreSQL features..."
      authorId: "user-uuid-here"
      tags: ["postgresql", "database", "tips"]
    }
  ) {
    id
    title
    tags
  }
}
```

---

## SQLite vs PostgreSQL Comparison

### Schema Differences

```prisma
// SQLite
model User {
  id Int @id @default(autoincrement())
}

// PostgreSQL
model User {
  id String @id @default(uuid())
}
```

### Connection String

```prisma
// SQLite - file path
datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}

// PostgreSQL - connection URL
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

---

## Migrations for Production

```bash
# Create migration
npx prisma migrate dev --name init

# Apply to production
npx prisma migrate deploy
```

Migration files are stored in `prisma/migrations/`.

---

## Key Takeaways

1. **Use environment variables** for database URL
2. **UUID** is preferred for distributed systems
3. **Enums** provide type safety at database level
4. **JSON** fields are great for flexible data
5. **Arrays** simplify storing lists without join tables
6. **Cascade delete** handles related record cleanup
