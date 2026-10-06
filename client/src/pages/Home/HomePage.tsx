import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { logger } from '@/lib/logger';
import { boardsApi } from '@client/src/api';
import { postsApi } from '@client/src/api';
import type { Board, PostSummary } from '@shared/api.interface';
import ForumCard from '@client/src/components/ui/ForumCard';

const HomePage: React.FC = () => {
  const [boards, setBoards] = useState<Board[]>([]);
  const [latestPosts, setLatestPosts] = useState<PostSummary[]>([]);
  const [loadingBoards, setLoadingBoards] = useState<boolean>(true);
  const [loadingPosts, setLoadingPosts] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted: boolean = true;

    const loadBoards = async (): Promise<void> => {
      try {
        const data: Board[] = await boardsApi.getBoards();
        if (mounted) setBoards(data);
      } catch (err) {
        logger.error('首页加载板块失败', err);
        if (mounted) setError('加载失败');
      } finally {
        if (mounted) setLoadingBoards(false);
      }
    };

    const loadLatestPosts = async (): Promise<void> => {
      try {
        const data = await postsApi.getPosts({
          page: 1,
          pageSize: 5,
          sort: 'latest',
        });
        if (mounted) setLatestPosts(data.items);
      } catch (err) {
        logger.error('首页加载最新帖子失败', err);
      } finally {
        if (mounted) setLoadingPosts(false);
      }
    };

    loadBoards();
    loadLatestPosts();

    return () => {
      mounted = false;
    };
  }, []);

  const formatTime = (dateStr: string | null): string => {
    if (!dateStr) return '-';
    const date: Date = new Date(dateStr);
    const now: Date = new Date();
    const diffMs: number = now.getTime() - date.getTime();
    const diffMins: number = Math.floor(diffMs / 60000);
    const diffHours: number = Math.floor(diffMs / 3600000);
    const diffDays: number = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return '刚刚';
    if (diffMins < 60) return `${diffMins}分钟前`;
    if (diffHours < 24) return `${diffHours}小时前`;
    if (diffDays < 7) return `${diffDays}天前`;
    return date.toLocaleDateString('zh-CN');
  };

  const boardNamesById = new Map<string, string>();
  boards.forEach((b: Board) => boardNamesById.set(b.id, b.name));

  return (
    <div className="max-w-[960px] mx-auto px-4 py-8">
      {/* 顶部欢迎语 */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-semibold text-[#e5e5e5] tracking-tight mb-2">
          灵异论坛
        </h1>
        <p className="text-[#d4af37] text-sm tracking-widest">驭鬼者情报站</p>
      </div>

      {/* 三大铁律 */}
      <ForumCard className="mb-8">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-[#d4af37] mb-4">
            三大铁律
          </h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-[#d4af37] font-bold text-sm">壹</span>
              <p className="text-[#e5e5e5]">鬼无法被杀死</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-[#d4af37] font-bold text-sm">贰</span>
              <p className="text-[#e5e5e5]">只有鬼能对付鬼</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-[#d4af37] font-bold text-sm">叁</span>
              <p className="text-[#e5e5e5]">洞察鬼的规律</p>
            </div>
          </div>
        </div>
      </ForumCard>

      {/* 板块入口区 */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-[#e5e5e5] mb-4 border-l-2 border-[#d4af37] pl-3">
          板块入口
        </h2>
        {loadingBoards ? (
          <div className="text-[#737373] text-center py-8">加载中...</div>
        ) : error ? (
          <div className="text-[#dc2626] text-center py-8">{error}</div>
        ) : boards.length === 0 ? (
          <div className="text-[#737373] text-center py-8">暂无板块</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {boards.map((board: Board) => (
              <Link key={board.id} to={`/board/${board.slug}`}>
                <ForumCard className="h-full hover:border-[#d4af37] transition-colors cursor-pointer">
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-[#e5e5e5] font-medium hover:text-[#d4af37] transition-colors">
                        {board.name}
                      </h3>
                      <span className="text-[#737373] text-sm">
                        {board.postCount} 帖
                      </span>
                    </div>
                    <p className="text-[#a3a3a3] text-sm line-clamp-2">
                      {board.description}
                    </p>
                  </div>
                </ForumCard>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* 最新帖子 */}
      <section>
        <h2 className="text-lg font-semibold text-[#e5e5e5] mb-4 border-l-2 border-[#d4af37] pl-3">
          最新帖子
        </h2>
        <ForumCard>
          {loadingPosts ? (
            <div className="text-[#737373] text-center py-8">加载中...</div>
          ) : latestPosts.length === 0 ? (
            <div className="text-[#737373] text-center py-8">暂无帖子</div>
          ) : (
            <div className="divide-y divide-[#262626]">
              {latestPosts.map((post: PostSummary) => (
                <div
                  key={post.id}
                  className="py-3 px-4 hover:bg-[#1a1a1a] transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/post/${post.id}`}
                        className="text-[#e5e5e5] hover:text-[#d4af37] transition-colors truncate block"
                      >
                        {post.title}
                      </Link>
                      <div className="flex items-center gap-3 mt-1 text-xs text-[#737373]">
                        <span>{boardNamesById.get(post.boardId) || '-'}</span>
                        <span>·</span>
                        <span>{post.author.displayName}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-[#737373] ml-4 shrink-0">
                      <span>{post.replyCount} 回复</span>
                      <span>{formatTime(post.lastReplyAt || post.createdAt)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ForumCard>
      </section>
    </div>
  );
};

export default HomePage;
