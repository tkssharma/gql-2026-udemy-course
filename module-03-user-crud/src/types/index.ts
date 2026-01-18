// User type matching GraphQL schema
export interface User {
  id: string;
  name: string;
}

// Input type for creating a user
export interface CreateUserInput {
  name: string;
}

// Query arguments
export interface UserQueryArgs {
  id: string;
}

// Mutation arguments
export interface CreateUserMutationArgs {
  name: string;
}
