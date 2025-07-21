import { useDispatch, useSelector } from 'react-redux';
import { Comment, Order } from '../../store/slices/interfaces/order';
import { AppDispatch, deleteComment, RootState } from '../../store';
import Button from '../Button/Button';

interface CommentListProps {
  comments: Comment[];
  order: Order;
}

const CommentList = ({ comments, order }: CommentListProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const { name, surname } = useSelector((state: RootState) => state.auth);
  const userFullName = name && surname ? `${name} ${surname}` : null;

  const handleDelete = (commentId: string) => {
    dispatch(deleteComment(commentId));
  };

  return (
    <div
      style={{
        position: 'relative',
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
                  position: 'relative',
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
                  <span style={{ marginRight: '10px' }}>
                    Date:{' '}
                    {new Date(comment.createdAt).toLocaleString('uk-UA', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                  <div>
                    {userFullName && comment.author === userFullName && order.manager && (
                      <Button
                        variant="delete"
                        style={{
                          position: 'absolute',
                          top: 5,
                          right: 5,
                          padding: 0,
                          minWidth: 'unset',
                        }}
                        onClick={() => handleDelete(comment.id)}
                        aria-label="Delete Comment">
                        &#10005;
                      </Button>
                    )}
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
