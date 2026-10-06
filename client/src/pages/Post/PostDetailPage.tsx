import React, { useState, useEffect, useCallback } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { logger } from '@/lib/logger';
import { postsApi } from '@client/src/api';
import type {
  PostDetail,
  Reply,
  ReplyListResponse,
} from '@shared/api.interface';
import ForumCard from '@client/src/components/ui/ForumCard';
import GoldButton from '@client/src/components/ui/GoldButton';
import ForumPagination from '@client/src/components/ui/ForumPagination';
import { useAuth } from '@client/src/context/AuthContext';

const PostDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();

  const page: number = parseInt(searchParams.get('page') || '1', 10);
  const authorOnly: boolean = searchParams.get('authorOnly') === '1';

  const [post, setPost] = useState<PostDetail | null>(null);
  const [replyData, setReplyData] = useState<ReplyListResponse | null>(null);
  const [loadingPost, setLoadingPost] = useState<boolean>(true);
  const [loadingReplies, setLoadingReplies] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  const PAGE_SIZE: number = 20;

  // 加载帖子详情
  useEffect(() => {
    if (!id) return;
    let mounted: boolean = true;

    const loadPost = async (): Promise<void> => {
      try {
        setLoadingPost(true);
        const data: PostDetail = await postsApi.getPost(id);
        if (mounted) setPost(data);
      } catch (err) {
        logger.error(`加载帖子详情失败: ${id}`, err);
        if (mounted) setError('帖子不存在或已被删除');
      } finally {
        if (mounted) setLoadingPost(false);
      }
    };

    loadPost();
    return () => {
      mounted = false;
    };
  }, [id]);

  // 加载回帖列表
  useEffect(() => {
    if (!id) return;
    let mounted: boolean = true;

    const loadReplies = async (): Promise<void> => {
      try {
        setLoadingReplies(true);
        const data: ReplyListResponse = await postsApi.getReplies(id, {
          page,
          pageSize: PAGE_SIZE,
          authorOnly,
        });
        if (mounted) setReplyData(data);
      } catch (err) {
        logger.error(`加载回帖失败: ${id}`, err);
      } finally {
        if (mounted) setLoadingReplies(false);
      }
    };

    loadReplies();
    return () => {
      mounted = false;
    };
  }, [id, page, authorOnly]);

  const handlePageChange = useCallback(
    (newPage: number): void => {
      const params: URLSearchParams = new URLSearchParams(searchParams);
      params.set('page', String(newPage));
      setSearchParams(params);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [searchParams, setSearchParams],
  );

  const toggleAuthorOnly = useCallback((): void => {
    const params: URLSearchParams = new URLSearchParams(searchParams);
    if (authorOnly) {
      params.delete('authorOnly');
    } else {
      params.set('authorOnly', '1');
    }
    params.set('page', '1');
    setSearchParams(params);
  }, [authorOnly, searchParams, setSearchParams]);

  const handleSubmitReply = useCallback(async (): Promise<void> => {
    if (!id || !replyContent.trim() || !user) return;

    try {
      setSubmitting(true);
      await postsApi.createReply(id, { content: replyContent.trim() });
      setReplyContent('');
      // 刷新回帖列表
      const data: ReplyListResponse = await postsApi.getReplies(id, {
        page: 1,
        pageSize: PAGE_SIZE,
        authorOnly,
      });
      setReplyData(data);
      // 重置到第一页
      const params: URLSearchParams = new URLSearchParams(searchParams);
      params.set('page', '1');
      setSearchParams(params);
      // 同时更新帖子回复数
      if (post) {
        setPost({ ...post, replyCount: post.replyCount + 1 });
      }
    } catch (err) {
      logger.error('回复失败', err);
    } finally {
      setSubmitting(false);
    }
  }, [id, replyContent, user, authorOnly, searchParams, setSearchParams, post]);

  const formatTime = (dateStr: string): string => {
    const date: Date = new Date(dateStr);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loadingPost) {
    return (
      <div className="max-w-[960px] mx-auto px-4 py-8">
        <div className="text-[#737373] text-center py-8">加载中...</div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="max-w-[960px] mx-auto px-4 py-8">
        <div className="text-[#dc2626] text-center py-8">
          {error || '帖子不存在'}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[960px] mx-auto px-4 py-8">
      {/* 帖子标题 */}
      <div className="mb-4">
        <h1 className="text-2xl font-semibold text-[#e5e5e5] mb-3">
          {post.title}
        </h1>
        <div className="flex items-center gap-4 text-sm text-[#737373]">
          <Link
            to={`/profile/${post.author.username}`}
            className="text-[#a3a3a3] hover:text-[#d4af37] transition-colors"
          >
            {post.author.displayName}
          </Link>
          <span>·</span>
          <span>{formatTime(post.createdAt)}</span>
          <span>·</span>
          <span>{post.viewCount} 浏览</span>
          <span>·</span>
          <span>{post.replyCount} 回复</span>
        </div>
      </div>

      {/* 帖子正文 */}
      <ForumCard className="mb-8">
        <div className="p-6">
          <div
            className="text-[#e5e5e5] whitespace-pre-wrap leading-relaxed"
            style={{ lineHeight: '1.6' }}
          >
            {post.content}
          </div>
        </div>
      </ForumCard>

      {/* 回帖区标题 */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-[#e5e5e5] border-l-2 border-[#d4af37] pl-3">
          全部回复 ({post.replyCount})
        </h2>
        <label className="flex items-center gap-2 cursor-pointer text-sm text-[#a3a3a3]">
          <input
            type="checkbox"
            checked={authorOnly}
            onChange={toggleAuthorOnly}
            className="accent-[#d4af37] w-4 h-4"
          />
          只看楼主
        </label>
      </div>

      {/* 回帖列表 */}
      {loadingReplies ? (
        <div className="text-[#737373] text-center py-8">加载中...</div>
      ) : !replyData || replyData.items.length === 0 ? (
        <ForumCard>
          <div className="text-[#737373] text-center py-8">暂无回复</div>
        </ForumCard>
      ) : (
        <div className="space-y-3">
          {replyData.items.map((reply: Reply) => (
            <ForumCard key={reply.id}>
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-[#d4af37] text-sm font-medium">
                      #{reply.floor}
                    </span>
                    <Link
                      to={`/profile/${reply.author.username}`}
                      className="text-[#e5e5e5] text-sm hover:text-[#d4af37] transition-colors"
                    >
                      {reply.author.displayName}
                    </Link>
                  </div>
                  <span className="text-[#737373] text-xs">
                    {formatTime(reply.createdAt)}
                  </span>
                </div>
                <div
                  className="text-[#e5e5e5] text-sm whitespace-pre-wrap leading-relaxed"
                  style={{ lineHeight: '1.6' }}
                >
                  {reply.content}
                </div>
              </div>
            </ForumCard>
          ))}
        </div>
      )}

      {/* 分页 */}
      {replyData && (
        <ForumPagination
          page={page}
          pageSize={PAGE_SIZE}
          total={replyData.total}
          onPageChange={handlePageChange}
        />
      )}

      {/* 回帖输入区 */}
      <div className="mt-6">
        {user ? (
          <ForumCard>
            <div className="p-4">
              <h3 className="text-sm font-medium text-[#e5e5e5] mb-3">
                发表回复
              </h3>
              <textarea
                value={replyContent}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setReplyContent(e.target.value)
                }
                placeholder="写下你的回复..."
                rows={4}
                className="w-full bg-[#141414] border border-[#262626] text-[#e5e5e5] rounded-sm px-3 py-2 focus:border-[#d4af37] outline-none text-sm resize-none"
              />
              <div className="flex justify-end mt-3">
                <GoldButton
                  onClick={handleSubmitReply}
                  disabled={submitting || !replyContent.trim()}
                >
                  {submitting ? '发送中...' : '回复'}
                </GoldButton>
              </div>
            </div>
          </ForumCard>
        ) : (
          <ForumCard>
            <div className="p-6 text-center">
              <span className="text-[#737373] text-sm">登录后可回复</span>
              <Link
                to="/login"
                className="text-[#d4af37] text-sm hover:underline ml-2"
              >
                去登录
              </Link>
            </div>
          </ForumCard>
        )}
      </div>
    </div>
  );
};

export default PostDetailPage;
