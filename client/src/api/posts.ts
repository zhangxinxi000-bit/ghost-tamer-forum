import request from './request';
import type {
  PostDetail,
  PostListResponse,
  Reply,
  ReplyListResponse,
  CreatePostRequest,
  CreateReplyRequest,
} from '@shared/api.interface';

interface GetPostsParams {
  boardId?: string;
  page?: number;
  pageSize?: number;
  sort?: 'latest' | 'hot';
  keyword?: string;
}

interface GetRepliesParams {
  page?: number;
  pageSize?: number;
  authorOnly?: boolean;
}

export async function getPosts(params: GetPostsParams): Promise<PostListResponse> {
  return request<PostListResponse>({
    url: '/api/posts',
    method: 'GET',
    params,
  });
}

export async function getPost(id: string): Promise<PostDetail> {
  return request<PostDetail>({
    url: `/api/posts/${id}`,
    method: 'GET',
  });
}

export async function createPost(data: CreatePostRequest): Promise<PostDetail> {
  return request<PostDetail>({
    url: '/api/posts',
    method: 'POST',
    data,
  });
}

export async function getReplies(
  postId: string,
  params: GetRepliesParams = {},
): Promise<ReplyListResponse> {
  return request<ReplyListResponse>({
    url: `/api/posts/${postId}/replies`,
    method: 'GET',
    params,
  });
}

export async function createReply(
  postId: string,
  data: CreateReplyRequest,
): Promise<Reply> {
  return request<Reply>({
    url: `/api/posts/${postId}/replies`,
    method: 'POST',
    data,
  });
}
