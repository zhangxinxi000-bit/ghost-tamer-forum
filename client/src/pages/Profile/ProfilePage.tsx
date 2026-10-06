import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { logger } from '@/lib/logger';
import GoldButton from '@client/src/components/ui/GoldButton';
import ForumCard from '@client/src/components/ui/ForumCard';
import { useAuth } from '@client/src/context/AuthContext';
import { usersApi } from '@client/src/api';
import type {
  ForumUser,
  UpdateProfileRequest,
  DangerLevelSelf,
} from '@shared/api.interface';
import { Image } from '@client/src/components/ui/image';

const ProfilePage: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const { user: currentUser, updateProfile } = useAuth();
  const [profileUser, setProfileUser] = useState<ForumUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);

  const [editData, setEditData] = useState<UpdateProfileRequest>({
    displayName: '',
    realName: '',
    city: '',
    organization: '',
    position: '',
    ghostInfo: '',
    ghostItems: '',
    dangerLevelSelf: 'normal',
    bio: '',
  });

  const isOwnProfile = currentUser?.username === profileUser?.username;

  useEffect(() => {
    const fetchProfile = async (): Promise<void> => {
      if (!username) return;
      setLoading(true);
      setError('');
      try {
        const user: ForumUser = await usersApi.getUserByUsername(username);
        setProfileUser(user);
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : '获取用户信息失败';
        setError(message);
        logger.error('获取用户信息失败', err);
      } finally {
        setLoading(false);
      }
    };

    void fetchProfile();
  }, [username]);

  const handleEditClick = (): void => {
    if (!profileUser) return;
    setEditData({
      displayName: profileUser.displayName,
      realName: profileUser.realName ?? '',
      city: profileUser.city ?? '',
      organization: profileUser.organization ?? '',
      position: profileUser.position ?? '',
      ghostInfo: profileUser.ghostInfo ?? '',
      ghostItems: profileUser.ghostItems ?? '',
      age: profileUser.age ?? undefined,
      dangerLevelSelf: profileUser.dangerLevelSelf ?? 'normal',
      bio: profileUser.bio ?? '',
    });
    setIsEditing(true);
  };

  const handleEditChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ): void => {
    const { name, value, type } = e.target;
    if (type === 'number') {
      const numValue: number | undefined =
        value === '' ? undefined : Number(value);
      setEditData((prev) => ({ ...prev, [name]: numValue }));
    } else {
      setEditData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSelectChange = (
    e: React.ChangeEvent<HTMLSelectElement>,
  ): void => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (): Promise<void> => {
    setSaving(true);
    setError('');
    try {
      const updated: ForumUser = await updateProfile(editData);
      setProfileUser(updated);
      setIsEditing(false);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : '保存失败，请稍后重试';
      setError(message);
      logger.error('更新资料失败', err);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = (): void => {
    setIsEditing(false);
    setError('');
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const getArchiveId = (id: string): string => {
    return 'YGR-' + id.slice(0, 8).toUpperCase();
  };

  const getDangerLevelConfig = (
    level: string | null,
  ): { label: string; bg: string } => {
    switch (level as DangerLevelSelf) {
      case 'dangerous':
        return { label: '危险', bg: 'bg-[#ea580c]' };
      case 'extremely_dangerous':
        return { label: '极度危险', bg: 'bg-[#dc2626]' };
      case 'normal':
      default:
        return { label: '普通', bg: 'bg-[#525252]' };
    }
  };

  if (loading) {
    return (
      <div className="py-12 text-center text-[#737373]">
        加载中...
      </div>
    );
  }

  if (error && !profileUser) {
    return (
      <div className="py-12 text-center text-[#dc2626] text-sm">
        {error}
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="py-12 text-center text-[#737373]">
        用户不存在
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ForumCard padding="lg">
        <div className="flex flex-col md:flex-row gap-6">
          {/* 左侧：头像 + 统计 */}
          <div className="md:w-64 flex-shrink-0 flex flex-col items-center md:items-start">
            <div className="w-24 h-24 rounded-full bg-[#262626] flex items-center justify-center mb-4 border-2 border-[#262626] overflow-hidden">
              {profileUser.avatar ? (
                <Image
                  src={profileUser.avatar}
                  alt={profileUser.displayName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-[#737373] text-3xl font-semibold">
                  {profileUser.displayName.charAt(0).toUpperCase()}
                </span>
              )}
            </div>

            <h2 className="text-xl font-semibold text-[#e5e5e5] text-center md:text-left">
              {profileUser.displayName}
            </h2>
            <p className="text-[#737373] text-sm mt-1 text-center md:text-left">
              @{profileUser.username}
            </p>

            <div className="mt-3 text-center md:text-left">
              <span className="text-[#d4af37] font-mono text-sm tracking-wider">
                {getArchiveId(profileUser.id)}
              </span>
            </div>

            {isOwnProfile && !isEditing && (
              <GoldButton
                onClick={handleEditClick}
                className="mt-4 w-full md:w-auto"
              >
                编辑资料
              </GoldButton>
            )}

            {/* 统计数据 */}
            <div className="w-full mt-6 pt-6 border-t border-[#262626] space-y-3">
              <div className="flex justify-between">
                <span className="text-[#737373] text-sm">声望</span>
                <span className="text-[#d4af37] text-sm font-medium">
                  {profileUser.reputation}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#737373] text-sm">发帖数</span>
                <span className="text-[#e5e5e5] text-sm">
                  {profileUser.postCount}
                </span>
              </div>
              <div className="flex justify-between">
                 <span className="text-[#737373] text-sm">加入时间</span>
                 <span className="text-[#a3a3a3] text-sm">
                   {formatDate(profileUser.createdAt)}
                 </span>
               </div>
            </div>
          </div>

          {/* 右侧：详细信息 */}
          <div className="flex-1 border-t md:border-t-0 md:border-l border-[#262626] pt-6 md:pt-0 md:pl-6">
            {error && isEditing && (
              <div className="mb-4 text-red-500 text-sm">{error}</div>
            )}

            {isEditing ? (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-[#e5e5e5] mb-4">
                  编辑资料
                </h3>

                <div className="space-y-2">
                  <label
                    htmlFor="displayName"
                    className="block text-[#a3a3a3] text-sm"
                  >
                    昵称
                  </label>
                  <input
                    id="displayName"
                    name="displayName"
                    type="text"
                    value={editData.displayName ?? ''}
                    onChange={handleEditChange}
                    className="w-full bg-[#0a0a0a] border border-[#262626] text-[#e5e5e5] rounded-sm px-3 py-2 h-10 focus:border-[#d4af37] outline-none transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="city"
                    className="block text-[#a3a3a3] text-sm"
                  >
                    所在城市
                  </label>
                  <input
                    id="city"
                    name="city"
                    type="text"
                    value={editData.city ?? ''}
                    onChange={handleEditChange}
                    className="w-full bg-[#0a0a0a] border border-[#262626] text-[#e5e5e5] rounded-sm px-3 py-2 h-10 focus:border-[#d4af37] outline-none transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="organization"
                    className="block text-[#a3a3a3] text-sm"
                  >
                    所属组织
                  </label>
                  <input
                    id="organization"
                    name="organization"
                    type="text"
                    value={editData.organization ?? ''}
                    onChange={handleEditChange}
                    className="w-full bg-[#0a0a0a] border border-[#262626] text-[#e5e5e5] rounded-sm px-3 py-2 h-10 focus:border-[#d4af37] outline-none transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="position"
                    className="block text-[#a3a3a3] text-sm"
                  >
                    职务
                  </label>
                  <input
                    id="position"
                    name="position"
                    type="text"
                    value={editData.position ?? ''}
                    onChange={handleEditChange}
                    placeholder="如：总部行动队长、国际刑警、文职人员等"
                    className="w-full bg-[#0a0a0a] border border-[#262626] text-[#e5e5e5] rounded-sm px-3 py-2 h-10 focus:border-[#d4af37] outline-none transition-colors"
                  />
                </div>

                <div className="space-y-2">
                   <label
                     htmlFor="realName"
                     className="block text-[#a3a3a3] text-sm"
                   >
                     真实姓名
                   </label>
                   <input
                     id="realName"
                     name="realName"
                     type="text"
                     value={editData.realName ?? ''}
                     onChange={handleEditChange}
                     className="w-full bg-[#0a0a0a] border border-[#262626] text-[#e5e5e5] rounded-sm px-3 py-2 h-10 focus:border-[#d4af37] outline-none transition-colors"
                   />
                 </div>

                 <div className="space-y-2">
                   <label
                     htmlFor="age"
                     className="block text-[#a3a3a3] text-sm"
                   >
                     年龄
                   </label>
                   <input
                     id="age"
                     name="age"
                     type="number"
                     min="0"
                     max="150"
                     value={editData.age ?? ''}
                     onChange={handleEditChange}
                     className="w-full bg-[#0a0a0a] border border-[#262626] text-[#e5e5e5] rounded-sm px-3 py-2 h-10 focus:border-[#d4af37] outline-none transition-colors"
                   />
                 </div>

                 <div className="space-y-2">
                   <label
                     htmlFor="ghostInfo"
                     className="block text-[#a3a3a3] text-sm"
                   >
                     驾驭的厉鬼
                   </label>
                   <textarea
                     id="ghostInfo"
                     name="ghostInfo"
                     value={editData.ghostInfo ?? ''}
                     onChange={handleEditChange}
                     rows={3}
                     placeholder="每行描述一只驾驭的厉鬼及其能力"
                     className="w-full bg-[#0a0a0a] border border-[#262626] text-[#e5e5e5] rounded-sm px-3 py-2 focus:border-[#d4af37] outline-none transition-colors resize-none"
                   />
                 </div>

                 <div className="space-y-2">
                   <label
                     htmlFor="ghostItems"
                     className="block text-[#a3a3a3] text-sm"
                   >
                     持有的灵异物品
                   </label>
                   <textarea
                     id="ghostItems"
                     name="ghostItems"
                     value={editData.ghostItems ?? ''}
                     onChange={handleEditChange}
                     rows={3}
                     placeholder="每行描述一件持有的灵异物品"
                     className="w-full bg-[#0a0a0a] border border-[#262626] text-[#e5e5e5] rounded-sm px-3 py-2 focus:border-[#d4af37] outline-none transition-colors resize-none"
                   />
                 </div>

                 <div className="space-y-2">
                   <label
                     htmlFor="dangerLevelSelf"
                     className="block text-[#a3a3a3] text-sm"
                   >
                     危险程度自评
                   </label>
                   <select
                     id="dangerLevelSelf"
                     name="dangerLevelSelf"
                     value={editData.dangerLevelSelf ?? 'normal'}
                     onChange={handleSelectChange}
                     className="w-full bg-[#0a0a0a] border border-[#262626] text-[#e5e5e5] rounded-sm px-3 py-2 h-10 focus:border-[#d4af37] outline-none transition-colors appearance-none cursor-pointer"
                   >
                     <option value="normal">普通</option>
                     <option value="dangerous">危险</option>
                     <option value="extremely_dangerous">极度危险</option>
                   </select>
                 </div>

                 <div className="space-y-2">
                   <label
                     htmlFor="bio"
                     className="block text-[#a3a3a3] text-sm"
                   >
                     个人简介
                   </label>
                   <textarea
                     id="bio"
                     name="bio"
                     value={editData.bio ?? ''}
                     onChange={handleEditChange}
                     rows={4}
                     className="w-full bg-[#0a0a0a] border border-[#262626] text-[#e5e5e5] rounded-sm px-3 py-2 focus:border-[#d4af37] outline-none transition-colors resize-none"
                   />
                 </div>

                <div className="flex gap-3 pt-2">
                  <GoldButton onClick={handleSave} disabled={saving}>
                    {saving ? '保存中...' : '保存'}
                  </GoldButton>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-4 py-2 h-9 text-[#a3a3a3] border border-[#262626] rounded-sm hover:bg-[#1a1a1a] hover:text-[#e5e5e5] transition-colors text-sm"
                  >
                    取消
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                 <div>
                   <h3 className="text-sm font-semibold text-[#d4af37] mb-3 pb-2 border-b border-[#262626] tracking-wider">
                     基本信息
                   </h3>
                   <div className="space-y-3">
                     <div className="flex justify-between items-start">
                       <span className="text-[#737373] text-sm">代号</span>
                       <span className="text-[#e5e5e5] text-sm text-right">
                         {profileUser.displayName}
                       </span>
                     </div>
                     <div className="flex justify-between items-start">
                       <span className="text-[#737373] text-sm">真实姓名</span>
                       <span className="text-[#e5e5e5] text-sm text-right">
                         {profileUser.realName || '未填写'}
                       </span>
                     </div>
                     <div className="flex justify-between items-start">
                       <span className="text-[#737373] text-sm">年龄</span>
                       <span className="text-[#e5e5e5] text-sm text-right">
                         {profileUser.age ?? '未填写'}
                       </span>
                     </div>
                     <div className="flex justify-between items-start">
                       <span className="text-[#737373] text-sm">所在城市</span>
                       <span className="text-[#e5e5e5] text-sm text-right">
                         {profileUser.city || '未填写'}
                       </span>
                     </div>
                     <div className="flex justify-between items-start">
                       <span className="text-[#737373] text-sm">所属组织</span>
                       <span className="text-[#e5e5e5] text-sm text-right">
                         {profileUser.organization || '未填写'}
                       </span>
                     </div>
                     <div className="flex justify-between items-start">
                       <span className="text-[#737373] text-sm">职务</span>
                       <span className="text-[#e5e5e5] text-sm text-right">
                         {profileUser.position || '未填写'}
                       </span>
                     </div>
                   </div>
                 </div>

                 <div>
                   <h3 className="text-sm font-semibold text-[#d4af37] mb-3 pb-2 border-b border-[#262626] tracking-wider">
                     灵异档案
                   </h3>
                   <div className="space-y-3">
                     <div>
                       <div className="text-[#737373] text-sm mb-1">驾驭的厉鬼</div>
                       <div className="text-[#e5e5e5] text-sm whitespace-pre-wrap">
                         {profileUser.ghostInfo || '未填写'}
                       </div>
                     </div>
                     <div>
                       <div className="text-[#737373] text-sm mb-1">持有的灵异物品</div>
                       <div className="text-[#e5e5e5] text-sm whitespace-pre-wrap">
                         {profileUser.ghostItems || '未填写'}
                       </div>
                     </div>
                     <div className="flex justify-between items-center">
                       <span className="text-[#737373] text-sm">危险程度自评</span>
                       <span
                         className={`${getDangerLevelConfig(profileUser.dangerLevelSelf).bg} text-white text-xs px-2 py-0.5 rounded-[2px] font-medium`}
                       >
                         {getDangerLevelConfig(profileUser.dangerLevelSelf).label}
                       </span>
                     </div>
                   </div>
                 </div>

                 <div>
                   <h3 className="text-sm font-semibold text-[#d4af37] mb-3 pb-2 border-b border-[#262626] tracking-wider">
                     个人简介
                   </h3>
                   <div className="text-[#e5e5e5] text-sm whitespace-pre-wrap leading-relaxed">
                     {profileUser.bio || '未填写'}
                   </div>
                 </div>
               </div>
            )}
          </div>
        </div>
      </ForumCard>
    </div>
  );
};

export default ProfilePage;
