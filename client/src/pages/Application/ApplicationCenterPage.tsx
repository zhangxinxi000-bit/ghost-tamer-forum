import React, { useState, useEffect, useCallback } from 'react';
import { logger } from '@/lib/logger';
import {
  ClipboardCheck,
  Users,
  Award,
  Package,
  Clock,
  X,
} from 'lucide-react';
import { applicationsApi } from '@client/src/api';
import type {
  Application,
  ApplicationType,
  ApplicationStatus,
  CreateApplicationRequest,
} from '@shared/api.interface';
import ForumCard from '@client/src/components/ui/ForumCard';
import GoldButton from '@client/src/components/ui/GoldButton';
import ForumPagination from '@client/src/components/ui/ForumPagination';

const TYPE_LABELS: Record<ApplicationType, string> = {
  registration: '驭鬼者登记',
  join_org: '加入组织',
  captain_plan: '队长计划',
  item_claim: '物品申领',
};

const STATUS_LABELS: Record<
  ApplicationStatus,
  { label: string; className: string }
> = {
  pending: { label: '待审批', className: 'text-[#ca8a04]' },
  approved: { label: '已通过', className: 'text-[#16a34a]' },
  rejected: { label: '已驳回', className: 'text-[#dc2626]' },
};

interface ApplicationCardConfig {
  type: ApplicationType;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const APPLICATION_CARDS: ApplicationCardConfig[] = [
  {
    type: 'registration',
    title: '驭鬼者登记认证',
    description: '申请官方驭鬼者身份认证，获得档案编号',
    icon: <ClipboardCheck size={24} />,
  },
  {
    type: 'join_org',
    title: '加入组织',
    description: '申请加入总部、国际刑警、灵异论坛等组织',
    icon: <Users size={24} />,
  },
  {
    type: 'captain_plan',
    title: '队长计划报名',
    description: '顶尖驭鬼者培养计划选拔，倾尽国家资源培养',
    icon: <Award size={24} />,
  },
  {
    type: 'item_claim',
    title: '灵异物品申领',
    description: '向总部申领鬼烛、裹尸布等灵异物品',
    icon: <Package size={24} />,
  },
];

const ORGANIZATION_OPTIONS: string[] = [
  '总部',
  '国际刑警',
  '灵异论坛',
  '民间驭鬼者组织',
];

type TabType = 'all' | 'mine';

const ApplicationCenterPage: React.FC = () => {
  const [tab, setTab] = useState<TabType>('all');
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);
  const [pageSize] = useState<number>(10);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [selectedType, setSelectedType] = useState<ApplicationType | null>(null);
  const [formTitle, setFormTitle] = useState<string>('');
  const [formContent, setFormContent] = useState<string>('');
  const [formOrg, setFormOrg] = useState<string>('');
  const [formItemName, setFormItemName] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  const fetchApplications = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const params: {
        page: number;
        pageSize: number;
        mine?: boolean;
      } = { page, pageSize };
      if (tab === 'mine') params.mine = true;
      const data = await applicationsApi.getApplications(params);
      setApplications(data.items);
      setTotal(data.total);
    } catch (err: unknown) {
      logger.error('获取申请列表失败', err);
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

  const openDialog = (type: ApplicationType): void => {
    setSelectedType(type);
    setFormTitle('');
    setFormContent('');
    setFormOrg(ORGANIZATION_OPTIONS[0]);
    setFormItemName('');
    setDialogOpen(true);
  };

  const closeDialog = (): void => {
    setDialogOpen(false);
    setSelectedType(null);
  };

  const handleSubmit = async (): Promise<void> => {
    if (!selectedType) return;
    if (!formTitle.trim() || !formContent.trim()) {
      setError('请填写申请标题和内容');
      return;
    }
    setSubmitting(true);
    try {
      const payload: CreateApplicationRequest = {
        type: selectedType,
        title: formTitle.trim(),
        content: formContent.trim(),
      };
      if (selectedType === 'join_org' && formOrg) {
        payload.targetOrganization = formOrg;
      }
      if (selectedType === 'item_claim' && formItemName.trim()) {
        payload.itemName = formItemName.trim();
      }
      await applicationsApi.createApplication(payload);
      closeDialog();
      void fetchApplications();
    } catch (err: unknown) {
      logger.error('提交申请失败', err);
      setError('提交失败，请稍后重试');
    } finally {
      setSubmitting(false);
    }
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
          申请中心
        </h1>
        <p className="mt-1 text-sm text-[#737373]">
          驭鬼者登记认证、组织加入、队长计划报名、灵异物品申领
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {APPLICATION_CARDS.map((card: ApplicationCardConfig) => (
          <ForumCard
            key={card.type}
            padding="lg"
            className="hover:border-[#d4af37] transition-colors cursor-pointer group"
          >
            <button
              onClick={() => openDialog(card.type)}
              className="w-full text-left"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-[#0a0a0a] border border-[#262626] rounded-sm text-[#d4af37] group-hover:border-[#d4af37] transition-colors">
                  {card.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-[#e5e5e5] group-hover:text-[#d4af37] transition-colors">
                    {card.title}
                  </h3>
                  <p className="mt-2 text-sm text-[#a3a3a3] leading-relaxed">
                    {card.description}
                  </p>
                </div>
              </div>
            </button>
          </ForumCard>
        ))}
      </div>

      <ForumCard padding="none">
        <div className="flex border-b border-[#262626]">
          {(['all', 'mine'] as TabType[]).map((t: TabType) => (
            <button
              key={t}
              onClick={() => {
                setTab(t);
                setPage(1);
              }}
              className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
                tab === t
                  ? 'text-[#d4af37] border-[#d4af37]'
                  : 'text-[#a3a3a3] border-transparent hover:text-[#e5e5e5]'
              }`}
            >
              {t === 'all' ? '全部申请' : '我的申请'}
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
          <div className="divide-y divide-[#262626]">
            {applications.map((app: Application) => {
              const statusInfo = STATUS_LABELS[app.status];
              const isExpanded = expandedId === app.id;
              return (
                <div key={app.id}>
                  <button
                    onClick={() =>
                      setExpandedId(isExpanded ? null : app.id)
                    }
                    className="w-full text-left p-4 hover:bg-[#1a1a1a] transition-colors"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="px-2 py-0.5 text-xs bg-[#0a0a0a] border border-[#262626] text-[#a3a3a3] rounded-sm">
                            {TYPE_LABELS[app.type]}
                          </span>
                          <span className={`text-xs font-medium ${statusInfo.className}`}>
                            {statusInfo.label}
                          </span>
                        </div>
                        <h4 className="text-sm font-medium text-[#e5e5e5] truncate">
                          {app.title}
                        </h4>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-[#737373] whitespace-nowrap">
                        <span>申请人：{app.author.displayName}</span>
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {formatDate(app.createdAt)}
                        </span>
                      </div>
                    </div>
                  </button>
                  {isExpanded && (
                    <div className="px-4 pb-4 border-t border-[#262626] bg-[#0a0a0a]/50">
                      <div className="pt-3">
                        <p className="text-xs text-[#737373] mb-1">申请内容</p>
                        <p className="text-sm text-[#a3a3a3] leading-relaxed whitespace-pre-wrap">
                          {app.content}
                        </p>
                        {app.targetOrganization && (
                          <p className="mt-3 text-sm text-[#a3a3a3]">
                            <span className="text-[#737373]">目标组织：</span>
                            {app.targetOrganization}
                          </p>
                        )}
                        {app.itemName && (
                          <p className="mt-3 text-sm text-[#a3a3a3]">
                            <span className="text-[#737373]">物品名称：</span>
                            {app.itemName}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
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

      {dialogOpen && selectedType && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#141414] border border-[#262626] rounded-sm w-full max-w-lg">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#262626]">
              <h3 className="text-base font-semibold text-[#e5e5e5]">
                {TYPE_LABELS[selectedType]}申请
              </h3>
              <button
                onClick={closeDialog}
                className="text-[#737373] hover:text-[#e5e5e5] transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm text-[#a3a3a3] mb-2">
                  申请标题
                </label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormTitle(e.target.value)
                  }
                  placeholder="请输入申请标题"
                  className="w-full bg-[#0a0a0a] border border-[#262626] text-sm text-[#e5e5e5] px-3 py-2 rounded-sm focus:outline-none focus:border-[#d4af37] placeholder:text-[#525252]"
                />
              </div>
              <div>
                <label className="block text-sm text-[#a3a3a3] mb-2">
                  申请理由
                </label>
                <textarea
                  value={formContent}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setFormContent(e.target.value)
                  }
                  placeholder="请详细说明申请理由..."
                  rows={5}
                  className="w-full bg-[#0a0a0a] border border-[#262626] text-sm text-[#e5e5e5] px-3 py-2 rounded-sm focus:outline-none focus:border-[#d4af37] placeholder:text-[#525252] resize-none"
                />
              </div>
              {selectedType === 'join_org' && (
                <div>
                  <label className="block text-sm text-[#a3a3a3] mb-2">
                    目标组织
                  </label>
                  <select
                    value={formOrg}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                      setFormOrg(e.target.value)
                    }
                    className="w-full bg-[#0a0a0a] border border-[#262626] text-sm text-[#e5e5e5] px-3 py-2 rounded-sm focus:outline-none focus:border-[#d4af37]"
                  >
                    {ORGANIZATION_OPTIONS.map((opt: string) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              {selectedType === 'item_claim' && (
                <div>
                  <label className="block text-sm text-[#a3a3a3] mb-2">
                    物品名称
                  </label>
                  <input
                    type="text"
                    value={formItemName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormItemName(e.target.value)
                    }
                    placeholder="如：鬼烛、裹尸布、八音盒..."
                    className="w-full bg-[#0a0a0a] border border-[#262626] text-sm text-[#e5e5e5] px-3 py-2 rounded-sm focus:outline-none focus:border-[#d4af37] placeholder:text-[#525252]"
                  />
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3 px-5 py-4 border-t border-[#262626]">
              <GoldButton
                variant="ghost"
                size="sm"
                onClick={closeDialog}
                disabled={submitting}
              >
                取消
              </GoldButton>
              <GoldButton
                variant="primary"
                size="sm"
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? '提交中...' : '提交申请'}
              </GoldButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationCenterPage;
