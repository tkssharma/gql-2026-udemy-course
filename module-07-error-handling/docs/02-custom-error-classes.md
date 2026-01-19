# Custom Error Classes

## Why Custom Error Classes?

Custom error classes provide:

- **Consistency** - Same error format across your API
- **Type Safety** - TypeScript knows error properties
- **Reusability** - Define once, use everywhere
- **Rich Context** - Include relevant metadata automatically

## The GraphQLError Class

GraphQL Yoga uses the standard `GraphQLError` from the `graphql` package:

```typescript
import { GraphQLError } from 'graphql';

throw new GraphQLError('Something went wrong', {
  extensions: {
    code: 'CUSTOM_ERROR',
    customField: 'value',
  },
});
```

## Building a Custom Error Hierarchy

### Base Error Class

```typescript
// src/errors/base.ts
import { GraphQLError } from 'graphql';

export enum ErrorCode {
  UNAUTHENTICATED = 'UNAUTHENTICATED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  CONFLICT = 'CONFLICT',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
}

export class BaseError extends GraphQLError {
  constructor(message: string, code: ErrorCode, extensions?: Record<string, unknown>) {
    super(message, {
      extensions: {
        code,
        ...extensions,
      },
    });
  }
}
```

### Authentication Errors

```typescript
// src/errors/auth.ts
export class AuthenticationError extends BaseError {
  constructor(message = 'Authentication required') {
    super(message, ErrorCode.UNAUTHENTICATED);
  }
}

export class InvalidTokenError extends BaseError {
  constructor(message = 'Invalid authentication token') {
    super(message, ErrorCode.UNAUTHENTICATED, {
      reason: 'INVALID_TOKEN',
    });
  }
}

export class TokenExpiredError extends BaseError {
  constructor(message = 'Token has expired') {
    super(message, ErrorCode.UNAUTHENTICATED, {
      reason: 'TOKEN_EXPIRED',
    });
  }
}
```

### Authorization Errors

```typescript
// src/errors/authorization.ts
export class ForbiddenError extends BaseError {
  constructor(message = 'You do not have permission') {
    super(message, ErrorCode.FORBIDDEN);
  }
}

export class InsufficientPermissionsError extends BaseError {
  constructor(requiredRole: string) {
    super(`This action requires ${requiredRole} role`, ErrorCode.FORBIDDEN, { requiredRole });
  }
}
```

### Resource Errors

```typescript
// src/errors/resource.ts
export class NotFoundError extends BaseError {
  constructor(resource: string, id?: string) {
    const message = id ? `${resource} with id "${id}" not found` : `${resource} not found`;

    super(message, ErrorCode.NOT_FOUND, {
      resource,
      resourceId: id,
    });
  }
}

export class AlreadyExistsError extends BaseError {
  constructor(resource: string, field: string, value: string) {
    super(`${resource} with ${field} "${value}" already exists`, ErrorCode.CONFLICT, { resource, field, value });
  }
}
```

### Validation Errors

```typescript
// src/errors/validation.ts
export class ValidationError extends BaseError {
  constructor(message: string, field?: string, value?: unknown) {
    super(message, ErrorCode.VALIDATION_ERROR, {
      field,
      invalidValue: value,
    });
  }
}

// For multiple validation errors at once
export class InvalidInputError extends BaseError {
  constructor(errors: Array<{ field: string; message: string }>) {
    super('Invalid input provided', ErrorCode.VALIDATION_ERROR, {
      validationErrors: errors,
    });
  }
}
```

### Business Logic Errors

```typescript
// src/errors/business.ts
export class InsufficientStockError extends BaseError {
  constructor(productId: string, requested: number, available: number) {
    super(`Insufficient stock. Requested: ${requested}, Available: ${available}`, ErrorCode.CONFLICT, {
      productId,
      requested,
      available,
    });
  }
}

export class OrderCancelledError extends BaseError {
  constructor(orderId: string) {
    super(`Order "${orderId}" has been cancelled`, ErrorCode.CONFLICT, { orderId, reason: 'ORDER_CANCELLED' });
  }
}

export class PaymentFailedError extends BaseError {
  constructor(reason: string) {
    super(`Payment failed: ${reason}`, ErrorCode.CONFLICT, {
      reason,
      type: 'PAYMENT_FAILED',
    });
  }
}
```

## Using Custom Errors in Resolvers

```typescript
// src/resolvers/mutation.ts
import { AuthenticationError, NotFoundError, ValidationError, InsufficientStockError } from '../errors';

export const Mutation = {
  createOrder: (_, args, context) => {
    // Authentication check
    if (!context.currentUser) {
      throw new AuthenticationError();
    }

    // Validation
    if (args.input.quantity <= 0) {
      throw new ValidationError('Quantity must be positive', 'quantity', args.input.quantity);
    }

    // Resource check
    const product = db.products.findById(args.input.productId);
    if (!product) {
      throw new NotFoundError('Product', args.input.productId);
    }

    // Business logic check
    if (product.stock < args.input.quantity) {
      throw new InsufficientStockError(product.id, args.input.quantity, product.stock);
    }

    // Create order...
  },
};
```

## Error Response Examples

### NotFoundError

```json
{
  "errors": [
    {
      "message": "User with id \"999\" not found",
      "path": ["user"],
      "extensions": {
        "code": "NOT_FOUND",
        "resource": "User",
        "resourceId": "999"
      }
    }
  ]
}
```

### ValidationError

```json
{
  "errors": [
    {
      "message": "Quantity must be positive",
      "path": ["createOrder"],
      "extensions": {
        "code": "VALIDATION_ERROR",
        "field": "quantity",
        "invalidValue": -5
      }
    }
  ]
}
```

### InvalidInputError (Multiple)

```json
{
  "errors": [
    {
      "message": "Invalid input provided",
      "path": ["createProduct"],
      "extensions": {
        "code": "VALIDATION_ERROR",
        "validationErrors": [
          { "field": "name", "message": "Name is required" },
          { "field": "price", "message": "Price must be positive" }
        ]
      }
    }
  ]
}
```

### InsufficientStockError

```json
{
  "errors": [
    {
      "message": "Insufficient stock. Requested: 10, Available: 3",
      "path": ["createOrder"],
      "extensions": {
        "code": "CONFLICT",
        "productId": "123",
        "requested": 10,
        "available": 3
      }
    }
  ]
}
```

## Best Practices

1. **Use an enum for error codes** - Prevents typos, enables autocomplete
2. **Include context in extensions** - IDs, field names, values
3. **Keep messages user-friendly** - They may be shown to end users
4. **Create specific error classes** - `NotFoundError` vs generic `Error`
5. **Document your error codes** - Help API consumers handle errors

## Error Class Hierarchy

```
GraphQLError (from 'graphql')
    └── BaseError
            ├── AuthenticationError
            │       ├── InvalidTokenError
            │       └── TokenExpiredError
            ├── ForbiddenError
            │       └── InsufficientPermissionsError
            ├── NotFoundError
            ├── ValidationError
            │       └── InvalidInputError
            └── ConflictError
                    ├── AlreadyExistsError
                    ├── InsufficientStockError
                    └── OrderCancelledError
```
