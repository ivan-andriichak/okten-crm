import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Redirect,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from './decorators/current-user.decorator';
import { SkipAuth } from './decorators/skip-auth.decorator';
import { LoginReqDto } from './dto/req/login.req.dto';
import { RegisterReqDto } from './dto/req/register.req.dto';
import { AuthResDto } from './dto/res/auth.res.dto';
import { TokenPairResDto } from './dto/res/token-pair.res.dto';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { IUserData } from './interfaces/user-data.interface';
import { AuthService } from './services/auth.service';

@ApiTags('Auth')
@Controller('/')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiResponse({
    status: 302,
    description: 'Redirect to login page if user is not authenticated, otherwise redirect to dashboard',
  })
  @SkipAuth()
  @Get()
  @Redirect('/login', 302)
  redirectToLogin() {
    return;
  }

  @ApiResponse({ status: HttpStatus.FOUND, description: 'Admin created successfully' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Admin already exists' })
  @SkipAuth()
  @Get('create-admin')
  public async createDefaultAdmin(): Promise<AuthResDto> {
    return await this.authService.createDefaultAdmin();
  }

  @SkipAuth()
  @ApiResponse({
    status: 201,
    description: 'user created successfully',
    type: AuthResDto,
  })
  @Post('register')
  public async register(@Body() dto: RegisterReqDto): Promise<AuthResDto> {
    return await this.authService.register(dto);
  }

  @ApiBearerAuth()
  @SkipAuth()
  @Get('check-auth')
  public async checkAuth(@CurrentUser() userData: IUserData): Promise<void> {
    if (!userData) {
      throw new UnauthorizedException();
    }
  }

  @SkipAuth()
  @Post('login')
  public async login(@Body() dto: LoginReqDto): Promise<AuthResDto> {
    return await this.authService.login(dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtRefreshGuard)
  @SkipAuth()
  @Post('refresh')
  public async refresh(@CurrentUser() userData: IUserData): Promise<TokenPairResDto> {
    return await this.authService.refresh(userData);
  }

  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('logOut')
  public async logOut(@CurrentUser() userData: IUserData): Promise<void> {
    await this.authService.logOut(userData);
  }
}
