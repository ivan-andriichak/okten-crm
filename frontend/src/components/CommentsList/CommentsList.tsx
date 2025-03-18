import { useDispatch } from 'react-redux';
import { Comment, Order } from '../../interfaces/order';
import { AppDispatch, deleteComment } from '../../store';
import Button from '../Button/Button';

interface CommentListProps {
  comments: Comment[];
  order: Order; // Додаємо order для доступу до msg і utm
}

const CommentList = ({ comments, order }: CommentListProps) => {
  const dispatch = useDispatch<AppDispatch>();

  const handleDelete = (commentId: string) => {
    console.log('Deleting comment with ID:', commentId);
    dispatch(deleteComment(commentId));
  };

  return (
    <div style={{ margin: '20px 0 0' }}>
      {comments && comments.length > 0 ? (
        <div
          style={{
            border: '1px solid #ccc',
            borderRadius: '5px',
            padding: '10px',
          }}
        >
          {/* Блок із Message і UTM (один раз, із order) */}
          <div
            style={{
              border: '1px solid red',
              display: 'flex',
              width: '20%',
              flexDirection: 'column',
              marginBottom: '10px',
            }}
          >
            <span>Message: {order.msg || 'null'}</span>
            <span>UTM: {order.utm || 'N/A'}</span>
          </div>

          {/* Список коментарів */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {comments.map((comment) =>
              comment ? (
                <div
                  key={comment.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    width: '45%',
                    border: '1px solid red',
                    backgroundColor: 'white',
                    padding: '5px',
                    borderRadius: '5px',
                  }}
                >
                  <span>Comment: {comment.text || 'N/A'}</span>
                  <div style={{ textAlign: 'right' }}>
                    <span>Author: {comment.author || 'Unknown'}</span>
                    <br />
                    <span>
                      Date:{' '}
                      {new Date(comment.createdAt).toLocaleString('uk-UA', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                    <Button
                      style={{ marginTop: '5px', display: 'block' }}
                      variant="delete"
                      onClick={() => handleDelete(comment.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ) : null,
            )}
          </div>
        </div>
      ) : (
        <p>No comments yet.</p>
      )}
    </div>
  );
};

export { CommentList };