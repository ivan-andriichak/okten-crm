import { Column, Entity, OneToMany } from 'typeorm';

import { Role } from '../../common/enums/role.enum';
import { CommentEntity } from './comment.entity';
import { TableNameEnum } from './enums/table-name.enum';
import { CreateUpdateModel } from './models/create-update.model';
import { OrderEntity } from './order.entity';
import { RefreshTokenEntity } from './refresh-token.entity';

@Entity(TableNameEnum.USERS)
export class UserEntity extends CreateUpdateModel {
  @Column('text')
  email: string;

  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'varchar', length: 255 })
  surname: string;

  @Column('text', { select: false })
  password: string;

  @Column('boolean')
  is_active: boolean;

  @Column('text')
  last_login: string;

  @Column('text', { nullable: true })
  image?: string;

  @Column({ type: 'enum', enum: Role })
  role: Role;

  @OneToMany(() => RefreshTokenEntity, (token) => token.user)
  refreshTokens?: RefreshTokenEntity[];

  @OneToMany(() => OrderEntity, (order) => order.user)
  orders: OrderEntity[];

  @OneToMany(() => CommentEntity, (comment) => comment.user)
  comments?: CommentEntity[];
}
