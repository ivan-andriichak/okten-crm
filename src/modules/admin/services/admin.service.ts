import { Injectable } from '@nestjs/common';

@Injectable()
export class AdminService {
  // constructor(
  //   private readonly logger: LoggerService,
  //   private readonly userRepository: UserRepository,
  //   private readonly tokenService: TokenService,
  //   private readonly userService: UsersService,
  //   private readonly refreshTokenRepository: RefreshTokenRepository,
  //   private readonly authCacheService: AuthCacheService
  // ) {}
  // public async createDefaultAdmin(): Promise<AuthResDto> {
  //   const defaultAdminEmail = 'admin@gmail.com';
  //   const defaultAdminPassword = 'admin';
  //   const deviceId = 'default-device-id'; // Тут можна задати будь-який дефолтний deviceId
  //
  //   try {
  //     // Перевірка чи існує вже адмін
  //     await this.userService.isEmailExistOrThrow(defaultAdminEmail); // Викликаємо перевірку на наявність email
  //
  //     // Якщо адмін не існує, створюємо нового
  //     const hashedPassword = await bcrypt.hash(defaultAdminPassword, 10);
  //
  //     // // Створюємо DTO з дефолтними значеннями
  //     // const dto: RegisterReqDto = {
  //     //   email: defaultAdminEmail,
  //     //   password: hashedPassword,
  //     //   deviceId: deviceId,
  //     // };
  //
  //     // Створюємо користувача з роллю ADMIN
  //     const user = await this.userRepository.save(
  //       this.userRepository.create({
  //         ...dto,
  //         role: Role.ADMIN, // Вказуємо роль адміна
  //         name: 'Admin',
  //         surname: 'Default',
  //       })
  //     );
  //
  //     // Генерація токенів після створення користувача
  //     const tokens = await this.tokenService.generateAuthTokens({
  //       userId: user.id,
  //       deviceId: dto.deviceId,
  //     });
  //
  //     // Збереження refresh токену та access токену в базі
  //     await Promise.all([
  //       this.refreshTokenRepository.save({
  //         deviceId: dto.deviceId,
  //         refreshToken: tokens.refreshToken,
  //         user_id: user.id,
  //       }),
  //       this.authCacheService.saveToken(tokens.accessToken, user.id, dto.deviceId),
  //     ]);
  //
  //     return { user: UserMapper.toResponseDTO(user), tokens };
  //   } catch (error) {
  //     this.logger.error('Registration failed', error.stack);
  //     throw new Error('Registration failed');
  //   }
  // }
}
