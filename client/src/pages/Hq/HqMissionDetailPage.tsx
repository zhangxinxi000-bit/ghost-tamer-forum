import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { logger } from '@/lib/logger';
import { MapPin, Coins, ArrowLeft, Clock, Shield, FileCheck } from 'lucide-react';
import { hqMissionsApi } from '@client/src/api';
import type { HqMission, HqMissionStatus, HqMissionType } from '@shared/api.interface';
import DangerBadge from '@client/src/components/ui/DangerBadge';
import GoldButton from '@client/src/components/ui/GoldButton';
import ForumCard from '@client/src/components/ui/ForumCard';
import { useAuth } from '@client/src/context/AuthContext';
import { toast } from 'sonner';

const missionStatusMap: Record<HqMissionStatus, { label: string; className: string }> = {
  pending: { label: '待接取', className: 'text-[#ca8a04]' },
  in_progress: { label: '进行中', className: 'text-[#16a34a]' },
  completed: { label: '已完成', className: 'text-[#737373]' },
  failed: { label: '失败', className: 'text-[#dc2626]' },
  cancelled: { label: '已取消', className: 'text-[#737373]' },
};

const missionTypeLabelMap: Record<HqMissionType, string> = {
  support: '支援某市',
  containment: '收容厉鬼',
  transport: '押送灵异物品',
  investigation: '调查',
  other: '其他',
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

const HqMissionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [mission, setMission] = useState<HqMission | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [accepting, setAccepting] = useState<boolean>(false);

  const { user } = useAuth();

  useEffect(() => {
    if (!id) return;

    const fetchMission = async (): Promise<void> => {
      setLoading(true);
      setError(null);
      try {
        const data: HqMission = await hqMissionsApi.getHqMission(id);
        setMission(data);
      } catch (err: unknown) {
        logger.error(`获取任务详情失败: ${id}`, err);
        setError('加载失败，请稍后重试');
      } finally {
        setLoading(false);
      }
    };

    void fetchMission();
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

  if (error || !mission) {
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
          {error || '任务不存在'}
        </div>
      </div>
    );
  }

  const statusInfo = missionStatusMap[mission.status];

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
            <DangerBadge level={mission.dangerLevel} />
            <span className={`text-sm font-medium ${statusInfo.className}`}>
              {statusInfo.label}
            </span>
          </div>
        </div>

        <h1 className="text-xl font-bold text-[#e5e5e5]">{mission.title}</h1>

        <div className="flex items-center gap-4 text-xs text-[#737373] flex-wrap">
          <span className="flex items-center gap-1">
            发布者：
            <HqAuthorDisplay author={mission.author} />
          </span>
          <span className="flex items-center gap-1">
            <Clock size={12} />
            {new Date(mission.createdAt).toLocaleString('zh-CN')}
          </span>
          <span className="flex items-center gap-1 text-[#d4af37] font-medium">
            <Coins size={12} />
            {mission.reward.toLocaleString()} 黄金
          </span>
          {mission.location && (
            <span className="flex items-center gap-1">
              <MapPin size={12} />
              {mission.location}
            </span>
          )}
          <span className="px-2 py-0.5 text-xs border border-[#262626] rounded-sm text-[#a3a3a3]">
            {missionTypeLabelMap[mission.missionType]}
          </span>
        </div>
      </ForumCard>

      <ForumCard className="space-y-4">
        <div className="flex items-baseline gap-2 pb-3 border-b border-[#262626]">
          <span className="text-sm text-[#737373] w-20">赏金</span>
          <span className="text-2xl font-bold text-[#d4af37] flex items-center gap-2">
            <Coins size={20} />
            {mission.reward.toLocaleString()} 黄金
          </span>
        </div>

        <div className="flex items-start gap-2">
          <span className="text-sm text-[#737373] w-20">任务类型</span>
          <span className="text-sm text-[#e5e5e5]">
            {missionTypeLabelMap[mission.missionType]}
          </span>
        </div>

        {mission.location && (
          <div className="flex items-start gap-2">
            <span className="text-sm text-[#737373] w-20 flex items-center gap-1">
              <MapPin size={14} />
              地点
            </span>
            <span className="text-sm text-[#e5e5e5]">{mission.location}</span>
          </div>
        )}

        {mission.requirements && (
          <div className="flex items-start gap-2 pt-3 border-t border-[#262626]">
            <span className="text-sm text-[#737373] w-20 flex items-center gap-1 pt-0.5">
              <FileCheck size={14} />
              任务要求
            </span>
            <div className="text-sm text-[#e5e5e5] flex-1 whitespace-pre-wrap leading-relaxed">
              {mission.requirements}
            </div>
          </div>
        )}

        <div className="flex items-start gap-2 pt-3 border-t border-[#262626]">
          <span className="text-sm text-[#737373] w-20">任务内容</span>
          <div className="text-sm text-[#e5e5e5] flex-1 whitespace-pre-wrap leading-relaxed">
            {mission.content}
          </div>
        </div>
      </ForumCard>

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

export default HqMissionDetailPage;
