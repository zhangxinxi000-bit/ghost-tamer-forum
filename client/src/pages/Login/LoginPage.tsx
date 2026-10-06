import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { logger } from '@/lib/logger';
import GoldButton from '@client/src/components/ui/GoldButton';
import ForumCard from '@client/src/components/ui/ForumCard';
import { useAuth } from '@client/src/context/AuthContext';
import type { LoginRequest } from '@shared/api.interface';

const LoginPage: React.FC = () => {
  const [formData, setFormData] = useState<LoginRequest>({
    username: '',
    password: '',
  });
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(formData);
      navigate('/');
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : '登录失败，请检查用户名和密码';
      setError(message);
      logger.error('登录失败', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center py-12">
      <ForumCard className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-[#e5e5e5] tracking-tight mb-2">
            登录
          </h1>
          <p className="text-[#a3a3a3] text-sm">进入驭鬼者的世界</p>
        </div>

        {error && (
          <div className="mb-4 text-red-500 text-sm text-center">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="username"
              className="block text-[#a3a3a3] text-sm"
            >
              用户名
            </label>
            <input
              id="username"
              name="username"
              type="text"
              value={formData.username}
              onChange={handleChange}
              required
              className="w-full bg-[#141414] border border-[#262626] text-[#e5e5e5] rounded-[2px] px-3 py-2 h-10 focus:border-[#d4af37] outline-none transition-colors"
              placeholder="请输入用户名"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="password"
              className="block text-[#a3a3a3] text-sm"
            >
              密码
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full bg-[#141414] border border-[#262626] text-[#e5e5e5] rounded-[2px] px-3 py-2 h-10 focus:border-[#d4af37] outline-none transition-colors"
              placeholder="请输入密码"
            />
          </div>

          <GoldButton type="submit" className="w-full" disabled={loading}>
            {loading ? '登录中...' : '登录'}
          </GoldButton>
        </form>

        <div className="mt-6 text-center text-sm text-[#a3a3a3]">
          还没有账号？{' '}
          <Link
            to="/register"
            className="text-[#d4af37] hover:underline"
          >
            立即注册
          </Link>
        </div>
      </ForumCard>
    </div>
  );
};

export default LoginPage;
