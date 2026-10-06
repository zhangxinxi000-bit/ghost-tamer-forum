import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { logger } from '@/lib/logger';
import { ArrowLeft, Clock, User } from 'lucide-react';
import { tradesApi } from '@client/src/api';
import type { Trade, TradeType, TradeStatus } from '@shared/api.interface';
import GoldButton from '@client/src/components/ui/GoldButton';
import ForumCard from '@client/src/components/ui/ForumCard';
import { useAuth } from '@client/src/context/AuthContext';
import { toast } from 'sonner';

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

const TradeDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [trade, setTrade] = useState<Trade | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [contacting, setContacting] = useState<boolean>(false);

  const { user } = useAuth();

  useEffect(() => {
    if (!id) return;

    const fetchTrade = async (): Promise<void> => {
      setLoading(true);
      setError(null);
      try {
        const data: Trade = await tradesApi.getTrade(id);
        setTrade(data);
      } catch (err: unknown) {
        logger.error(`获取交易详情失败: ${id}`, err);
        setError('加载失败，请稍后重试');
      } finally {
        setLoading(false);
      }
    };

    void fetchTrade();
  }, [id]);

  const handleContact = (): void => {
    if (!user) {
      navigate('/login');
      return;
    }
    setContacting(true);
    setTimeout(() => {
      setContacting(false);
      toast.info('功能开发中，敬请期待');
    }, 500);
  };

  if (loading) {
    return (
      <div className="py-12 text-center text-[#737373] text-sm">加载中...</div>
    );
  }

  if (error || !trade) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-sm text-[#a3a3a3] hover:text-[#d4af37] transition-colors"
        >
          <ArrowLeft size={14} />
          返回
        </button>
        <div className="py-12 text-center text-[#dc2626] text-sm">
          {error || '交易不存在'}
        </div>
      </div>
    );
  }

  const typeInfo = typeLabelMap[trade.tradeType];

  return (
    <div className="space-y-6">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1 text-sm text-[#a3a3a3] hover:text-[#d4af37] transition-colors"
      >
        <ArrowLeft size={14} />
        返回交易区
      </button>

      {/* Header */}
      <ForumCard className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <span className={`text-sm font-semibold ${typeInfo.className}`}>
            【{typeInfo.label}】
          </span>
          <span className="text-xs text-[#737373]">
            {statusLabelMap[trade.status]}
          </span>
        </div>

        <h1 className="text-xl font-bold text-[#e5e5e5]">{trade.title}</h1>

        <div className="flex items-center gap-4 text-xs text-[#737373] flex-wrap">
          <span className="flex items-center gap-1">
            <User size={12} />
            {trade.author.displayName}
          </span>
          <span className="flex items-center gap-1">
            <Clock size={12} />
            {new Date(trade.createdAt).toLocaleString('zh-CN')}
          </span>
        </div>
      </ForumCard>

      {/* Detail */}
      <ForumCard className="space-y-4">
        <div className="flex items-baseline gap-2 pb-3 border-b border-[#262626]">
          <span className="text-sm text-[#737373] w-20">价格</span>
          <span className="text-lg font-bold text-[#d4af37]">
            {trade.price || '面议'}
          </span>
        </div>

        <div className="flex items-start gap-2">
          <span className="text-sm text-[#737373] w-20">物品类型</span>
          <span className="text-sm text-[#e5e5e5]">{trade.itemType}</span>
        </div>

        <div className="flex items-start gap-2 pt-3 border-t border-[#262626]">
          <span className="text-sm text-[#737373] w-20">详情</span>
          <div className="text-sm text-[#e5e5e5] flex-1 whitespace-pre-wrap leading-relaxed">
            {trade.content}
          </div>
        </div>
      </ForumCard>

      {/* Action */}
      <div className="flex justify-end">
        {user ? (
          <GoldButton size="lg" onClick={handleContact} disabled={contacting}>
            {contacting ? '处理中...' : '联系卖家'}
          </GoldButton>
        ) : (
          <GoldButton size="lg" onClick={() => navigate('/login')}>
            登录后联系
          </GoldButton>
        )}
      </div>
    </div>
  );
};

export default TradeDetailPage;
