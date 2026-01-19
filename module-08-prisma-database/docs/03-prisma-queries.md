# Prisma Queries in GraphQL Resolvers

## Basic CRUD Operations

### Find Many (List)

```typescript
// Get all users
const users = await context.prisma.user.findMany();

// With ordering
const users = await context.prisma.user.findMany({
  orderBy: { createdAt: 'desc' },
});

// With filtering
const publishedPosts = await context.prisma.post.findMany({
  where: { published: true },
});

// With pagination
const posts = await context.prisma.post.findMany({
  skip: 0,
  take: 10,
});
```

### Find Unique (Single Record)

```typescript
// By ID
const user = await context.prisma.user.findUnique({
  where: { id: 'cuid123' },
});

// By unique field
const user = await context.prisma.user.findUnique({
  where: { email: 'john@example.com' },
});
```

### Create

```typescript
const user = await context.prisma.user.create({
  data: {
    email: 'new@example.com',
    name: 'New User',
    role: 'user',
  },
});
```

### Update

```typescript
const user = await context.prisma.user.update({
  where: { id: 'cuid123' },
  data: {
    name: 'Updated Name',
  },
});
```

### Delete

```typescript
await context.prisma.user.delete({
  where: { id: 'cuid123' },
});
```

## Relations

### Include Related Data

```typescript
// Get user with their posts
const user = await context.prisma.user.findUnique({
  where: { id: 'cuid123' },
  include: {
    posts: true,
  },
});

// Nested includes
const user = await context.prisma.user.findUnique({
  where: { id: 'cuid123' },
  include: {
    posts: {
      include: {
        comments: true,
      },
    },
  },
});
```

### Select Specific Fields

```typescript
const user = await context.prisma.user.findUnique({
  where: { id: 'cuid123' },
  select: {
    id: true,
    name: true,
    email: true,
    // Don't include role, createdAt, etc.
  },
});
```

### Create with Relations

```typescript
// Create user with posts
const user = await context.prisma.user.create({
  data: {
    email: 'author@example.com',
    name: 'Author',
    posts: {
      create: [
        { title: 'Post 1', content: 'Content 1' },
        { title: 'Post 2', content: 'Content 2' },
      ],
    },
  },
  include: {
    posts: true,
  },
});

// Create post for existing user
const post = await context.prisma.post.create({
  data: {
    title: 'New Post',
    content: 'Content here',
    author: {
      connect: { id: 'existing-user-id' },
    },
  },
});
```

## Filtering

### Basic Filters

```typescript
// Equals
where: { published: true }

// Not equals
where: { role: { not: 'admin' } }

// Contains (string)
where: { name: { contains: 'john' } }

// Starts with
where: { email: { startsWith: 'admin' } }

// In array
where: { role: { in: ['admin', 'moderator'] } }

// Greater than
where: { createdAt: { gt: new Date('2024-01-01') } }
```

### Combining Filters

```typescript
// AND (implicit)
where: {
  published: true,
  authorId: 'user123',
}

// AND (explicit)
where: {
  AND: [
    { published: true },
    { authorId: 'user123' },
  ],
}

// OR
where: {
  OR: [
    { title: { contains: 'graphql' } },
    { content: { contains: 'graphql' } },
  ],
}

// NOT
where: {
  NOT: { role: 'admin' },
}
```

### Relation Filters

```typescript
// Posts by users with specific role
const posts = await context.prisma.post.findMany({
  where: {
    author: {
      role: 'admin',
    },
  },
});

// Users with at least one published post
const users = await context.prisma.user.findMany({
  where: {
    posts: {
      some: { published: true },
    },
  },
});
```

## In GraphQL Resolvers

### Query Resolver Example

```typescript
export const Query = {
  posts: async (_, args, context: GraphQLContext) => {
    const { published, authorId, search } = args;

    return context.prisma.post.findMany({
      where: {
        ...(published !== undefined && { published }),
        ...(authorId && { authorId }),
        ...(search && {
          OR: [{ title: { contains: search } }, { content: { contains: search } }],
        }),
      },
      orderBy: { createdAt: 'desc' },
    });
  },
};
```

### Mutation Resolver Example

```typescript
export const Mutation = {
  createPost: async (_, { input }, context: GraphQLContext) => {
    if (!context.currentUser) {
      throw new Error('Not authenticated');
    }

    return context.prisma.post.create({
      data: {
        title: input.title,
        content: input.content,
        published: input.published ?? false,
        authorId: context.currentUser.id,
      },
    });
  },
};
```

### Field Resolver Example

```typescript
export const Post = {
  author: async (parent, _, context: GraphQLContext) => {
    // parent.authorId comes from the post record
    return context.prisma.user.findUnique({
      where: { id: parent.authorId },
    });
  },

  comments: async (parent, _, context: GraphQLContext) => {
    return context.prisma.comment.findMany({
      where: { postId: parent.id },
      orderBy: { createdAt: 'desc' },
    });
  },
};
```

## Error Handling

```typescript
export const Mutation = {
  updatePost: async (_, { id, input }, context: GraphQLContext) => {
    // Check if post exists
    const post = await context.prisma.post.findUnique({
      where: { id },
    });

    if (!post) {
      throw new GraphQLError('Post not found', {
        extensions: { code: 'NOT_FOUND' },
      });
    }

    // Check ownership
    if (post.authorId !== context.currentUser?.id) {
      throw new GraphQLError('Not authorized', {
        extensions: { code: 'FORBIDDEN' },
      });
    }

    // Update
    return context.prisma.post.update({
      where: { id },
      data: input,
    });
  },
};
```

## Performance Tips

1. **Use `select` to limit fields** - Don't fetch data you don't need
2. **Use `include` sparingly** - Prefer field resolvers for relations
3. **Add database indexes** - For frequently queried fields
4. **Use pagination** - Don't fetch unlimited records
5. **Batch with DataLoader** - For N+1 query problems
