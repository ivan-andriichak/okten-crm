import { useDispatch } from 'react-redux';
import {
  addComment,
  AppDispatch,
  openEditModal,
  setCommentText,
} from '../../store';
import Button from '../Button/Button';
import { OrderDetailsProps } from './const';
import { CommentList } from '../CommentsList/CommentsList';

const OrderDetails = ({
                        order,
                        commentText,
                        currentUserId,
                        token,
                      }: OrderDetailsProps) => {
  const dispatch = useDispatch<AppDispatch>();

  const canEditOrComment =
    !order.manager || (order.manager && order.manager.id === currentUserId);

  const handleCommentSubmit = async () => {
    if (!commentText || !token || !canEditOrComment) return;

    await dispatch(
      addComment({ orderId: order.id, commentText }),
    );
  };

  const handleEditClick = () => {
    dispatch(openEditModal(order));
  };

  return (
    <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column' }}>
      <CommentList comments={order.comments || []} order={order} />
      {canEditOrComment && (
        <div
          style={{
            marginTop: '10px',
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'flex-end',
          }}
        >
          <input
            type="text"
            value={commentText}
            onChange={(e) => dispatch(setCommentText(e.target.value))}
            placeholder="Add a comment"
            style={{
              width: '30%',
              padding: '5px',
              marginRight: '10px',
              borderRadius: '5px',
            }}
          />
          <Button variant="primary" onClick={handleCommentSubmit}>
            Submit Comment
          </Button>
          <Button
            variant="primary"
            onClick={handleEditClick}
            style={{ marginLeft: '10px' }}
          >
            Edit Order
          </Button>
        </div>
      )}
    </div>
  );
};

export { OrderDetails };