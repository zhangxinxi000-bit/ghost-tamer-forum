import React, { useState, useEffect, useCallback } from 'react';
import { Link, useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { logger } from '@/lib/logger';
import { boardsApi } from '@client/src/api';
import { postsApi } from '@client/src/api';
import type { Board, PostSummary, PostListResponse } from '@shared/api.interface';
import ForumCard from '@client/src/components/ui/ForumCard';
import GoldButton from '@client/src/components/ui/GoldButton';
import ForumPagination from '@client/src/components/ui/ForumPagination';
import { useAuth } from '@client/src/context/AuthContext';

const BoardPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const page: number = parseInt(searchParams.get('page') || '1', 10);
  const sort: 'latest' | 'hot' = (searchParams.get('sort') as 'latest' | 'hot') || 'latest';
  const keyword: string = searchParams.get('keyword') || '';

  const [board, setBoard] = useState<Board | null>(null);
  const [postData, setPostData] = useState<PostListResponse | null>(null);
  const [loadingBoard, setLoadingBoard] = useState<boolean>(true);
  const [loadingPosts, setLoadingPosts] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState<string>(keyword);

  const PAGE_SIZE: number = 20;

  // 加载板块信息
  useEffect(() => {
    if (!slug) return;
    let mounted: boolean = true;

    const loadBoard = async (): Promise<void> => {
      try {
        setLoadingBoard(true);
        const data: Board = await boardsApi.getBoard(slug);
        if (mounted) setBoard(data);
      } catch (err) {
        logger.error(`加载板块失败: ${slug}`, err);
        if (mounted) setError('板块不存在');
      } finally {
        if (mounted) setLoadingBoard(false);
      }
    };

    loadBoard();
    return () => {
      mounted = false;
    };
  }, [slug]);

  // 加载帖子列表
  useEffect(() => {
    if (!board) return;
    let mounted: boolean = true;

    const loadPosts = async (): Promise<void> => {
      try {
        setLoadingPosts(true);
        const data: PostListResponse = await postsApi.getPosts({
          boardId: board.id,
          page,
          pageSize: PAGE_SIZE,
          sort,
          keyword: keyword || undefined,
        });
        if (mounted) setPostData(data);
      } catch (err) {
        logger.error('加载帖子列表失败', err);
      } finally {
        if (mounted) setLoadingPosts(false);
      }
    };

    loadPosts();
    return () => {
      mounted = false;
    };
  }, [board, page, sort, keyword]);

  const handlePageChange = useCallback(
    (newPage: number): void => {
      const params: URLSearchParams = new URLSearchParams(searchParams);
      params.set('page', String(newPage));
      setSearchParams(params);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [searchParams, setSearchParams],
  );

  const handleSortChange = useCallback(
    (newSort: 'latest' | 'hot'): void => {
      const params: URLSearchParams = new URLSearchParams(searchParams);
      params.set('sort', newSort);
      params.set('page', '1');
      setSearchParams(params);
    },
    [searchParams, setSearchParams],
  );

  const handleSearch = useCallback(
    (e: React.FormEvent): void => {
      e.preventDefault();
      const params: URLSearchParams = new URLSearchParams(searchParams);
      if (searchInput.trim()) {
        params.set('keyword', searchInput.trim());
      } else {
        params.delete('keyword');
      }
      params.set('page', '1');
      setSearchParams(params);
    },
    [searchInput, searchParams, setSearchParams],
  );

  const handleNewPost = useCallback((): void => {
    if (!user) {
      navigate('/login');
      return;
    }
    navigate(`/new-post?board=${slug || ''}`);
  }, [user, navigate, slug]);

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

  if (loadingBoard) {
    return (
      <div className="max-w-[960px] mx-auto px-4 py-8">
        <div className="text-[#737373] text-center py-8">加载中...</div>
      </div>
    );
  }

  if (error || !board) {
    return (
      <div className="max-w-[960px] mx-auto px-4 py-8">
        <div className="text-[#dc2626] text-center py-8">{error || '板块不存在'}</div>
      </div>
    );
  }

  // 排序：置顶帖在前
  const sortedPosts: PostSummary[] = postData
    ? [...postData.items].sort((a: PostSummary, b: PostSummary) => {
        if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
        return 0;
      })
    : [];

  return (
    <div className="max-w-[960px] mx-auto px-4 py-8">
      {/* 板块头部 */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-[#e5e5e5] mb-2">
          {board.name}
        </h1>
        <p className="text-[#a3a3a3] text-sm">{board.description}</p>
      </div>

      {/* 工具栏 */}
      <ForumCard className="mb-4">
        <div className="p-4 flex items-center gap-4 flex-wrap">
          <form onSubmit={handleSearch} className="flex-1 min-w-[200px]">
            <input
              type="text"
              value={searchInput}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setSearchInput(e.target.value)
              }
              placeholder="搜索帖子标题..."
              className="w-full bg-[#141414] border border-[#262626] text-[#e5e5e5] rounded-sm px-3 py-2 focus:border-[#d4af37] outline-none text-sm"
            />
          </form>

          <div className="flex items-center gap-1">
            <button
              onClick={() => handleSortChange('latest')}
              className={`px-3 py-2 text-sm rounded-sm border transition-colors ${
                sort === 'latest'
                  ? 'bg-[#d4af37] border-[#d4af37] text-[#0a0a0a]'
                  : 'bg-[#141414] border-[#262626] text-[#a3a3a3] hover:border-[#d4af37] hover:text-[#d4af37]'
              }`}
            >
              最新
            </button>
            <button
              onClick={() => handleSortChange('hot')}
              className={`px-3 py-2 text-sm rounded-sm border transition-colors ${
                sort === 'hot'
                  ? 'bg-[#d4af37] border-[#d4af37] text-[#0a0a0a]'
                  : 'bg-[#141414] border-[#262626] text-[#a3a3a3] hover:border-[#d4af37] hover:text-[#d4af37]'
              }`}
            >
              热门
            </button>
          </div>

          <GoldButton onClick={handleNewPost}>发帖</GoldButton>
        </div>
      </ForumCard>

      {/* 帖子列表 */}
      <ForumCard>
        {loadingPosts ? (
          <div className="text-[#737373] text-center py-8">加载中...</div>
        ) : sortedPosts.length === 0 ? (
          <div className="text-[#737373] text-center py-8">暂无帖子</div>
        ) : (
          <div>
            {sortedPosts.map((post: PostSummary) => (
              <div
                key={post.id}
                className={`border-b border-[#262626] py-3 px-4 hover:bg-[#1a1a1a] transition-colors cursor-pointer ${
                  post.isPinned ? 'bg-[#1a1608]' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* 标记 */}
                  <div className="flex items-center gap-1 shrink-0 w-16">
                    {post.isPinned && (
                      <span className="text-[#dc2626] text-xs font-medium">
                        置顶
                      </span>
                    )}
                    {post.isEssence && (
                      <span className="text-[#d4af37] text-xs font-medium">
                        精华
                      </span>
                    )}
                  </div>

                  {/* 标题 */}
                  <Link
                    to={`/post/${post.id}`}
                    className="flex-1 min-w-0 text-[#e5e5e5] hover:text-[#d4af37] transition-colors truncate"
                  >
                    {post.title}
                  </Link>

                  {/* 作者 */}
                  <Link
                    to={`/profile/${post.author.displayName}`}
                    className="text-[#a3a3a3] text-sm hover:text-[#d4af37] transition-colors shrink-0 w-24 truncate text-right"
                  >
                    {post.author.displayName}
                  </Link>

                  {/* 回复/浏览 */}
                  <div className="text-[#737373] text-sm shrink-0 w-20 text-right">
                    {post.replyCount}/{post.viewCount}
                  </div>

                  {/* 最后回复时间 */}
                  <div className="text-[#737373] text-xs shrink-0 w-20 text-right">
                    {formatTime(post.lastReplyAt || post.createdAt)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </ForumCard>

      {/* 分页 */}
      {postData && (
        <ForumPagination
          page={page}
          pageSize={PAGE_SIZE}
          total={postData.total}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
};

export default BoardPage;
