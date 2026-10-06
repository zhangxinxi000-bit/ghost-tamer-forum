import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import { logger } from '@/lib/logger';
import type {
  ForumUser,
  LoginRequest,
  RegisterRequest,
  LoginResponse,
  UpdateProfileRequest,
} from '@shared/api.interface';
import { axiosForBackend } from '@/api/request';
import { setToken, clearToken, getToken } from '@client/src/api/request';

interface AuthContextType {
  user: ForumUser | null;
  loading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  updateProfile: (data: UpdateProfileRequest) => Promise<ForumUser>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_KEY: string = 'forum_user';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<ForumUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchCurrentUser = useCallback(async (): Promise<void> => {
    try {
      const response = await axiosForBackend({
        url: '/api/users/me',
        method: 'GET',
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });
      const currentUser: ForumUser = response.data;
      setUser(currentUser);
      localStorage.setItem(USER_KEY, JSON.stringify(currentUser));
    } catch (err: unknown) {
      logger.error('获取当前用户失败', err);
      clearToken();
      localStorage.removeItem(USER_KEY);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token: string | null = getToken();
    if (token) {
      void fetchCurrentUser();
    } else {
      setLoading(false);
    }
  }, [fetchCurrentUser]);

  const login = async (data: LoginRequest): Promise<void> => {
    try {
      const response = await axiosForBackend({
        url: '/api/auth/login',
        method: 'POST',
        data,
      });
      const result: LoginResponse = response.data;
      setToken(result.token);
      localStorage.setItem(USER_KEY, JSON.stringify(result.user));
      setUser(result.user);
    } catch (err: unknown) {
      logger.error('登录失败', err);
      throw err;
    }
  };

  const register = async (data: RegisterRequest): Promise<void> => {
    try {
      const response = await axiosForBackend({
        url: '/api/auth/register',
        method: 'POST',
        data,
      });
      const result: LoginResponse = response.data;
      setToken(result.token);
      localStorage.setItem(USER_KEY, JSON.stringify(result.user));
      setUser(result.user);
    } catch (err: unknown) {
      logger.error('注册失败', err);
      throw err;
    }
  };

  const logout = (): void => {
    clearToken();
    localStorage.removeItem(USER_KEY);
    setUser(null);
  };

  const updateProfile = async (
    data: UpdateProfileRequest,
  ): Promise<ForumUser> => {
    try {
      const response = await axiosForBackend({
        url: '/api/users/me',
        method: 'PATCH',
        data,
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });
      const updated: ForumUser = response.data;
      setUser(updated);
      localStorage.setItem(USER_KEY, JSON.stringify(updated));
      return updated;
    } catch (err: unknown) {
      logger.error('更新资料失败', err);
      throw err;
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context: AuthContextType | undefined = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
