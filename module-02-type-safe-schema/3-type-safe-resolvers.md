# 3. Type-Safe Resolvers

Learn to write fully typed resolver functions that catch errors at compile time.

---

## Resolver Function Signature

Every GraphQL resolver receives four arguments:

```typescript
function resolver(parent, args, context, info) {
  // Return data
}
```

| Argument  | Description                                                  |
| --------- | ------------------------------------------------------------ |
| `parent`  | Result from parent resolver (root resolvers get `undefined`) |
| `args`    | Arguments passed to the field                                |
| `context` | Shared context (auth, database, etc.)                        |
| `info`    | GraphQL execution info (rarely used)                         |

---

## Typing Each Argument

### 1. Parent Type

```typescript
// Root resolvers (Query, Mutation) - parent is undefined
const Query = {
  users: (parent: undefined, args, context) => { ... },
};

// Field resolvers - parent is the parent type
const User = {
  posts: (parent: User, args, context) => { ... },
  //      ^^^^^^^^^^^^ Parent is the User object
};

const Post = {
  author: (parent: Post, args, context) => { ... },
  //      ^^^^^^^^^^^^ Parent is the Post object
};
```

### 2. Args Type

```typescript
// Define argument interfaces
interface UserArgs {
  id: string;
}

interface UsersArgs {
  limit?: number | null;
  offset?: number | null;
}

interface CreateUserArgs {
  input: CreateUserInput;
}

// Use in resolvers
const Query = {
  user: (parent: undefined, args: UserArgs) => {
    return users.find((u) => u.id === args.id);
    //                            ^^^^^^^ TypeScript knows this exists
  },

  users: (parent: undefined, args: UsersArgs) => {
    const limit = args.limit ?? 10;
    const offset = args.offset ?? 0;
    return users.slice(offset, offset + limit);
  },
};

const Mutation = {
  createUser: (parent: undefined, args: CreateUserArgs) => {
    const { name, email, role } = args.input;
    //      ^^^^^^^^^^^^^^^^^^^^ All typed!
    return createUser({ name, email, role });
  },
};
```

### 3. Context Type

```typescript
// Define context interface
interface Context {
  // Current authenticated user
  currentUser: User | null;

  // Database connection
  db: Database;

  // Services
  userService: UserService;
  postService: PostService;

  // Request info
  request: Request;
}

// Use in resolvers
const Query = {
  me: (parent: undefined, args: {}, context: Context) => {
    if (!context.currentUser) {
      throw new Error('Not authenticated');
    }
    return context.currentUser;
  },

  users: async (parent: undefined, args: {}, context: Context) => {
    return context.userService.findAll();
    //     ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ Typed!
  },
};
```

### 4. Info Type (Optional)

```typescript
import type { GraphQLResolveInfo } from 'graphql';

const Query = {
  user: (
    parent: undefined,
    args: UserArgs,
    context: Context,
    info: GraphQLResolveInfo, // Rarely needed
  ) => {
    // info contains field selection, path, etc.
    console.log(info.fieldName); // 'user'
    return users.find((u) => u.id === args.id);
  },
};
```

---

## Typing Return Values

### Explicit Return Types

```typescript
const Query = {
  // Nullable return
  user: (parent: undefined, args: UserArgs, context: Context): User | null => {
    return users.find((u) => u.id === args.id) ?? null;
  },

  // Non-null array return
  users: (parent: undefined, args: UsersArgs, context: Context): User[] => {
    return users;
  },

  // Async return
  posts: async (parent: undefined, args: PostsArgs, context: Context): Promise<Post[]> => {
    return context.postService.findAll();
  },
};
```

### Field Resolvers

```typescript
const User = {
  // Resolve posts for a user
  posts: (parent: User, args: {}, context: Context): Post[] => {
    return posts.filter((p) => p.authorId === parent.id);
  },

  // Async field resolver
  posts: async (parent: User, args: {}, context: Context): Promise<Post[]> => {
    return context.postService.findByAuthorId(parent.id);
  },

  // Computed field
  fullName: (parent: User): string => {
    return `${parent.firstName} ${parent.lastName}`;
  },

  // Field with arguments
  posts: (parent: User, args: { limit?: number; status?: PostStatus }, context: Context): Post[] => {
    let userPosts = posts.filter((p) => p.authorId === parent.id);

    if (args.status) {
      userPosts = userPosts.filter((p) => p.status === args.status);
    }

    if (args.limit) {
      userPosts = userPosts.slice(0, args.limit);
    }

    return userPosts;
  },
};
```

---

## Generic Resolver Types

Create reusable resolver type definitions:

```typescript
// Generic resolver type
type Resolver<TParent, TArgs, TContext, TResult> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo,
) => TResult | Promise<TResult>;

// Specific resolver types
type QueryResolver<TArgs, TResult> = Resolver<undefined, TArgs, Context, TResult>;
type MutationResolver<TArgs, TResult> = Resolver<undefined, TArgs, Context, TResult>;
type FieldResolver<TParent, TArgs, TResult> = Resolver<TParent, TArgs, Context, TResult>;

// Usage
const userResolver: QueryResolver<UserArgs, User | null> = (_, args, context) => {
  return context.userService.findById(args.id);
};

const postsResolver: FieldResolver<User, {}, Post[]> = (parent, _, context) => {
  return context.postService.findByAuthorId(parent.id);
};
```

