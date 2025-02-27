import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { OrderEntity } from '../../database/entities/order.entity';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { IUserData } from '../auth/interfaces/user-data.interface';
import { CommentDto } from './dto/req/comment.req.dto';
import { EditOrderDto } from './dto/req/edit-order.req.dto';
import { ExcelQueryDto } from './dto/req/excel-guery.req.dto';
import { OrderListQueryDto } from './dto/req/order-list.query.dto';
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
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Limit per page (default: 20)',
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    description: 'Sort field (default: created_at)',
  })
  @ApiQuery({
    name: 'order',
    required: false,
    enum: ['ASC', 'DESC'],
    description: 'Sort order (default: DESC)',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search by name, surname, or email',
  })
  public async getListOrders(
    @CurrentUser() userData: IUserData,
    @Query() query: OrderListQueryDto,
  ): Promise<OrderListDto> {
    const [entities, total] = await this.ordersService.getListOrders(
      userData,
      query,
    );
    return OrderMapper.toResponseListDTO(entities, total, query);
  }

  @Get(':orderId')
  @ApiOkResponse({ description: 'Single order details', type: OrderEntity })
  public async getOrderById(
    @Param('orderId') id: string,
  ): Promise<OrderEntity> {
    return await this.ordersService.getOrderById(id);
  }

  @Post(':orderId/comment')
  @ApiOkResponse({ description: 'Order with added comment', type: OrderEntity })
  async addComment(
    @Param('orderId') id: string,
    @Body() commentDto: CommentDto,
  ): Promise<OrderEntity> {
    return await this.ordersService.addComment(id, commentDto);
  }

  @Patch(':id/edit')
  @ApiOkResponse({ description: 'Updated order', type: OrderEntity })
  async editOrder(
    @Param('id') id: string,
    @Body() editOrderDto: EditOrderDto,
  ): Promise<OrderEntity> {
    return await this.ordersService.editOrder(id, editOrderDto);
  }

  @Post('excel')
  @ApiOkResponse({
    description: 'Excel file buffer',
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  async generateExcel(@Query() query: ExcelQueryDto): Promise<Buffer> {
    return await this.ordersService.generateExcel(query);
  }
}
