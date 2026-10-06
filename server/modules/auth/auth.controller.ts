import { Body, Controller, Post } from '@nestjs/common';
import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';

import { AuthService } from './auth.service';
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
} from '../../../shared/api.interface';

class RegisterDto implements RegisterRequest {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  username!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(128)
  password!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  displayName!: string;
}

class LoginDto implements LoginRequest {
  @IsString()
  @IsNotEmpty()
  username!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;
}

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto): Promise<LoginResponse> {
    return this.authService.register(dto);
  }

  @Post('login')
  async login(@Body() dto: LoginDto): Promise<LoginResponse> {
    return this.authService.login(dto);
  }
}
