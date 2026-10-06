import request from './request';
import type {
  CreateHqMissionRequest,
  HqMission,
  HqMissionListResponse,
} from '@shared/api.interface';

interface GetHqMissionsParams {
  page?: number;
  pageSize?: number;
  dangerLevel?: string;
  status?: string;
  missionType?: string;
  sort?: string;
}

export function getHqMissions(
  params: GetHqMissionsParams,
): Promise<HqMissionListResponse> {
  return request<HqMissionListResponse>({
    url: '/api/hq/missions',
    method: 'GET',
    params,
  });
}

export function getHqMission(id: string): Promise<HqMission> {
  return request<HqMission>({
    url: `/api/hq/missions/${id}`,
    method: 'GET',
  });
}

export function createHqMission(
  data: CreateHqMissionRequest,
): Promise<HqMission> {
  return request<HqMission>({
    url: '/api/hq/missions',
    method: 'POST',
    data,
  });
}
