import { Controller, Get, Param } from '@nestjs/common';
import { BoardsService } from './boards.service';
import type { Board } from '../../../shared/api.interface';

@Controller('api/boards')
export class BoardsController {
  constructor(private readonly boardsService: BoardsService) {}

  @Get()
  async findAll(): Promise<Board[]> {
    return this.boardsService.findAll();
  }

  @Get(':slug')
  async findBySlug(@Param('slug') slug: string): Promise<Board> {
    return this.boardsService.findBySlug(slug);
  }
}