---

## Complete Typed Resolvers Example

### Types Definition

```typescript
// src/types/index.ts

export type UserRole = 'ADMIN' | 'USER';
export type PostStatus = 'DRAFT' | 'PUBLISHED';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  status: PostStatus;
  authorId: string;
  createdAt: string;
}

export interface CreateUserInput {
  name: string;
  email: string;
  role?: UserRole;
}

export interface CreatePostInput {
  title: string;
  content: string;
}

export interface Context {
  currentUser: User | null;
  db: Database;
}
```

### Query Resolvers

```typescript
// src/resolvers/Query.ts
import type { User, Post, Context } from '../types';

interface UserArgs {
  id: string;
}

interface UsersArgs {
  limit?: number | null;
  offset?: number | null;
}

interface PostArgs {
  id: string;
}

interface PostsArgs {
  status?: PostStatus | null;
}

export const Query = {
  // Get current user
  me: (_parent: undefined, _args: {}, context: Context): User | null => {
    return context.currentUser;
  },

  // Get user by ID
  user: async (_parent: undefined, args: UserArgs, context: Context): Promise<User | null> => {
    return context.db.users.findById(args.id);
  },

  // Get all users with pagination
  users: async (_parent: undefined, args: UsersArgs, context: Context): Promise<User[]> => {
    const limit = args.limit ?? 10;
    const offset = args.offset ?? 0;
    return context.db.users.findAll({ limit, offset });
  },

  // Get post by ID
  post: async (_parent: undefined, args: PostArgs, context: Context): Promise<Post | null> => {
    return context.db.posts.findById(args.id);
  },

  // Get posts with optional status filter
  posts: async (_parent: undefined, args: PostsArgs, context: Context): Promise<Post[]> => {
    if (args.status) {
      return context.db.posts.findByStatus(args.status);
    }
    return context.db.posts.findAll();
  },
};
```

### Mutation Resolvers

```typescript
// src/resolvers/Mutation.ts
import type { User, Post, CreateUserInput, CreatePostInput, Context } from '../types';
import { GraphQLError } from 'graphql';

interface CreateUserArgs {
  input: CreateUserInput;
}

interface CreatePostArgs {
  input: CreatePostInput;
}

interface PublishPostArgs {
  id: string;
}

interface DeletePostArgs {
  id: string;
}

export const Mutation = {
  // Create new user
  createUser: async (_parent: undefined, args: CreateUserArgs, context: Context): Promise<User> => {
    const { name, email, role = 'USER' } = args.input;

    // Check if email already exists
    const existing = await context.db.users.findByEmail(email);
    if (existing) {
      throw new GraphQLError('Email already in use', {
        extensions: { code: 'BAD_USER_INPUT' },
      });
    }

    return context.db.users.create({ name, email, role });
  },

  // Create new post (requires authentication)
  createPost: async (_parent: undefined, args: CreatePostArgs, context: Context): Promise<Post> => {
    if (!context.currentUser) {
      throw new GraphQLError('Not authenticated', {
        extensions: { code: 'UNAUTHENTICATED' },
      });
    }

    return context.db.posts.create({
      ...args.input,
      authorId: context.currentUser.id,
      status: 'DRAFT',
    });
  },

  // Publish a post
  publishPost: async (_parent: undefined, args: PublishPostArgs, context: Context): Promise<Post> => {
    if (!context.currentUser) {
      throw new GraphQLError('Not authenticated', {
        extensions: { code: 'UNAUTHENTICATED' },
      });
    }

    const post = await context.db.posts.findById(args.id);

    if (!post) {
      throw new GraphQLError('Post not found', {
        extensions: { code: 'NOT_FOUND' },
      });
    }

    if (post.authorId !== context.currentUser.id) {
      throw new GraphQLError('Not authorized', {
        extensions: { code: 'FORBIDDEN' },
      });
    }

    return context.db.posts.update(args.id, { status: 'PUBLISHED' });
  },

  // Delete a post
  deletePost: async (_parent: undefined, args: DeletePostArgs, context: Context): Promise<boolean> => {
    if (!context.currentUser) {
      throw new GraphQLError('Not authenticated', {
        extensions: { code: 'UNAUTHENTICATED' },
      });
    }

    const post = await context.db.posts.findById(args.id);

    if (!post) {
      return false;
    }

    if (post.authorId !== context.currentUser.id && context.currentUser.role !== 'ADMIN') {
      throw new GraphQLError('Not authorized', {
        extensions: { code: 'FORBIDDEN' },
      });
    }

    await context.db.posts.delete(args.id);
    return true;
  },
};
```

### Field Resolvers

