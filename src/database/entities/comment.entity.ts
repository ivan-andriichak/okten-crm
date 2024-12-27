import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { TableNameEnum } from './enums/table-name.enum';
import { CreateUpdateModel } from './models/create-update.model';
import { OrderEntity } from './order.entity';
import { UserEntity } from './user.entity';

@Entity(TableNameEnum.COMMENTS)
export class CommentEntity extends CreateUpdateModel {
  @Column('text')
  message: string;

  @Column('text')
  utm: string;

  @Column('text')
  author: string;

  @ManyToOne(() => OrderEntity, (order) => order.comments)
  @JoinColumn({ name: 'order_id' })
  order?: OrderEntity;

  @ManyToOne(() => UserEntity, (user) => user.comments)
  @JoinColumn({ name: 'user_id' })
  user?: UserEntity;
}
