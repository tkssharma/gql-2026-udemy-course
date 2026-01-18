# 4. GraphQL Code Generator (Codegen)

Automatically generate TypeScript types from your GraphQL schema — always in sync, zero manual work.

---

## What is GraphQL Code Generator?

GraphQL Code Generator reads your schema and generates TypeScript types automatically.

```
┌─────────────────┐         ┌─────────────────┐
│  GraphQL Schema │ ──────► │  TypeScript     │
│  (typeDefs)     │ codegen │  Types          │
└─────────────────┘         └─────────────────┘

type User {                 interface User {
  id: ID!          ──────►    id: string;
  name: String!               name: string;
}                           }
```

### Benefits

| Manual Types          | Generated Types  |
| --------------------- | ---------------- |
| Can drift from schema | Always in sync   |
| Time-consuming        | Automatic        |
| Error-prone           | Accurate         |
| Maintenance burden    | Zero maintenance |

---

## Installation

```bash
# Core packages
npm install -D @graphql-codegen/cli

# Plugins for TypeScript
npm install -D @graphql-codegen/typescript
npm install -D @graphql-codegen/typescript-resolvers

# Optional: For operations (client-side)
npm install -D @graphql-codegen/typescript-operations
```

### All at once:

```bash
npm install -D @graphql-codegen/cli @graphql-codegen/typescript @graphql-codegen/typescript-resolvers
```

---

## Configuration

Create `codegen.ts` in your project root:

```typescript
// codegen.ts
import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  // Where to find your schema
  schema: './src/schema/typeDefs.ts',

  // Output configuration
  generates: {
    // Output file path
    './src/generated/graphql.ts': {
      // Plugins to use
      plugins: [
        'typescript', // Generate base types
        'typescript-resolvers', // Generate resolver types
      ],

      // Plugin configuration
      config: {
        // Use your context type
        contextType: '../context/index.js#Context',

        // Map custom scalars
        scalars: {
          DateTime: 'string',
          JSON: 'Record<string, unknown>',
        },

        // Make fields optional in resolvers (recommended)
        makeResolverTypeCallable: true,

        // Use type imports
        useTypeImports: true,
      },
    },
  },
};

export default config;
```

---

## Schema Setup for Codegen

Your schema needs to be in a format codegen can read:

### Option 1: SDL String (Recommended)

```typescript
// src/schema/typeDefs.ts
export const typeDefs = /* GraphQL */ `
  type User {
    id: ID!
    name: String!
    email: String!
    posts: [Post!]!
  }

  type Post {
    id: ID!
    title: String!
    content: String!
    author: User!
  }

  type Query {
    user(id: ID!): User
    users: [User!]!
    post(id: ID!): Post
    posts: [Post!]!
  }

  type Mutation {
    createUser(input: CreateUserInput!): User!
    createPost(input: CreatePostInput!): Post!
  }

  input CreateUserInput {
    name: String!
    email: String!
  }

  input CreatePostInput {
    title: String!
    content: String!
  }
`;
```

### Option 2: .graphql Files

```graphql
# src/schema/schema.graphql
type User {
  id: ID!
  name: String!
  email: String!
  posts: [Post!]!
}

# ... rest of schema
```

Update codegen.ts:

```typescript
const config: CodegenConfig = {
  schema: './src/schema/**/*.graphql',
  // ...
};
```

---

## Add Scripts to package.json

```json
{
  "scripts": {
    "codegen": "graphql-codegen",
    "codegen:watch": "graphql-codegen --watch",
    "dev": "npm run codegen && tsx watch src/index.ts",
    "build": "npm run codegen && tsc"
  }
}
```

---

## Run Code Generation

```bash
# Generate once
npm run codegen

# Watch mode (regenerate on schema changes)
npm run codegen:watch
```

Output:

```
✔ Parse Configuration
✔ Generate outputs
  ✔ ./src/generated/graphql.ts
```

---

## Generated Types

After running codegen, you'll get a file like this:

