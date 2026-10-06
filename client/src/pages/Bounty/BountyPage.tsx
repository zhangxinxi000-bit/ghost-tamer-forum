import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { logger } from '@/lib/logger';
import { Coins, MapPin, Ghost } from 'lucide-react';
import { bountiesApi } from '@client/src/api';
import type {
  Bounty,
  BountyStatus,
  DangerLevel,
} from '@shared/api.interface';
import DangerBadge from '@client/src/components/ui/DangerBadge';
import GoldButton from '@client/src/components/ui/GoldButton';
import ForumCard from '@client/src/components/ui/ForumCard';
import ForumPagination from '@client/src/components/ui/ForumPagination';
import { useAuth } from '@client/src/context/AuthContext';

const DANGER_LEVELS: (DangerLevel | 'all')[] = ['all', 'S', 'A', 'B', 'C'];
const STATUS_OPTIONS: { value: BountyStatus | 'all'; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'in_progress', label: '进行中' },
  { value: 'resolved', label: '已解决' },
  { value: 'failed', label: '失败' },
  { value: 'closed', label: '关闭' },
];
const SORT_OPTIONS: { value: 'latest' | 'reward'; label: string }[] = [
  { value: 'latest', label: '最新' },
  { value: 'reward', label: '赏金最高' },
];

const statusLabelMap: Record<BountyStatus, { label: string; className: string }> = {
  open: { label: '待接取', className: 'text-[#ca8a04]' },
  in_progress: { label: '进行中', className: 'text-[#16a34a]' },
  resolved: { label: '已解决', className: 'text-[#737373]' },
  failed: { label: '失败', className: 'text-[#dc2626]' },
  closed: { label: '关闭', className: 'text-[#737373]' },
};

const BountyPage: React.FC = () => {
  const [bounties, setBounties] = useState<Bounty[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);
  const [pageSize] = useState<number>(10);
  const [dangerLevel, setDangerLevel] = useState<DangerLevel | 'all'>('all');
  const [status, setStatus] = useState<BountyStatus | 'all'>('all');
  const [sort, setSort] = useState<'latest' | 'reward'>('latest');

  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchBounties = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string | number> = {
        page,
        pageSize,
        sort,
      };
      if (dangerLevel !== 'all') params.dangerLevel = dangerLevel;
      if (status !== 'all') params.status = status;

      const data = await bountiesApi.getBounties(params);
      setBounties(data.items);
      setTotal(data.total);
    } catch (err: unknown) {
      logger.error('获取悬赏列表失败', err);
      setError('加载失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, dangerLevel, status, sort]);

  useEffect(() => {
    void fetchBounties();
  }, [fetchBounties]);

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
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#e5e5e5] tracking-tight">
            悬赏榜
          </h1>
          <p className="mt-1 text-sm text-[#737373]">
            接受任务，猎杀厉鬼，换取报酬
          </p>
        </div>
        {user && (
          <GoldButton
            size="sm"
            onClick={() => navigate('/new-post')}
          >
            发布悬赏
          </GoldButton>
        )}
      </div>

      {/* Filters */}
      <ForumCard padding="sm" className="space-y-3">
        {/* Danger level filter */}
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

        {/* Status + sort */}
        <div className="flex items-center gap-6 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#737373] w-16">状态</span>
            <select
              value={status}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                setStatus(e.target.value as BountyStatus | 'all');
                setPage(1);
              }}
              className="bg-[#0a0a0a] border border-[#262626] text-sm text-[#e5e5e5] px-2 py-1 rounded-sm focus:outline-none focus:border-[#d4af37]"
            >
              {STATUS_OPTIONS.map(
                (opt: { value: BountyStatus | 'all'; label: string }) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ),
              )}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[#737373] w-16">排序</span>
            <div className="flex gap-1">
              {SORT_OPTIONS.map(
                (s: { value: 'latest' | 'reward'; label: string }) => (
                  <button
                    key={s.value}
                    onClick={() => {
                      setSort(s.value);
                      setPage(1);
                    }}
                    className={`px-3 py-1 text-xs rounded-sm border transition-colors ${
                      sort === s.value
                        ? 'border-[#d4af37] text-[#d4af37]'
                        : 'border-[#262626] text-[#a3a3a3] hover:border-[#d4af37] hover:text-[#d4af37]'
                    }`}
                  >
                    {s.label}
                  </button>
                ),
              )}
            </div>
          </div>
        </div>
      </ForumCard>

      {/* List */}
      {loading ? (
        <div className="py-12 text-center text-[#737373] text-sm">
          加载中...
        </div>
      ) : error ? (
        <div className="py-12 text-center text-[#dc2626] text-sm">{error}</div>
      ) : bounties.length === 0 ? (
        <div className="py-12 text-center text-[#737373] text-sm">
          暂无悬赏任务
        </div>
      ) : (
        <div className="space-y-3">
          {bounties.map((bounty: Bounty) => {
            const statusInfo = statusLabelMap[bounty.status];
            return (
              <Link
                key={bounty.id}
                to={`/bounties/${bounty.id}`}
                className="block"
              >
                <ForumCard className="hover:border-[#d4af37] transition-colors cursor-pointer">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <DangerBadge level={bounty.dangerLevel} />
                    <span
                      className={`text-xs font-medium ${statusInfo.className}`}
                    >
                      {statusInfo.label}
                    </span>
                  </div>

                  <h3 className="text-base font-semibold text-[#e5e5e5] hover:text-[#d4af37] transition-colors mb-2">
                    {bounty.title}
                  </h3>

                  <p className="text-sm text-[#a3a3a3] mb-3 line-clamp-2">
                    {truncate(bounty.description, 100)}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-[#737373] flex-wrap">
                    {bounty.location && (
                      <span className="flex items-center gap-1">
                        <MapPin size={12} />
                        {bounty.location}
                      </span>
                    )}
                    {bounty.ghostName && (
                      <span className="flex items-center gap-1">
                        <Ghost size={12} />
                        {bounty.ghostName}
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-[#d4af37] font-medium">
                      <Coins size={12} />
                      {bounty.reward.toLocaleString()} 黄金
                    </span>
                    <span>发布者：{bounty.author.displayName}</span>
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

export default BountyPage;
