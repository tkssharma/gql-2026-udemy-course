# Module 02: Mutations

A comprehensive demo showcasing GraphQL queries and mutations with GraphQL Yoga.

## Topics Covered

- **Creating mutations** - CRUD operations for users
- **Input types** - `CreateUserInput`, `UpdateUserInput`
- **Mutation responses** - Structured responses with success/message/data
- **Error handling** - Validation errors, not found errors, duplicate checks

## Project Structure

```
src/
├── index.ts              # Server entry point
├── data/
│   └── users.ts          # In-memory user database
├── resolvers/
│   ├── index.ts          # Resolver exports
│   ├── query.ts          # Query resolvers
│   └── mutation.ts       # Mutation resolvers with error handling
├── schema/
│   ├── index.ts          # Schema creation
│   └── typeDefs.ts       # GraphQL type definitions
└── types/
    └── index.ts          # TypeScript interfaces
```

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Server runs at: http://localhost:4000/graphql

## Example Queries

### Get All Users

```graphql
query {
  users {
    id
    name
    email
    age
    createdAt
  }
}
```

### Get Single User

```graphql
query {
  user(id: "1") {
    id
    name
    email
  }
}
```

### Search Users

```graphql
query {
  searchUsers(name: "john") {
    id
    name
    email
  }
}
```

## Example Mutations

### Create User

```graphql
mutation {
  createUser(input: { name: "Alice Johnson", email: "alice@example.com", age: 28 }) {
    success
    message
    user {
      id
      name
      email
      age
      createdAt
    }
  }
}
```

### Update User

```graphql
mutation {
  updateUser(id: "1", input: { name: "John Updated", age: 31 }) {
    success
    message
    user {
      id
      name
      email
      age
    }
  }
}
```

### Delete User

```graphql
mutation {
  deleteUser(id: "1") {
    success
    message
    deletedId
  }
}
```

## Error Handling Examples

### Validation Error (Invalid Email)

```graphql
mutation {
  createUser(input: { name: "Test", email: "invalid-email" }) {
    success
    message
  }
}
```

### Duplicate Email Error

```graphql
mutation {
  createUser(input: { name: "Another John", email: "john@example.com" }) {
    success
    message
  }
}
```

### User Not Found Error

```graphql
mutation {
  updateUser(id: "999", input: { name: "Test" }) {
    success
    message
  }
}
```

## Key Concepts

### Input Types

Input types are used to pass complex objects as mutation arguments:

```graphql
input CreateUserInput {
  name: String!
  email: String!
  age: Int
}
```

### Mutation Responses

Structured responses provide consistent feedback:

```graphql
type UserMutationResponse {
  success: Boolean!
  message: String!
  user: User
}
```

### Error Handling

Errors are thrown using `GraphQLError` with custom extensions:

```typescript
throw new GraphQLError('User not found', {
  extensions: {
    code: 'USER_NOT_FOUND',
    argumentName: 'id',
  },
});
```
