import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { logger } from '@/lib/logger';
import { MapPin, Ghost, Eye, ArrowLeft, Clock, Shield } from 'lucide-react';
import { hqEventsApi } from '@client/src/api';
import type { HqEvent, HqEventStatus } from '@shared/api.interface';
import DangerBadge from '@client/src/components/ui/DangerBadge';
import ForumCard from '@client/src/components/ui/ForumCard';

const eventStatusMap: Record<HqEventStatus, { label: string; className: string }> = {
  active: { label: '活跃中', className: 'text-[#dc2626]' },
  contained: { label: '已收容', className: 'text-[#16a34a]' },
  resolved: { label: '已解决', className: 'text-[#737373]' },
  failed: { label: '失败', className: 'text-[#dc2626]' },
  closed: { label: '已关闭', className: 'text-[#737373]' },
};

interface HqAuthorDisplayProps {
  author: {
    displayName: string;
    organization: string | null;
    position: string | null;
  };
}

const HqAuthorDisplay: React.FC<HqAuthorDisplayProps> = ({ author }) => {
  const isHq = author.organization?.includes('总部');
  if (isHq && author.position) {
    return (
      <span className="flex items-center gap-1">
        <span className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-semibold tracking-wide rounded-sm bg-[#d4af37] text-[#0a0a0a]">
          <Shield size={10} />
          总部
        </span>
        <span className="text-[#d4af37]">{author.position}</span>
      </span>
    );
  }
  return <span>{author.displayName}</span>;
};

const HqEventDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<HqEvent | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchEvent = async (): Promise<void> => {
      setLoading(true);
      setError(null);
      try {
        const data: HqEvent = await hqEventsApi.getHqEvent(id);
        setEvent(data);
      } catch (err: unknown) {
        logger.error(`获取事件通报详情失败: ${id}`, err);
        setError('加载失败，请稍后重试');
      } finally {
        setLoading(false);
      }
    };

    void fetchEvent();
  }, [id]);

  if (loading) {
    return (
      <div className="py-12 text-center text-[#737373] text-sm">加载中...</div>
    );
  }

  if (error || !event) {
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
          {error || '事件通报不存在'}
        </div>
      </div>
    );
  }

  const statusInfo = eventStatusMap[event.status];

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1 text-sm text-[#a3a3a3] hover:text-[#d4af37] transition-colors"
      >
        <ArrowLeft size={14} />
        返回总部
      </button>

      <ForumCard className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <DangerBadge level={event.dangerLevel} />
            <span className={`text-sm font-medium ${statusInfo.className}`}>
              {statusInfo.label}
            </span>
          </div>
        </div>

        <h1 className="text-xl font-bold text-[#e5e5e5]">{event.title}</h1>

        <div className="flex items-center gap-4 text-xs text-[#737373] flex-wrap">
          <span className="flex items-center gap-1">
            发布者：
            <HqAuthorDisplay author={event.author} />
          </span>
          <span className="flex items-center gap-1">
            <Clock size={12} />
            {new Date(event.createdAt).toLocaleString('zh-CN')}
          </span>
          <span className="flex items-center gap-1">
            <Eye size={12} />
            浏览 {event.viewCount}
          </span>
          {event.eventLocation && (
            <span className="flex items-center gap-1">
              <MapPin size={12} />
              {event.eventLocation}
            </span>
          )}
          {event.ghostName && (
            <span className="flex items-center gap-1">
              <Ghost size={12} />
              {event.ghostName}
            </span>
          )}
        </div>
      </ForumCard>

      <ForumCard className="space-y-4">
        {event.ghostRules && (
          <div className="pb-4 border-b border-[#262626] space-y-2">
            <div className="flex items-center gap-2">
              <Ghost size={14} className="text-[#d4af37]" />
              <span className="text-sm font-semibold text-[#d4af37]">厉鬼规律</span>
            </div>
            <div className="pl-6 text-sm text-[#e5e5e5] whitespace-pre-wrap leading-relaxed">
              {event.ghostRules}
            </div>
          </div>
        )}

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-[#a3a3a3]">通报正文</span>
          </div>
          <div className="text-sm text-[#e5e5e5] whitespace-pre-wrap leading-relaxed">
            {event.content}
          </div>
        </div>
      </ForumCard>
    </div>
  );
};

export default HqEventDetailPage;
