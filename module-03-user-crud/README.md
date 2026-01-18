# Module 03: User CRUD Example

A simple GraphQL API with User CRUD operations using GraphQL Yoga and TypeScript.

---

## Schema

```graphql
type Query {
  users: [User!]!
  user(id: ID!): User
}

type Mutation {
  createUser(name: String!): User!
}

type User {
  id: ID!
  name: String!
}
```

---

## Project Structure

```
module-03-user-crud/
├── src/
│   ├── index.ts              # Server entry point
│   ├── data/
│   │   └── users.ts          # In-memory data store
│   ├── resolvers/
│   │   ├── index.ts          # Resolver composition
│   │   ├── Query.ts          # Query resolvers
│   │   └── Mutation.ts       # Mutation resolvers
│   ├── schema/
│   │   ├── index.ts          # Schema composition
│   │   └── typeDefs.ts       # GraphQL type definitions
│   └── types/
│       └── index.ts          # TypeScript interfaces
├── .env
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

---

## Getting Started

### 1. Install Dependencies

```bash
cd module-03-user-crud
npm install
```

### 2. Run Development Server

```bash
npm run dev
```

### 3. Open GraphiQL

Navigate to `http://localhost:4000/graphql`

---

## Example Queries

### Get All Users

```graphql
query {
  users {
    id
    name
  }
}
```

**Response:**

```json
{
  "data": {
    "users": [
      { "id": "1", "name": "Alice" },
      { "id": "2", "name": "Bob" },
      { "id": "3", "name": "Charlie" }
    ]
  }
}
```

### Get User by ID

```graphql
query {
  user(id: "1") {
    id
    name
  }
}
```

**Response:**

```json
{
  "data": {
    "user": {
      "id": "1",
      "name": "Alice"
    }
  }
}
```

### Get Non-Existent User

```graphql
query {
  user(id: "999") {
    id
    name
  }
}
```

**Response:**

```json
{
  "data": {
    "user": null
  }
}
```

---

## Example Mutations

### Create User

```graphql
mutation {
  createUser(name: "David") {
    id
    name
  }
}
```

**Response:**

```json
{
  "data": {
    "createUser": {
      "id": "4",
      "name": "David"
    }
  }
}
```

---

## Scripts

| Script      | Command             | Description                      |
| ----------- | ------------------- | -------------------------------- |
| `dev`       | `npm run dev`       | Start dev server with hot reload |
| `build`     | `npm run build`     | Compile TypeScript               |
| `start`     | `npm start`         | Run production server            |
| `typecheck` | `npm run typecheck` | Check types                      |

---

## Key Concepts Demonstrated

1. **Type-Safe Resolvers** - TypeScript interfaces for args and return types
2. **In-Memory Data Store** - Simple array-based storage
3. **Query Resolvers** - `users` (list) and `user` (single with nullable return)
4. **Mutation Resolvers** - `createUser` with auto-generated ID
5. **Project Structure** - Organized by concern (schema, resolvers, types, data)
