import { Injectable, NotFoundException } from '@nestjs/common';
import * as ExcelJS from 'exceljs';

import { OrderEntity } from '../../../database/entities/order.entity';
import { OrdersRepository } from '../../repository/services/orders.repository';
import { CommentDto } from '../dto/req/comment.req.dto';
import { EditOrderDto } from '../dto/req/edit-order.req.dto';
import { ExcelQueryDto } from '../dto/req/excel-guery.req.dto';
import { PaginationReqDto } from '../dto/req/pagination.req.dto';

@Injectable()
export class OrdersService {
  constructor(private readonly ordersRepository: OrdersRepository) {}

  public async getOrders(paginationDto: PaginationReqDto) {
    return await this.ordersRepository.getOrders(paginationDto);
  }

  async getOrderById(id: string): Promise<OrderEntity> {
    const order = await this.ordersRepository.findOne({ where: { id: id } });
    if (!order) {
      throw new Error('Order not found');
    }
    return order;
  }

  async addComment(orderId: string, commentDto: CommentDto): Promise<OrderEntity> {
    const order = await this.ordersRepository.findOne({ where: { id: orderId } });

    if (!order) {
      throw new Error('Order not found');
    }

    const newComment = {
      text: commentDto.text,
      author: commentDto.author,
      createdAt: new Date(),
    };

    // Додаємо коментар до існуючого масиву
    order.comments = order.comments ? [...order.comments, newComment] : [newComment];

    // Якщо статус був "null" або "New", змінюємо на "In Work" і записуємо менеджера
    if (order.status === null) {
      order.status = 'In Work';
      order.user = commentDto.author;
    }

    await this.ordersRepository.save(order);
    return order;
  }

  async editOrder(orderId: string, editOrderDto: EditOrderDto): Promise<OrderEntity> {
    const order = await this.ordersRepository.findOne({ where: { id: orderId.toString() } });

    if (!order) {
      throw new NotFoundException(`Order with id ${orderId} not found`);
    }

    // Оновлюємо необхідні поля
    order.status = editOrderDto.status;
    order.course = editOrderDto.course;
    order.course_type = editOrderDto.courseType;
    order.course_format = editOrderDto.courseFormat;
    order.group = editOrderDto.group;

    // Зберігаємо зміни
    await this.ordersRepository.save(order);

    return order;
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
