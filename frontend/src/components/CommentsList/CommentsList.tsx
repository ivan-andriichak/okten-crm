import { useDispatch } from 'react-redux';
import { Comment } from '../../interfaces/order';
import { AppDispatch, deleteComment } from '../../store';

interface CommentListProps {
  comments: Comment[];
}

const CommentList = ({ comments }: CommentListProps) => {
  const dispatch = useDispatch<AppDispatch>();

  const handleDelete = (commentId: string) => {
    console.log('Deleting comment with ID:', commentId);
    dispatch(deleteComment(commentId));
  };

  return (
    <div style={{ marginTop: '20px' }}>
      <h3>Comments</h3>
      {comments && comments.length > 0 ? (
        comments.map(comment =>
          comment ? (
            <div
              key={comment.id}
              style={{
                border: '1px solid #ccc',
                padding: '10px',
                marginBottom: '10px',
                width: '50%',
              }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: '20px',
                }}>
                {/* Ліва частина: Message і UTM */}
                <div
                  style={{
                    display: 'flex',
                    border: '1px solid #ccc',
                    flexDirection: 'column',
                    gap: '5px',
                  }}>
                  <span>Message: {comment.text || 'N/A'}</span>
                  <span>UTM: {comment.utm || 'N/A'}</span>
                </div>

                {/* Права частина: Author і Date */}
                <div
                  style={{
                    display: 'flex',
                    border: '1px solid #ccc',
                    flexDirection: 'column',
                    gap: '5px',
                  }}>
                  <span>Author: {comment.author || 'Unknown'}</span>
                  <span>
                    Date:{' '}
                    {new Date(comment.createdAt).toLocaleString('uk-UA', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                  {/* Кнопка Delete */}
                  <button
                    onClick={() => handleDelete(comment.id)}
                    style={{
                      backgroundColor: '#f86b6b',
                      color: 'white',
                      border: 'none',
                      padding: '5px 10px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      marginTop: '10px',
                      alignSelf: 'flex-start',
                    }}>
                    Delete
                  </button>
                </div>
              </div>


            </div>
          ) : null,
        )
      ) : (
        <p>No comments yet.</p>
      )}
    </div>
  );
};

export { CommentList };