import {
  Controller,
  Get,
  Param,
  Query,
} from '@nestjs/common';
import {
  IsInt,
  IsOptional,
  Max,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

import { AnnouncementsService } from './announcements.service';
import type {
  Announcement as AnnouncementDto,
  AnnouncementListResponse,
} from '../../../shared/api.interface';

class AnnouncementListQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number;
}

@Controller('api/announcements')
export class AnnouncementsController {
  constructor(private readonly announcementsService: AnnouncementsService) {}

  @Get()
  async getList(
    @Query() query: AnnouncementListQueryDto,
  ): Promise<AnnouncementListResponse> {
    const page: number = query.page ?? 1;
    const pageSize: number = query.pageSize ?? 20;
    return this.announcementsService.getList({ page, pageSize });
  }

  @Get(':id')
  async getDetail(@Param('id') id: string): Promise<AnnouncementDto> {
    return this.announcementsService.getDetail(id);
  }
}
