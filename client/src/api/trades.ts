import request from './request';
import type {
  TradeListResponse,
  Trade,
  CreateTradeRequest,
} from '@shared/api.interface';

interface GetTradesParams {
  page?: number;
  pageSize?: number;
  tradeType?: string;
  status?: string;
  itemType?: string;
}

export function getTrades(params: GetTradesParams): Promise<TradeListResponse> {
  return request<TradeListResponse>({
    url: '/api/trades',
    method: 'GET',
    params,
  });
}

export function getTrade(id: string): Promise<Trade> {
  return request<Trade>({
    url: `/api/trades/${id}`,
    method: 'GET',
  });
}

export function createTrade(data: CreateTradeRequest): Promise<Trade> {
  return request<Trade>({
    url: '/api/trades',
    method: 'POST',
    data,
  });
}
