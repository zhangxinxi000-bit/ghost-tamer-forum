import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { logger } from '@/lib/logger';
import { Clock, User } from 'lucide-react';
import { tradesApi } from '@client/src/api';
import type {
  Trade,
  TradeType,
  TradeStatus,
} from '@shared/api.interface';
import GoldButton from '@client/src/components/ui/GoldButton';
import ForumCard from '@client/src/components/ui/ForumCard';
import ForumPagination from '@client/src/components/ui/ForumPagination';
import { useAuth } from '@client/src/context/AuthContext';

const TYPE_OPTIONS: { value: TradeType | 'all'; label: string; className: string }[] = [
  { value: 'all', label: '全部', className: '' },
  { value: 'sell', label: '出售', className: 'text-[#2563eb]' },
  { value: 'buy', label: '求购', className: 'text-[#16a34a]' },
  { value: 'exchange', label: '交换', className: 'text-[#9333ea]' },
];

const STATUS_OPTIONS: { value: TradeStatus | 'all'; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'open', label: '进行中' },
  { value: 'completed', label: '已完成' },
  { value: 'closed', label: '已关闭' },
];

const typeLabelMap: Record<TradeType, { label: string; className: string }> = {
  sell: { label: '出售', className: 'text-[#2563eb]' },
  buy: { label: '求购', className: 'text-[#16a34a]' },
  exchange: { label: '交换', className: 'text-[#9333ea]' },
};

const statusLabelMap: Record<TradeStatus, string> = {
  open: '进行中',
  completed: '已完成',
  closed: '已关闭',
};

const TradePage: React.FC = () => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);
  const [pageSize] = useState<number>(10);
  const [tradeType, setTradeType] = useState<TradeType | 'all'>('all');
  const [itemType, setItemType] = useState<string>('');
  const [status, setStatus] = useState<TradeStatus | 'all'>('all');

  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchTrades = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string | number> = {
        page,
        pageSize,
      };
      if (tradeType !== 'all') params.tradeType = tradeType;
      if (itemType) params.itemType = itemType;
      if (status !== 'all') params.status = status;

      const data = await tradesApi.getTrades(params);
      setTrades(data.items);
      setTotal(data.total);
    } catch (err: unknown) {
      logger.error('获取交易列表失败', err);
      setError('加载失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, tradeType, itemType, status]);

  useEffect(() => {
    void fetchTrades();
  }, [fetchTrades]);

  const handlePageChange = (newPage: number): void => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#e5e5e5] tracking-tight">
            交易区
          </h1>
          <p className="mt-1 text-sm text-[#737373]">
            灵异物品、情报、黄金交易
          </p>
        </div>
        {user && (
          <GoldButton size="sm" onClick={() => navigate('/new-post')}>
            发布交易
          </GoldButton>
        )}
      </div>

      {/* Filters */}
      <ForumCard padding="sm" className="space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-[#737373] w-16">类型</span>
          <div className="flex gap-1">
            {TYPE_OPTIONS.map(
              (opt: { value: TradeType | 'all'; label: string; className: string }) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    setTradeType(opt.value);
                    setPage(1);
                  }}
                  className={`px-3 py-1 text-xs rounded-sm border transition-colors ${
                    tradeType === opt.value
                      ? 'bg-[#d4af37] border-[#d4af37] text-[#0a0a0a] font-medium'
                      : 'bg-transparent border-[#262626] text-[#a3a3a3] hover:border-[#d4af37] hover:text-[#d4af37]'
                  }`}
                >
                  {opt.label}
                </button>
              ),
            )}
          </div>
        </div>

        <div className="flex items-center gap-6 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#737373] w-16">分类</span>
            <select
              value={itemType}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                setItemType(e.target.value);
                setPage(1);
              }}
              className="bg-[#0a0a0a] border border-[#262626] text-sm text-[#e5e5e5] px-2 py-1 rounded-sm focus:outline-none focus:border-[#d4af37]"
            >
              <option value="">全部物品类型</option>
              <option value="灵异物品">灵异物品</option>
              <option value="灵异情报">灵异情报</option>
              <option value="法器">法器</option>
              <option value="材料">材料</option>
              <option value="其他">其他</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[#737373] w-16">状态</span>
            <select
              value={status}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                setStatus(e.target.value as TradeStatus | 'all');
                setPage(1);
              }}
              className="bg-[#0a0a0a] border border-[#262626] text-sm text-[#e5e5e5] px-2 py-1 rounded-sm focus:outline-none focus:border-[#d4af37]"
            >
              {STATUS_OPTIONS.map(
                (opt: { value: TradeStatus | 'all'; label: string }) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ),
              )}
            </select>
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
      ) : trades.length === 0 ? (
        <div className="py-12 text-center text-[#737373] text-sm">
          暂无交易信息
        </div>
      ) : (
        <div className="space-y-3">
          {trades.map((trade: Trade) => {
            const typeInfo = typeLabelMap[trade.tradeType];
            return (
              <Link
                key={trade.id}
                to={`/trades/${trade.id}`}
                className="block"
              >
                <ForumCard className="hover:border-[#d4af37] transition-colors cursor-pointer">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <span className={`text-xs font-semibold ${typeInfo.className}`}>
                      【{typeInfo.label}】
                    </span>
                    <span className="text-xs text-[#737373]">
                      {statusLabelMap[trade.status]}
                    </span>
                  </div>

                  <h3 className="text-base font-semibold text-[#e5e5e5] hover:text-[#d4af37] transition-colors mb-2">
                    {trade.title}
                  </h3>

                  <div className="flex items-center gap-4 text-xs text-[#737373] mb-3 flex-wrap">
                    <span>物品类型：{trade.itemType}</span>
                    <span className="text-[#d4af37] font-medium">
                      价格：{trade.price || '面议'}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-[#737373] flex-wrap">
                    <span className="flex items-center gap-1">
                      <User size={12} />
                      {trade.author.displayName}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {new Date(trade.createdAt).toLocaleDateString('zh-CN')}
                    </span>
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

export default TradePage;
