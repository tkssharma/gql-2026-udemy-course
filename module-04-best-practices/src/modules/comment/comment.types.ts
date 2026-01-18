export interface CommentModel {
  id: string;
  content: string;
  authorId: string;
  postId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCommentInput {
  content: string;
  postId: string;
}

export interface UpdateCommentInput {
  content: string;
}
