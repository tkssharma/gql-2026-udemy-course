/**
 * Domain models - these represent your database/business entities
 * Separate from GraphQL types (which are auto-generated)
 */

export interface UserModel {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserData {
  name: string;
  email: string;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
}
