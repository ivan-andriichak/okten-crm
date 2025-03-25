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
    this.logger.log(`getListOrders called for user ${userData.userId}`);
    const userId = userData.role === Role.MANAGER || userData.role === Role.ADMIN ? userData.userId : undefined;
    console.log('Service - UserId:', userId); // Логування userId
    console.log('Service - Query:', query); // Логування query
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

    // Зберігаємо оновлений порядок
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
      utm: createOrderDto.utm || null,
      msg: createOrderDto.utm ? 'Заявка з реклами' : null,
      status: createOrderDto.status || 'New',
      manager: null,
      created_at: new Date(),
    });
    return await this.ordersRepository.save(order);
  }

  async generateExcel(query: ExcelQueryDto): Promise<Buffer> {
    const orders = await this.ordersRepository.find({
      where: { ...query },
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
