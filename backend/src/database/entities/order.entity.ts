import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { CourseEnum, CourseFormatEnum, CourseTypeEnum } from '../../modules/orders/enums/order.enums';
import { CommentEntity } from './comment.entity';
import { TableNameEnum } from './enums/table-name.enum';
import { GroupEntity } from './group.entity';
import { UserEntity } from './user.entity';

@Entity(TableNameEnum.ORDERS)
export class OrderEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ type: 'varchar', length: 25, nullable: true })
  name: string;

  @Column({ type: 'varchar', length: 25, nullable: true })
  surname: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  email: string;

  @Column('varchar', { length: 13, nullable: true })
  phone: string;

  @Column('int', { nullable: true })
  age: number;

  @Column({ nullable: true, type: 'enum', enum: CourseEnum })
  course: string;

  @Column({ type: 'enum', enum: CourseFormatEnum, default: 'static' })
  course_format: string;

  @Column({ type: 'enum', enum: CourseTypeEnum, default: 'minimal' })
  course_type: string;

  @Column({ type: 'varchar', length: 15, nullable: true })
  status: string;

  @Column('int', { nullable: true })
  sum: number;

  @Column('int', { nullable: true })
  alreadyPaid: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  group: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  utm: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  msg: string;

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
