# 2. Defining TypeScript Types for Your Schema

Learn to write TypeScript interfaces that perfectly match your GraphQL schema.

---

## GraphQL to TypeScript Type Mapping

### Scalar Types

| GraphQL   | TypeScript |
| --------- | ---------- |
| `ID`      | `string`   |
| `String`  | `string`   |
| `Int`     | `number`   |
| `Float`   | `number`   |
| `Boolean` | `boolean`  |

```graphql
# GraphQL Schema
type Product {
  id: ID!
  name: String!
  price: Float!
  quantity: Int!
  inStock: Boolean!
}
```

```typescript
// TypeScript Interface
interface Product {
  id: string;
  name: string;
  price: number;
  quantity: number;
  inStock: boolean;
}
```

---

## Nullable vs Non-Nullable Types

GraphQL uses `!` to mark non-nullable fields. In TypeScript, we use union types with `null`.

### Non-Nullable (Required)

```graphql
type User {
  id: ID! # Never null
  name: String! # Never null
}
```

```typescript
interface User {
  id: string; // Always present
  name: string; // Always present
}
```

### Nullable (Optional)

```graphql
type User {
  id: ID!
  name: String!
  bio: String # Can be null
  age: Int # Can be null
}
```

```typescript
interface User {
  id: string;
  name: string;
  bio: string | null; // Explicit null
  age: number | null; // Explicit null
}

// Alternative: Optional property
interface User {
  id: string;
  name: string;
  bio?: string; // undefined (slightly different semantics)
  age?: number;
}
```

**Best Practice:** Use `| null` for GraphQL nullability (matches GraphQL semantics better than `?`).

---

## Array Types

```graphql
type User {
  tags: [String] # Nullable list, nullable items
  roles: [String!] # Nullable list, non-null items
  posts: [Post]! # Non-null list, nullable items
  comments: [Comment!]! # Non-null list, non-null items
}
```

```typescript
interface User {
  tags: (string | null)[] | null; // [String]
  roles: string[] | null; // [String!]
  posts: (Post | null)[]; // [Post]!
  comments: Comment[]; // [Comment!]!
}
```

### Simplified (Common Pattern)

Most APIs use `[Type!]!` (non-null list of non-null items):

```graphql
type User {
  posts: [Post!]!
}
```

```typescript
interface User {
  posts: Post[]; // Simple array
}
```

---

## Object Types

```graphql
type User {
  id: ID!
  name: String!
  email: String!
  profile: Profile
  posts: [Post!]!
}

type Profile {
  bio: String
  avatar: String
  website: String
}

type Post {
  id: ID!
  title: String!
  content: String!
  published: Boolean!
  author: User!
  createdAt: String!
}
```

```typescript
interface User {
  id: string;
  name: string;
  email: string;
  profile: Profile | null;
  posts: Post[];
}

interface Profile {
  bio: string | null;
  avatar: string | null;
  website: string | null;
}

interface Post {
  id: string;
  title: string;
  content: string;
  published: boolean;
  author: User;
  createdAt: string;
}
```

---

## Enum Types

```graphql
enum UserRole {
  ADMIN
  MODERATOR
  USER
  GUEST
}

enum PostStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}

type User {
  role: UserRole!
}

type Post {
  status: PostStatus!
}
```

```typescript
// Option 1: TypeScript enum
enum UserRole {
  ADMIN = 'ADMIN',
  MODERATOR = 'MODERATOR',
  USER = 'USER',
  GUEST = 'GUEST',
}

enum PostStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

// Option 2: Union type (preferred - no runtime overhead)
type UserRole = 'ADMIN' | 'MODERATOR' | 'USER' | 'GUEST';
type PostStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

// Option 3: Const object (when you need the values)
const UserRole = {
  ADMIN: 'ADMIN',
  MODERATOR: 'MODERATOR',
  USER: 'USER',
  GUEST: 'GUEST',
} as const;

type UserRole = (typeof UserRole)[keyof typeof UserRole];
```

---

## Input Types

Input types are used for mutation arguments:

```graphql
input CreateUserInput {
  name: String!
  email: String!
  role: UserRole = USER # Default value
}

input UpdateUserInput {
  name: String
  email: String
  role: UserRole
}

input PostFilters {
  authorId: ID
  status: PostStatus
  tags: [String!]
  limit: Int = 10
  offset: Int = 0
}
```

```typescript
interface CreateUserInput {
  name: string;
  email: string;
  role?: UserRole; // Optional because it has a default
}

interface UpdateUserInput {
  name?: string | null;
  email?: string | null;
  role?: UserRole | null;
}

interface PostFilters {
  authorId?: string | null;
  status?: PostStatus | null;
  tags?: string[] | null;
  limit?: number; // Has default
  offset?: number; // Has default
}
```

---

## Query and Mutation Arguments

```graphql
type Query {
  user(id: ID!): User
  users(limit: Int, offset: Int): [User!]!
  searchUsers(query: String!, filters: UserFilters): [User!]!
}

type Mutation {
  createUser(input: CreateUserInput!): User!
  updateUser(id: ID!, input: UpdateUserInput!): User!
  deleteUser(id: ID!): Boolean!
}
```

