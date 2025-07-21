import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';

import { OrderEntity } from '../../../database/entities/order.entity';
import { OrderListQueryDto } from '../../orders/dto/req/order-list.query.dto';

@Injectable()
export class OrdersRepository extends Repository<OrderEntity> {
  constructor(private readonly dataSource: DataSource) {
    super(OrderEntity, dataSource.manager);
  }

  private buildOrderQuery(userId: string | undefined, query: OrderListQueryDto, withPagination: boolean = true) {
    const {
      page = 1,
      limit = 25,
      sort = 'id',
      order = 'DESC',
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

    const qb = this.createQueryBuilder('order')
      .leftJoinAndSelect('order.manager', 'manager')
      .leftJoinAndSelect('order.groupEntity', 'groupEntity')
      .leftJoinAndSelect('order.comments', 'comments')
      .leftJoinAndSelect('comments.user', 'commentUser');

    if (myOrders === true && userId) {
      qb.andWhere('order.manager_id = :userId', { userId });
    }

    if (manager_id) {
      qb.andWhere('order.manager_id = :manager_id', { manager_id });
    }

    if (name) qb.andWhere('LOWER(TRIM(order.name)) LIKE :name', { name: `%${name.trim().toLowerCase()}%` });
    if (surname)
      qb.andWhere('LOWER(TRIM(order.surname)) LIKE :surname', { surname: `%${surname.trim().toLowerCase()}%` });
    if (email) qb.andWhere('LOWER(TRIM(order.email)) LIKE :email', { email: `${email.trim().toLowerCase()}` });
    if (phone) qb.andWhere('LOWER(TRIM(order.phone)) LIKE :phone', { phone: `${phone.trim().toLowerCase()}` });
    if (age) qb.andWhere('order.age = :age', { age: Number(age) });
    if (course) qb.andWhere('order.course LIKE :course', { course: `%${course}%` });
    if (course_format) qb.andWhere('order.course_format LIKE :course_format', { course_format: `%${course_format}%` });
    if (course_type) qb.andWhere('order.course_type LIKE :course_type', { course_type: `%${course_type}%` });
    if (status === 'New') {
      qb.andWhere('(order.status = :status OR order.status IS NULL)', { status: 'new' });
    } else if (status) {
      qb.andWhere('order.status = :status', { status });
    }
    if (sum) qb.andWhere('order.sum LIKE :sum', { sum: `%${sum}%` });
    if (alreadyPaid) qb.andWhere('order.alreadyPaid LIKE :alreadyPaid', { alreadyPaid: `%${alreadyPaid}%` });
    if (group) qb.andWhere('order.group LIKE :group', { group: `%${group}%` });
    if (created_at && created_at.trim())
      qb.andWhere('CAST(order.created_at AS CHAR) LIKE :created_at', { created_at: `%${created_at.trim()}%` });
    if (manager) {
      const parts = manager.trim().toLowerCase().split(/\s+/);
      parts.forEach((part, idx) => {
        qb.andWhere(`(LOWER(manager.name) LIKE :managerPart${idx} OR LOWER(manager.surname) LIKE :managerPart${idx})`, {
          [`managerPart${idx}`]: `%${part}%`,
        });
      });
    }

    if (sort === 'manager_id') {
      qb.orderBy('order.manager_id', order);
    } else if (sort === 'manager') {
      qb.orderBy('manager.name', order);
      qb.addOrderBy('manager.surname', order);
    } else {
      qb.orderBy(`order.${sort}`, order);
    }

    if (withPagination) {
      qb.skip((page - 1) * limit).take(limit);
    }

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

    return qb;
  }

  public async getListOrders(userId: string, query: OrderListQueryDto): Promise<[OrderEntity[], number]> {
    const qb = this.buildOrderQuery(userId, query, true);
    const [orders, total] = await qb.getManyAndCount();
    return [orders, total];
  }

  public async getAllOrders(userId: string, query: OrderListQueryDto): Promise<OrderEntity[]> {
    const qb = this.buildOrderQuery(userId, query, false);
    return await qb.getMany();
  }
}
