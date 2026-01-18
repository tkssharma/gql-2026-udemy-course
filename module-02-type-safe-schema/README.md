# Module 02: Type-Safe Schema with TypeScript

Build fully type-safe GraphQL APIs where TypeScript catches errors at compile time.

---

## Module Outline

### 1. Why Type Safety Matters

- The problem with untyped resolvers
- Runtime errors vs compile-time errors
- Benefits of end-to-end type safety

### 2. Defining TypeScript Types for Your Schema

- Mapping GraphQL types to TypeScript interfaces
- Scalar type mappings
- Nullable vs non-nullable types
- Input types and arguments
- Enum types

### 3. Type-Safe Resolvers

- Typing resolver functions
- Parent, args, context, info parameters
- Field resolvers with proper types
- Generic resolver types

### 4. GraphQL Code Generator (Codegen)

- What is codegen and why use it
- Installation and setup
- Configuration file (codegen.ts)
- Generating types from schema
- Generating typed resolvers
- Watch mode for development

### 5. Advanced Codegen Patterns

- Custom scalars
- Mapped types
- Context typing
- Federation support

### 6. Best Practices for Type Organization

- File structure for types
- Separating generated vs manual types
- Domain-driven type organization
- Barrel exports
- Avoiding circular dependencies

### 7. Practical Examples

- Complete typed User/Post API
- Type-safe mutations with input validation
- Typed field resolvers for relationships

---

## What You'll Learn

| Topic           | Outcome                                       |
| --------------- | --------------------------------------------- |
| Manual typing   | Write TypeScript types that match your schema |
| Codegen         | Auto-generate types from GraphQL schema       |
| Resolver typing | Fully typed resolver functions                |
| Best practices  | Organize types for maintainability            |

---

## Prerequisites

- Completed Module 01 (Project Setup)
- Basic TypeScript knowledge
- Understanding of GraphQL schema

---

## Files in This Module

| File                       | Content                   |
| -------------------------- | ------------------------- |
| `1-why-type-safety.md`     | Benefits and motivation   |
| `2-manual-types.md`        | Writing types by hand     |
| `3-type-safe-resolvers.md` | Typing resolver functions |
| `4-codegen-setup.md`       | GraphQL Code Generator    |
| `5-advanced-codegen.md`    | Advanced patterns         |
| `6-best-practices.md`      | Organization and patterns |
| `7-practical-example.md`   | Complete working example  |

---

## Quick Preview

### The Problem (Untyped)

```typescript
// ❌ No type safety - errors at runtime
const resolvers = {
  Query: {
    user: (_, args) => {
      return users.find((u) => u.id === args.userId); // typo: should be args.id
    },
  },
  User: {
    posts: (parent) => {
      return posts.filter((p) => p.oderId === parent.id); // typo: authorId
    },
  },
};
```

### The Solution (Typed)

```typescript
// ✅ Full type safety - errors at compile time
import type { Resolvers } from './generated/graphql';

const resolvers: Resolvers = {
  Query: {
    user: (_, args) => {
      return users.find((u) => u.id === args.id); // ✅ TypeScript knows args.id exists
    },
  },
  User: {
    posts: (parent) => {
      return posts.filter((p) => p.authorId === parent.id); // ✅ TypeScript catches typos
    },
  },
};
```

---

## Next: [1. Why Type Safety Matters →](./1-why-type-safety.md)
