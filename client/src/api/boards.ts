import { logger } from '@/lib/logger';
import { axiosForBackend } from './request';
import type { Board } from '@shared/api.interface';

export async function getBoards(): Promise<Board[]> {
  try {
    const response = await axiosForBackend({
      url: '/api/boards',
      method: 'GET',
    });
    return response.data;
  } catch (error) {
    logger.error('获取板块列表失败', error);
    throw error;
  }
}

export async function getBoard(slug: string): Promise<Board> {
  try {
    const response = await axiosForBackend({
      url: `/api/boards/${slug}`,
      method: 'GET',
    });
    return response.data;
  } catch (error) {
    logger.error(`获取板块失败: ${slug}`, error);
    throw error;
  }
}
