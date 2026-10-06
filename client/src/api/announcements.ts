import request from './request';
import type {
  AnnouncementListResponse,
  Announcement,
} from '@shared/api.interface';

interface GetAnnouncementsParams {
  page?: number;
  pageSize?: number;
}

export function getAnnouncements(
  params: GetAnnouncementsParams,
): Promise<AnnouncementListResponse> {
  return request<AnnouncementListResponse>({
    url: '/api/announcements',
    method: 'GET',
    params,
  });
}

export function getAnnouncement(id: string): Promise<Announcement> {
  return request<Announcement>({
    url: `/api/announcements/${id}`,
    method: 'GET',
  });
}
