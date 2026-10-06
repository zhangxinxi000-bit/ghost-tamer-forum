import request from './request';
import type {
  WantedListResponse,
  WantedPerson,
} from '@shared/api.interface';

interface GetWantedParams {
  page?: number;
  pageSize?: number;
  status?: string;
  dangerLevel?: string;
}

export function getWantedList(params: GetWantedParams): Promise<WantedListResponse> {
  return request<WantedListResponse>({
    url: '/api/wanted',
    method: 'GET',
    params,
  });
}

export function getWanted(id: string): Promise<WantedPerson> {
  return request<WantedPerson>({
    url: `/api/wanted/${id}`,
    method: 'GET',
  });
}