```typescript
// src/resolvers/User.ts
import type { User, Post, Context } from '../types';

interface UserPostsArgs {
  limit?: number | null;
  status?: PostStatus | null;
}

export const User = {
  // Resolve posts for a user
  posts: async (parent: User, args: UserPostsArgs, context: Context): Promise<Post[]> => {
    let posts = await context.db.posts.findByAuthorId(parent.id);

    if (args.status) {
      posts = posts.filter((p) => p.status === args.status);
    }

    if (args.limit) {
      posts = posts.slice(0, args.limit);
    }

    return posts;
  },

  // Computed field: post count
  postCount: async (parent: User, _args: {}, context: Context): Promise<number> => {
    const posts = await context.db.posts.findByAuthorId(parent.id);
    return posts.length;
  },
};
```

```typescript
// src/resolvers/Post.ts
import type { User, Post, Context } from '../types';

export const Post = {
  // Resolve author for a post
  author: async (parent: Post, _args: {}, context: Context): Promise<User> => {
    const author = await context.db.users.findById(parent.authorId);

    if (!author) {
      throw new GraphQLError('Author not found', {
        extensions: { code: 'NOT_FOUND' },
      });
    }

    return author;
  },

  // Computed field: excerpt
  excerpt: (parent: Post): string => {
    return parent.content.slice(0, 200) + '...';
  },
};
```

### Combine Resolvers

```typescript
// src/resolvers/index.ts
import { Query } from './Query.js';
import { Mutation } from './Mutation.js';
import { User } from './User.js';
import { Post } from './Post.js';

export const resolvers = {
  Query,
  Mutation,
  User,
  Post,
};
```

---

## Type-Safe Resolver Patterns

### Pattern 1: Resolver Map Type

```typescript
// Define a type for all resolvers
interface Resolvers {
  Query: {
    me: (parent: undefined, args: {}, context: Context) => User | null;
    user: (parent: undefined, args: UserArgs, context: Context) => Promise<User | null>;
    users: (parent: undefined, args: UsersArgs, context: Context) => Promise<User[]>;
  };
  Mutation: {
    createUser: (parent: undefined, args: CreateUserArgs, context: Context) => Promise<User>;
  };
  User: {
    posts: (parent: User, args: UserPostsArgs, context: Context) => Promise<Post[]>;
  };
}

// Resolvers must match this type
const resolvers: Resolvers = {
  Query: { ... },
  Mutation: { ... },
  User: { ... },
};
```

### Pattern 2: Satisfies Operator

```typescript
// Use satisfies for type checking while preserving inference
const resolvers = {
  Query: {
    user: (_, args: UserArgs, context: Context) => {
      return context.db.users.findById(args.id);
    },
  },
} satisfies Partial<Resolvers>;
```

### Pattern 3: Helper Functions

```typescript
// Create typed resolver helpers
function createQueryResolver<TArgs, TResult>(
  resolver: (parent: undefined, args: TArgs, context: Context) => TResult | Promise<TResult>,
) {
  return resolver;
}

function createFieldResolver<TParent, TArgs, TResult>(
  resolver: (parent: TParent, args: TArgs, context: Context) => TResult | Promise<TResult>,
) {
  return resolver;
}

// Usage
const userResolver = createQueryResolver<UserArgs, User | null>((_, args, context) =>
  context.db.users.findById(args.id),
);

const postsResolver = createFieldResolver<User, {}, Post[]>((parent, _, context) =>
  context.db.posts.findByAuthorId(parent.id),
);
```

---

## Common Mistakes to Avoid

### 1. Forgetting Async/Await

```typescript
// ❌ Wrong - returns Promise, not User
const user = (_: undefined, args: UserArgs, context: Context): User | null => {
  return context.db.users.findById(args.id); // This is a Promise!
};

// ✅ Correct - mark as async and return Promise type
const user = async (_: undefined, args: UserArgs, context: Context): Promise<User | null> => {
  return context.db.users.findById(args.id);
};
```

### 2. Wrong Parent Type

```typescript
// ❌ Wrong - parent is User, not Post
const Post = {
  author: (parent: Post, ...) => { ... }, // Should be parent: Post
};

// ✅ Correct
const Post = {
  author: (parent: Post, _args: {}, context: Context): Promise<User> => {
    return context.db.users.findById(parent.authorId);
  },
};
```

### 3. Missing Null Checks

```typescript
// ❌ Wrong - doesn't handle null
const user = async (_, args: UserArgs, context: Context): Promise<User> => {
  return context.db.users.findById(args.id); // Might return null!
};

// ✅ Correct - explicit null return type
const user = async (_, args: UserArgs, context: Context): Promise<User | null> => {
  return context.db.users.findById(args.id);
};
```

---

## Summary

| Component      | Type                            |
| -------------- | ------------------------------- |
| Parent (root)  | `undefined`                     |
| Parent (field) | Parent object type              |
| Args           | Interface matching GraphQL args |
| Context        | Your context interface          |
| Return         | Matches GraphQL return type     |

**Next step:** Use GraphQL Code Generator to auto-generate these types!

---

## Next: [4. GraphQL Code Generator →](./4-codegen-setup.md)
