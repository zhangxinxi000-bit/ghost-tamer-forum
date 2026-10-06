import {
  Controller,
  Get,
  Param,
  Query,
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

import { WantedService } from './wanted.service';
import type {
  DangerLevel,
  WantedListResponse,
  WantedPerson as WantedPersonDto,
  WantedStatus,
} from '../../../shared/api.interface';

class WantedListQueryDto {
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
  @IsIn(['active', 'captured', 'deceased', 'closed'])
  status?: WantedStatus;

  @IsOptional()
  @IsString()
  @IsIn(['S', 'A', 'B', 'C'])
  dangerLevel?: DangerLevel;
}

@Controller('api/wanted')
export class WantedController {
  constructor(private readonly wantedService: WantedService) {}

  @Get()
  async getList(@Query() query: WantedListQueryDto): Promise<WantedListResponse> {
    const page: number = query.page ?? 1;
    const pageSize: number = query.pageSize ?? 20;
    return this.wantedService.getList({
      page,
      pageSize,
      status: query.status,
      dangerLevel: query.dangerLevel,
    });
  }

  @Get(':id')
  async getDetail(@Param('id') id: string): Promise<WantedPersonDto> {
    return this.wantedService.getDetail(id);
  }
}
