import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';

import { OrderEntity } from '../../../database/entities/order.entity';
import { PaginationReqDto } from '../../orders/dto/req/pagination.req.dto';

@Injectable()
export class OrdersRepository extends Repository<OrderEntity> {
  constructor(private readonly dataSource: DataSource) {
    super(OrderEntity, dataSource.manager);
  }

  public async getOrders({ page = 1, limit = 25, sort = 'created_at', order = 'DESC' }: PaginationReqDto) {
    const qb = this.createQueryBuilder('order');

    // Сортування
    qb.orderBy(`order.${sort}`, order);

    // Пагінація
    qb.skip((page - 1) * limit);
    qb.take(limit);

    // Вибираємо лише необхідні поля
    qb.select([
      'order.id',
      'order.name',
      'order.surname',
      'order.email',
      'order.phone',
      'order.age',
      'order.course',
      'order.course_format',
      'order.course_type',
      'order.status',
      'order.sum',
      'order.alreadyPaid',
      'order.created_at',
    ]);

    // Виконуємо запит
    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
    };
  }
}
