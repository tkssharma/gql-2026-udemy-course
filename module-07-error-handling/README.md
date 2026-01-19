# Module 07: Error Handling

A comprehensive demo showcasing GraphQL error handling, custom error classes, error formatting, and partial responses with GraphQL Yoga.

## Topics Covered

1. **GraphQL Error Types** - Understanding different error categories
2. **Custom Error Classes** - Building reusable error hierarchy
3. **Error Formatting** - Controlling error output for different environments
4. **Partial Responses** - Handling mixed success/failure scenarios

## 📚 Documentation

Detailed explanations for each topic are available in the `docs/` folder:

- [01-graphql-error-types.md](./docs/01-graphql-error-types.md) - Error categories and response structure
- [02-custom-error-classes.md](./docs/02-custom-error-classes.md) - Building custom error hierarchy
- [03-error-formatting.md](./docs/03-error-formatting.md) - Masking and formatting errors
- [04-partial-responses.md](./docs/04-partial-responses.md) - Handling partial data with errors

---

## Project Structure

```
src/
├── index.ts              # Server entry point
├── data/
│   └── index.ts          # In-memory data store
├── errors/
│   └── index.ts          # Custom error classes
├── resolvers/
│   ├── index.ts          # Resolver exports
│   ├── query.ts          # Query resolvers with error examples
│   ├── mutation.ts       # Mutation resolvers with validation
│   └── types.ts          # Field resolvers
├── schema/
│   ├── index.ts          # Schema creation
│   └── typeDefs.ts       # GraphQL type definitions
└── types/
    └── index.ts          # TypeScript interfaces
```

---

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Server runs at: **http://localhost:4000/graphql**

---

## Test Tokens

| Token                | User       | Role  |
| -------------------- | ---------- | ----- |
| `Bearer admin-token` | Admin User | admin |
| `Bearer user-token`  | John Doe   | user  |
| `Bearer jane-token`  | Jane Smith | user  |

Add to HTTP Headers:

```json
{
  "Authorization": "Bearer user-token"
}
```

---

## Error Code Reference

| Code                 | Description                      | HTTP Equivalent |
| -------------------- | -------------------------------- | --------------- |
| `UNAUTHENTICATED`    | No valid credentials             | 401             |
| `FORBIDDEN`          | Valid credentials, no permission | 403             |
| `NOT_FOUND`          | Resource doesn't exist           | 404             |
| `VALIDATION_ERROR`   | Invalid input data               | 400             |
| `CONFLICT`           | Resource conflict                | 409             |
| `INSUFFICIENT_STOCK` | Not enough inventory             | 409             |
| `INTERNAL_ERROR`     | Server error                     | 500             |

---

## Example Queries

### 1. Not Found Error

```graphql
query {
  userOrError(id: "999") {
    id
    name
  }
}
```

Response:

```json
{
  "errors": [
    {
      "message": "User with id \"999\" not found",
      "extensions": {
        "code": "NOT_FOUND",
        "resource": "User",
        "resourceId": "999"
      }
    }
  ]
}
```

### 2. Authentication Error

```graphql
# No Authorization header
query {
  me {
    id
    name
  }
}
```

Response:

```json
{
  "errors": [
    {
      "message": "Authentication required",
      "extensions": { "code": "UNAUTHENTICATED" }
    }
  ]
}
```

### 3. Authorization Error (Admin Only)

```graphql
# Header: { "Authorization": "Bearer user-token" }
query {
  adminStats
}
```

Response:

```json
{
  "errors": [
    {
      "message": "This action requires admin role",
      "extensions": {
        "code": "INSUFFICIENT_PERMISSIONS",
        "requiredRole": "admin"
      }
    }
  ]
}
```

### 4. Partial Response

```graphql
query {
  batchUsers(ids: ["1", "2", "999", "3"]) {
    users {
      user {
        id
        name
      }
      error
    }
    successCount
    errorCount
  }
}
```

Response:

```json
{
  "data": {
    "batchUsers": {
      "users": [
        { "user": { "id": "1", "name": "Admin User" }, "error": null },
        { "user": { "id": "2", "name": "John Doe" }, "error": null },
        { "user": null, "error": "User with id \"999\" not found" },
        { "user": { "id": "3", "name": "Jane Smith" }, "error": null }
      ],
      "successCount": 3,
      "errorCount": 1
    }
  }
}
```

---

## Example Mutations

### 1. Validation Error

```graphql
# Header: { "Authorization": "Bearer user-token" }
mutation {
  createOrder(input: { productId: "1", quantity: -5 }) {
    success
    message
  }
}
```

Response:

```json
{
  "errors": [
    {
      "message": "Quantity must be greater than 0",
      "extensions": {
        "code": "VALIDATION_ERROR",
        "field": "quantity",
        "invalidValue": -5
      }
    }
  ]
}
```

### 2. Insufficient Stock Error

```graphql
# Header: { "Authorization": "Bearer user-token" }
mutation {
  createOrder(input: { productId: "3", quantity: 1 }) {
    success
    message
  }
}
```

Response:

```json
{
  "errors": [
    {
      "message": "Insufficient stock for product. Requested: 1, Available: 0",
      "extensions": {
        "code": "INSUFFICIENT_STOCK",
        "productId": "3",
        "requested": 1,
        "available": 0
      }
    }
  ]
}
```

### 3. Multiple Validation Errors

```graphql
# Header: { "Authorization": "Bearer admin-token" }
mutation {
  createProduct(name: "X", price: -10, stock: -5) {
    id
    name
  }
}
```

Response:

```json
{
  "errors": [
    {
      "message": "Invalid input provided",
      "extensions": {
        "code": "VALIDATION_ERROR",
        "validationErrors": [
          { "field": "name", "message": "Name must be at least 2 characters" },
          { "field": "price", "message": "Price must be greater than 0" },
          { "field": "stock", "message": "Stock cannot be negative" }
        ]
      }
    }
  ]
}
```

### 4. Conflict Error (Cancel Delivered Order)

```graphql
# Header: { "Authorization": "Bearer user-token" }
mutation {
  cancelOrder(id: "1") {
    success
    message
  }
}
```

Response:

```json
{
  "errors": [
    {
      "message": "Cannot cancel a delivered order",
      "extensions": {
        "code": "CONFLICT",
        "orderId": "1",
        "currentStatus": "delivered"
      }
    }
  ]
}
```

---

## Custom Error Classes

The project includes a hierarchy of custom error classes:

```
GraphQLError
    └── BaseError
            ├── AuthenticationError
            ├── ForbiddenError
            ├── InsufficientPermissionsError
            ├── ValidationError
            ├── InvalidInputError
            ├── NotFoundError
            ├── AlreadyExistsError
            ├── ConflictError
            ├── InsufficientStockError
            ├── OrderCancelledError
            └── InternalError
```

---

## Key Concepts

| Concept               | Description                                |
| --------------------- | ------------------------------------------ |
| **Error Extensions**  | Custom metadata in `extensions` field      |
| **Error Codes**       | Machine-readable codes for client handling |
| **Partial Responses** | Return data + errors together              |
| **Error Masking**     | Hide internal details in production        |
| **Validation Errors** | Include field and value information        |

---

## Best Practices

1. **Use consistent error codes** - Define an enum for all error codes
2. **Include context** - Add relevant IDs, field names, values
3. **Keep messages user-friendly** - They may be shown to end users
4. **Log full errors server-side** - For debugging
5. **Mask errors in production** - Hide stack traces and internal details
6. **Use nullable fields** - For graceful partial responses
