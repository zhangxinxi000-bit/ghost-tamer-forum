import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { logger } from '@/lib/logger';
import GoldButton from '@client/src/components/ui/GoldButton';
import ForumCard from '@client/src/components/ui/ForumCard';
import { useAuth } from '@client/src/context/AuthContext';
import type { RegisterRequest } from '@shared/api.interface';

interface RegisterFormData extends RegisterRequest {
  confirmPassword: string;
}

const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState<RegisterFormData>({
    username: '',
    password: '',
    displayName: '',
    confirmPassword: '',
  });
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }

    setLoading(true);

    try {
      await register({
        username: formData.username,
        password: formData.password,
        displayName: formData.displayName,
      });
      navigate('/');
    } catch (err) {
      const message =
        err instanceof Error ? err.message : '注册失败，请稍后重试';
      setError(message);
      logger.error('注册失败', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center py-12">
      <ForumCard className="w-full max-w-md p-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-semibold text-[#e5e5e5] tracking-tight mb-2">
            注册
          </h1>
          <p className="text-[#a3a3a3] text-sm">成为驭鬼者论坛一员</p>
        </div>

        <p className="text-[#737373] text-xs text-center mb-6 italic leading-relaxed">
          记住：鬼无法被杀死。只有鬼能对付鬼。洞察鬼的规律，是活下去的唯一方式。
        </p>

        {error && (
          <div className="mb-4 text-red-500 text-sm text-center">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="username"
              className="block text-[#a3a3a3] text-sm"
            >
              用户名（驭鬼者代号）
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
              htmlFor="displayName"
              className="block text-[#a3a3a3] text-sm"
            >
              昵称（展示名）
            </label>
            <input
              id="displayName"
              name="displayName"
              type="text"
              value={formData.displayName}
              onChange={handleChange}
              required
              className="w-full bg-[#141414] border border-[#262626] text-[#e5e5e5] rounded-[2px] px-3 py-2 h-10 focus:border-[#d4af37] outline-none transition-colors"
              placeholder="请输入昵称"
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

          <div className="space-y-2">
            <label
              htmlFor="confirmPassword"
              className="block text-[#a3a3a3] text-sm"
            >
              确认密码
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="w-full bg-[#141414] border border-[#262626] text-[#e5e5e5] rounded-[2px] px-3 py-2 h-10 focus:border-[#d4af37] outline-none transition-colors"
              placeholder="请再次输入密码"
            />
          </div>

          <GoldButton type="submit" className="w-full" disabled={loading}>
            {loading ? '注册中...' : '注册'}
          </GoldButton>
        </form>

        <div className="mt-6 text-center text-sm text-[#a3a3a3]">
          已有账号？{' '}
          <Link to="/login" className="text-[#d4af37] hover:underline">
            立即登录
          </Link>
        </div>
      </ForumCard>
    </div>
  );
};

export default RegisterPage;
