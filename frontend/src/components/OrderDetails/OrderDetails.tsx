import { useDispatch, useSelector } from 'react-redux';
import {
  addComment,
  AppDispatch,
  openEditModal,
  RootState,
  setCommentText,
} from '../../store';
import Button from '../Button/Button';
import { CommentList } from '../CommentsList/CommentsList';
import React from 'react';
import { OrderDetailsProps } from './const';

const OrderDetails = ({
  orderId,
  commentText,
  currentUserId,
  token,
}: OrderDetailsProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const order = useSelector((state: RootState) =>
    state.orders.orders.find(o => Number(o.id) === orderId),
  );

  if (!order) return <p>Loading order...</p>;

  const canEditOrComment =
    !order.manager || (order.manager && order.manager.id === currentUserId);

  const handleCommentSubmit = async (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (!commentText || !token || !canEditOrComment) return;
    await dispatch(addComment({ orderId: order.id, commentText }));
    dispatch(setCommentText(''));
  };

  const handleEditClick = () => {
    dispatch(openEditModal(order));
  };

  return (
    <div style={{ padding: '10px', display: 'flex', flexDirection: 'column' }}>
      <CommentList comments={order.comments || []} order={order} />
      {canEditOrComment && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
          }}>
          <input
            type="text"
            value={commentText}
            onChange={e => dispatch(setCommentText(e.target.value))}
            placeholder="Add a comment"
            style={{
              width: '30%',
              padding: '5px',
              marginRight: '10px',
              borderRadius: '5px',
              border: '1px solid #ccc',
            }}
          />
          <Button variant="primary" onClick={handleCommentSubmit}>
            Submit Comment
          </Button>
          <Button
            variant="primary"
            onClick={handleEditClick}
            style={{ marginLeft: '10px' }}>
            Edit Order
          </Button>
        </div>
      )}
    </div>
  );
};

export { OrderDetails };
