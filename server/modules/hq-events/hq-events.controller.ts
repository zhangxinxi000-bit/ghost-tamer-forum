import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

import { HqEventsService } from './hq-events.service';
import { AuthGuard } from '../auth/auth.guard';
import type {
  HqEvent as HqEventDto,
  HqEventListResponse,
  HqEventStatus,
  DangerLevel,
} from '../../../shared/api.interface';

class HqEventListQueryDto {
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

  @IsOptional()
  @IsString()
  @IsIn(['S', 'A', 'B', 'C'])
  dangerLevel?: DangerLevel;

  @IsOptional()
  @IsString()
  @IsIn(['active', 'contained', 'resolved', 'failed', 'closed'])
  status?: HqEventStatus;

  @IsOptional()
  @IsString()
  @IsIn(['latest', 'views'])
  sort?: 'latest' | 'views';
}

class CreateHqEventDto {
  @IsString()
  title!: string;

  @IsString()
  content!: string;

  @IsString()
  @IsIn(['S', 'A', 'B', 'C'])
  dangerLevel!: DangerLevel;

  @IsOptional()
  @IsString()
  eventLocation?: string;

  @IsOptional()
  @IsString()
  ghostName?: string;

  @IsOptional()
  @IsString()
  ghostRules?: string;

  @IsOptional()
  @IsString()
  @IsIn(['active', 'contained', 'resolved', 'failed', 'closed'])
  status?: HqEventStatus;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isPinned?: boolean;
}

@Controller('api/hq/events')
export class HqEventsController {
  constructor(private readonly hqEventsService: HqEventsService) {}

  @Get()
  async getList(@Query() query: HqEventListQueryDto): Promise<HqEventListResponse> {
    const page: number = query.page ?? 1;
    const pageSize: number = query.pageSize ?? 20;
    return this.hqEventsService.getList({
      page,
      pageSize,
      dangerLevel: query.dangerLevel,
      status: query.status,
      sort: query.sort,
    });
  }

  @Get(':id')
  async getDetail(@Param('id') id: string): Promise<HqEventDto> {
    return this.hqEventsService.getDetail(id);
  }

  @UseGuards(AuthGuard)
  @Post()
  async create(
    @Req() req: { user: { userId: string } },
    @Body() body: CreateHqEventDto,
  ): Promise<HqEventDto> {
    const { userId } = req.user;
    return this.hqEventsService.create(userId, body);
  }
}
