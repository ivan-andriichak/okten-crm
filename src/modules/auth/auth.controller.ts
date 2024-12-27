import { Body, Controller, Get, HttpCode, HttpStatus, Post, Redirect, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';

import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { AdminService } from '../admin/services/admin.service';
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
  @ApiResponse({
    status: 302,
    description: 'Перенаправляє на сторінку входу або на панель керування в залежності від статусу автентифікації',
  })
  @Get('/')
  @Redirect()
  public redirectToLogin(@CurrentUser() user?: IUserData): { url: string; statusCode: number } {
    return {
      url: user ? '/dashboard' : '/login',
      statusCode: 302,
    };
  }

  constructor(
    private readonly authService: AuthService,
    private readonly adminService: AdminService
  ) {}

  @ApiResponse({ status: HttpStatus.FOUND, description: 'Admin created successfully' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Admin already exists' })
  @Roles(Role.ADMIN)
  @Get('create-admin')
  public async createDefaultAdmin(): Promise<string> {
    return await this.adminService.createDefaultAdmin();
  }

  @Roles(Role.ADMIN)
  @SkipAuth()
  @Post('register')
  public async register(@Body() dto: RegisterReqDto): Promise<AuthResDto> {
    return await this.authService.register(dto);
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
