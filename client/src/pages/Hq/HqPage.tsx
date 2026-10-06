import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { logger } from '@/lib/logger';
import { MapPin, Ghost, Eye, Coins, Shield } from 'lucide-react';
import { hqEventsApi, hqMissionsApi } from '@client/src/api';
import type {
  HqEvent,
  HqMission,
  HqEventStatus,
  HqMissionStatus,
  HqMissionType,
  DangerLevel,
} from '@shared/api.interface';
import DangerBadge from '@client/src/components/ui/DangerBadge';
import ForumCard from '@client/src/components/ui/ForumCard';
import ForumPagination from '@client/src/components/ui/ForumPagination';

const DANGER_LEVELS: (DangerLevel | 'all')[] = ['all', 'S', 'A', 'B', 'C'];

const EVENT_STATUS_OPTIONS: { value: HqEventStatus | 'all'; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'active', label: '活跃' },
  { value: 'contained', label: '已收容' },
  { value: 'resolved', label: '已解决' },
  { value: 'failed', label: '失败' },
  { value: 'closed', label: '已关闭' },
];

const EVENT_SORT_OPTIONS: { value: 'latest' | 'hot'; label: string }[] = [
  { value: 'latest', label: '最新' },
  { value: 'hot', label: '热度' },
];

const MISSION_STATUS_OPTIONS: { value: HqMissionStatus | 'all'; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'pending', label: '待接取' },
  { value: 'in_progress', label: '进行中' },
  { value: 'completed', label: '已完成' },
  { value: 'failed', label: '失败' },
  { value: 'cancelled', label: '已取消' },
];

const MISSION_TYPE_OPTIONS: { value: HqMissionType | 'all'; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'support', label: '支援' },
  { value: 'containment', label: '收容' },
  { value: 'transport', label: '押送' },
  { value: 'investigation', label: '调查' },
  { value: 'other', label: '其他' },
];

const MISSION_SORT_OPTIONS: { value: 'latest' | 'reward'; label: string }[] = [
  { value: 'latest', label: '最新' },
  { value: 'reward', label: '赏金最高' },
];

const eventStatusMap: Record<HqEventStatus, { label: string; className: string }> = {
  active: { label: '活跃中', className: 'text-[#dc2626]' },
  contained: { label: '已收容', className: 'text-[#16a34a]' },
  resolved: { label: '已解决', className: 'text-[#737373]' },
  failed: { label: '失败', className: 'text-[#dc2626]' },
  closed: { label: '已关闭', className: 'text-[#737373]' },
};

