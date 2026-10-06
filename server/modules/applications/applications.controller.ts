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

import { ApplicationsService } from './applications.service';
import { AuthGuard } from '../auth/auth.guard';
import type {
  Application as ApplicationDto,
  ApplicationListResponse,
  ApplicationType,
  ApplicationStatus,
  CreateApplicationRequest,
  ReviewApplicationRequest,
} from '../../../shared/api.interface';

class ApplicationListQueryDto {
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
  @IsIn(['registration', 'join_org', 'captain_plan', 'item_claim'])
  type?: ApplicationType;

  @IsOptional()
  @IsString()
  @IsIn(['pending', 'approved', 'rejected'])
  status?: ApplicationStatus;

  @IsOptional()
  @IsString()
  @IsIn(['true', 'false'])
  mine?: string;
}

class CreateApplicationDto implements CreateApplicationRequest {
  @IsString()
  @IsIn(['registration', 'join_org', 'captain_plan', 'item_claim'])
  type!: ApplicationType;

  @IsString()
  title!: string;

  @IsString()
  content!: string;

  @IsOptional()
  @IsString()
  targetOrganization?: string;

  @IsOptional()
  @IsString()
  itemName?: string;
}

class ReviewApplicationDto implements ReviewApplicationRequest {
  @IsString()
  @IsIn(['approved', 'rejected'])
  status!: 'approved' | 'rejected';

  @IsString()
  reviewComment!: string;
}

@Controller('api/applications')
export class ApplicationsController {
  constructor(
    private readonly applicationsService: ApplicationsService,
  ) {}

  @Get()
  async getList(
    @Query() query: ApplicationListQueryDto,
    @Req() req: { user?: { userId: string } },
  ): Promise<ApplicationListResponse> {
    const page: number = query.page ?? 1;
    const pageSize: number = query.pageSize ?? 20;
    const mine: boolean = query.mine === 'true';
    const userId: string | undefined = mine ? req.user?.userId : undefined;
    return this.applicationsService.getList({
      page,
      pageSize,
      type: query.type,
      status: query.status,
      userId,
    });
  }

  @Get(':id')
  async getDetail(@Param('id') id: string): Promise<ApplicationDto> {
    return this.applicationsService.getDetail(id);
  }

  @UseGuards(AuthGuard)
  @Post()
  async create(
    @Req() req: { user: { userId: string } },
    @Body() body: CreateApplicationDto,
  ): Promise<ApplicationDto> {
    const { userId } = req.user;
    return this.applicationsService.create(userId, body);
  }

  @UseGuards(AuthGuard)
  @Post(':id/review')
  async review(
    @Req() req: { user: { userId: string } },
    @Param('id') id: string,
    @Body() body: ReviewApplicationDto,
  ): Promise<ApplicationDto> {
    const { userId } = req.user;
    return this.applicationsService.review(id, userId, body);
  }
}
