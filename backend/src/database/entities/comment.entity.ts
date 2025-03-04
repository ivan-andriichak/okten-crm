import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { TableNameEnum } from './enums/table-name.enum';
import { CreateUpdateModel } from './models/create-update.model';
import { OrderEntity } from './order.entity';
import { UserEntity } from './user.entity';

@Entity(TableNameEnum.COMMENTS)
export class CommentEntity extends CreateUpdateModel {
  @Column('text', { nullable: true })
  text: string;

  @Column('text', { nullable: true })
  utm: string;

  @ManyToOne(() => OrderEntity, (order) => order.comments)
  @JoinColumn({ name: 'order_id' })
  order?: OrderEntity;

  @ManyToOne(() => UserEntity, (user) => user.comments)
  @JoinColumn({ name: 'user_id' })
  user?: UserEntity;
}
