import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { GroupEntity } from '../../database/entities/group.entity';
import { AuthModule } from '../auth/auth.module';
import { GroupController } from './group.controller';
import { GroupService } from './services/group.services';

@Module({
  imports: [TypeOrmModule.forFeature([GroupEntity]), AuthModule],
  providers: [GroupService],
  controllers: [GroupController],
  exports: [GroupService],
})
export class GroupModule {}
