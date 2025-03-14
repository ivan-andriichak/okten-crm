import { useDispatch } from 'react-redux';
import { addComment, AppDispatch, openEditModal, setCommentText } from '../../store';
import { FC } from 'react';
import Button from '../Button/Button';
import { OrderDetailsProps, getOrderFields } from './const';
import CommentList from '../CommentsList/CommentsList';

const OrderDetails: FC<OrderDetailsProps> = ({ order, commentText, currentUserId, token }) => {
  const dispatch = useDispatch<AppDispatch>();

  const handleCommentSubmit = async () => {
    if (!commentText || !token) return;
    await dispatch(addComment(order.id));
  };

  const handleEditClick = () => {
    dispatch(openEditModal(order));
  };

  const canEdit = !order.manager || order.manager?.id === currentUserId;
  const fields = getOrderFields(order);

  return (
    <div>
      <h4>Order Details</h4>
      {fields.map(({ label, value }) => (
        <p key={label}>
          <strong>{label}:</strong> {value}
        </p>
      ))}
      <CommentList comments={order.comments} />
      {canEdit && (
        <div style={{ marginTop: '10px' }}>
          <input
            type="text"
            value={commentText}
            onChange={(e) => dispatch(setCommentText(e.target.value))}
            placeholder="Add a comment"
            style={{ width: '70%', padding: '5px', marginRight: '10px' }}
          />
          <Button variant="primary" onClick={handleCommentSubmit}>
            Submit Comment
          </Button>
          <Button variant="primary" onClick={handleEditClick} style={{ marginLeft: '10px' }}>
            Edit
          </Button>
        </div>
      )}
    </div>
  );
};

export default OrderDetails;