```typescript
// src/generated/graphql.ts (auto-generated)

export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };

// Scalars
export type Scalars = {
  ID: { input: string; output: string };
  String: { input: string; output: string };
  Boolean: { input: boolean; output: boolean };
  Int: { input: number; output: number };
  Float: { input: number; output: number };
};

// Object Types
export type User = {
  __typename?: 'User';
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  email: Scalars['String']['output'];
  posts: Array<Post>;
};

export type Post = {
  __typename?: 'Post';
  id: Scalars['ID']['output'];
  title: Scalars['String']['output'];
  content: Scalars['String']['output'];
  author: User;
};

// Input Types
export type CreateUserInput = {
  name: Scalars['String']['input'];
  email: Scalars['String']['input'];
};

export type CreatePostInput = {
  title: Scalars['String']['input'];
  content: Scalars['String']['input'];
};

// Query Types
export type Query = {
  __typename?: 'Query';
  user?: Maybe<User>;
  users: Array<User>;
  post?: Maybe<Post>;
  posts: Array<Post>;
};

export type QueryUserArgs = {
  id: Scalars['ID']['input'];
};

export type QueryPostArgs = {
  id: Scalars['ID']['input'];
};

// Mutation Types
export type Mutation = {
  __typename?: 'Mutation';
  createUser: User;
  createPost: Post;
};

export type MutationCreateUserArgs = {
  input: CreateUserInput;
};

export type MutationCreatePostArgs = {
  input: CreatePostInput;
};

// Resolver Types
export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo,
) => Promise<TResult> | TResult;

export type Resolvers<ContextType = Context> = {
  Query?: QueryResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  User?: UserResolvers<ContextType>;
  Post?: PostResolvers<ContextType>;
};

export type QueryResolvers<ContextType = Context> = {
  user?: Resolver<Maybe<User>, {}, ContextType, QueryUserArgs>;
  users?: Resolver<Array<User>, {}, ContextType, {}>;
  post?: Resolver<Maybe<Post>, {}, ContextType, QueryPostArgs>;
  posts?: Resolver<Array<Post>, {}, ContextType, {}>;
};

export type MutationResolvers<ContextType = Context> = {
  createUser?: Resolver<User, {}, ContextType, MutationCreateUserArgs>;
  createPost?: Resolver<Post, {}, ContextType, MutationCreatePostArgs>;
};

export type UserResolvers<ContextType = Context> = {
  id?: Resolver<Scalars['ID']['output'], User, ContextType, {}>;
  name?: Resolver<Scalars['String']['output'], User, ContextType, {}>;
  email?: Resolver<Scalars['String']['output'], User, ContextType, {}>;
  posts?: Resolver<Array<Post>, User, ContextType, {}>;
};

export type PostResolvers<ContextType = Context> = {
  id?: Resolver<Scalars['ID']['output'], Post, ContextType, {}>;
  title?: Resolver<Scalars['String']['output'], Post, ContextType, {}>;
  content?: Resolver<Scalars['String']['output'], Post, ContextType, {}>;
  author?: Resolver<User, Post, ContextType, {}>;
};
```

---

## Using Generated Types

### Import and Use Resolvers Type

```typescript
// src/resolvers/index.ts
import type { Resolvers } from '../generated/graphql.js';

export const resolvers: Resolvers = {
  Query: {
    user: (_, args, context) => {
      // args is typed as QueryUserArgs
      // context is typed as Context
      return context.db.users.findById(args.id);
    },

    users: (_, _args, context) => {
      return context.db.users.findAll();
    },
  },

  Mutation: {
    createUser: (_, args, context) => {
      // args.input is typed as CreateUserInput
      return context.db.users.create(args.input);
    },
  },

  User: {
    posts: (parent, _, context) => {
      // parent is typed as User
      return context.db.posts.findByAuthorId(parent.id);
    },
  },

  Post: {
    author: (parent, _, context) => {
      // parent is typed as Post
      return context.db.users.findById(parent.authorId);
    },
  },
};
```

### Type Errors Are Now Caught

```typescript
const resolvers: Resolvers = {
  Query: {
    user: (_, args, context) => {
      // ❌ Error: Property 'userId' does not exist on type 'QueryUserArgs'
      return context.db.users.findById(args.userId);

      // ✅ Correct
      return context.db.users.findById(args.id);
    },
  },

  User: {
    posts: (parent, _, context) => {
      // ❌ Error: Property 'oderId' does not exist on type 'User'
      return context.db.posts.findByAuthorId(parent.oderId);

      // ✅ Correct
      return context.db.posts.findByAuthorId(parent.id);
    },
  },
};
```

---

## Advanced Configuration

### Full codegen.ts Example

