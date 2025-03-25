import { useDispatch } from 'react-redux';
import { Comment, Order } from '../../interfaces/order';
import { AppDispatch, deleteComment } from '../../store';
import Button from '../Button/Button';

interface CommentListProps {
  comments: Comment[];
  order: Order;
}

const CommentList = ({ comments, order }: CommentListProps) => {
  const dispatch = useDispatch<AppDispatch>();

  const handleDelete = (commentId: string) => {
    console.log('Deleting comment with ID:', commentId);
    dispatch(deleteComment(commentId));
  };

  return (
    <div
      style={{
        margin: '10px 0',
        display: 'flex',
        flexDirection: 'row',
        gap: '10px',
        justifyContent: 'space-between',
      }}>
      <div
        style={{
          maxWidth: '30%',
          padding: '5px',
        }}>
        <div>
          <span>
            <strong>Message:</strong> {order.msg || 'null'}
          </span>
        </div>
        <div>
          <span>
            <strong>UTM:</strong> {order.utm || 'N/A'}
          </span>
        </div>
      </div>

      {comments && comments.length > 0 ? (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}>
          {comments.map(comment =>
            comment ? (
              <div
                key={comment.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  backgroundColor: 'white',
                  borderRadius: '5px',
                  padding: '5px',
                }}>
                <div>
                  <span>
                    <strong>Comment:</strong> {comment.text || 'N/A'}
                  </span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    gap: '10px',
                    justifyContent: 'space-around',
                    alignItems: 'center',
                    borderRadius: '5px',
                  }}>
                  <span>
                    <strong>Author:</strong> {comment.author || 'Unknown'}
                  </span>
                  <span>
                    Date:{' '}
                    {new Date(comment.createdAt).toLocaleString('uk-UA', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                  <div>
                    <Button
                      variant="delete"
                      onClick={() => handleDelete(comment.id)}>
                      Delete Comment
                    </Button>
                  </div>
                </div>
              </div>
            ) : null,
          )}
        </div>
      ) : (
        <p>No comments yet.</p>
      )}
    </div>
  );
};

export { CommentList };
