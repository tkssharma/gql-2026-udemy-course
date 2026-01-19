# GraphQL Yoga Course - Full Agenda

A comprehensive course on building **GraphQL APIs with GraphQL Yoga** - from basics to production-ready applications with Prisma.

---

## 🎯 What You'll Learn

- Build type-safe GraphQL APIs from scratch
- Master queries, mutations, and subscriptions
- Implement authentication and authorization
- Connect to databases with Prisma ORM
- Handle errors gracefully
- Follow production best practices

---

## 📚 Course Modules

### Module 01: Getting Started

- What is GraphQL and why use it
- GraphQL vs REST comparison
- Setting up GraphQL Yoga server
- Your first GraphQL query
- Using GraphiQL playground

### Module 02: Type-Safe Schema

- GraphQL Schema Definition Language (SDL)
- Scalar types (String, Int, Boolean, ID, Float)
- Object types and fields
- Non-nullable types and lists
- Custom scalar types
- Schema-first vs code-first approach

### Module 03: Queries & Mutations

- Writing query resolvers
- Query arguments and variables
- Building CRUD operations
- Mutation resolvers
- Input types for mutations
- Resolver function signature (parent, args, context, info)

### Module 04: Best Practices

- Project structure and organization
- Separating schema, resolvers, and types
- TypeScript integration
- Code organization patterns
- Naming conventions

### Module 05: Advanced Mutations

- Complex mutation patterns
- Nested mutations
- Batch operations
- Optimistic updates
- Return types for mutations

### Module 06: GraphQL Context

- Understanding context in GraphQL
- Creating context factory
- Passing data through context
- Request-scoped context
- Dependency injection pattern

### Module 06-01: Context Basics

- Simple mock database in context
- Passing database objects to resolvers
- Context type definitions

### Module 06-02: Authentication with Context

- JWT token authentication
- Passing auth headers to context
- Token verification in context factory
- Protected queries and mutations
- Role-based authorization (Admin, User)
- Current user in context

### Module 07: Error Handling

- GraphQL error types
- Custom error classes
- Error formatting
- Validation errors
- Authentication errors
- User-friendly error messages

### Module 08: Prisma Database Integration

#### Module 08-01: Prisma with SQLite

- Introduction to Prisma ORM
- Prisma schema definition
- Models and relations (User, Post)
- Database migrations
- Seeding data
- Prisma Client queries
- Injecting Prisma via GraphQL context

#### Module 08-02: Prisma with PostgreSQL

- PostgreSQL setup with Docker
- Environment variables for database URL
- PostgreSQL-specific features:
  - UUID primary keys
  - Native enum types
  - JSON columns
  - Array fields
  - Database indexes
- One-to-one relations (User → Profile)
- Many-to-many relations (Post ↔ Category)
- Cascade delete
- Production migrations

---

## 🛠️ Technologies Used

- **GraphQL Yoga** - Modern GraphQL server
- **TypeScript** - Type-safe JavaScript
- **Prisma** - Next-generation ORM
- **SQLite** - Development database
- **PostgreSQL** - Production database
- **Docker** - Container for PostgreSQL
- **Node.js** - Runtime environment

---

## 📁 Project Structure

```
graphql-yoga-course/
├── module-01-getting-started/     # Hello World GraphQL
├── module-02-type-safe-schema/    # Schema & Types
├── module-03-query-mutation/      # Queries & Mutations
├── module-03-user-crud/           # CRUD Operations
├── module-04-best-practices/      # Code Organization
├── module-05-mutations/           # Advanced Mutations
├── module-06-context/             # Context Deep Dive
├── module-06-context-01/          # Context Basics
├── module-06-context-02/          # JWT Authentication
├── module-07-error-handling/      # Error Handling
├── module-08-prisma-database/     # Prisma Overview
├── module-08-prisma-database-01/  # Prisma + SQLite
└── module-08-prisma-database-02/  # Prisma + PostgreSQL
```

---

## 🎓 Who Is This Course For?

- **Backend developers** wanting to learn GraphQL
- **REST API developers** transitioning to GraphQL
- **Full-stack developers** building modern APIs
- **Node.js developers** exploring GraphQL Yoga
- **Anyone** interested in type-safe API development

---

## ✅ Prerequisites

- Basic JavaScript/TypeScript knowledge
- Node.js installed (v18+)
- Familiarity with REST APIs (helpful but not required)
- Code editor (VS Code recommended)

---

## 🚀 By The End of This Course

You will be able to:

1. **Build** production-ready GraphQL APIs
2. **Design** type-safe schemas with SDL
3. **Implement** queries, mutations, and subscriptions
4. **Secure** APIs with JWT authentication
5. **Connect** to databases using Prisma
6. **Handle** errors gracefully
7. **Structure** projects following best practices
8. **Deploy** GraphQL APIs to production

---

## 📝 Quick Reference

| Topic                | Module |
| -------------------- | ------ |
| First GraphQL Server | 01     |
| Schema & Types       | 02     |
| Queries & Mutations  | 03     |
| Project Structure    | 04     |
| Advanced Mutations   | 05     |
| Context & DI         | 06     |
| Authentication       | 06-02  |
| Error Handling       | 07     |
| Prisma + SQLite      | 08-01  |
| Prisma + PostgreSQL  | 08-02  |

---

## 💡 Key Concepts Covered

- **Schema-first development**
- **Resolver pattern**
- **Context as dependency injection**
- **Type safety with TypeScript**
- **Database integration with Prisma**
- **Authentication & Authorization**
- **Error handling strategies**
- **Production best practices**

---

_Let's build amazing GraphQL APIs together! 🚀_
