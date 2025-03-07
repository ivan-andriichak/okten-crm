import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as ExcelJS from 'exceljs';

import { Role } from '../../../common/enums/role.enum';
import { CommentEntity } from '../../../database/entities/comment.entity';
import { OrderEntity } from '../../../database/entities/order.entity';
import { UserEntity } from '../../../database/entities/user.entity';
import { IUserData } from '../../auth/interfaces/user-data.interface';
import { GroupService } from '../../groups/services/group.services';
import { LoggerService } from '../../logger/logger.service';
import { OrdersRepository } from '../../repository/services/orders.repository';
import { UserRepository } from '../../repository/services/user.repository';
import { CommentDto } from '../dto/req/comment.req.dto';
import { EditOrderDto } from '../dto/req/edit-order.req.dto';
import { ExcelQueryDto } from '../dto/req/excel-guery.req.dto';
import { OrderListQueryDto } from '../dto/req/order-list.query.dto';
import { OrderListItemResDto } from '../dto/res/order-list-item.res.dto';
import { OrderMapper } from './order.mapper';

@Injectable()
export class OrderService {
  constructor(
    private readonly ordersRepository: OrdersRepository,
    private readonly userRepository: UserRepository,
    private readonly groupService: GroupService,
    private readonly logger: LoggerService,
  ) {}

  public async getListOrders(
    userData: IUserData,
    query: OrderListQueryDto,
  ): Promise<[OrderEntity[], number]> {
    this.logger.log(`getListOrders called for user ${userData.userId}`);
    const userId = userData.role === Role.MANAGER ? userData.userId : undefined;
    return await this.ordersRepository.getListOrders(userId, query);
  }

  async getOrderById(id: string): Promise<OrderEntity> {
    const order = await this.ordersRepository.findOne({ where: { id: id } });
    if (!order) {
      throw new Error('Order not found');
    }
    return order;
  }

  async addComment(
    orderId: string,
    commentDto: CommentDto,
    userData: IUserData,
  ): Promise<OrderListItemResDto> {
    this.logger.log(
      `addComment called for order ${orderId} by user ${userData.userId}`,
    );
    const order = await this.ordersRepository.findOne({
      where: { id: orderId },
      relations: ['manager', 'comments', 'comments.user'],
    });

    // Перевірка: менеджер відсутній або це поточний користувач
    if (order.manager && order.manager.id !== userData.userId) {
      throw new ForbiddenException(
        'You can only comment on orders without a manager or assigned to you',
      );
    }

    if (!order) {
      throw new NotFoundException(`Order with id ${orderId} not found`);
    }

    const newComment = new CommentEntity();
    newComment.text = commentDto.text;
    newComment.user = { id: userData.userId } as UserEntity;
    newComment.order = order;

    order.comments = order.comments
      ? [...order.comments, newComment]
      : [newComment];

    if (!order.status || order.status === 'New') {
      order.status = 'In Work';
      order.manager = { id: userData.userId } as UserEntity;
    }

    await this.ordersRepository.save(order);
    return OrderMapper.toOrderListItemResDto(order);
  }

  async editOrder(
    orderId: string,
    editOrderDto: EditOrderDto,
  ): Promise<OrderEntity> {
    const order = await this.ordersRepository.findOne({
      where: { id: orderId },
      relations: ['manager', 'groupEntity'],
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    // Оновлюємо поля
    Object.assign(order, editOrderDto);

    // Якщо передано manager_id, перевіряємо існування менеджера
    if (editOrderDto.manager_id) {
      const manager = await this.userRepository.findOne({
        where: { id: editOrderDto.manager_id },
      });
      if (!manager) {
        throw new NotFoundException(
          `Manager with ID ${editOrderDto.manager_id} not found`,
        );
      }
      order.manager = manager;
    }

    return await this.ordersRepository.save(order);
  }

  async generateExcel(query: ExcelQueryDto): Promise<Buffer> {
    const orders = await this.ordersRepository.find({
      where: {
        ...query,
      },
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Orders');

    worksheet.columns = [
      { header: 'ID', key: 'id' },
      { header: 'Name', key: 'name' },
      { header: 'Surname', key: 'surname' },
      { header: 'Email', key: 'email' },
      { header: 'Phone', key: 'phone' },
      { header: 'Age', key: 'age' },
      { header: 'Course', key: 'course' },
      { header: 'Course Format', key: 'courseFormat' },
      { header: 'Course Type', key: 'courseType' },
      { header: 'Status', key: 'status' },
      { header: 'Sum', key: 'sum' },
      { header: 'Already Paid', key: 'alreadyPaid' },
      { header: 'Created At', key: 'createdAt' },
    ];

    orders.forEach((order) => {
      worksheet.addRow(order);
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return buffer as Buffer;
  }
}
