# Module 04: Best Practices GraphQL App

A GraphQL Yoga application following TypeScript best practices:

- **Domain-driven modular structure** (User, Post, Comment)
- Type-safe resolvers with context
- Service pattern for business logic
- Schema composition with `mergeTypeDefs` / `mergeResolvers`
- GraphQL Code Generator ready
- Proper error handling

---

## Project Structure

```
module-04-best-practices/
├── src/
│   ├── index.ts                    # Server entry point
│   │
│   ├── modules/
│   │   ├── user/
│   │   │   ├── user.types.ts       # User domain types
│   │   │   ├── user.schema.ts      # User GraphQL schema
│   │   │   ├── user.resolvers.ts   # User resolvers
│   │   │   ├── user.service.ts     # User business logic + mock data
│   │   │   └── index.ts            # Barrel export
│   │   │
│   │   ├── post/
│   │   │   ├── post.types.ts
│   │   │   ├── post.schema.ts
│   │   │   ├── post.resolvers.ts
│   │   │   ├── post.service.ts
│   │   │   └── index.ts
│   │   │
│   │   └── comment/
│   │       ├── comment.types.ts
│   │       ├── comment.schema.ts
│   │       ├── comment.resolvers.ts
│   │       ├── comment.service.ts
│   │       └── index.ts
│   │
│   ├── shared/
│   │   └── types/
│   │       ├── context.ts          # Context interface
│   │       └── index.ts
│   │
│   ├── schema/
│   │   ├── base.ts                 # Base Query/Mutation types
│   │   └── index.ts                # Schema composition
│   │
│   └── generated/
│       └── graphql.ts              # Auto-generated (after codegen)
│
├── codegen.ts
├── package.json
├── tsconfig.json
└── README.md
```

---

## Getting Started

### 1. Install Dependencies

```bash
cd module-04-best-practices
npm install
```

### 2. Generate Types (Optional)

```bash
npm run codegen
```

### 3. Run Development Server

```bash
npm run dev
```

### 4. Open GraphiQL

Navigate to `http://localhost:4000/graphql`

---

## GraphQL Schema

### User

```graphql
type User {
  id: ID!
  name: String!
  email: String!
  posts: [Post!]!
  comments: [Comment!]!
  createdAt: String!
  updatedAt: String!
}
```

### Post

```graphql
type Post {
  id: ID!
  title: String!
  content: String!
  status: PostStatus!
  author: User!
  comments: [Comment!]!
  createdAt: String!
  updatedAt: String!
}

enum PostStatus {
  DRAFT
  PUBLISHED
}
```

### Comment

```graphql
type Comment {
  id: ID!
  content: String!
  author: User!
  post: Post!
  createdAt: String!
  updatedAt: String!
}
```

---

## Example Queries

### Get All Users with Posts

```graphql
query {
  users {
    id
    name
    email
    posts {
      id
      title
      status
    }
  }
}
```

### Get Post with Author and Comments

```graphql
query {
  post(id: "1") {
    id
    title
    content
    author {
      name
    }
    comments {
      content
      author {
        name
      }
    }
  }
}
```

### Get Posts by Status

```graphql
query {
  posts(status: PUBLISHED) {
    id
    title
    author {
      name
    }
  }
}
```

### Create User

```graphql
mutation {
  createUser(input: { name: "David", email: "david@example.com" }) {
    id
    name
    email
  }
}
```

### Create Post

```graphql
mutation {
  createPost(input: { title: "My New Post", content: "Post content here..." }) {
    id
    title
    status
    author {
      name
    }
  }
}
```

### Create Comment

```graphql
mutation {
  createComment(input: { content: "Great post!", postId: "1" }) {
    id
    content
    author {
      name
    }
    post {
      title
    }
  }
}
```

### Publish Post

```graphql
mutation {
  publishPost(id: "3") {
    id
    title
    status
  }
}
```

---

## Mock Data

The app comes with pre-populated mock data:

- **3 Users**: Alice, Bob, Charlie
- **5 Posts**: Various articles about GraphQL, TypeScript, Node.js
- **6 Comments**: Distributed across posts

---

## Best Practices Demonstrated

### 1. Domain-Driven Modular Structure

- Each domain (User, Post, Comment) has its own module
- Module contains: types, schema, resolvers, service
- Barrel exports for clean imports

### 2. Type-Safe Context

```typescript
interface Context {
  request: Request;
  userService: UserService;
  postService: PostService;
  commentService: CommentService;
}
```

### 3. Service Pattern

- Business logic encapsulated in service classes
- Easy to test and swap implementations

### 4. Schema Composition

```typescript
const typeDefs = mergeTypeDefs([baseTypeDefs, userTypeDefs, postTypeDefs, commentTypeDefs]);
const resolvers = mergeResolvers([userResolvers, postResolvers, commentResolvers]);
```

### 5. Field Resolvers

- Relationships resolved via field resolvers (User.posts, Post.author, etc.)
- Date to String transformation

### 6. Error Handling

- `GraphQLError` with proper error codes
- Validation before mutations

---

## Scripts

| Script          | Command                 | Description                      |
| --------------- | ----------------------- | -------------------------------- |
| `dev`           | `npm run dev`           | Start dev server with hot reload |
| `build`         | `npm run build`         | Generate types and compile       |
| `start`         | `npm start`             | Run production server            |
| `codegen`       | `npm run codegen`       | Generate TypeScript types        |
| `codegen:watch` | `npm run codegen:watch` | Watch mode for codegen           |
| `typecheck`     | `npm run typecheck`     | Check types                      |
