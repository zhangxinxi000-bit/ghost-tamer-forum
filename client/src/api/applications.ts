import request from './request';
import type {
  ApplicationListResponse,
  Application,
  CreateApplicationRequest,
  ReviewApplicationRequest,
} from '@shared/api.interface';

interface GetApplicationsParams {
  page?: number;
  pageSize?: number;
  type?: string;
  status?: string;
  mine?: boolean;
}

export function getApplications(
  params: GetApplicationsParams,
): Promise<ApplicationListResponse> {
  return request<ApplicationListResponse>({
    url: '/api/applications',
    method: 'GET',
    params,
  });
}

export function getApplication(id: string): Promise<Application> {
  return request<Application>({
    url: `/api/applications/${id}`,
    method: 'GET',
  });
}

export function createApplication(
  data: CreateApplicationRequest,
): Promise<Application> {
  return request<Application>({
    url: '/api/applications',
    method: 'POST',
    data,
  });
}

export function reviewApplication(
  id: string,
  data: ReviewApplicationRequest,
): Promise<Application> {
  return request<Application>({
    url: `/api/applications/${id}/review`,
    method: 'POST',
    data,
  });
}
