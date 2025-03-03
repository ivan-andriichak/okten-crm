// src/database/entities/order.entity.ts
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';

import {
  CourseEnum,
  CourseFormatEnum,
  CourseTypeEnum,
  StatusEnum,
} from '../../modules/orders/enums/order.enums';
import { CommentEntity } from './comment.entity';
import { TableNameEnum } from './enums/table-name.enum';
import { GroupEntity } from './group.entity';
import { CreateUpdateModel } from './models/create-update.model';
import { UserEntity } from './user.entity';

@Entity(TableNameEnum.ORDERS)
export class OrderEntity extends CreateUpdateModel {
  @Column({ type: 'varchar', length: 25, nullable: true })
  name: string;

  @Column({ type: 'varchar', length: 25, nullable: true })
  surname: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  email: string;

  @Column('varchar', { length: 12, nullable: true })
  phone: string;

  @Column('int', { nullable: true })
  age: number;

  @Column({ nullable: true, type: 'enum', enum: CourseEnum })
  course: string;

  @Column({ type: 'enum', enum: CourseFormatEnum, default: 'static' })
  course_format: string;

  @Column({ type: 'enum', enum: CourseTypeEnum, default: 'minimal' })
  course_type: string;

  @Column({ type: 'enum', enum: StatusEnum, default: 'New' })
  status: string;

  @Column('int', { nullable: true })
  sum: number;

  @Column('int', { nullable: true })
  alreadyPaid: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  group: string;

  @ManyToOne(() => UserEntity, { nullable: true })
  @JoinColumn({ name: 'manager_id' })
  manager: UserEntity;

  @ManyToOne(() => UserEntity, (user) => user.orders, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user?: UserEntity;

  @OneToMany(() => CommentEntity, (comment) => comment.order, { cascade: true })
  comments?: CommentEntity[];

  @ManyToOne(() => GroupEntity, (group) => group.orders, { nullable: true })
  @JoinColumn({ name: 'group_id' })
  groupEntity: GroupEntity;
}
