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

import { HqMissionsService } from './hq-missions.service';
import { AuthGuard } from '../auth/auth.guard';
import type {
  CreateHqMissionRequest,
  DangerLevel,
  HqMission as HqMissionDto,
  HqMissionListResponse,
  HqMissionStatus,
  HqMissionType,
} from '../../../shared/api.interface';

class HqMissionListQueryDto {
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
  @IsIn(['pending', 'in_progress', 'completed', 'failed', 'cancelled'])
  status?: HqMissionStatus;

  @IsOptional()
  @IsString()
  @IsIn(['support', 'containment', 'transport', 'investigation', 'other'])
  missionType?: HqMissionType;

  @IsOptional()
  @IsString()
  @IsIn(['latest', 'reward'])
  sort?: 'latest' | 'reward';
}

class CreateHqMissionDto implements CreateHqMissionRequest {
  @IsString()
  title!: string;

  @IsString()
  content!: string;

  @IsOptional()
  @IsString()
  @IsIn(['support', 'containment', 'transport', 'investigation', 'other'])
  missionType!: HqMissionType;

  @IsString()
  @IsIn(['S', 'A', 'B', 'C'])
  dangerLevel!: DangerLevel;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  requirements?: string;

  @IsOptional()
  @IsString()
  @IsIn(['pending', 'in_progress', 'completed', 'failed', 'cancelled'])
  status?: HqMissionStatus;

  @Type(() => Number)
  @IsInt()
  reward!: number;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isPinned?: boolean;
}

@Controller('api/hq/missions')
export class HqMissionsController {
  constructor(private readonly hqMissionsService: HqMissionsService) {}

  @Get()
  async getList(
    @Query() query: HqMissionListQueryDto,
  ): Promise<HqMissionListResponse> {
    const page: number = query.page ?? 1;
    const pageSize: number = query.pageSize ?? 20;
    return this.hqMissionsService.getList({
      page,
      pageSize,
      dangerLevel: query.dangerLevel,
      status: query.status,
      missionType: query.missionType,
      sort: query.sort,
    });
  }

  @Get(':id')
  async getDetail(@Param('id') id: string): Promise<HqMissionDto> {
    return this.hqMissionsService.getDetail(id);
  }

  @UseGuards(AuthGuard)
  @Post()
  async create(
    @Req() req: { user: { userId: string } },
    @Body() body: CreateHqMissionDto,
  ): Promise<HqMissionDto> {
    const { userId } = req.user;
    return this.hqMissionsService.create(userId, body);
  }
}
