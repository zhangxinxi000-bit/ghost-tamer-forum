import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import { IsInt, IsOptional, IsString, MaxLength } from 'class-validator';
import type { Request } from 'express';

import { AuthGuard } from '../auth/auth.guard';
import { UsersService } from './users.service';
import type { ForumUser, UpdateProfileRequest } from '../../../shared/api.interface';

class UpdateProfileDto implements UpdateProfileRequest {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  displayName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  organization?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  position?: string;

  @IsOptional()
  @IsString()
  ghostInfo?: string;

  @IsOptional()
  @IsString()
  ghostItems?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  realName?: string;

  @IsOptional()
  @IsInt()
  age?: number;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  dangerLevelSelf?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  avatar?: string;
}

@Controller('api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @UseGuards(AuthGuard)
  async getMe(@Req() req: Request): Promise<ForumUser> {
    const userId: string = req.user!.userId;
    return this.usersService.findById(userId);
  }

  @Patch('me')
  @UseGuards(AuthGuard)
  async updateMe(
    @Req() req: Request,
    @Body() dto: UpdateProfileDto,
  ): Promise<ForumUser> {
    const userId: string = req.user!.userId;
    return this.usersService.updateProfile(userId, dto);
  }

  @Get('profile/:username')
  async getByUsername(@Param('username') username: string): Promise<ForumUser> {
    return this.usersService.findByUsername(username);
  }

  @Get(':id')
  async getById(@Param('id') id: string): Promise<ForumUser> {
    return this.usersService.findById(id);
  }
}
