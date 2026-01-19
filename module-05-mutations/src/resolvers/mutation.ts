import { GraphQLError } from 'graphql';
import { users, generateId } from '../data/users.js';
import {
  CreateUserInput,
  UpdateUserInput,
  UserMutationResponse,
  DeleteUserResponse,
} from '../types/index.js';

// Email validation helper
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Check if email already exists
const emailExists = (email: string, excludeId?: string): boolean => {
  return users.some(
    (user) => user.email.toLowerCase() === email.toLowerCase() && user.id !== excludeId
  );
};

export const Mutation = {
  // Create a new user
  createUser: (
    _: unknown,
    args: { input: CreateUserInput }
  ): UserMutationResponse => {
    const { name, email, age } = args.input;

    // Validation: Check name
    if (!name || name.trim().length < 2) {
      throw new GraphQLError('Name must be at least 2 characters long', {
        extensions: {
          code: 'VALIDATION_ERROR',
          field: 'name',
        },
      });
    }

    // Validation: Check email format
    if (!isValidEmail(email)) {
      throw new GraphQLError('Invalid email format', {
        extensions: {
          code: 'VALIDATION_ERROR',
          field: 'email',
        },
      });
    }

    // Validation: Check duplicate email
    if (emailExists(email)) {
      throw new GraphQLError(`User with email "${email}" already exists`, {
        extensions: {
          code: 'DUPLICATE_EMAIL',
          field: 'email',
        },
      });
    }

    // Validation: Check age if provided
    if (age !== undefined && (age < 0 || age > 150)) {
      throw new GraphQLError('Age must be between 0 and 150', {
        extensions: {
          code: 'VALIDATION_ERROR',
          field: 'age',
        },
      });
    }

    // Create new user
    const newUser = {
      id: generateId(),
      name: name.trim(),
      email: email.toLowerCase(),
      age,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);

    return {
      success: true,
      message: 'User created successfully',
      user: newUser,
    };
  },

  // Update an existing user
  updateUser: (
    _: unknown,
    args: { id: string; input: UpdateUserInput }
  ): UserMutationResponse => {
    const { id, input } = args;
    const { name, email, age } = input;

    // Find user
    const userIndex = users.findIndex((user) => user.id === id);

    if (userIndex === -1) {
      throw new GraphQLError(`User with id "${id}" not found`, {
        extensions: {
          code: 'USER_NOT_FOUND',
          argumentName: 'id',
        },
      });
    }

    // Validation: Check name if provided
    if (name !== undefined && name.trim().length < 2) {
      throw new GraphQLError('Name must be at least 2 characters long', {
        extensions: {
          code: 'VALIDATION_ERROR',
          field: 'name',
        },
      });
    }

    // Validation: Check email if provided
    if (email !== undefined) {
      if (!isValidEmail(email)) {
        throw new GraphQLError('Invalid email format', {
          extensions: {
            code: 'VALIDATION_ERROR',
            field: 'email',
          },
        });
      }

      if (emailExists(email, id)) {
        throw new GraphQLError(`User with email "${email}" already exists`, {
          extensions: {
            code: 'DUPLICATE_EMAIL',
            field: 'email',
          },
        });
      }
    }

    // Validation: Check age if provided
    if (age !== undefined && (age < 0 || age > 150)) {
      throw new GraphQLError('Age must be between 0 and 150', {
        extensions: {
          code: 'VALIDATION_ERROR',
          field: 'age',
        },
      });
    }

    // Update user
    const updatedUser = {
      ...users[userIndex],
      ...(name !== undefined && { name: name.trim() }),
      ...(email !== undefined && { email: email.toLowerCase() }),
      ...(age !== undefined && { age }),
    };

    users[userIndex] = updatedUser;

    return {
      success: true,
      message: 'User updated successfully',
      user: updatedUser,
    };
  },

  // Delete a user
  deleteUser: (_: unknown, args: { id: string }): DeleteUserResponse => {
    const { id } = args;

    const userIndex = users.findIndex((user) => user.id === id);

    if (userIndex === -1) {
      throw new GraphQLError(`User with id "${id}" not found`, {
        extensions: {
          code: 'USER_NOT_FOUND',
          argumentName: 'id',
        },
      });
    }

    // Remove user
    users.splice(userIndex, 1);

    return {
      success: true,
      message: 'User deleted successfully',
      deletedId: id,
    };
  },
};
