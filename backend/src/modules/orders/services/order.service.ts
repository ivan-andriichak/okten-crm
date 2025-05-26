import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import * as ExcelJS from 'exceljs';

import { Role } from '../../../common/enums/role.enum';
import { OrderEntity } from '../../../database/entities/order.entity';
import { IUserData } from '../../auth/interfaces/user-data.interface';
import { GroupService } from '../../groups/services/group.services';
import { LoggerService } from '../../logger/logger.service';
import { CommentRepository } from '../../repository/services/comment.repository';
import { OrdersRepository } from '../../repository/services/orders.repository';
import { UserRepository } from '../../repository/services/user.repository';
import { CommentDto } from '../dto/req/comment.req.dto';
import { CreateOrderReqDto } from '../dto/req/create-order.req.dto';
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
    private readonly commentRepository: CommentRepository,
  ) {}

  public async getListOrders(userData: IUserData, query: OrderListQueryDto): Promise<[OrderEntity[], number]> {
    const userId = userData.role === Role.MANAGER || userData.role === Role.ADMIN ? userData.userId : undefined;
    return await this.ordersRepository.getListOrders(userId, query);
  }

  async getOrderById(orderId: number): Promise<OrderEntity> {
    const order = await this.ordersRepository.findOne({ where: { id: orderId } });
    if (!order) {
      throw new Error('Order not found');
    }
    return order;
  }

  async addComment(orderId: number, commentDto: CommentDto, userData: IUserData): Promise<OrderListItemResDto> {
    this.logger.log(`addComment called for order ${orderId} by user ${userData.userId}`);
    const order = await this.ordersRepository.findOne({
      where: { id: orderId },
      relations: ['manager', 'comments', 'comments.user'],
    });

    if (!order) {
      throw new NotFoundException(`Order with id ${orderId} not found`);
    }

    if (order.manager && order.manager.id !== userData.userId) {
      throw new ForbiddenException('You can only comment on orders without a manager or assigned to you');
    }

    const user = await this.userRepository.findOne({
      where: { id: userData.userId },
    });
    if (!user) {
      throw new NotFoundException(`User with id ${userData.userId} not found`);
    }

    const newComment = this.commentRepository.create({
      text: commentDto.text,
      user: user,
      order: order,
    });
    await this.commentRepository.save(newComment);

    if (!order.status || order.status === 'New') {
      order.status = 'In Work';
      order.manager = user;
    }

    if (!order.comments) order.comments = [];
    order.comments.push(newComment);

    await this.ordersRepository.save(order);

    const updatedOrder = await this.ordersRepository.findOne({
      where: { id: orderId },
      relations: ['manager', 'comments', 'comments.user'],
    });

    if (!updatedOrder) {
      throw new NotFoundException(`Updated order with id ${orderId} not found`);
    }

    return OrderMapper.toOrderListItemResDto(updatedOrder);
  }

  async deleteComment(commentId: string, userData: IUserData): Promise<void> {
    this.logger.log(`deleteComment called for comment ${commentId} by user ${userData.userId}`);
    const comment = await this.commentRepository.findOne({
      where: { id: commentId },
      relations: ['order', 'order.manager', 'user'],
    });

    if (!comment) {
      throw new NotFoundException(`Comment with id ${commentId} not found`);
    }

    const order = comment.order;
    if (order.manager && order.manager.id !== userData.userId && comment.user.id !== userData.userId) {
      throw new ForbiddenException('You can only delete comments on orders assigned to you or written by you');
    }

    await this.commentRepository.remove(comment);
  }

  async editOrder(orderId: number, editOrderDto: EditOrderDto): Promise<OrderEntity> {
    const order = await this.ordersRepository.findOne({
      where: { id: orderId },
      relations: ['manager', 'groupEntity'],
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    Object.assign(order, editOrderDto);

    if (editOrderDto.manager_id) {
      const manager = await this.userRepository.findOne({
        where: { id: editOrderDto.manager_id },
      });
      if (!manager) {
        throw new NotFoundException(`Manager with ID ${editOrderDto.manager_id} not found`);
      }
      order.manager = manager;
    }

    return await this.ordersRepository.save(order);
  }

  async createPublicOrder(createOrderDto: CreateOrderReqDto): Promise<OrderEntity> {
    const order = this.ordersRepository.create({
      ...createOrderDto,
      utm: createOrderDto.utm || 'utm_source=google&utm_medium=cpc&utm_campaign=spring_sale\n',
      msg: createOrderDto.utm ? 'Заявка з реклами' : null,
      status: createOrderDto.status || 'New',
      manager: null,
      created_at: new Date(),
    });
    return await this.ordersRepository.save(order);
  }

  async generateExcel(userData: IUserData, query: ExcelQueryDto): Promise<Buffer> {
    this.logger.log(`Generating Excel for user ${userData.userId} with query: ${JSON.stringify(query)}`);

    const [orders] = await this.getListOrders(userData, query as OrderListQueryDto);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Orders');

    worksheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Name', key: 'name', width: 20 },
      { header: 'Surname', key: 'surname', width: 20 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Phone', key: 'phone', width: 20 },
      { header: 'Age', key: 'age', width: 10 },
      { header: 'Course', key: 'course', width: 15 },
      { header: 'Course Format', key: 'course_format', width: 15 },
      { header: 'Course Type', key: 'course_type', width: 15 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Sum', key: 'sum', width: 10 },
      { header: 'Already Paid', key: 'alreadyPaid', width: 15 },
      { header: 'Group', key: 'group', width: 20 },
      { header: 'Created At', key: 'created_at', width: 20 },
      { header: 'Manager', key: 'manager', width: 20 },
    ];

    // Додаємо рядки з даними
    orders.forEach((order) => {
      worksheet.addRow({
        id: order.id,
        name: order.name,
        surname: order.surname,
        email: order.email,
        phone: order.phone,
        age: order.age,
        course: order.course,
        course_format: order.course_format,
        course_type: order.course_type,
        status: order.status,
        sum: order.sum,
        alreadyPaid: order.alreadyPaid,
        group: order.groupEntity?.name || order.group,
        created_at: order.created_at.toISOString().split('T')[0],
        manager: order.manager ? `${order.manager.name} ${order.manager.surname}` : '',
      });
    });

    // Форматуємо заголовки
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

    // Генеруємо буфер
    const buffer = await workbook.xlsx.writeBuffer();
    return buffer as Buffer;
  }
}
