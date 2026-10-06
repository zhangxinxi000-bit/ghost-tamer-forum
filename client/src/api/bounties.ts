import request from './request';
import type {
  BountyListResponse,
  Bounty,
  CreateBountyRequest,
} from '@shared/api.interface';

interface GetBountiesParams {
  page?: number;
  pageSize?: number;
  status?: string;
  dangerLevel?: string;
  sort?: string;
}

export function getBounties(params: GetBountiesParams): Promise<BountyListResponse> {
  return request<BountyListResponse>({
    url: '/api/bounties',
    method: 'GET',
    params,
  });
}

export function getBounty(id: string): Promise<Bounty> {
  return request<Bounty>({
    url: `/api/bounties/${id}`,
    method: 'GET',
  });
}

export function createBounty(data: CreateBountyRequest): Promise<Bounty> {
  return request<Bounty>({
    url: '/api/bounties',
    method: 'POST',
    data,
  });
}
