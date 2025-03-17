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

  // Перевірка, чи можна додавати коментар або редагувати
  const canEditOrComment =
    !order.manager || (order.manager && order.manager.id === currentUserId);

  const handleCommentSubmit = async () => {
    if (!commentText || !token || !canEditOrComment) return;

    await dispatch(
      addComment({ orderId: order.id, commentText }), // Передаємо об'єкт із orderId і commentText
    );
  };

  const handleEditClick = () => {
    dispatch(openEditModal(order));
  };

  return (
    <div style={{ padding: '20px' }}>
      {/* Деталі заявки */}
      <div style={{ marginBottom: '20px' }}>
        <h2>Order Details</h2>
        <p><strong>ID:</strong> {order.id}</p>
        <p><strong>Name:</strong> {order.name || 'N/A'}</p>
        <p><strong>Surname:</strong> {order.surname || 'N/A'}</p>
        <p><strong>Email:</strong> {order.email || 'N/A'}</p>
        <p><strong>Phone:</strong> {order.phone || 'N/A'}</p>
        <p><strong>Age:</strong> {order.age || 'N/A'}</p>
        <p><strong>Course:</strong> {order.course || 'N/A'}</p>
        <p><strong>Course Format:</strong> {order.course_format}</p>
        <p><strong>Course Type:</strong> {order.course_type}</p>
        <p><strong>Status:</strong> {order.status || 'N/A'}</p>
        <p><strong>Sum:</strong> {order.sum || 'N/A'}</p>
        <p><strong>Already Paid:</strong> {order.alreadyPaid || 'N/A'}</p>
        <p><strong>Created At:</strong> {new Date(order.created_at).toLocaleString('uk-UA')}</p>
        <p><strong>Manager:</strong> {order.manager ? `${order.manager.name} ${order.manager.surname}`: 'None'}</p>
      </div>

      {/* Список коментарів */}
      <CommentList comments={order.comments || []} />

      {/* Форма для додавання коментаря */}
      {canEditOrComment && (
        <div style={{ marginTop: '10px' }}>
          <input
            type="text"
            value={commentText}
            onChange={e => dispatch(setCommentText(e.target.value))}
            placeholder="Add a comment"
            style={{ width: '30%', padding: '5px', marginRight: '10px' }}
          />
          <Button variant="primary" onClick={handleCommentSubmit}>
            Submit Comment
          </Button>
          <Button
            variant="primary"
            onClick={handleEditClick}
            style={{ marginLeft: '10px' }}
          >
            Edit
          </Button>
        </div>
      )}
    </div>
  );
};

export { OrderDetails };