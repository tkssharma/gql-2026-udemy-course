// User types
export interface User {
  id: string;
  name: string;
  email: string;
  age?: number;
  createdAt: string;
}

// Input types for mutations
export interface CreateUserInput {
  name: string;
  email: string;
  age?: number;
}

export interface UpdateUserInput {
  name?: string;
  email?: string;
  age?: number;
}

// Mutation response types
export interface MutationResponse {
  success: boolean;
  message: string;
}

export interface UserMutationResponse extends MutationResponse {
  user?: User;
}

export interface DeleteUserResponse extends MutationResponse {
  deletedId?: string;
}

// Error types
export class UserNotFoundError extends Error {
  constructor(id: string) {
    super(`User with id "${id}" not found`);
    this.name = 'UserNotFoundError';
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class DuplicateEmailError extends Error {
  constructor(email: string) {
    super(`User with email "${email}" already exists`);
    this.name = 'DuplicateEmailError';
  }
}
