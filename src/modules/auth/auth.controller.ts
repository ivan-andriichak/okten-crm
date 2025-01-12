import { Body, Controller, Get, HttpCode, HttpStatus, Post, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

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
  @Get('/')
  @SkipAuth()
  public redirectToDashboardOrLogin(@Res() res: Response, @CurrentUser() user?: IUserData): void {
    if (user) {
      res.redirect('dashboard');
    } else {
      res.redirect('login');
    }
  }

  // @ApiResponse({ status: 200, description: 'Intermediate route for POST login' })
  // @Get('login')
  // @SkipAuth()
  // public redirectToLoginPage(@Res() res: Response): void {
  //   res.send(`
  //     <!DOCTYPE html>
  //     <html lang="en">
  //     <head>
  //       <meta charset="UTF-8">
  //       <meta name="viewport" content="width=device-width, initial-scale=1.0">
  //       <title>Redirecting...</title>
  //     </head>
  //     <body>
  //       <form id="loginForm" action="/login" method="POST">
  //         <input type="hidden" name="email" value="test@gmail.com">
  //         <input type="hidden" name="password" value="23qwe!@#QWE">
  //         <input type="hidden" name="deviceId"" value="550e8400-e29b-41d4-a716-446655440000">
  //       </form>
  //       <script>
  //         document.getElementById('loginForm').submit(); // Автоматичне відправлення форми
  //       </script>
  //     </body>
  //     </html>
  //   `);
  // }

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
    description: 'Користувач створений',
    type: AuthResDto,
  })
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
