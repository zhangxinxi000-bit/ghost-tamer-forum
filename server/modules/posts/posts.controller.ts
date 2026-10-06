import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { PostsService } from './posts.service';
import { AuthGuard } from '../auth/auth.guard';
import type {
  PostDetail,
  PostListResponse,
  ReplyListResponse,
  Reply,
  CreatePostRequest,
  CreateReplyRequest,
} from '../../../shared/api.interface';

interface AuthenticatedRequest extends Request {
  user: { userId: string };
}

@Controller('api/posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  async findPosts(
    @Query('boardId') boardId?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('sort') sort?: string,
    @Query('keyword') keyword?: string,
  ): Promise<PostListResponse> {
    const pageNum: number = page ? parseInt(page, 10) : 1;
    const pageSizeNum: number = pageSize ? parseInt(pageSize, 10) : 20;
    const validPage: number = pageNum > 0 ? pageNum : 1;
    const validPageSize: number =
      pageSizeNum > 0 && pageSizeNum <= 50 ? pageSizeNum : 20;
    const validSort: 'latest' | 'hot' = sort === 'hot' ? 'hot' : 'latest';

    return this.postsService.findPosts({
      boardId,
      page: validPage,
      pageSize: validPageSize,
      sort: validSort,
      keyword,
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<PostDetail> {
    // Increment view count first, then return detail
    await this.postsService.incrementViewCount(id);
    return this.postsService.findPostDetail(id);
  }

  @UseGuards(AuthGuard)
  @Post()
  async create(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreatePostRequest,
  ): Promise<PostDetail> {
    const { userId } = req.user;
    return this.postsService.createPost(userId, dto);
  }

  @Get(':id/replies')
  async findReplies(
    @Param('id') id: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('authorOnly') authorOnly?: string,
  ): Promise<ReplyListResponse> {
    const pageNum: number = page ? parseInt(page, 10) : 1;
    const pageSizeNum: number = pageSize ? parseInt(pageSize, 10) : 20;
    const validPage: number = pageNum > 0 ? pageNum : 1;
    const validPageSize: number =
      pageSizeNum > 0 && pageSizeNum <= 50 ? pageSizeNum : 20;
    const authorOnlyBool: boolean = authorOnly === 'true';

    return this.postsService.findReplies({
      postId: id,
      page: validPage,
      pageSize: validPageSize,
      authorOnly: authorOnlyBool,
    });
  }

  @UseGuards(AuthGuard)
  @Post(':id/replies')
  async createReply(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateReplyRequest,
  ): Promise<Reply> {
    const { userId } = req.user;
    return this.postsService.createReply(id, userId, dto);
  }
}