```typescript
// codegen.ts
import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  // Schema source
  schema: './src/schema/typeDefs.ts',

  // Generate multiple outputs
  generates: {
    // Server-side types
    './src/generated/graphql.ts': {
      plugins: ['typescript', 'typescript-resolvers'],
      config: {
        // Context type import
        contextType: '../context/index.js#Context',

        // Custom scalar mappings
        scalars: {
          DateTime: 'string',
          Date: 'string',
          JSON: 'Record<string, unknown>',
          UUID: 'string',
        },

        // Resolver options
        makeResolverTypeCallable: true,
        useTypeImports: true,

        // Enum handling
        enumsAsTypes: true,

        // Optional: Map database models to GraphQL types
        mappers: {
          User: '../models/User.js#UserModel',
          Post: '../models/Post.js#PostModel',
        },

        // Field resolver parent type
        defaultMapper: 'Partial<{T}>',

        // Avoid __typename in types
        skipTypename: true,

        // Use Maybe type for nullable
        maybeValue: 'T | null | undefined',
      },
    },
  },

  // Hooks
  hooks: {
    afterAllFileWrite: ['prettier --write'],
  },

  // Ignore patterns
  ignoreNoDocuments: true,
};

export default config;
```

### Mappers: Database Models vs GraphQL Types

When your database models differ from GraphQL types:

```typescript
// src/models/User.ts
export interface UserModel {
  id: string;
  name: string;
  email: string;
  passwordHash: string; // Not in GraphQL!
  createdAt: Date; // Date in DB, String in GraphQL
}
```

```typescript
// codegen.ts
config: {
  mappers: {
    User: '../models/User.js#UserModel',
  },
}
```

Now resolvers expect `UserModel` as parent:

```typescript
const User: UserResolvers = {
  // parent is UserModel, not GraphQL User
  posts: (parent, _, context) => {
    return context.db.posts.findByAuthorId(parent.id);
  },

  // Transform Date to String
  createdAt: (parent) => {
    return parent.createdAt.toISOString();
  },
};
```

---

## Watch Mode Workflow

For development, run codegen in watch mode:

```bash
# Terminal 1: Watch schema changes
npm run codegen:watch

# Terminal 2: Run dev server
npm run dev
```

Or combine them:

```json
{
  "scripts": {
    "dev": "concurrently \"npm run codegen:watch\" \"tsx watch src/index.ts\""
  }
}
```

```bash
npm install -D concurrently
```

---

## Project Structure with Codegen

```
src/
├── generated/
│   └── graphql.ts        # Auto-generated (git ignored)
├── schema/
│   └── typeDefs.ts       # Your GraphQL schema
├── resolvers/
│   ├── index.ts          # Uses generated Resolvers type
│   ├── Query.ts
│   ├── Mutation.ts
│   ├── User.ts
│   └── Post.ts
├── context/
│   └── index.ts          # Context type (referenced by codegen)
├── models/
│   └── User.ts           # Database models (optional mappers)
└── index.ts
```

### .gitignore

```gitignore
# Generated files
src/generated/
```

---

## Troubleshooting

### Error: Cannot find schema

```
✖ Failed to load schema from ./src/schema/typeDefs.ts
```

**Solution:** Ensure your schema exports a string or uses proper format:

```typescript
// ✅ Correct
export const typeDefs = /* GraphQL */ `
  type Query { ... }
`;

// ❌ Wrong - codegen can't read this
export const schema = createSchema({ typeDefs: `...` });
```

### Error: Context type not found

```
Cannot find module '../context/index.js'
```

**Solution:** Use `.js` extension for ESM:

```typescript
contextType: '../context/index.js#Context',  // ✅
contextType: '../context/index#Context',     // ❌
```

### Types not updating

**Solution:** Re-run codegen:

```bash
npm run codegen
```

Or ensure watch mode is running.

---

## Summary

| Step | Action                        |
| ---- | ----------------------------- |
| 1    | Install codegen packages      |
| 2    | Create `codegen.ts` config    |
| 3    | Add npm scripts               |
| 4    | Run `npm run codegen`         |
| 5    | Import `Resolvers` type       |
| 6    | Use watch mode in development |

**Result:** Types always match your schema, errors caught at compile time!

---

## Next: [5. Advanced Codegen Patterns →](./5-advanced-codegen.md)
