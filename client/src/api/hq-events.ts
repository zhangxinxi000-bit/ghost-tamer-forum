import request from './request';
import type {
  HqEventListResponse,
  HqEvent,
} from '@shared/api.interface';

interface GetHqEventsParams {
  page?: number;
  pageSize?: number;
  status?: string;
  dangerLevel?: string;
  sort?: string;
}

interface CreateHqEventData {
  title: string;
  content: string;
  dangerLevel: string;
  eventLocation?: string;
  ghostName?: string;
  ghostRules?: string;
  status?: string;
  isPinned?: boolean;
}

export function getHqEvents(params: GetHqEventsParams): Promise<HqEventListResponse> {
  return request<HqEventListResponse>({
    url: '/api/hq/events',
    method: 'GET',
    params,
  });
}

export function getHqEvent(id: string): Promise<HqEvent> {
  return request<HqEvent>({
    url: `/api/hq/events/${id}`,
    method: 'GET',
  });
}

export function createHqEvent(data: CreateHqEventData): Promise<HqEvent> {
  return request<HqEvent>({
    url: '/api/hq/events',
    method: 'POST',
    data,
  });
}
