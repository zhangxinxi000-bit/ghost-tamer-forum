import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { logger } from '@/lib/logger';
import { Coins, MapPin, Ghost, Eye, ArrowLeft, Clock } from 'lucide-react';
import { bountiesApi } from '@client/src/api';
import type { Bounty, BountyStatus } from '@shared/api.interface';
import DangerBadge from '@client/src/components/ui/DangerBadge';
import GoldButton from '@client/src/components/ui/GoldButton';
import ForumCard from '@client/src/components/ui/ForumCard';
import { useAuth } from '@client/src/context/AuthContext';
import { toast } from 'sonner';

const statusLabelMap: Record<BountyStatus, { label: string; className: string }> = {
  open: { label: '待接取', className: 'text-[#ca8a04]' },
  in_progress: { label: '进行中', className: 'text-[#16a34a]' },
  resolved: { label: '已解决', className: 'text-[#737373]' },
  failed: { label: '失败', className: 'text-[#dc2626]' },
  closed: { label: '关闭', className: 'text-[#737373]' },
};

const BountyDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [bounty, setBounty] = useState<Bounty | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [accepting, setAccepting] = useState<boolean>(false);

  const { user } = useAuth();

  useEffect(() => {
    if (!id) return;

    const fetchBounty = async (): Promise<void> => {
      setLoading(true);
      setError(null);
      try {
        const data: Bounty = await bountiesApi.getBounty(id);
        setBounty(data);
      } catch (err: unknown) {
        logger.error(`获取悬赏详情失败: ${id}`, err);
        setError('加载失败，请稍后重试');
      } finally {
        setLoading(false);
      }
    };

    void fetchBounty();
  }, [id]);

  const handleAccept = (): void => {
    if (!user) {
      navigate('/login');
      return;
    }
    setAccepting(true);
    setTimeout(() => {
      setAccepting(false);
      toast.info('功能开发中，敬请期待');
    }, 500);
  };

  if (loading) {
    return (
      <div className="py-12 text-center text-[#737373] text-sm">加载中...</div>
    );
  }

  if (error || !bounty) {
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
          {error || '悬赏不存在'}
        </div>
      </div>
    );
  }

  const statusInfo = statusLabelMap[bounty.status];

  return (
    <div className="space-y-6">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1 text-sm text-[#a3a3a3] hover:text-[#d4af37] transition-colors"
      >
        <ArrowLeft size={14} />
        返回悬赏榜
      </button>

      {/* Header */}
      <ForumCard className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <DangerBadge level={bounty.dangerLevel} />
            <span className={`text-sm font-medium ${statusInfo.className}`}>
              {statusInfo.label}
            </span>
          </div>
        </div>

        <h1 className="text-xl font-bold text-[#e5e5e5]">{bounty.title}</h1>

        <div className="flex items-center gap-4 text-xs text-[#737373] flex-wrap">
          <Link
            to={`/profile/${bounty.author.displayName}`}
            className="hover:text-[#d4af37] transition-colors"
          >
            发布者：{bounty.author.displayName}
          </Link>
          <span className="flex items-center gap-1">
            <Clock size={12} />
            {new Date(bounty.createdAt).toLocaleString('zh-CN')}
          </span>
          <span className="flex items-center gap-1">
            <Eye size={12} />
            浏览 0
          </span>
        </div>
      </ForumCard>

      {/* Detail */}
      <ForumCard className="space-y-4">
        <div className="flex items-baseline gap-2 pb-3 border-b border-[#262626]">
          <span className="text-sm text-[#737373] w-20">赏金</span>
          <span className="text-2xl font-bold text-[#d4af37] flex items-center gap-2">
            <Coins size={20} />
            {bounty.reward.toLocaleString()} 黄金
          </span>
        </div>

        {bounty.location && (
          <div className="flex items-start gap-2">
            <span className="text-sm text-[#737373] w-20 flex items-center gap-1">
              <MapPin size={14} />
              地点
            </span>
            <span className="text-sm text-[#e5e5e5]">{bounty.location}</span>
          </div>
        )}

        {bounty.ghostName && (
          <div className="flex items-start gap-2">
            <span className="text-sm text-[#737373] w-20 flex items-center gap-1">
              <Ghost size={14} />
              鬼名称
            </span>
            <span className="text-sm text-[#e5e5e5]">{bounty.ghostName}</span>
          </div>
        )}

        {bounty.ghostRules && (
          <div className="flex items-start gap-2">
            <span className="text-sm text-[#737373] w-20">鬼的规律</span>
            <span className="text-sm text-[#e5e5e5] flex-1 whitespace-pre-wrap">
              {bounty.ghostRules}
            </span>
          </div>
        )}

        <div className="flex items-start gap-2 pt-3 border-t border-[#262626]">
          <span className="text-sm text-[#737373] w-20">详细描述</span>
          <div className="text-sm text-[#e5e5e5] flex-1 whitespace-pre-wrap leading-relaxed">
            {bounty.description}
          </div>
        </div>
      </ForumCard>

      {/* Action */}
      <div className="flex justify-end">
        {user ? (
          <GoldButton size="lg" onClick={handleAccept} disabled={accepting}>
            {accepting ? '接取中...' : '接取任务'}
          </GoldButton>
        ) : (
          <GoldButton size="lg" onClick={() => navigate('/login')}>
            登录后接取
          </GoldButton>
        )}
      </div>
    </div>
  );
};

export default BountyDetailPage;
