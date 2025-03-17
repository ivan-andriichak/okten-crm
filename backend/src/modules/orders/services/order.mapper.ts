import { OrderEntity } from '../../../database/entities/order.entity';
import { UserMapper } from '../../users/user.maper';
import { OrderListQueryDto } from '../dto/req/order-list.query.dto';
import { OrderListItemResDto } from '../dto/res/order-list-item.res.dto';

export class OrderMapper {
  public static toResponseListDTO(
    entities: OrderEntity[],
    total: number,
    query: OrderListQueryDto,
  ) {
    return {
      orders: entities.map((order) => OrderMapper.toOrderListItemResDto(order)),
      total,
      query,
    };
  }

  public static toOrderListItemResDto(
    entity: OrderEntity,
  ): OrderListItemResDto {
    return {
      id: entity.id,
      name: entity.name,
      surname: entity.surname,
      email: entity.email,
      phone: entity.phone,
      age: entity.age,
      course: entity.course,
      course_format: entity.course_format,
      course_type: entity.course_type,
      status: entity.status,
      sum: entity.sum,
      alreadyPaid: entity.alreadyPaid,
      created_at: entity.created_at,
      group: entity.group,
      manager: entity.manager ? UserMapper.toResponseDTO(entity.manager) : null,
      comments: entity.comments?.map((comment) => ({
        id: comment.id,
        text: comment.text,
        utm: comment.utm,
        author:
          `${comment.user?.name || 'Unknown'} ${comment.user?.surname || ''}`.trim(),
        createdAt: comment.created_at,
      })),
    };
  }
}
