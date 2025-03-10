import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  addComment,
  AppDispatch, closeEditModal,
  fetchOrders,
  logout, openEditModal,
  RootState, setCommentText,
  setSort, toggleExpand,
  updateEditForm,
  updateOrder,
} from '../../store';


interface OrdersProps {
  token: string;
  role: 'admin' | 'manager';
  onLogout: () => void;
  currentUserId: string;
}

const Orders: React.FC<OrdersProps> = ({ role }) => {
  const dispatch = useDispatch<AppDispatch>();
  const {
    orders,
    loading,
    error,
    sort,
    order: sortOrder,
    expandedOrderId,
    editingOrder,
    editForm,
    commentText,
  } = useSelector((state: RootState) => state.orders);
  const {  currentUserId, token } = useSelector(
    (state: RootState) => state.auth,
  );

  useEffect(() => {
    if (token) {
      dispatch(fetchOrders());
    }
  }, [dispatch, token, sort, sortOrder]);

  const handleSort = (field: string) => {
    const newOrder = sort === field && sortOrder === 'ASC' ? 'DESC' : 'ASC';
    dispatch(setSort({ sort: field, order: newOrder }));
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  const handleEditChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    dispatch(updateEditForm({ [name]: value }));
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrder || !token) return;
    await dispatch(updateOrder(editingOrder.id));
  };

  const handleCommentSubmit = async (orderId: string) => {
    if (!commentText || !token) return;
    await dispatch(addComment(orderId));
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Orders Page</h2>
      <p>Role: {role}</p>
      <p>User ID: {currentUserId || 'Not available'}</p>
      <button onClick={handleLogout}>Logout</button>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {orders.length > 0 ? (
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            marginTop: '20px',
          }}>
          <thead>
            <tr>
              <th
                style={{
                  border: '1px solid #ddd',
                  padding: '8px',
                  cursor: 'pointer',
                }}
                onClick={() => handleSort('id')}>
                ID {sort === 'id' && (sortOrder === 'ASC' ? '↑' : '↓')}
              </th>
              <th
                style={{
                  border: '1px solid #ddd',
                  padding: '8px',
                  cursor: 'pointer',
                }}
                onClick={() => handleSort('name')}>
                Name {sort === 'name' && (sortOrder === 'ASC' ? '↑' : '↓')}
              </th>
              <th
                style={{
                  border: '1px solid #ddd',
                  padding: '8px',
                  cursor: 'pointer',
                }}
                onClick={() => handleSort('surname')}>
                Surname{' '}
                {sort === 'surname' && (sortOrder === 'ASC' ? '↑' : '↓')}
              </th>
              <th
                style={{
                  border: '1px solid #ddd',
                  padding: '8px',
                  cursor: 'pointer',
                }}
                onClick={() => handleSort('email')}>
                Email {sort === 'email' && (sortOrder === 'ASC' ? '↑' : '↓')}
              </th>
              <th
                style={{
                  border: '1px solid #ddd',
                  padding: '8px',
                  cursor: 'pointer',
                }}
                onClick={() => handleSort('phone')}>
                Phone {sort === 'phone' && (sortOrder === 'ASC' ? '↑' : '↓')}
              </th>
              <th
                style={{
                  border: '1px solid #ddd',
                  padding: '8px',
                  cursor: 'pointer',
                }}
                onClick={() => handleSort('age')}>
                Age {sort === 'age' && (sortOrder === 'ASC' ? '↑' : '↓')}
              </th>
              <th
                style={{
                  border: '1px solid #ddd',
                  padding: '8px',
                  cursor: 'pointer',
                }}
                onClick={() => handleSort('course')}>
                Course {sort === 'course' && (sortOrder === 'ASC' ? '↑' : '↓')}
              </th>
              <th
                style={{
                  border: '1px solid #ddd',
                  padding: '8px',
                  cursor: 'pointer',
                }}
                onClick={() => handleSort('course_format')}>
                Course Format{' '}
                {sort === 'course_format' && (sortOrder === 'ASC' ? '↑' : '↓')}
              </th>
              <th
                style={{
                  border: '1px solid #ddd',
                  padding: '8px',
                  cursor: 'pointer',
                }}
                onClick={() => handleSort('course_type')}>
                Course Type{' '}
                {sort === 'course_type' && (sortOrder === 'ASC' ? '↑' : '↓')}
              </th>
              <th
                style={{
                  border: '1px solid #ddd',
                  padding: '8px',
                  cursor: 'pointer',
                }}
                onClick={() => handleSort('status')}>
                Status {sort === 'status' && (sortOrder === 'ASC' ? '↑' : '↓')}
              </th>
              <th
                style={{
                  border: '1px solid #ddd',
                  padding: '8px',
                  cursor: 'pointer',
                }}
                onClick={() => handleSort('sum')}>
                Sum {sort === 'sum' && (sortOrder === 'ASC' ? '↑' : '↓')}
              </th>
              <th
                style={{
                  border: '1px solid #ddd',
                  padding: '8px',
                  cursor: 'pointer',
                }}
                onClick={() => handleSort('alreadyPaid')}>
                Already Paid{' '}
                {sort === 'alreadyPaid' && (sortOrder === 'ASC' ? '↑' : '↓')}
              </th>
              <th
                style={{
                  border: '1px solid #ddd',
                  padding: '8px',
                  cursor: 'pointer',
                }}
                onClick={() => handleSort('group')}>
                Group {sort === 'group' && (sortOrder === 'ASC' ? '↑' : '↓')}
              </th>
              <th
                style={{
                  border: '1px solid #ddd',
                  padding: '8px',
                  cursor: 'pointer',
                }}
                onClick={() => handleSort('created_at')}>
                Created At{' '}
                {sort === 'created_at' && (sortOrder === 'ASC' ? '↑' : '↓')}
              </th>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <React.Fragment key={order.id}>
                <tr
                  onClick={() => dispatch(toggleExpand(order.id))}
                  style={{ cursor: 'pointer' }}>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                    {order.id}
                  </td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                    {order.name}
                  </td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                    {order.surname}
                  </td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                    {order.email}
                  </td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                    {order.phone}
                  </td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                    {order.age}
                  </td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                    {order.course}
                  </td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                    {order.course_format}
                  </td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                    {order.course_type}
                  </td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                    {order.status}
                  </td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                    {order.sum}
                  </td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                    {order.alreadyPaid}
                  </td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                    {order.group || 'No group'}
                  </td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                    {new Date(order.created_at).toLocaleString()}
                  </td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        const canEdit =
                          !order.manager || order.manager?.id === currentUserId;
                        if (!canEdit) {
                          dispatch(
                            updateEditForm({
                              comments: [],
                              course_format: '',
                            }),
                          );
                          return;
                        }
                        dispatch(openEditModal(order));
                      }}>
                      Edit
                    </button>
                  </td>
                </tr>
                {expandedOrderId === order.id && (
                  <tr>
                    <td
                      colSpan={15}
                      style={{
                        border: '1px solid #ddd',
                        padding: '8px',
                        backgroundColor: '#f9f9f9',
                      }}>
                      <div>
                        <h4>Order Details</h4>
                        <p>
                          <strong>ID:</strong> {order.id}
                        </p>
                        <p>
                          <strong>Name:</strong> {order.name}
                        </p>
                        <p>
                          <strong>Surname:</strong> {order.surname}
                        </p>
                        <p>
                          <strong>Email:</strong> {order.email}
                        </p>
                        <p>
                          <strong>Phone:</strong> {order.phone}
                        </p>
                        <p>
                          <strong>Age:</strong> {order.age}
                        </p>
                        <p>
                          <strong>Course:</strong> {order.course}
                        </p>
                        <p>
                          <strong>Course Format:</strong> {order.course_format}
                        </p>
                        <p>
                          <strong>Course Type:</strong> {order.course_type}
                        </p>
                        <p>
                          <strong>Status:</strong> {order.status}
                        </p>
                        <p>
                          <strong>Sum:</strong> {order.sum}
                        </p>
                        <p>
                          <strong>Already Paid:</strong> {order.alreadyPaid}
                        </p>
                        <p>
                          <strong>Group:</strong> {order.group || 'No group'}
                        </p>
                        <p>
                          <strong>Created At:</strong>{' '}
                          {new Date(order.created_at).toLocaleString()}
                        </p>
                        <p>
                          <strong>Manager:</strong>{' '}
                          {order.manager
                            ? `${order.manager.name} ${order.manager.surname}`
                            : 'None'}
                        </p>
                        <p>
                          <strong>Message:</strong>{' '}
                          {order.comments && order.comments.length > 0
                            ? order.comments[0]?.text
                            : 'N/A'}
                        </p>
                        <p>
                          <strong>UTM:</strong>{' '}
                          {order.comments && order.comments.length > 0
                            ? order.comments[0]?.utm
                            : 'N/A'}
                        </p>
                        <p>
                          <strong>Group (Text):</strong>{' '}
                          {order.group || 'No group'}
                        </p>
                        <p>
                          <strong>Group Entity:</strong>{' '}
                          {order.groupEntity?.name || 'No group entity'}
                        </p>
                        <strong>Comments:</strong>
                        {order.comments && order.comments.length > 0 ? (
                          order.comments.map((comment, index) =>
                            comment ? (
                              <div key={index}>
                                <p>
                                  <strong>Message:</strong>{' '}
                                  {comment.text || 'N/A'}
                                  <br />
                                  <strong>UTM:</strong> {comment.utm || 'N/A'}
                                  <br />
                                  <strong>Author:</strong>{' '}
                                  {comment.author || 'Unknown'}
                                  <br />
                                  <strong>Created At:</strong>{' '}
                                  {new Date(comment.createdAt).toLocaleString()}
                                </p>
                              </div>
                            ) : null,
                          )
                        ) : (
                          <p>No comments yet.</p>
                        )}
                        {(!order.manager ||
                          order.manager?.id === currentUserId) && (
                          <div>
                            <input
                              type="text"
                              value={commentText}
                              onChange={e =>
                                dispatch(setCommentText(e.target.value))
                              }
                              placeholder="Add a comment"
                              style={{
                                width: '70%',
                                padding: '5px',
                                marginRight: '10px',
                              }}
                            />
                            <button
                              onClick={() => handleCommentSubmit(order.id)}>
                              Submit Comment
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No orders found.</p>
      )}

      {editingOrder && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <div
            style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '5px',
              width: '400px',
            }}>
            <h3>Edit Order</h3>
            <form onSubmit={handleEditSubmit}>
              <div>
                <label>Name:</label>
                <input
                  type="text"
                  name="name"
                  value={editForm.name || ''}
                  onChange={handleEditChange}
                  style={{
                    width: '100%',
                    padding: '5px',
                    marginBottom: '10px',
                  }}
                />
              </div>
              <div>
                <label>Surname:</label>
                <input
                  type="text"
                  name="surname"
                  value={editForm.surname || ''}
                  onChange={handleEditChange}
                  style={{
                    width: '100%',
                    padding: '5px',
                    marginBottom: '10px',
                  }}
                />
              </div>
              <div>
                <label>Email:</label>
                <input
                  type="email"
                  name="email"
                  value={editForm.email || ''}
                  onChange={handleEditChange}
                  style={{
                    width: '100%',
                    padding: '5px',
                    marginBottom: '10px',
                  }}
                />
              </div>
              <div>
                <label>Phone:</label>
                <input
                  type="text"
                  name="phone"
                  value={editForm.phone || ''}
                  onChange={handleEditChange}
                  style={{
                    width: '100%',
                    padding: '5px',
                    marginBottom: '10px',
                  }}
                />
              </div>
              <div>
                <label>Age:</label>
                <input
                  type="number"
                  name="age"
                  value={editForm.age || ''}
                  onChange={handleEditChange}
                  style={{
                    width: '100%',
                    padding: '5px',
                    marginBottom: '10px',
                  }}
                />
              </div>
              <div>
                <label>Course:</label>
                <select
                  name="course"
                  value={editForm.course || ''}
                  onChange={handleEditChange}
                  style={{
                    width: '100%',
                    padding: '5px',
                    marginBottom: '10px',
                  }}>
                  <option value="">Select Course</option>
                  <option value="FS">FS</option>
                  <option value="QACX">QACX</option>
                  <option value="JCX">JCX</option>
                  <option value="JSCX">JSCX</option>
                  <option value="FE">FE</option>
                  <option value="PCX">PCX</option>
                </select>
              </div>
              <div>
                <label>Course Format:</label>
                <select
                  name="course_format"
                  value={editForm.course_format || ''}
                  onChange={handleEditChange}
                  style={{
                    width: '100%',
                    padding: '5px',
                    marginBottom: '10px',
                  }}>
                  <option value="">Select Format</option>
                  <option value="static">Static</option>
                  <option value="online">Online</option>
                </select>
              </div>
              <div>
                <label>Course Type:</label>
                <select
                  name="course_type"
                  value={editForm.course_type || ''}
                  onChange={handleEditChange}
                  style={{
                    width: '100%',
                    padding: '5px',
                    marginBottom: '10px',
                  }}>
                  <option value="">Select Type</option>
                  <option value="pro">Pro</option>
                  <option value="minimal">Minimal</option>
                  <option value="premium">Premium</option>
                  <option value="incubator">Incubator</option>
                  <option value="vip">VIP</option>
                </select>
              </div>
              <div>
                <label>Status:</label>
                <select
                  name="status"
                  value={editForm.status || ''}
                  onChange={handleEditChange}
                  style={{
                    width: '100%',
                    padding: '5px',
                    marginBottom: '10px',
                  }}>
                  <option value="">Select Status</option>
                  <option value="In work">In work</option>
                  <option value="New">New</option>
                  <option value="Aggre">Aggre</option>
                  <option value="Disaggre">Disaggre</option>
                  <option value="Dubbing">Dubbing</option>
                </select>
              </div>
              <div>
                <label>Sum:</label>
                <input
                  type="number"
                  name="sum"
                  value={editForm.sum || ''}
                  onChange={handleEditChange}
                  style={{
                    width: '100%',
                    padding: '5px',
                    marginBottom: '10px',
                  }}
                />
              </div>
              <div>
                <label>Already Paid:</label>
                <input
                  type="number"
                  name="alreadyPaid"
                  value={editForm.alreadyPaid || ''}
                  onChange={handleEditChange}
                  style={{
                    width: '100%',
                    padding: '5px',
                    marginBottom: '10px',
                  }}
                />
              </div>
              <div>
                <label>Group:</label>
                <input
                  type="text"
                  name="group"
                  value={editForm.group || ''}
                  onChange={handleEditChange}
                  style={{
                    width: '100%',
                    padding: '5px',
                    marginBottom: '10px',
                  }}
                />
              </div>
              <div style={{ marginTop: '10px' }}>
                <button type="submit">Submit</button>
                <button
                  type="button"
                  onClick={() => dispatch(closeEditModal())}
                  style={{ marginLeft: '10px' }}>
                  Close
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;