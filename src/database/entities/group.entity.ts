import { Column, Entity, OneToMany } from 'typeorm';

import { TableNameEnum } from './enums/table-name.enum';
import { CreateUpdateModel } from './models/create-update.model';
import { OrderEntity } from './order.entity';

@Entity(TableNameEnum.GROUPS)
export class GroupEntity extends CreateUpdateModel {
  @Column({ type: 'varchar', length: 255, nullable: true })
  name: string;

  @OneToMany(() => OrderEntity, (order) => order.group_)
  orders: OrderEntity[];
}
