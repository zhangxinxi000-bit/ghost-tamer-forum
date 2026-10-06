import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { logger } from '@/lib/logger';
import { ArrowLeft, Pin, Clock } from 'lucide-react';
import { announcementsApi } from '@client/src/api';
import type { Announcement } from '@shared/api.interface';
import ForumCard from '@client/src/components/ui/ForumCard';

const AnnouncementDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchAnnouncement = async (): Promise<void> => {
      setLoading(true);
      setError(null);
      try {
        const data: Announcement = await announcementsApi.getAnnouncement(id);
        setAnnouncement(data);
      } catch (err: unknown) {
        logger.error(`获取公告详情失败: ${id}`, err);
        setError('加载失败，请稍后重试');
      } finally {
        setLoading(false);
      }
    };

    void fetchAnnouncement();
  }, [id]);

  if (loading) {
    return (
      <div className="py-12 text-center text-[#737373] text-sm">加载中...</div>
    );
  }

  if (error || !announcement) {
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
          {error || '公告不存在'}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1 text-sm text-[#a3a3a3] hover:text-[#d4af37] transition-colors"
      >
        <ArrowLeft size={14} />
        返回公告列表
      </button>

      {/* Content */}
      <ForumCard className="space-y-4">
        <div className="flex items-center gap-2">
          {announcement.isPinned && (
            <span className="flex items-center gap-1 text-xs text-[#d4af37] font-medium">
              <Pin size={12} />
              置顶
            </span>
          )}
        </div>

        <h1 className="text-xl font-bold text-[#e5e5e5]">
          {announcement.title}
        </h1>

        <div className="flex items-center gap-2 text-xs text-[#737373] pb-4 border-b border-[#262626]">
          <Clock size={12} />
          {new Date(announcement.createdAt).toLocaleString('zh-CN')}
        </div>

        <div className="text-sm text-[#e5e5e5] whitespace-pre-wrap leading-relaxed pt-2">
          {announcement.content}
        </div>
      </ForumCard>
    </div>
  );
};

export default AnnouncementDetailPage;
