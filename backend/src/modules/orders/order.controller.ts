import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiQuery, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { Response } from 'express';

import { Public } from '../../common/decorators/public.decorator';
import { OrderEntity } from '../../database/entities/order.entity';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { IUserData } from '../auth/interfaces/user-data.interface';
import { CommentDto } from './dto/req/comment.req.dto';
import { CreateOrderReqDto } from './dto/req/create-order.req.dto';
import { EditOrderDto } from './dto/req/edit-order.req.dto';
import { ExcelQueryDto } from './dto/req/excel-guery.req.dto';
import { OrderListQueryDto } from './dto/req/order-list.query.dto';
import { OrderListItemResDto } from './dto/res/order-list-item.res.dto';
import { OrderListDto } from './dto/res/ored-list.res';
import { OrderMapper } from './services/order.mapper';
import { OrderService } from './services/order.service';

@ApiBearerAuth()
@ApiTags('Orders')
@Controller('orders')
export class OrderController {
  constructor(private readonly ordersService: OrderService) {}

  @Get()
  @ApiOkResponse({
    description: 'List of orders with pagination',
    type: OrderListDto,
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Limit per page (default: 25)' })
  @ApiQuery({ name: 'sort', required: false, description: 'Sort field (default: id)' })
  @ApiQuery({ name: 'order', required: false, enum: ['ASC', 'DESC'], description: 'Sort order (default: ASC)' })
  @ApiQuery({ name: 'name', required: false, description: 'Filter by name' })
  @ApiQuery({ name: 'surname', required: false, description: 'Filter by surname' })
  @ApiQuery({ name: 'email', required: false, description: 'Filter by email' })
  @ApiQuery({ name: 'phone', required: false, description: 'Filter by phone' })
  @ApiQuery({ name: 'age', required: false, description: 'Filter by age' })
  @ApiQuery({ name: 'course', required: false, description: 'Filter by course' })
  @ApiQuery({ name: 'course_format', required: false, description: 'Filter by course format' })
  @ApiQuery({ name: 'course_type', required: false, description: 'Filter by course type' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by status' })
  @ApiQuery({ name: 'sum', required: false, description: 'Filter by sum' })
  @ApiQuery({ name: 'alreadyPaid', required: false, description: 'Filter by already paid' })
  @ApiQuery({ name: 'group', required: false, description: 'Filter by group' })
  @ApiQuery({ name: 'created_at', required: false, description: 'Filter by created at' })
  @ApiQuery({ name: 'manager', required: false, description: 'Filter by manager' })
  @ApiQuery({ name: 'manager_id', required: false, description: 'Filter by manager ID' })
  @ApiQuery({ name: 'myOrders', required: false, description: 'Filter only my orders (true/false)' })
  public async getListOrders(
    @CurrentUser() userData: IUserData,
    @Query() query: OrderListQueryDto,
  ): Promise<OrderListDto> {
    const [entities, total] = await this.ordersService.getListOrders(userData, query);
    return OrderMapper.toResponseListDTO(entities, total, query);
  }

  @Post('register')
  @Public()
  @ApiOkResponse({ description: 'Public order created', type: OrderEntity })
  async createPublicOrder(@Body() createOrderDto: CreateOrderReqDto): Promise<OrderEntity> {
    return await this.ordersService.createPublicOrder(createOrderDto);
  }

  @Post(':orderId/comment')
  @ApiOkResponse({
    description: 'Order with added comment',
    type: OrderListItemResDto,
  })
  async addComment(
    @Param('orderId') id: number,
    @Body() commentDto: CommentDto,
    @CurrentUser() userData: IUserData,
  ): Promise<OrderListItemResDto> {
    return await this.ordersService.addComment(id, commentDto, userData);
  }

  @Post('excel')
  async generateExcel(@CurrentUser() userData: IUserData, @Body() query: ExcelQueryDto, @Res() res: Response) {
    const buffer = await this.ordersService.generateExcel(userData, query);

    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename=orders_${new Date().toISOString().split('T')[0]}.xlsx`,
      'Content-Length': buffer.length,
    });

    res.end(buffer);
  }

  @Patch(':id/edit')
  @ApiOkResponse({ description: 'Updated order', type: OrderEntity })
  async editOrder(@Param('id') id: number, @Body() editOrderDto: EditOrderDto): Promise<OrderEntity> {
    return await this.ordersService.editOrder(id, editOrderDto);
  }

  @Delete('comments/:commentId')
  @ApiOkResponse({ description: 'Comment deleted successfully' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async deleteComment(@Param('commentId') commentId: string, @CurrentUser() userData: IUserData): Promise<void> {
    await this.ordersService.deleteComment(commentId, userData);
  }
}
