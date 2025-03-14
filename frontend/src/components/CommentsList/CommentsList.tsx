import { FC } from 'react';
import { Order } from '../../interfaces/order';
import { Comment } from '../../interfaces/order';

interface CommentListProps {
  comments: Order['comments'];
}

const CommentList: FC<CommentListProps> = ({ comments }) => (
  <div style={{ marginTop: '10px' }}>
    <strong>Comments:</strong>
    {comments && comments.length > 0 ? (
      comments.map((comment:Comment, index:number) =>
        comment ? (
          <div key={index}>
            <div style={{border: '1px solid #ccc', padding: '10px', marginTop: '10px', width: '50%', display: 'flex'}}>
              <strong>Comment:</strong> {comment.text || 'N/A'}<br />
              <strong>UTM:</strong> {comment.utm || 'N/A'}<br />
              <strong>Author:</strong> {comment.author || 'Unknown'}<br />
             <strong>Created At:</strong> {new Date(comment.createdAt).toLocaleString('uk-UA', { month: 'long', day: 'numeric', year: 'numeric' })}
            </div>
          </div>
        ) : null
      )
    ) : (
      <p>No comments yet.</p>
    )}
  </div>
);

export default CommentList;