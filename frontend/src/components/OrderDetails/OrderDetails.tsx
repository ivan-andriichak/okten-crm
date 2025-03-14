import { useDispatch } from 'react-redux';
import { addComment, AppDispatch, setCommentText } from '../../store';
import { FC } from 'react';
import { Order } from '../../interfaces/order';

interface OrderDetailsProps {
  order: Order; // Замініть на тип Order
  commentText: string;
  currentUserId: string | null;
  token: string | null;
}

const OrderDetails: FC<OrderDetailsProps> = ({ order, commentText, currentUserId, token }) => {
  const dispatch = useDispatch<AppDispatch>();

  const handleCommentSubmit = async () => {
    if (!commentText || !token) return;
    await dispatch(addComment(order.id));
  };

  return (
    <div>
      <h4>Order Details</h4>
      <p><strong>ID:</strong> {order.id}</p>
      <p><strong>Name:</strong> {order.name}</p>
      <p><strong>Surname:</strong> {order.surname}</p>
      <p><strong>Email:</strong> {order.email}</p>
      <p><strong>Phone:</strong> {order.phone}</p>
      <p><strong>Age:</strong> {order.age}</p>
      <p><strong>Course:</strong> {order.course}</p>
      <p><strong>Course Format:</strong> {order.course_format}</p>
      <p><strong>Course Type:</strong> {order.course_type}</p>
      <p><strong>Status:</strong> {order.status}</p>
      <p><strong>Sum:</strong> {order.sum}</p>
      <p><strong>Already Paid:</strong> {order.alreadyPaid}</p>
      <p><strong>Group:</strong> {order.group || 'No group'}</p>
      <p><strong>Created At:</strong> {new Date(order.created_at).toLocaleString()}</p>
      <p><strong>Manager:</strong> {order.manager ? `${order.manager.name} ${order.manager.surname}` : 'None'}</p>
      <p><strong>Message:</strong> {order.comments && order.comments.length > 0 ? order.comments[0]?.text : 'N/A'}</p>
      <p><strong>UTM:</strong> {order.comments && order.comments.length > 0 ? order.comments[0]?.utm : 'N/A'}</p>
      <p><strong>Group (Text):</strong> {order.group || 'No group'}</p>
      <p><strong>Group Entity:</strong> {order.groupEntity?.name || 'No group entity'}</p>
      <strong>Comments:</strong>
      {order.comments && order.comments.length > 0 ? (
        order.comments.map((comment: any, index: number) =>
          comment ? (
            <div key={index}>
              <p>
                <strong>Message:</strong> {comment.text || 'N/A'}<br />
                <strong>UTM:</strong> {comment.utm || 'N/A'}<br />
                <strong>Author:</strong> {comment.author || 'Unknown'}<br />
                <strong>Created At:</strong> {new Date(comment.createdAt).toLocaleString()}
              </p>
            </div>
          ) : null,
        )
      ) : (
        <p>No comments yet.</p>
      )}
      {(!order.manager || order.manager?.id === currentUserId) && (
        <div>
          <input
            type="text"
            value={commentText}
            onChange={e => dispatch(setCommentText(e.target.value))}
            placeholder="Add a comment"
            style={{ width: '70%', padding: '5px', marginRight: '10px' }}
          />
          <button onClick={handleCommentSubmit}>Submit Comment</button>
        </div>
      )}
    </div>
  );
};

export default OrderDetails;