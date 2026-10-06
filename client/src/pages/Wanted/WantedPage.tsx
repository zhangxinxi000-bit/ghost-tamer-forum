import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { logger } from '@/lib/logger';
import { Coins, MapPin } from 'lucide-react';
import { wantedApi } from '@client/src/api';
import type {
  WantedPerson,
  WantedStatus,
  DangerLevel,
} from '@shared/api.interface';
import DangerBadge from '@client/src/components/ui/DangerBadge';
import ForumCard from '@client/src/components/ui/ForumCard';
import ForumPagination from '@client/src/components/ui/ForumPagination';

const DANGER_LEVELS: (DangerLevel | 'all')[] = ['all', 'S', 'A', 'B', 'C'];
const STATUS_OPTIONS: { value: WantedStatus | 'all'; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'active', label: '通缉中' },
  { value: 'captured', label: '已抓获' },
  { value: 'deceased', label: '已死亡' },
  { value: 'closed', label: '已关闭' },
];

const statusLabelMap: Record<WantedStatus, { label: string; className: string }> = {
  active: { label: '通缉中', className: 'text-[#dc2626] font-medium' },
  captured: { label: '已抓获', className: 'text-[#16a34a]' },
  deceased: { label: '已死亡', className: 'text-[#737373]' },
  closed: { label: '已关闭', className: 'text-[#737373]' },
};

const WantedPage: React.FC = () => {
  const [list, setList] = useState<WantedPerson[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);
  const [pageSize] = useState<number>(10);
  const [dangerLevel, setDangerLevel] = useState<DangerLevel | 'all'>('all');
  const [status, setStatus] = useState<WantedStatus | 'all'>('all');


  const fetchList = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string | number> = {
        page,
        pageSize,
      };
      if (dangerLevel !== 'all') params.dangerLevel = dangerLevel;
      if (status !== 'all') params.status = status;

      const data = await wantedApi.getWantedList(params);
      setList(data.items);
      setTotal(data.total);
    } catch (err: unknown) {
      logger.error('获取通缉令列表失败', err);
      setError('加载失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, dangerLevel, status]);

  useEffect(() => {
    void fetchList();
  }, [fetchList]);

  const handlePageChange = (newPage: number): void => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const truncate = (text: string, max: number): string => {
    if (text.length <= max) return text;
    return text.slice(0, max) + '...';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-[#e5e5e5] tracking-tight">
          通缉令
        </h1>
        <p className="mt-1 text-sm text-[#737373]">
          危险失控驭鬼者通缉，提供线索有奖
        </p>
      </div>

      {/* Filters */}
      <ForumCard padding="sm" className="space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-[#737373] w-16">危险等级</span>
          <div className="flex gap-1">
            {DANGER_LEVELS.map((level: DangerLevel | 'all') => (
              <button
                key={level}
                onClick={() => {
                  setDangerLevel(level);
                  setPage(1);
                }}
                className={`px-3 py-1 text-xs rounded-sm border transition-colors ${
                  dangerLevel === level
                    ? 'bg-[#d4af37] border-[#d4af37] text-[#0a0a0a] font-medium'
                    : 'bg-transparent border-[#262626] text-[#a3a3a3] hover:border-[#d4af37] hover:text-[#d4af37]'
                }`}
              >
                {level === 'all' ? '全部' : level}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-[#737373] w-16">状态</span>
          <select
            value={status}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
              setStatus(e.target.value as WantedStatus | 'all');
              setPage(1);
            }}
            className="bg-[#0a0a0a] border border-[#262626] text-sm text-[#e5e5e5] px-2 py-1 rounded-sm focus:outline-none focus:border-[#d4af37]"
          >
            {STATUS_OPTIONS.map(
              (opt: { value: WantedStatus | 'all'; label: string }) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ),
            )}
          </select>
        </div>
      </ForumCard>

      {/* List */}
      {loading ? (
        <div className="py-12 text-center text-[#737373] text-sm">
          加载中...
        </div>
      ) : error ? (
        <div className="py-12 text-center text-[#dc2626] text-sm">{error}</div>
      ) : list.length === 0 ? (
        <div className="py-12 text-center text-[#737373] text-sm">
          暂无通缉令
        </div>
      ) : (
        <div className="space-y-3">
          {list.map((item: WantedPerson) => {
            const statusInfo = statusLabelMap[item.status];
            return (
              <Link
                key={item.id}
                to={`/wanted/${item.id}`}
                className="block"
              >
                <ForumCard className="hover:border-[#d4af37] transition-colors cursor-pointer">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <DangerBadge level={item.dangerLevel} />
                    <span className={`text-xs ${statusInfo.className}`}>
                      {statusInfo.label}
                    </span>
                  </div>

                  <h3 className="text-base font-semibold text-[#e5e5e5] hover:text-[#d4af37] transition-colors mb-1">
                    {item.title}
                  </h3>

                  <p className="text-sm text-[#a3a3a3] mb-1">
                    目标姓名：{item.targetName}
                  </p>

                  <p className="text-sm text-[#737373] mb-3 line-clamp-2">
                    {truncate(item.description, 100)}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-[#737373] flex-wrap">
                    <span className="flex items-center gap-1 text-[#d4af37] font-medium">
                      <Coins size={12} />
                      {item.bountyAmount.toLocaleString()} 黄金
                    </span>
                    {item.lastSeen && (
                      <span className="flex items-center gap-1">
                        <MapPin size={12} />
                        {item.lastSeen}
                      </span>
                    )}
                  </div>
                </ForumCard>
              </Link>
            );
          })}
        </div>
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

export default WantedPage;
