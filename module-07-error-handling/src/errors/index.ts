import { GraphQLError } from 'graphql';

// Error codes enum for consistency
export enum ErrorCode {
  // Authentication errors
  UNAUTHENTICATED = 'UNAUTHENTICATED',
  INVALID_TOKEN = 'INVALID_TOKEN',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',

  // Authorization errors
  FORBIDDEN = 'FORBIDDEN',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',

  // Validation errors
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',

  // Resource errors
  NOT_FOUND = 'NOT_FOUND',
  ALREADY_EXISTS = 'ALREADY_EXISTS',
  CONFLICT = 'CONFLICT',

  // Business logic errors
  INSUFFICIENT_STOCK = 'INSUFFICIENT_STOCK',
  ORDER_CANCELLED = 'ORDER_CANCELLED',
  PAYMENT_FAILED = 'PAYMENT_FAILED',

  // Server errors
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  DATABASE_ERROR = 'DATABASE_ERROR',
}

// Base custom error class
export class BaseError extends GraphQLError {
  constructor(
    message: string,
    code: ErrorCode,
    extensions?: Record<string, unknown>
  ) {
    super(message, {
      extensions: {
        code,
        ...extensions,
      },
    });
  }
}

// Authentication Errors
export class AuthenticationError extends BaseError {
  constructor(message = 'Authentication required') {
    super(message, ErrorCode.UNAUTHENTICATED);
  }
}

export class InvalidTokenError extends BaseError {
  constructor(message = 'Invalid authentication token') {
    super(message, ErrorCode.INVALID_TOKEN);
  }
}

export class TokenExpiredError extends BaseError {
  constructor(message = 'Authentication token has expired') {
    super(message, ErrorCode.TOKEN_EXPIRED);
  }
}

// Authorization Errors
export class ForbiddenError extends BaseError {
  constructor(message = 'You do not have permission to perform this action') {
    super(message, ErrorCode.FORBIDDEN);
  }
}

export class InsufficientPermissionsError extends BaseError {
  constructor(requiredRole: string) {
    super(`This action requires ${requiredRole} role`, ErrorCode.INSUFFICIENT_PERMISSIONS, {
      requiredRole,
    });
  }
}

// Validation Errors
export class ValidationError extends BaseError {
  constructor(message: string, field?: string, value?: unknown) {
    super(message, ErrorCode.VALIDATION_ERROR, {
      field,
      invalidValue: value,
    });
  }
}

export class InvalidInputError extends BaseError {
  constructor(errors: Array<{ field: string; message: string }>) {
    super('Invalid input provided', ErrorCode.INVALID_INPUT, {
      validationErrors: errors,
    });
  }
}

// Resource Errors
export class NotFoundError extends BaseError {
  constructor(resource: string, id?: string) {
    const message = id
      ? `${resource} with id "${id}" not found`
      : `${resource} not found`;
    super(message, ErrorCode.NOT_FOUND, {
      resource,
      resourceId: id,
    });
  }
}

export class AlreadyExistsError extends BaseError {
  constructor(resource: string, field: string, value: string) {
    super(`${resource} with ${field} "${value}" already exists`, ErrorCode.ALREADY_EXISTS, {
      resource,
      field,
      value,
    });
  }
}

export class ConflictError extends BaseError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, ErrorCode.CONFLICT, details);
  }
}

// Business Logic Errors
export class InsufficientStockError extends BaseError {
  constructor(productId: string, requested: number, available: number) {
    super(
      `Insufficient stock for product. Requested: ${requested}, Available: ${available}`,
      ErrorCode.INSUFFICIENT_STOCK,
      {
        productId,
        requested,
        available,
      }
    );
  }
}

export class OrderCancelledError extends BaseError {
  constructor(orderId: string) {
    super(`Order "${orderId}" has been cancelled and cannot be modified`, ErrorCode.ORDER_CANCELLED, {
      orderId,
    });
  }
}

export class PaymentFailedError extends BaseError {
  constructor(reason: string) {
    super(`Payment failed: ${reason}`, ErrorCode.PAYMENT_FAILED, {
      reason,
    });
  }
}

// Server Errors
export class InternalError extends BaseError {
  constructor(message = 'An internal error occurred') {
    super(message, ErrorCode.INTERNAL_ERROR);
  }
}

export class ServiceUnavailableError extends BaseError {
  constructor(service: string) {
    super(`${service} is currently unavailable`, ErrorCode.SERVICE_UNAVAILABLE, {
      service,
    });
  }
}

export class DatabaseError extends BaseError {
  constructor(operation: string) {
    super(`Database error during ${operation}`, ErrorCode.DATABASE_ERROR, {
      operation,
    });
  }
}
