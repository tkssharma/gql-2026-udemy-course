export type PostStatus = 'DRAFT' | 'PUBLISHED';

export interface PostModel {
  id: string;
  title: string;
  content: string;
  status: PostStatus;
  authorId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePostInput {
  title: string;
  content: string;
}

export interface UpdatePostInput {
  title?: string;
  content?: string;
}
