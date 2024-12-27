import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiOkResponse, ApiQuery, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';

import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { OrderEntity } from '../../database/entities/order.entity';
import { CommentDto } from './dto/req/comment.req.dto';
import { EditOrderDto } from './dto/req/edit-order.req.dto';
import { ExcelQueryDto } from './dto/req/excel-guery.req.dto';
import { PaginationReqDto } from './dto/req/pagination.req.dto';
import { OrderDto } from './dto/res/order.res.dto';
import { OrderListDto } from './dto/res/ored-list.res';
import { OrdersService } from './services/orders.service';

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiOkResponse({ description: 'List of orders with pagination', type: OrderListDto })
  @ApiQuery({ name: 'page', required: false, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'order', required: false, enum: ['ASC', 'DESC'], description: 'Sort order (default: DESC)' })
  async findAll(@Query() query: PaginationReqDto): Promise<{
    total: number;
    data: OrderEntity[];
    totalPages: number;
    currentPage: number;
  }> {
    return await this.ordersService.getOrders(query);
  }

  @Get(':orderId')
  @ApiOkResponse({ description: 'Return order by ID', type: OrderDto })
  async getOrderById(@Param('orderId') id: string): Promise<OrderEntity> {
    return await this.ordersService.getOrderById(id);
  }

  @Post(':orderId/comment')
  @ApiOkResponse({ description: 'Add a comment to the order', type: OrderDto })
  async addComment(@Param('id') id: string, @Body() commentDto: CommentDto): Promise<OrderEntity> {
    return await this.ordersService.addComment(id, commentDto);
  }

  @Patch(':id/edit')
  @ApiOkResponse({ description: 'Edit order details', type: OrderDto })
  async editOrder(@Param('id') id: string, @Body() editOrderDto: EditOrderDto): Promise<OrderEntity> {
    return await this.ordersService.editOrder(id, editOrderDto);
  }

  @Post('excel')
  @ApiOkResponse({ description: 'Generate Excel file for orders' })
  async generateExcel(@Query() query: ExcelQueryDto): Promise<Buffer> {
    return await this.ordersService.generateExcel(query);
  }
}