```typescript
// Query argument types
interface UserArgs {
  id: string;
}

interface UsersArgs {
  limit?: number | null;
  offset?: number | null;
}

interface SearchUsersArgs {
  query: string;
  filters?: UserFilters | null;
}

// Mutation argument types
interface CreateUserArgs {
  input: CreateUserInput;
}

interface UpdateUserArgs {
  id: string;
  input: UpdateUserInput;
}

interface DeleteUserArgs {
  id: string;
}
```

---

## Custom Scalars

```graphql
scalar DateTime
scalar JSON
scalar UUID

type Event {
  id: UUID!
  name: String!
  date: DateTime!
  metadata: JSON
}
```

```typescript
// Custom scalar types
type DateTime = string; // ISO 8601 string
type UUID = string; // UUID string
type JSON = Record<string, unknown> | unknown[];

// Or use branded types for extra safety
type DateTime = string & { readonly __brand: 'DateTime' };
type UUID = string & { readonly __brand: 'UUID' };

interface Event {
  id: UUID;
  name: string;
  date: DateTime;
  metadata: JSON | null;
}
```

---

## Union Types

```graphql
union SearchResult = User | Post | Comment

type Query {
  search(query: String!): [SearchResult!]!
}
```

```typescript
type SearchResult = User | Post | Comment;

// With discriminator for type narrowing
interface User {
  __typename: 'User';
  id: string;
  name: string;
}

interface Post {
  __typename: 'Post';
  id: string;
  title: string;
}

interface Comment {
  __typename: 'Comment';
  id: string;
  text: string;
}

type SearchResult = User | Post | Comment;

// Usage with type narrowing
function handleResult(result: SearchResult) {
  switch (result.__typename) {
    case 'User':
      console.log(result.name); // TypeScript knows it's User
      break;
    case 'Post':
      console.log(result.title); // TypeScript knows it's Post
      break;
    case 'Comment':
      console.log(result.text); // TypeScript knows it's Comment
      break;
  }
}
```

---

## Interface Types

```graphql
interface Node {
  id: ID!
}

interface Timestamped {
  createdAt: DateTime!
  updatedAt: DateTime!
}

type User implements Node & Timestamped {
  id: ID!
  name: String!
  createdAt: DateTime!
  updatedAt: DateTime!
}

type Post implements Node & Timestamped {
  id: ID!
  title: String!
  createdAt: DateTime!
  updatedAt: DateTime!
}
```

```typescript
interface Node {
  id: string;
}

interface Timestamped {
  createdAt: string;
  updatedAt: string;
}

interface User extends Node, Timestamped {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

interface Post extends Node, Timestamped {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}
```

---

## Complete Example

### GraphQL Schema

```graphql
enum UserRole {
  ADMIN
  USER
}

enum PostStatus {
  DRAFT
  PUBLISHED
}

type User {
  id: ID!
  name: String!
  email: String!
  role: UserRole!
  posts: [Post!]!
  createdAt: String!
}

type Post {
  id: ID!
  title: String!
  content: String!
  status: PostStatus!
  author: User!
  tags: [String!]!
  createdAt: String!
}

input CreateUserInput {
  name: String!
  email: String!
  role: UserRole = USER
}

input CreatePostInput {
  title: String!
  content: String!
  tags: [String!]
}

type Query {
  user(id: ID!): User
  users: [User!]!
  post(id: ID!): Post
  posts(status: PostStatus): [Post!]!
}

type Mutation {
  createUser(input: CreateUserInput!): User!
  createPost(input: CreatePostInput!): Post!
  publishPost(id: ID!): Post!
}
```

### TypeScript Types

```typescript
// src/types/index.ts

// Enums
export type UserRole = 'ADMIN' | 'USER';
export type PostStatus = 'DRAFT' | 'PUBLISHED';

// Object Types
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  posts: Post[];
  createdAt: string;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  status: PostStatus;
  author: User;
  tags: string[];
  createdAt: string;
}

// Input Types
export interface CreateUserInput {
  name: string;
  email: string;
  role?: UserRole;
}

export interface CreatePostInput {
  title: string;
  content: string;
  tags?: string[];
}

// Query Arguments
export interface UserQueryArgs {
  id: string;
}

export interface PostQueryArgs {
  id: string;
}

export interface PostsQueryArgs {
  status?: PostStatus | null;
}

// Mutation Arguments
export interface CreateUserMutationArgs {
  input: CreateUserInput;
}

export interface CreatePostMutationArgs {
  input: CreatePostInput;
}

export interface PublishPostMutationArgs {
  id: string;
}
```

---

## Type Mapping Cheat Sheet

| GraphQL    | TypeScript                 |
| ---------- | -------------------------- |
| `ID!`      | `string`                   |
| `ID`       | `string \| null`           |
| `String!`  | `string`                   |
| `String`   | `string \| null`           |
| `Int!`     | `number`                   |
| `Int`      | `number \| null`           |
| `Float!`   | `number`                   |
| `Float`    | `number \| null`           |
| `Boolean!` | `boolean`                  |
| `Boolean`  | `boolean \| null`          |
| `[Type!]!` | `Type[]`                   |
| `[Type!]`  | `Type[] \| null`           |
| `[Type]!`  | `(Type \| null)[]`         |
| `[Type]`   | `(Type \| null)[] \| null` |
| `enum`     | `'VALUE1' \| 'VALUE2'`     |
| `input`    | `interface`                |

---

## Next: [3. Type-Safe Resolvers →](./3-type-safe-resolvers.md)
