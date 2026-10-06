import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { logger } from '@/lib/logger';
import { boardsApi, postsApi } from '@client/src/api';
import type { Board, PostDetail } from '@shared/api.interface';
import ForumCard from '@client/src/components/ui/ForumCard';
import GoldButton from '@client/src/components/ui/GoldButton';
import { useAuth } from '@client/src/context/AuthContext';

const NewPostPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, loading: authLoading } = useAuth();

  const preselectedBoard: string = searchParams.get('board') || '';

  const [boards, setBoards] = useState<Board[]>([]);
  const [selectedBoardId, setSelectedBoardId] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [loadingBoards, setLoadingBoards] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // 未登录跳转
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  // 加载板块列表
  useEffect(() => {
    let mounted: boolean = true;

    const loadBoards = async (): Promise<void> => {
      try {
        const data: Board[] = await boardsApi.getBoards();
        if (mounted) {
          setBoards(data);
          // 如果有预选板块，找到对应 id
          if (preselectedBoard) {
            const found: Board | undefined = data.find(
              (b: Board) => b.slug === preselectedBoard,
            );
            if (found) setSelectedBoardId(found.id);
          }
        }
      } catch (err) {
        logger.error('加载板块列表失败', err);
        if (mounted) setError('加载板块列表失败');
      } finally {
        if (mounted) setLoadingBoards(false);
      }
    };

    loadBoards();
    return () => {
      mounted = false;
    };
  }, [preselectedBoard]);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();

    if (!selectedBoardId) {
      setError('请选择板块');
      return;
    }
    if (!title.trim()) {
      setError('请输入标题');
      return;
    }
    if (!content.trim()) {
      setError('请输入内容');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      const result: PostDetail = await postsApi.createPost({
        boardId: selectedBoardId,
        title: title.trim(),
        content: content.trim(),
      });
      navigate(`/post/${result.id}`);
    } catch (err) {
      logger.error('发布帖子失败', err);
      setError('发布失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="max-w-[960px] mx-auto px-4 py-8">
        <div className="text-[#737373] text-center py-8">加载中...</div>
      </div>
    );
  }

  return (
    <div className="max-w-[720px] mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold text-[#e5e5e5] mb-6">发布新帖</h1>

      {error && (
        <div className="mb-4 p-3 bg-[#2a0a0a] border border-[#dc2626] text-[#dc2626] text-sm rounded-sm">
          {error}
        </div>
      )}

      <ForumCard>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* 板块选择 */}
          <div>
            <label className="block text-sm text-[#a3a3a3] mb-2">
              选择板块
            </label>
            {loadingBoards ? (
              <div className="text-[#737373] text-sm py-2">加载中...</div>
            ) : (
              <select
                value={selectedBoardId}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  setSelectedBoardId(e.target.value)
                }
                className="w-full bg-[#141414] border border-[#262626] text-[#e5e5e5] rounded-sm px-3 py-2 focus:border-[#d4af37] outline-none text-sm appearance-none cursor-pointer"
                style={{
                  backgroundImage:
                    "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23737373' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")",
                  backgroundPosition: 'right 0.5rem center',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '1.5em 1.5em',
                  paddingRight: '2.5rem',
                }}
              >
                <option value="">请选择板块</option>
                {boards.map((board: Board) => (
                  <option key={board.id} value={board.id}>
                    {board.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* 标题 */}
          <div>
            <label className="block text-sm text-[#a3a3a3] mb-2">
              帖子标题
            </label>
            <input
              type="text"
              value={title}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setTitle(e.target.value)
              }
              placeholder="请输入帖子标题"
              maxLength={100}
              className="w-full bg-[#141414] border border-[#262626] text-[#e5e5e5] rounded-sm px-3 py-2 focus:border-[#d4af37] outline-none text-sm"
            />
          </div>

          {/* 内容 */}
          <div>
            <label className="block text-sm text-[#a3a3a3] mb-2">
              帖子内容
            </label>
            <textarea
              value={content}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setContent(e.target.value)
              }
              placeholder="请输入帖子内容..."
              rows={12}
              className="w-full bg-[#141414] border border-[#262626] text-[#e5e5e5] rounded-sm px-3 py-2 focus:border-[#d4af37] outline-none text-sm resize-none leading-relaxed"
            />
          </div>

          {/* 提交按钮 */}
          <div className="flex justify-end pt-2">
            <GoldButton type="submit" disabled={submitting}>
              {submitting ? '发布中...' : '发布帖子'}
            </GoldButton>
          </div>
        </form>
      </ForumCard>
    </div>
  );
};

export default NewPostPage;
