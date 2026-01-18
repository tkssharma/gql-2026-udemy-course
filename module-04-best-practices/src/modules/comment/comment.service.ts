import type { CommentModel, CreateCommentInput, UpdateCommentInput } from './comment.types.js';

// Mock data
const comments: CommentModel[] = [
  {
    id: '1',
    content: 'Great article! Very helpful for beginners.',
    authorId: '2',
    postId: '1',
    createdAt: new Date('2024-01-06'),
    updatedAt: new Date('2024-01-06'),
  },
  {
    id: '2',
    content: 'Thanks for sharing this knowledge!',
    authorId: '3',
    postId: '1',
    createdAt: new Date('2024-01-07'),
    updatedAt: new Date('2024-01-07'),
  },
  {
    id: '3',
    content: 'I learned a lot from this post.',
    authorId: '1',
    postId: '2',
    createdAt: new Date('2024-01-11'),
    updatedAt: new Date('2024-01-11'),
  },
  {
    id: '4',
    content: 'Could you explain more about type inference?',
    authorId: '3',
    postId: '2',
    createdAt: new Date('2024-01-12'),
    updatedAt: new Date('2024-01-12'),
  },
  {
    id: '5',
    content: 'Looking forward to more content like this!',
    authorId: '1',
    postId: '4',
    createdAt: new Date('2024-01-21'),
    updatedAt: new Date('2024-01-21'),
  },
  {
    id: '6',
    content: 'This helped me optimize my app significantly.',
    authorId: '3',
    postId: '4',
    createdAt: new Date('2024-01-22'),
    updatedAt: new Date('2024-01-22'),
  },
];

let nextId = 7;

export class CommentService {
  findAll(): CommentModel[] {
    return comments;
  }

  findById(id: string): CommentModel | null {
    return comments.find((c) => c.id === id) ?? null;
  }

  findByPostId(postId: string): CommentModel[] {
    return comments.filter((c) => c.postId === postId);
  }

  findByAuthorId(authorId: string): CommentModel[] {
    return comments.filter((c) => c.authorId === authorId);
  }

  findByIds(ids: string[]): CommentModel[] {
    return comments.filter((c) => ids.includes(c.id));
  }

  create(authorId: string, input: CreateCommentInput): CommentModel {
    const now = new Date();
    const comment: CommentModel = {
      id: String(nextId++),
      content: input.content,
      authorId,
      postId: input.postId,
      createdAt: now,
      updatedAt: now,
    };
    comments.push(comment);
    return comment;
  }

  update(id: string, input: UpdateCommentInput): CommentModel | null {
    const index = comments.findIndex((c) => c.id === id);
    if (index === -1) return null;

    const comment = comments[index];
    if (!comment) return null;

    const updated: CommentModel = {
      ...comment,
      content: input.content,
      updatedAt: new Date(),
    };
    comments[index] = updated;
    return updated;
  }

  delete(id: string): boolean {
    const index = comments.findIndex((c) => c.id === id);
    if (index === -1) return false;
    comments.splice(index, 1);
    return true;
  }
}
