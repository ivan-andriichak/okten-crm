import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';

import { OrderEntity } from '../../../database/entities/order.entity';
import { OrderListQueryDto } from '../../orders/dto/req/order-list.query.dto';

@Injectable()
export class OrdersRepository extends Repository<OrderEntity> {
  constructor(private readonly dataSource: DataSource) {
    super(OrderEntity, dataSource.manager);
    console.log('OrdersRepository initialized');
    console.log('DataSource initialized:', dataSource.isInitialized);
  }

  public async getListOrders(
    userId: string | undefined,
    query: OrderListQueryDto,
  ): Promise<[OrderEntity[], number]> {
    const {
      page = 1,
      limit = 25,
      sort = 'created_at',
      order = 'DESC',
      search,
    } = query;

    const qb = this.createQueryBuilder('order')
      .leftJoinAndSelect('order.manager', 'manager')
      .leftJoinAndSelect('order.groupEntity', 'groupEntity')
      .leftJoinAndSelect('order.comments', 'comments')
      .leftJoinAndSelect('comments.user', 'commentUser');

    // Фільтр за userId (якщо передано)
    if (userId) {
      qb.andWhere('order.user_id = :userId', { userId });
    }

    // Пошук за полями name, surname, email (якщо передано search)
    if (search) {
      qb.andWhere(
        '(LOWER(order.name) LIKE :search OR LOWER(order.surname) LIKE :search OR LOWER(order.email) LIKE :search)',
        { search: `%${search.toLowerCase()}%` },
      );
    }

    // Сортування
    qb.orderBy(`order.${sort}`, order);

    // Пагінація
    qb.skip((page - 1) * limit).take(limit);

    // Вибираємо потрібні поля
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
      'order.group',
      'groupEntity.id',
      'manager.id',
      'manager.email',
      'manager.name',
      'manager.surname',
      'manager.role',
      'comments.id',
      'comments.text',
      'comments.utm',
      'comments.created_at',
      'commentUser.id',
      'commentUser.name',
      'commentUser.surname',
    ]);

    const [orders, total] = await qb.getManyAndCount();
    console.log('Orders fetched:', orders);
    return [orders, total];
  }
}
