import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
} from 'axios';

const TOKEN_KEY = 'forum_token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

function handleUnauthorized(): void {
  clearToken();
  if (window.location.pathname !== '/login') {
    window.location.href = '/login';
  }
}

/** 全局 axios 实例:自动携带 Bearer Token,401 时跳转登录页 */
export const axiosForBackend: AxiosInstance = axios.create({
  // 开发环境由 Vite dev server 代理 /api 到后端;生产环境同源
  baseURL: '',
  timeout: 15000,
});

axiosForBackend.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosForBackend.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      handleUnauthorized();
    }
    return Promise.reject(error);
  },
);

export async function request<T>(config: AxiosRequestConfig): Promise<T> {
  const response = await axiosForBackend.request<T>(config);
  return response.data;
}

export default request;
