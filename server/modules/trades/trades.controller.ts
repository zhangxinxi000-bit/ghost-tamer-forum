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

import { TradesService } from './trades.service';
import { AuthGuard } from '../auth/auth.guard';
import type {
  CreateTradeRequest,
  Trade as TradeDto,
  TradeListResponse,
  TradeStatus,
  TradeType,
} from '../../../shared/api.interface';

class TradeListQueryDto {
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
  @IsIn(['sell', 'buy', 'exchange'])
  tradeType?: TradeType;

  @IsOptional()
  @IsString()
  itemType?: string;

  @IsOptional()
  @IsString()
  @IsIn(['open', 'closed', 'completed'])
  status?: TradeStatus;
}

class CreateTradeDto implements CreateTradeRequest {
  @IsString()
  title!: string;

  @IsString()
  content!: string;

  @IsString()
  @IsIn(['sell', 'buy', 'exchange'])
  tradeType!: TradeType;

  @IsString()
  itemType!: string;

  @IsOptional()
  @IsString()
  price?: string;
}

@Controller('api/trades')
export class TradesController {
  constructor(private readonly tradesService: TradesService) {}

  @Get()
  async getList(@Query() query: TradeListQueryDto): Promise<TradeListResponse> {
    const page: number = query.page ?? 1;
    const pageSize: number = query.pageSize ?? 20;
    return this.tradesService.getList({
      page,
      pageSize,
      tradeType: query.tradeType,
      itemType: query.itemType,
      status: query.status,
    });
  }

  @Get(':id')
  async getDetail(@Param('id') id: string): Promise<TradeDto> {
    return this.tradesService.getDetail(id);
  }

  @UseGuards(AuthGuard)
  @Post()
  async create(
    @Req() req: { user: { userId: string } },
    @Body() body: CreateTradeDto,
  ): Promise<TradeDto> {
    const { userId } = req.user;
    return this.tradesService.create(userId, body);
  }
}
