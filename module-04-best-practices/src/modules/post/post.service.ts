import type { PostModel, PostStatus, CreatePostInput, UpdatePostInput } from './post.types.js';

// Mock data
const posts: PostModel[] = [
  {
    id: '1',
    title: 'Getting Started with GraphQL',
    content: 'GraphQL is a query language for APIs...',
    status: 'PUBLISHED',
    authorId: '1',
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-05'),
  },
  {
    id: '2',
    title: 'TypeScript Best Practices',
    content: 'TypeScript adds static typing to JavaScript...',
    status: 'PUBLISHED',
    authorId: '1',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10'),
  },
  {
    id: '3',
    title: 'Building APIs with GraphQL Yoga',
    content: 'GraphQL Yoga is a batteries-included GraphQL server...',
    status: 'DRAFT',
    authorId: '2',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: '4',
    title: 'Node.js Performance Tips',
    content: 'Learn how to optimize your Node.js applications...',
    status: 'PUBLISHED',
    authorId: '2',
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20'),
  },
  {
    id: '5',
    title: 'React and GraphQL Integration',
    content: 'How to use GraphQL with React applications...',
    status: 'DRAFT',
    authorId: '3',
    createdAt: new Date('2024-01-25'),
    updatedAt: new Date('2024-01-25'),
  },
];

let nextId = 6;

export class PostService {
  findAll(): PostModel[] {
    return posts;
  }

  findById(id: string): PostModel | null {
    return posts.find((p) => p.id === id) ?? null;
  }

  findByAuthorId(authorId: string): PostModel[] {
    return posts.filter((p) => p.authorId === authorId);
  }

  findByStatus(status: PostStatus): PostModel[] {
    return posts.filter((p) => p.status === status);
  }

  findByIds(ids: string[]): PostModel[] {
    return posts.filter((p) => ids.includes(p.id));
  }

  create(authorId: string, input: CreatePostInput): PostModel {
    const now = new Date();
    const post: PostModel = {
      id: String(nextId++),
      title: input.title,
      content: input.content,
      status: 'DRAFT',
      authorId,
      createdAt: now,
      updatedAt: now,
    };
    posts.push(post);
    return post;
  }

  update(id: string, input: UpdatePostInput): PostModel | null {
    const index = posts.findIndex((p) => p.id === id);
    if (index === -1) return null;

    const post = posts[index];
    if (!post) return null;

    const updated: PostModel = {
      ...post,
      ...input,
      updatedAt: new Date(),
    };
    posts[index] = updated;
    return updated;
  }

  publish(id: string): PostModel | null {
    const index = posts.findIndex((p) => p.id === id);
    if (index === -1) return null;

    const post = posts[index];
    if (!post) return null;

    const updated: PostModel = {
      ...post,
      status: 'PUBLISHED',
      updatedAt: new Date(),
    };
    posts[index] = updated;
    return updated;
  }

  delete(id: string): boolean {
    const index = posts.findIndex((p) => p.id === id);
    if (index === -1) return false;
    posts.splice(index, 1);
    return true;
  }
}
