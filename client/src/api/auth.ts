import { logger } from '@/lib/logger';
import { axiosForBackend } from './request';
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  ForumUser,
  UpdateProfileRequest,
} from '@shared/api.interface';

export const authApi = {
  async register(data: RegisterRequest): Promise<LoginResponse> {
    try {
      const response = await axiosForBackend({
        url: '/api/auth/register',
        method: 'POST',
        data,
      });
      return response.data;
    } catch (error) {
      logger.error('注册失败', error);
      throw error;
    }
  },

  async login(data: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await axiosForBackend({
        url: '/api/auth/login',
        method: 'POST',
        data,
      });
      return response.data;
    } catch (error) {
      logger.error('登录失败', error);
      throw error;
    }
  },
};

export const usersApi = {
  async getUserByUsername(username: string): Promise<ForumUser> {
    try {
      const response = await axiosForBackend({
        url: `/api/users/${username}`,
        method: 'GET',
      });
      return response.data;
    } catch (error) {
      logger.error('获取用户信息失败', error);
      throw error;
    }
  },

  async updateProfile(data: UpdateProfileRequest): Promise<ForumUser> {
    try {
      const response = await axiosForBackend({
        url: '/api/users/profile',
        method: 'PATCH',
        data,
      });
      return response.data;
    } catch (error) {
      logger.error('更新资料失败', error);
      throw error;
    }
  },
};
