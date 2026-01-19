# Module 06-01: Context Basics - Simple Database Injection

A simple demo showing the **core concept of context** - passing a mock database to resolvers via context.

## What This Demo Shows

**One simple concept**: How to pass a database object through context so resolvers can access it.

---

## Project Structure

```
src/
├── index.ts           # Server entry point
├── context/
│   └── index.ts       # Context factory - passes db to resolvers
├── db/
│   └── index.ts       # Simple mock database (user list)
├── resolvers/
│   ├── index.ts       # Resolver exports
│   └── query.ts       # Query resolvers using context.db
├── schema/
│   ├── index.ts       # Schema creation
│   └── typeDefs.ts    # GraphQL type definitions
└── types/
    └── index.ts       # TypeScript interfaces
```

---

## How It Works

### 1. Define the Database (Simple User List)

```typescript
// src/db/index.ts
export const db: Database = {
  users: [
    { id: '1', name: 'John Doe', email: 'john@example.com' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
    { id: '3', name: 'Bob Wilson', email: 'bob@example.com' },
  ],
};
```

### 2. Define the Context Type

```typescript
// src/types/index.ts
export interface GraphQLContext {
  db: Database; // Database passed via context
}
```

### 3. Create Context Factory

```typescript
// src/context/index.ts
import { db } from '../db/index.js';

export const createContext = (): GraphQLContext => {
  return {
    db, // Pass database via context
  };
};
```

### 4. Use Context in Resolvers

```typescript
// src/resolvers/query.ts
export const Query = {
  // Access database through context.db
  users: (_, __, context: GraphQLContext) => {
    return context.db.users;
  },

  user: (_, args: { id: string }, context: GraphQLContext) => {
    return context.db.users.find((user) => user.id === args.id);
  },
};
```

### 5. Pass Context to Yoga

```typescript
// src/index.ts
const yoga = createYoga({
  schema,
  context: createContext, // Called for each request
});
```

---

## Getting Started

```bash
npm install
npm run dev
```

Server runs at: **http://localhost:4000/graphql**

---

## Example Queries

### Get All Users

```graphql
query {
  users {
    id
    name
    email
  }
}
```

### Get User by ID

```graphql
query {
  user(id: "1") {
    id
    name
    email
  }
}
```

---

## Key Concept

```
┌─────────────────────────────────────────┐
│           Context Factory               │
│  createContext() => { db: userList }    │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│              Resolvers                  │
│  Query.users(_, __, context) =>         │
│    return context.db.users              │
└─────────────────────────────────────────┘
```

**Why use context?**

- Resolvers don't import database directly
- Easy to mock for testing
- Single place to configure dependencies
