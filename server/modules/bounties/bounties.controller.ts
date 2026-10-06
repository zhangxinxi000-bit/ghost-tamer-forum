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
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

import { BountiesService } from './bounties.service';
import { AuthGuard } from '../auth/auth.guard';
import type {
  Bounty as BountyDto,
  BountyListResponse,
  BountyStatus,
  CreateBountyRequest,
  DangerLevel,
} from '../../../shared/api.interface';

class BountyListQueryDto {
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
  @IsIn(['open', 'in_progress', 'resolved', 'failed', 'closed'])
  status?: BountyStatus;

  @IsOptional()
  @IsString()
  @IsIn(['latest', 'reward'])
  sort?: 'latest' | 'reward';
}

class CreateBountyDto implements CreateBountyRequest {
  @IsString()
  title!: string;

  @IsString()
  description!: string;

  @IsString()
  @IsIn(['S', 'A', 'B', 'C'])
  dangerLevel!: DangerLevel;

  @Type(() => Number)
  @IsInt()
  reward!: number;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  ghostName?: string;

  @IsOptional()
  @IsString()
  ghostRules?: string;
}

@Controller('api/bounties')
export class BountiesController {
  constructor(private readonly bountiesService: BountiesService) {}

  @Get()
  async getList(@Query() query: BountyListQueryDto): Promise<BountyListResponse> {
    const page: number = query.page ?? 1;
    const pageSize: number = query.pageSize ?? 20;
    return this.bountiesService.getList({
      page,
      pageSize,
      dangerLevel: query.dangerLevel,
      status: query.status,
      sort: query.sort,
    });
  }

  @Get(':id')
  async getDetail(@Param('id') id: string): Promise<BountyDto> {
    return this.bountiesService.getDetail(id);
  }

  @UseGuards(AuthGuard)
  @Post()
  async create(
    @Req() req: { user: { userId: string } },
    @Body() body: CreateBountyDto,
  ): Promise<BountyDto> {
    const { userId } = req.user;
    return this.bountiesService.create(userId, body);
  }
}
