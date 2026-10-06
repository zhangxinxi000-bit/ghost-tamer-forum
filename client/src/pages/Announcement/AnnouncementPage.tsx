import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { logger } from '@/lib/logger';
import { Pin, Clock } from 'lucide-react';
import { announcementsApi } from '@client/src/api';
import type { Announcement } from '@shared/api.interface';
import ForumCard from '@client/src/components/ui/ForumCard';
import ForumPagination from '@client/src/components/ui/ForumPagination';

const AnnouncementPage: React.FC = () => {
  const [list, setList] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);
  const [pageSize] = useState<number>(10);

  const fetchList = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const data = await announcementsApi.getAnnouncements({ page, pageSize });
      setList(data.items);
      setTotal(data.total);
    } catch (err: unknown) {
      logger.error('获取公告列表失败', err);
      setError('加载失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize]);

  useEffect(() => {
    void fetchList();
  }, [fetchList]);

  const handlePageChange = (newPage: number): void => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-[#e5e5e5] tracking-tight">
          论坛公告
        </h1>
        <p className="mt-1 text-sm text-[#737373]">
          论坛官方公告与重要通知
        </p>
      </div>

      {/* List */}
      {loading ? (
        <div className="py-12 text-center text-[#737373] text-sm">
          加载中...
        </div>
      ) : error ? (
        <div className="py-12 text-center text-[#dc2626] text-sm">{error}</div>
      ) : list.length === 0 ? (
        <div className="py-12 text-center text-[#737373] text-sm">
          暂无公告
        </div>
      ) : (
        <ForumCard padding="none">
          <ul className="divide-y divide-[#1f1f1f]">
            {list.map((item: Announcement) => (
              <li key={item.id}>
                <Link
                  to={`/announcements/${item.id}`}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-[#1a1a1a] transition-colors"
                >
                  {item.isPinned && (
                    <span className="flex items-center gap-1 text-xs text-[#d4af37] font-medium flex-shrink-0">
                      <Pin size={12} />
                      置顶
                    </span>
                  )}
                  <span className="flex-1 text-sm text-[#e5e5e5] hover:text-[#d4af37] transition-colors truncate">
                    {item.title}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-[#737373] flex-shrink-0">
                    <Clock size={12} />
                    {new Date(item.createdAt).toLocaleDateString('zh-CN')}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </ForumCard>
      )}

      {/* Pagination */}
      {!loading && !error && total > 0 && (
        <ForumPagination
          page={page}
          pageSize={pageSize}
          total={total}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
};

export default AnnouncementPage;
