import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Express } from 'express';

import { UserEntity } from '../../database/entities/user.entity';
import { IUserData } from '../auth/interfaces/user-data.interface';
import { AuthCacheService } from '../auth/services/auth-cach.service';
import { ContentType } from '../file-storage/enums/content-type.enum';
import { FileStorageService } from '../file-storage/services/file-storage.service';
import { LoggerService } from '../logger/logger.service';
import { UserRepository } from '../repository/services/user.repository';
import { UpdateUserDto } from './dto/req/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly fileStorageService: FileStorageService,
    private readonly userRepository: UserRepository,
    private readonly authCacheService: AuthCacheService,
    private readonly logger: LoggerService,
  ) {}

  public async findMe(userData: IUserData): Promise<UserEntity> {
    this.logger.log(`findMe called for user ${userData.userId}`);
    return await this.userRepository.findOneBy({ id: userData.userId });
  }

  public async updateMe(userData: IUserData, dto: UpdateUserDto): Promise<UserEntity> {
    this.logger.log(`updateMe called for user ${userData.userId}`);
    const user = await this.userRepository.findOneBy({ id: userData.userId });
    this.userRepository.merge(user, dto);
    return await this.userRepository.save(user);
  }

  public async removeMe(userData: IUserData): Promise<void> {
    this.logger.warn(`removeMe called for user ${userData.userId}`);
    await this.userRepository.delete({ id: userData.userId });
    await this.authCacheService.deleteToken(userData.userId, userData.deviceId);
  }

  public async findOne(userId: string): Promise<UserEntity> {
    this.logger.log(`findOne called for user ${userId}`);
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }
    return user;
  }

  public async uploadAvatar(userData: IUserData, avatar: Express.Multer.File): Promise<void> {
    this.logger.log(`uploadAvatar called for user ${userData.userId}`);
    const image = await this.fileStorageService.uploadFile(avatar, ContentType.AVATAR, userData.userId);
    await this.userRepository.update(userData.userId, { image });
  }

  public async deleteAvatar(userData: IUserData): Promise<void> {
    this.logger.log(`deleteAvatar called for user ${userData.userId}`);
    const user = await this.userRepository.findOneBy({ id: userData.userId });
    if (user.image) {
      await this.fileStorageService.deleteFile(user.image);
      await this.userRepository.save(this.userRepository.merge(user, { image: null }));
    }
  }

  public async isEmailExistOrThrow(email: string): Promise<void> {
    const user = await this.userRepository.findOneBy({ email });
    if (user) {
      throw new ConflictException('Email already exists');
    }
  }
}