const missionStatusMap: Record<HqMissionStatus, { label: string; className: string }> = {
  pending: { label: '待接取', className: 'text-[#ca8a04]' },
  in_progress: { label: '进行中', className: 'text-[#16a34a]' },
  completed: { label: '已完成', className: 'text-[#737373]' },
  failed: { label: '失败', className: 'text-[#dc2626]' },
  cancelled: { label: '已取消', className: 'text-[#737373]' },
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

const HqPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'events' | 'missions'>('events');

  const [events, setEvents] = useState<HqEvent[]>([]);
  const [eventsLoading, setEventsLoading] = useState<boolean>(true);
  const [eventsError, setEventsError] = useState<string | null>(null);
  const [eventsPage, setEventsPage] = useState<number>(1);
  const [eventsTotal, setEventsTotal] = useState<number>(0);
  const [eventsPageSize] = useState<number>(10);
  const [eventDangerLevel, setEventDangerLevel] = useState<DangerLevel | 'all'>('all');
  const [eventStatus, setEventStatus] = useState<HqEventStatus | 'all'>('all');
  const [eventSort, setEventSort] = useState<'latest' | 'hot'>('latest');

  const [missions, setMissions] = useState<HqMission[]>([]);
  const [missionsLoading, setMissionsLoading] = useState<boolean>(true);
  const [missionsError, setMissionsError] = useState<string | null>(null);
  const [missionsPage, setMissionsPage] = useState<number>(1);
  const [missionsTotal, setMissionsTotal] = useState<number>(0);
  const [missionsPageSize] = useState<number>(10);
  const [missionDangerLevel, setMissionDangerLevel] = useState<DangerLevel | 'all'>('all');
  const [missionStatus, setMissionStatus] = useState<HqMissionStatus | 'all'>('all');
  const [missionType, setMissionType] = useState<HqMissionType | 'all'>('all');
  const [missionSort, setMissionSort] = useState<'latest' | 'reward'>('latest');

  const fetchEvents = useCallback(async (): Promise<void> => {
    setEventsLoading(true);
    setEventsError(null);
    try {
      const params: Record<string, string | number> = {
        page: eventsPage,
        pageSize: eventsPageSize,
        sort: eventSort,
      };
      if (eventDangerLevel !== 'all') params.dangerLevel = eventDangerLevel;
      if (eventStatus !== 'all') params.status = eventStatus;

      const data = await hqEventsApi.getHqEvents(params);
      setEvents(data.items);
      setEventsTotal(data.total);
    } catch (err: unknown) {
      logger.error('获取事件通报列表失败', err);
      setEventsError('加载失败，请稍后重试');
    } finally {
      setEventsLoading(false);
    }
  }, [eventsPage, eventsPageSize, eventDangerLevel, eventStatus, eventSort]);

  const fetchMissions = useCallback(async (): Promise<void> => {
    setMissionsLoading(true);
    setMissionsError(null);
    try {
      const params: Record<string, string | number> = {
        page: missionsPage,
        pageSize: missionsPageSize,
        sort: missionSort,
      };
      if (missionDangerLevel !== 'all') params.dangerLevel = missionDangerLevel;
      if (missionStatus !== 'all') params.status = missionStatus;
      if (missionType !== 'all') params.missionType = missionType;

      const data = await hqMissionsApi.getHqMissions(params);
      setMissions(data.items);
      setMissionsTotal(data.total);
    } catch (err: unknown) {
      logger.error('获取任务指派列表失败', err);
      setMissionsError('加载失败，请稍后重试');
    } finally {
      setMissionsLoading(false);
    }
  }, [missionsPage, missionsPageSize, missionDangerLevel, missionStatus, missionType, missionSort]);

  useEffect(() => {
    void fetchEvents();
  }, [fetchEvents]);

  useEffect(() => {
    void fetchMissions();
  }, [fetchMissions]);

  const handleEventPageChange = (newPage: number): void => {
    setEventsPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleMissionPageChange = (newPage: number): void => {
    setMissionsPage(newPage);
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
        <div className="flex items-center gap-3 mb-1">
          <Shield size={22} className="text-[#d4af37]" />
          <h1 className="text-xl font-bold text-[#d4af37] tracking-tight">
            全球灵异事件处理总部
          </h1>
        </div>
        <p className="mt-1 text-sm text-[#737373]">
          官方权威组织 · 负责全球灵异事件处理与驭鬼者管理
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#262626]">
        <button
          onClick={() => setActiveTab('events')}
          className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
            activeTab === 'events'
              ? 'text-[#d4af37] border-[#d4af37]'
              : 'text-[#a3a3a3] border-transparent hover:text-[#e5e5e5]'
          }`}
        >
          事件通报
        </button>
        <button
          onClick={() => setActiveTab('missions')}
          className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
            activeTab === 'missions'
              ? 'text-[#d4af37] border-[#d4af37]'
              : 'text-[#a3a3a3] border-transparent hover:text-[#e5e5e5]'
          }`}
        >
          任务指派
        </button>
      </div>

      {/* Events Tab */}
      {activeTab === 'events' && (
        <div className="space-y-4">
          {/* Filters */}
          <ForumCard padding="sm" className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-[#737373] w-16">危险等级</span>
              <div className="flex gap-1">
                {DANGER_LEVELS.map((level: DangerLevel | 'all') => (
                  <button
                    key={level}
                    onClick={() => {
                      setEventDangerLevel(level);
                      setEventsPage(1);
                    }}
                    className={`px-3 py-1 text-xs rounded-sm border transition-colors ${
                      eventDangerLevel === level
                        ? 'bg-[#d4af37] border-[#d4af37] text-[#0a0a0a] font-medium'
                        : 'bg-transparent border-[#262626] text-[#a3a3a3] hover:border-[#d4af37] hover:text-[#d4af37]'
                    }`}
                  >
                    {level === 'all' ? '全部' : level}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-6 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#737373] w-16">状态</span>
                <select
                  value={eventStatus}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                    setEventStatus(e.target.value as HqEventStatus | 'all');
                    setEventsPage(1);
                  }}
                  className="bg-[#0a0a0a] border border-[#262626] text-sm text-[#e5e5e5] px-2 py-1 rounded-sm focus:outline-none focus:border-[#d4af37]"
                >
                  {EVENT_STATUS_OPTIONS.map(
                    (opt: { value: HqEventStatus | 'all'; label: string }) => (
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
                  {EVENT_SORT_OPTIONS.map(
                    (s: { value: 'latest' | 'hot'; label: string }) => (
                      <button
                        key={s.value}
                        onClick={() => {
                          setEventSort(s.value);
                          setEventsPage(1);
                        }}
                        className={`px-3 py-1 text-xs rounded-sm border transition-colors ${
                          eventSort === s.value
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
          {eventsLoading ? (
            <div className="py-12 text-center text-[#737373] text-sm">
              加载中...
            </div>
          ) : eventsError ? (
            <div className="py-12 text-center text-[#dc2626] text-sm">{eventsError}</div>
          ) : events.length === 0 ? (
            <div className="py-12 text-center text-[#737373] text-sm">
              暂无事件通报
            </div>
          ) : (
            <div className="space-y-3">
              {events.map((event: HqEvent) => {
                const statusInfo = eventStatusMap[event.status];
                return (
                  <Link
                    key={event.id}
                    to={`/hq/events/${event.id}`}
                    className="block"
                  >
                    <ForumCard className="hover:border-[#d4af37] transition-colors cursor-pointer">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <DangerBadge level={event.dangerLevel} />
                        <span
                          className={`text-xs font-medium ${statusInfo.className}`}
                        >
                          {statusInfo.label}
                        </span>
                      </div>

                      <h3 className="text-base font-semibold text-[#e5e5e5] hover:text-[#d4af37] transition-colors mb-2">
                        {event.title}
                      </h3>

                      <p className="text-sm text-[#a3a3a3] mb-3 line-clamp-2">
                        {truncate(event.content, 120)}
                      </p>

                      <div className="flex items-center gap-4 text-xs text-[#737373] flex-wrap">
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
                        <span className="flex items-center gap-1">
                          <Eye size={12} />
                          {event.viewCount}
                        </span>
                        <span>
                          发布者：
                          <HqAuthorDisplay author={event.author} />
                        </span>
                      </div>
                    </ForumCard>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {!eventsLoading && !eventsError && eventsTotal > 0 && (
            <ForumPagination
              page={eventsPage}
              pageSize={eventsPageSize}
              total={eventsTotal}
              onPageChange={handleEventPageChange}
            />
          )}
        </div>
      )}

      {/* Missions Tab */}
      {activeTab === 'missions' && (
        <div className="space-y-4">
          {/* Filters */}
          <ForumCard padding="sm" className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-[#737373] w-16">危险等级</span>
              <div className="flex gap-1">
                {DANGER_LEVELS.map((level: DangerLevel | 'all') => (
                  <button
                    key={level}
                    onClick={() => {
                      setMissionDangerLevel(level);
                      setMissionsPage(1);
                    }}
                    className={`px-3 py-1 text-xs rounded-sm border transition-colors ${
                      missionDangerLevel === level
                        ? 'bg-[#d4af37] border-[#d4af37] text-[#0a0a0a] font-medium'
                        : 'bg-transparent border-[#262626] text-[#a3a3a3] hover:border-[#d4af37] hover:text-[#d4af37]'
                    }`}
                  >
                    {level === 'all' ? '全部' : level}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-6 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#737373] w-16">任务类型</span>
                <select
                  value={missionType}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                    setMissionType(e.target.value as HqMissionType | 'all');
                    setMissionsPage(1);
                  }}
                  className="bg-[#0a0a0a] border border-[#262626] text-sm text-[#e5e5e5] px-2 py-1 rounded-sm focus:outline-none focus:border-[#d4af37]"
                >
                  {MISSION_TYPE_OPTIONS.map(
                    (opt: { value: HqMissionType | 'all'; label: string }) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ),
                  )}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-[#737373] w-16">状态</span>
                <select
                  value={missionStatus}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                    setMissionStatus(e.target.value as HqMissionStatus | 'all');
                    setMissionsPage(1);
                  }}
                  className="bg-[#0a0a0a] border border-[#262626] text-sm text-[#e5e5e5] px-2 py-1 rounded-sm focus:outline-none focus:border-[#d4af37]"
                >
                  {MISSION_STATUS_OPTIONS.map(
                    (opt: { value: HqMissionStatus | 'all'; label: string }) => (
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
                  {MISSION_SORT_OPTIONS.map(
                    (s: { value: 'latest' | 'reward'; label: string }) => (
                      <button
                        key={s.value}
                        onClick={() => {
                          setMissionSort(s.value);
                          setMissionsPage(1);
                        }}
                        className={`px-3 py-1 text-xs rounded-sm border transition-colors ${
                          missionSort === s.value
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
          {missionsLoading ? (
            <div className="py-12 text-center text-[#737373] text-sm">
              加载中...
            </div>
          ) : missionsError ? (
            <div className="py-12 text-center text-[#dc2626] text-sm">{missionsError}</div>
          ) : missions.length === 0 ? (
            <div className="py-12 text-center text-[#737373] text-sm">
              暂无指派任务
            </div>
          ) : (
            <div className="space-y-3">
              {missions.map((mission: HqMission) => {
                const statusInfo = missionStatusMap[mission.status];
                return (
                  <Link
                    key={mission.id}
                    to={`/hq/missions/${mission.id}`}
                    className="block"
                  >
                    <ForumCard className="hover:border-[#d4af37] transition-colors cursor-pointer">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <DangerBadge level={mission.dangerLevel} />
                        <span
                          className={`text-xs font-medium ${statusInfo.className}`}
                        >
                          {statusInfo.label}
                        </span>
                      </div>

                      <h3 className="text-base font-semibold text-[#e5e5e5] hover:text-[#d4af37] transition-colors mb-2">
                        {mission.title}
                      </h3>

                      <p className="text-sm text-[#a3a3a3] mb-3 line-clamp-2">
                        {truncate(mission.content, 120)}
                      </p>

                      <div className="flex items-center gap-4 text-xs text-[#737373] flex-wrap">
                        {mission.location && (
                          <span className="flex items-center gap-1">
                            <MapPin size={12} />
                            {mission.location}
                          </span>
                        )}
                        <span className="flex items-center gap-1 text-[#d4af37] font-medium">
                          <Coins size={12} />
                          {mission.reward.toLocaleString()} 黄金
                        </span>
                        <span>
                          发布者：
                          <HqAuthorDisplay author={mission.author} />
                        </span>
                      </div>
                    </ForumCard>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {!missionsLoading && !missionsError && missionsTotal > 0 && (
            <ForumPagination
              page={missionsPage}
              pageSize={missionsPageSize}
              total={missionsTotal}
              onPageChange={handleMissionPageChange}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default HqPage;
