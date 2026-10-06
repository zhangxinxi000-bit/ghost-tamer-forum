import React, { useState, useEffect, useCallback } from 'react';
import { logger } from '@/lib/logger';
import { Clock, User, CheckCircle, XCircle, ChevronDown } from 'lucide-react';
import { applicationsApi } from '@client/src/api';
import type { Application, ApplicationStatus } from '@shared/api.interface';
import ForumCard from '@client/src/components/ui/ForumCard';
import ForumPagination from '@client/src/components/ui/ForumPagination';

const TYPE_LABELS: Record<string, string> = {
  registration: '驭鬼者登记',
  join_org: '加入组织',
  captain_plan: '队长计划',
  item_claim: '物品申领',
};

const STATUS_LABELS: Record<
  ApplicationStatus,
  { label: string; className: string; badgeBg: string }
> = {
  pending: {
    label: '待审批',
    className: 'text-[#ca8a04]',
    badgeBg: 'bg-[#ca8a04]/10 border-[#ca8a04]/30 text-[#ca8a04]',
  },
  approved: {
    label: '已通过',
    className: 'text-[#16a34a]',
    badgeBg: 'bg-[#16a34a]/10 border-[#16a34a]/30 text-[#16a34a]',
  },
  rejected: {
    label: '已驳回',
    className: 'text-[#dc2626]',
    badgeBg: 'bg-[#dc2626]/10 border-[#dc2626]/30 text-[#dc2626]',
  },
};

type FilterTab = 'all' | ApplicationStatus;

const TABS: { value: FilterTab; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'pending', label: '待审批' },
  { value: 'approved', label: '已通过' },
  { value: 'rejected', label: '已驳回' },
];

const MyApplicationsPage: React.FC = () => {
  const [tab, setTab] = useState<FilterTab>('all');
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);
  const [pageSize] = useState<number>(10);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchApplications = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const params: {
        page: number;
        pageSize: number;
        mine: boolean;
        status?: string;
      } = { page, pageSize, mine: true };
      if (tab !== 'all') params.status = tab;
      const data = await applicationsApi.getApplications(params);
      setApplications(data.items);
      setTotal(data.total);
    } catch (err: unknown) {
      logger.error('获取我的申请失败', err);
      setError('加载失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, tab]);

  useEffect(() => {
    void fetchApplications();
  }, [fetchApplications]);

  const handlePageChange = (newPage: number): void => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[#e5e5e5] tracking-tight">
          我的申请
        </h1>
        <p className="mt-1 text-sm text-[#737373]">
          查看所有已提交的申请及其审批状态
        </p>
      </div>

      <ForumCard padding="none">
        <div className="flex border-b border-[#262626] px-2">
          {TABS.map((t: { value: FilterTab; label: string }) => (
            <button
              key={t.value}
              onClick={() => {
                setTab(t.value);
                setPage(1);
                setExpandedId(null);
              }}
              className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
                tab === t.value
                  ? 'text-[#d4af37] border-[#d4af37]'
                  : 'text-[#a3a3a3] border-transparent hover:text-[#e5e5e5]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="py-12 text-center text-[#737373] text-sm">
            加载中...
          </div>
        ) : error ? (
          <div className="py-12 text-center text-[#dc2626] text-sm">{error}</div>
        ) : applications.length === 0 ? (
          <div className="py-12 text-center text-[#737373] text-sm">
            暂无申请记录
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {applications.map((app: Application) => {
              const statusInfo = STATUS_LABELS[app.status];
              const isExpanded = expandedId === app.id;
              return (
                <ForumCard
                  key={app.id}
                  padding="none"
                  className={isExpanded ? 'border-[#d4af37]' : ''}
                >
                  <button
                    onClick={() =>
                      setExpandedId(isExpanded ? null : app.id)
                    }
                    className="w-full text-left p-4 hover:bg-[#1a1a1a] transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="px-2 py-0.5 text-xs bg-[#0a0a0a] border border-[#262626] text-[#a3a3a3] rounded-sm">
                            {TYPE_LABELS[app.type] || app.type}
                          </span>
                          <span
                            className={`px-2 py-0.5 text-xs font-medium border rounded-sm ${statusInfo.badgeBg}`}
                          >
                            {statusInfo.label}
                          </span>
                        </div>
                        <h4 className="text-sm font-semibold text-[#e5e5e5]">
                          {app.title}
                        </h4>
                        <div className="flex items-center gap-4 mt-2 text-xs text-[#737373]">
                          <span className="flex items-center gap-1">
                            <Clock size={12} />
                            提交于 {formatDate(app.createdAt)}
                          </span>
                        </div>
                      </div>
                      <ChevronDown
                        size={18}
                        className={`text-[#737373] transition-transform flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`}
                      />
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-4 pb-4 border-t border-[#262626] bg-[#0a0a0a]/50">
                      <div className="pt-3 space-y-4">
                        <div>
                          <p className="text-xs text-[#737373] mb-1">
                            申请内容
                          </p>
                          <p className="text-sm text-[#a3a3a3] leading-relaxed whitespace-pre-wrap">
                            {app.content}
                          </p>
                        </div>

                        {app.targetOrganization && (
                          <div>
                            <p className="text-xs text-[#737373] mb-1">
                              目标组织
                            </p>
                            <p className="text-sm text-[#e5e5e5]">
                              {app.targetOrganization}
                            </p>
                          </div>
                        )}

                        {app.itemName && (
                          <div>
                            <p className="text-xs text-[#737373] mb-1">
                              物品名称
                            </p>
                            <p className="text-sm text-[#e5e5e5]">
                              {app.itemName}
                            </p>
                          </div>
                        )}

                        {app.reviewer && (
                          <div className="pt-3 border-t border-[#262626]">
                            <div className="flex items-center gap-2 mb-2">
                              {app.status === 'approved' ? (
                                <CheckCircle
                                  size={16}
                                  className="text-[#16a34a]"
                                />
                              ) : (
                                <XCircle size={16} className="text-[#dc2626]" />
                              )}
                              <span
                                className={`text-sm font-medium ${statusInfo.className}`}
                              >
                                {statusInfo.label}
                              </span>
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-xs text-[#737373]">
                                <User size={12} />
                                <span>审批人：{app.reviewer.displayName}</span>
                              </div>
                              {app.reviewedAt && (
                                <div className="flex items-center gap-2 text-xs text-[#737373]">
                                  <Clock size={12} />
                                  <span>
                                    审批时间：{formatDate(app.reviewedAt)}
                                  </span>
                                </div>
                              )}
                              {app.reviewComment && (
                                <div className="mt-2">
                                  <p className="text-xs text-[#737373] mb-1">
                                    审批意见
                                  </p>
                                  <p className="text-sm text-[#a3a3a3] leading-relaxed">
                                    {app.reviewComment}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </ForumCard>
              );
            })}
          </div>
        )}

        {!loading && !error && total > 0 && (
          <ForumPagination
            page={page}
            pageSize={pageSize}
            total={total}
            onPageChange={handlePageChange}
          />
        )}
      </ForumCard>
    </div>
  );
};

export default MyApplicationsPage;
