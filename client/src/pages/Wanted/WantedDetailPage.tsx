import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { logger } from '@/lib/logger';
import { Coins, MapPin, ArrowLeft, Clock, Ghost } from 'lucide-react';
import { wantedApi } from '@client/src/api';
import type { WantedPerson, WantedStatus } from '@shared/api.interface';
import DangerBadge from '@client/src/components/ui/DangerBadge';
import ForumCard from '@client/src/components/ui/ForumCard';

const statusLabelMap: Record<WantedStatus, { label: string; className: string }> = {
  active: { label: '通缉中', className: 'text-[#dc2626] font-medium' },
  captured: { label: '已抓获', className: 'text-[#16a34a]' },
  deceased: { label: '已死亡', className: 'text-[#737373]' },
  closed: { label: '已关闭', className: 'text-[#737373]' },
};

const WantedDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [wanted, setWanted] = useState<WantedPerson | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchWanted = async (): Promise<void> => {
      setLoading(true);
      setError(null);
      try {
        const data: WantedPerson = await wantedApi.getWanted(id);
        setWanted(data);
      } catch (err: unknown) {
        logger.error(`获取通缉详情失败: ${id}`, err);
        setError('加载失败，请稍后重试');
      } finally {
        setLoading(false);
      }
    };

    void fetchWanted();
  }, [id]);

  if (loading) {
    return (
      <div className="py-12 text-center text-[#737373] text-sm">加载中...</div>
    );
  }

  if (error || !wanted) {
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
          {error || '通缉令不存在'}
        </div>
      </div>
    );
  }

  const statusInfo = statusLabelMap[wanted.status];

  return (
    <div className="space-y-6">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1 text-sm text-[#a3a3a3] hover:text-[#d4af37] transition-colors"
      >
        <ArrowLeft size={14} />
        返回通缉令
      </button>

      {/* Header */}
      <ForumCard className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <DangerBadge level={wanted.dangerLevel} />
            <span className={`text-sm font-medium ${statusInfo.className}`}>
              {statusInfo.label}
            </span>
          </div>
        </div>

        <h1 className="text-xl font-bold text-[#e5e5e5]">{wanted.title}</h1>

        <div className="flex items-center gap-4 text-xs text-[#737373] flex-wrap">
          <span className="flex items-center gap-1">
            <Clock size={12} />
            {new Date(wanted.createdAt).toLocaleString('zh-CN')}
          </span>
        </div>
      </ForumCard>

      {/* Detail */}
      <ForumCard className="space-y-4">
        <div className="flex items-baseline gap-2 pb-3 border-b border-[#262626]">
          <span className="text-sm text-[#737373] w-24">目标姓名</span>
          <span className="text-lg font-semibold text-[#dc2626]">
            {wanted.targetName}
          </span>
        </div>

        <div className="flex items-start gap-2">
          <span className="text-sm text-[#737373] w-24 flex items-center gap-1">
            <Coins size={14} />
            悬赏金额
          </span>
          <span className="text-sm text-[#d4af37] font-medium">
            {wanted.bountyAmount.toLocaleString()} 黄金
          </span>
        </div>

        {wanted.lastSeen && (
          <div className="flex items-start gap-2">
            <span className="text-sm text-[#737373] w-24 flex items-center gap-1">
              <MapPin size={14} />
              最后出现地点
            </span>
            <span className="text-sm text-[#e5e5e5]">{wanted.lastSeen}</span>
          </div>
        )}

        {wanted.ghostInfo && (
          <div className="flex items-start gap-2">
            <span className="text-sm text-[#737373] w-24 flex items-center gap-1">
              <Ghost size={14} />
              驾驭的鬼
            </span>
            <span className="text-sm text-[#e5e5e5] flex-1 whitespace-pre-wrap">
              {wanted.ghostInfo}
            </span>
          </div>
        )}

        <div className="flex items-start gap-2 pt-3 border-t border-[#262626]">
          <span className="text-sm text-[#737373] w-24">详细描述</span>
          <div className="text-sm text-[#e5e5e5] flex-1 whitespace-pre-wrap leading-relaxed">
            {wanted.description}
          </div>
        </div>
      </ForumCard>
    </div>
  );
};

export default WantedDetailPage;
