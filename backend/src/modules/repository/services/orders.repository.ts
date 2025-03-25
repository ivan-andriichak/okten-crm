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

  public async getListOrders(userId: string, query: OrderListQueryDto): Promise<[OrderEntity[], number]> {
    const {
      page = 1,
      limit = 25,
      sort = 'id',
      order = 'ASC',
      name,
      surname,
      email,
      phone,
      age,
      course,
      course_format,
      course_type,
      status,
      sum,
      alreadyPaid,
      group,
      created_at,
      manager,
      manager_id,
      myOrders,
    } = query;

    console.log('Query received:', query);
    console.log('UserId received:', userId);
    console.log('myOrders value:', myOrders, 'typeof myOrders:', typeof myOrders);

    const qb = this.createQueryBuilder('order')
      .leftJoinAndSelect('order.manager', 'manager')
      .leftJoinAndSelect('order.groupEntity', 'groupEntity')
      .leftJoinAndSelect('order.comments', 'comments')
      .leftJoinAndSelect('comments.user', 'commentUser');

    // Фільтр за userId, якщо myOrders === true
    if (myOrders === true && userId) {
      console.log('Applying filter for myOrders with userId:', userId);
      qb.andWhere('order.manager_id = :userId', { userId });
    } else {
      console.log('No myOrders filter applied. myOrders:', myOrders, 'userId:', userId);
    }

    // Фільтр за manager_id, якщо передано явно
    if (manager_id) {
      console.log('Applying filter for manager_id:', manager_id);
      qb.andWhere('order.manager_id = :manager_id', { manager_id });
    }

    // Решта фільтрів
    if (name) qb.andWhere('order.name LIKE :name', { name: `%${name}%` });
    if (surname) qb.andWhere('order.surname LIKE :surname', { surname: `%${surname}%` });
    if (email) qb.andWhere('order.email LIKE :email', { email: `%${email}%` });
    if (phone) qb.andWhere('order.phone LIKE :phone', { phone: `%${phone}%` });
    if (age) qb.andWhere('order.age LIKE :age', { age: `%${age}%` });
    if (course) qb.andWhere('order.course LIKE :course', { course: `%${course}%` });
    if (course_format) qb.andWhere('order.course_format LIKE :course_format', { course_format: `%${course_format}%` });
    if (course_type) qb.andWhere('order.course_type LIKE :course_type', { course_type: `%${course_type}%` });
    if (status) qb.andWhere('order.status LIKE :status', { status: `%${status}%` });
    if (sum) qb.andWhere('order.sum LIKE :sum', { sum: `%${sum}%` });
    if (alreadyPaid) qb.andWhere('order.alreadyPaid LIKE :alreadyPaid', { alreadyPaid: `%${alreadyPaid}%` });
    if (group) qb.andWhere('order.group LIKE :group', { group: `%${group}%` });
    if (created_at) qb.andWhere('DATE(order.created_at) = :created_at', { created_at });
    if (manager)
      qb.andWhere('manager.name LIKE :manager OR manager.surname LIKE :manager', { manager: `%${manager}%` });

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
      'order.utm',
      'order.msg',
      'groupEntity.id',
      'manager.id',
      'manager.email',
      'manager.name',
      'manager.surname',
      'manager.role',
      'comments.id',
      'comments.text',
      'comments.created_at',
      'commentUser.id',
      'commentUser.name',
      'commentUser.surname',
    ]);

    const [orders, total] = await qb.getManyAndCount();
    console.log('Orders fetched:', orders.length, 'Total:', total);
    return [orders, total];
  }
}
