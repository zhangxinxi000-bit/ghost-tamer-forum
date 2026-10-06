import request from './request';
import type {
  ForumUser,
  UpdateProfileRequest,
} from '@shared/api.interface';

export function getCurrentUser(): Promise<ForumUser> {
  return request<ForumUser>({
    url: '/api/users/me',
    method: 'GET',
  });
}

export function getUserById(id: string): Promise<ForumUser> {
  return request<ForumUser>({
    url: `/api/users/${id}`,
    method: 'GET',
  });
}

export function getUserByUsername(username: string): Promise<ForumUser> {
  return request<ForumUser>({
    url: `/api/users/profile/${username}`,
    method: 'GET',
  });
}

export function updateProfile(data: UpdateProfileRequest): Promise<ForumUser> {
  return request<ForumUser>({
    url: '/api/users/me',
    method: 'PATCH',
    data,
  });
}
